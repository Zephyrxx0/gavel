import { z } from 'zod';
import { RiskLevelEnum, InconsistencySeverityEnum } from './common';

export const FavorabilityEnum = z.enum(['docA', 'docB', 'neutral']);
export type Favorability = z.infer<typeof FavorabilityEnum>;

export const ClauseDiffSchema = z.object({
  category: z.string().describe('Subject matter or topic of the clause (e.g., Termination, Liability Cap)'),
  textDocA: z.string().describe('Provision excerpt from Document A'),
  textDocB: z.string().describe('Provision excerpt from Document B'),
  favors: FavorabilityEnum.describe('Which document provides more favorable terms to the evaluating party'),
  riskRating: RiskLevelEnum.describe('Risk tier associated with this difference'),
  notes: z.string().describe('Objective comparative analysis notes explaining substantive differences without legal advice'),
});
export type ClauseDiff = z.infer<typeof ClauseDiffSchema>;

export const InconsistencyItemSchema = z.object({
  clauseTitle: z.string().describe('Title or section reference of the conflicting provisions'),
  description: z.string().describe('Factual description of the internal conflict or contradiction between terms'),
  severity: InconsistencySeverityEnum.describe('Severity rating of the inconsistency: critical, notable, or minor'),
});
export type InconsistencyItem = z.infer<typeof InconsistencyItemSchema>;

export const ComparisonSchema = z.object({
  favorabilityVerdict: FavorabilityEnum.describe('Overall favorability assessment across both documents'),
  verdictRationale: z.string().describe('Objective plain-English justification for the overall verdict'),
  differences: z.array(ClauseDiffSchema).describe('Side-by-side clause-level comparison items'),
  inconsistencies: z.array(InconsistencyItemSchema).describe('Contradictions, ambiguities, or internal conflicts identified'),
  negotiationGuide: z.array(z.string()).describe('Educational negotiation talking points and options based on differences'),
});
export type Comparison = z.infer<typeof ComparisonSchema>;
