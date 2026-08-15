export const THEMES = ["agentic ai", "multi-agent", "enterprise ai", "ai governance", "human approval", "india ai", "data sovereignty", "healthcare ai", "clinical workflow", "ai chips", "data centers", "ai infrastructure", "saas", "regulated deployment"];
export const DRAFT_STATUSES = ["DRAFT", "REVIEWED", "APPROVED", "PUBLISHED", "ARCHIVED"] as const;
export const SOURCE_TIERS = ["PRIMARY", "CREDIBLE", "DISCOVERY"] as const;
export const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/signals", label: "Signal queue" },
  { href: "/drafts", label: "Draft workspace" },
  { href: "/sources", label: "Sources" },
];
