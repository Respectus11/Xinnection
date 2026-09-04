import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  generateThreadKey,
  hashToken,
  sealForThread,
  wrapSecret,
  wrapThreadKey,
} from "../src/lib/crypto";
import { generateSeekerCode } from "../src/lib/token";

// Development seed: categories, one super admin, one active professional,
// one pending application, and three demo threads with printed codes so the
// whole flow can be exercised by hand. Local development only.
const prisma = new PrismaClient();

const SEED_TOTP_ADMIN = "JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP";
const SEED_TOTP_PRO = "KRSXG5CTMVRXEZLUKRSXG5CTMVRXEZLU";

const CATEGORIES = [
  { slug: "anxiety", sortOrder: 1, isCrisis: false },
  { slug: "grief", sortOrder: 2, isCrisis: false },
  { slug: "relationships", sortOrder: 3, isCrisis: false },
  { slug: "academic-stress", sortOrder: 4, isCrisis: false },
  { slug: "family", sortOrder: 5, isCrisis: false },
  { slug: "work", sortOrder: 6, isCrisis: false },
  { slug: "crisis-self-harm", sortOrder: 7, isCrisis: true },
  { slug: "other", sortOrder: 8, isCrisis: false },
];

function totpUri(label: string, secret: string): string {
  return `otpauth://totp/Xinnection:${label}?secret=${secret}&issuer=Xinnection&algorithm=SHA1&digits=6&period=30`;
}

async function main() {
  for (const category of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { sortOrder: category.sortOrder, isCrisis: category.isCrisis },
      create: category,
    });
  }

  const adminEmail = (process.env.SEED_ADMIN_EMAIL ?? "admin@xinnection.local").toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "Xinnection!Admin1";
  const admin = await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 10),
      totpSecretEnc: wrapSecret(SEED_TOTP_ADMIN),
      role: "SUPER_ADMIN",
    },
  });

  const proEmail = (process.env.SEED_PRO_EMAIL ?? "amina@xinnection.local").toLowerCase();
  const proPassword = process.env.SEED_PRO_PASSWORD ?? "Xinnection!Pro1";
  const amina = await prisma.professional.upsert({
    where: { email: proEmail },
    update: {},
    create: {
      email: proEmail,
      passwordHash: await bcrypt.hash(proPassword, 10),
      totpSecretEnc: wrapSecret(SEED_TOTP_PRO),
      fullName: "Amina Bekele",
      credentials: "MA Clinical Counseling",
      licenseNumber: "ETH-PSY-0001",
      specialty: "Counseling psychology",
      languages: ["en", "am"],
      status: "ACTIVE",
    },
  });

  await prisma.professional.upsert({
    where: { email: "dawit@xinnection.local" },
    update: {},
    create: {
      email: "dawit@xinnection.local",
      passwordHash: await bcrypt.hash("Xinnection!Pro2", 10),
      totpSecretEnc: wrapSecret(SEED_TOTP_PRO),
      fullName: "Dawit Girmay",
      credentials: "BSc Psychiatric Nursing",
      licenseNumber: "ETH-PSY-0002",
      specialty: "Psychiatric nursing",
      languages: ["en", "ti"],
      status: "PENDING",
    },
  });

  async function demoThread(opts: {
    slug: string;
    language: string;
    status: "OPEN" | "IN_PROGRESS";
    claimedById?: string;
    ageHours: number;
    flagged?: boolean;
    turns: Array<["SEEKER" | "PROFESSIONAL", string]>;
  }) {
    const category = await prisma.category.findUniqueOrThrow({ where: { slug: opts.slug } });
    const code = generateSeekerCode();
    const dek = generateThreadKey();
    const base = Date.now() - opts.ageHours * 3600 * 1000;
    await prisma.anonymousSession.create({
      data: {
        tokenHash: hashToken(code),
        expiresAt: new Date(Date.now() + 90 * 24 * 3600 * 1000),
        thread: {
          create: {
            categoryId: category.id,
            language: opts.language,
            status: opts.status,
            claimedById: opts.claimedById,
            claimedAt: opts.claimedById ? new Date(base + 3600 * 1000) : null,
            wrappedDek: wrapThreadKey(dek),
            createdAt: new Date(base),
            messages: {
              create: opts.turns.map(([role, text], index) => ({
                senderRole: role,
                ...sealForThread(dek, text),
                createdAt: new Date(base + index * 5 * 60 * 1000),
              })),
            },
            crisisFlags: opts.flagged
              ? { create: { source: "SEEKER_SELECTION", raisedAt: new Date(base) } }
              : undefined,
          },
        },
      },
    });
    return code;
  }

  const code1 = await demoThread({
    slug: "anxiety",
    language: "en",
    status: "OPEN",
    ageHours: 3,
    turns: [
      ["SEEKER", "I can't stop replaying every conversation I had today. My chest feels tight and I can't sleep. Exams start Monday and my mind just keeps racing."],
    ],
  });
  const code2 = await demoThread({
    slug: "crisis-self-harm",
    language: "en",
    status: "OPEN",
    ageHours: 30,
    flagged: true,
    turns: [
      ["SEEKER", "Everything feels pointless lately and I keep thinking about hurting myself. I don't know who else to tell."],
    ],
  });
  const code3 = await demoThread({
    slug: "grief",
    language: "en",
    status: "IN_PROGRESS",
    claimedById: amina.id,
    ageHours: 26,
    turns: [
      ["SEEKER", "My grandmother raised me. She passed last month and the house is so quiet now that I can barely breathe in it."],
      ["PROFESSIONAL", "I'm sorry for your loss. The quietness you describe makes so much sense — she filled the space, and grief often lives in that silence. Tell me about her, if you'd like."],
      ["SEEKER", "She used to sing while making coffee. The silence where her voice used to be is the hardest part."],
    ],
  });

  console.log("Seed complete.");
  console.log(`Admin login: ${admin.email} / ${adminPassword}`);
  console.log(`Pro login:   ${amina.email} / ${proPassword}`);
  console.log(`Admin TOTP:  ${totpUri(admin.email, SEED_TOTP_ADMIN)}`);
  console.log(`Pro TOTP:    ${totpUri(amina.email, SEED_TOTP_PRO)}`);
  console.log(`Demo thread (open, anxiety):        ${code1}`);
  console.log(`Demo thread (open, flagged crisis): ${code2}`);
  console.log(`Demo thread (claimed by Amina):     ${code3}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
