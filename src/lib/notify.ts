// Staff notification driver. The product sends no seeker-facing email by
// design (there are no seeker addresses to write to); this covers the one
// staff flow — "your application was approved". Swap the driver for a real
// provider without touching the audited approve flow.
export interface Notifier {
  professionalApproved(input: { id: string; email: string; fullName: string }): Promise<void>;
}

class ConsoleNotifier implements Notifier {
  async professionalApproved(): Promise<void> {
    // Content-free by policy: the audit log already records who approved whom.
    console.log("[notify:console] professional approval — no email provider configured");
  }
}

export const notifier: Notifier = new ConsoleNotifier();
