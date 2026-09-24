export const seekerCategories = [
  { id: "anxiety", label: "Anxiety", color: "tertiary" },
  { id: "relationships", label: "Relationships", color: "lavender" },
  { id: "grief", label: "Grief", color: "peach" },
  { id: "burnout", label: "Burnout", color: "rose" },
  { id: "loneliness", label: "Loneliness", color: "secondary" },
  { id: "transitions", label: "Transitions", color: "primary" },
];

export const liveMetrics = {
  totalQueue: 42,
  escalations: 5,
  activeChats: 3,
  handoffLog: 8
};

export type RiskLevel = "high" | "medium" | "low";

export interface TriageThread {
  id: string;
  category: string;
  timeWaiting: string;
  preview: string;
  risk: RiskLevel;
  tags: string[];
}

export const triageQueue: TriageThread[] = [
  {
    id: "TH-9021",
    category: "Anxiety",
    timeWaiting: "4m",
    preview: "I feel like I can't catch my breath today and everything is...",
    risk: "high",
    tags: ["First-time", "Urgent"]
  },
  {
    id: "TH-9022",
    category: "Burnout",
    timeWaiting: "12m",
    preview: "Just so tired of doing the same thing every day with no...",
    risk: "medium",
    tags: ["Return-user"]
  },
  {
    id: "TH-9023",
    category: "Loneliness",
    timeWaiting: "22m",
    preview: "I moved to a new city and I haven't spoken to anyone in...",
    risk: "low",
    tags: []
  }
];
