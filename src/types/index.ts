// ─── AI Tool Definitions ───

export type UseCase = "coding" | "writing" | "data" | "research" | "mixed";

export interface ToolPlan {
  id: string;
  name: string;
  pricePerSeat: number; // monthly USD
  features: string[];
  maxRecommendedSeats?: number;
  minRecommendedSeats?: number;
}

export interface AITool {
  id: string;
  name: string;
  category: "ide" | "assistant" | "api";
  icon: string; // emoji fallback
  plans: ToolPlan[];
  website: string;
}

// ─── User Input ───

export interface ToolEntry {
  toolId: string;
  planId: string;
  seats: number;
  monthlySpend: number; // actual spend (may differ from list price × seats)
}

export interface AuditInput {
  tools: ToolEntry[];
  teamSize: number;
  primaryUseCase: UseCase;
}

// ─── Audit Results ───

export type RecommendationAction =
  | "keep"
  | "downgrade"
  | "switch_plan"
  | "switch_tool"
  | "use_credits"
  | "consolidate";

export interface ToolRecommendation {
  toolId: string;
  toolName: string;
  currentPlan: string;
  currentSpend: number;
  action: RecommendationAction;
  recommendedPlan?: string;
  recommendedTool?: string;
  newSpend: number;
  monthlySavings: number;
  reason: string;
  confidence: "high" | "medium" | "low";
}

export interface AuditResult {
  id: string;
  input: AuditInput;
  recommendations: ToolRecommendation[];
  totalCurrentSpend: number;
  totalOptimizedSpend: number;
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  credexSavingsEstimate: number; // additional savings via Credex credits
  aiSummary: string;
  createdAt: string;
}

// ─── Lead Capture ───

export interface LeadData {
  email: string;
  companyName?: string;
  role?: string;
  teamSize?: number;
  auditId: string;
  totalMonthlySavings: number;
}

// ─── Shareable URL ───

export interface SharedAudit {
  id: string;
  tools: { name: string; plan: string; currentSpend: number }[];
  recommendations: ToolRecommendation[];
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  aiSummary: string;
  // No email, no company name — stripped for public sharing
}
