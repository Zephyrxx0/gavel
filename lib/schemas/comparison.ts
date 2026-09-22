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

export const NegotiationCardSchema = z.object({
  clauseTitle: z.string().describe('Brief label for this negotiation point'),
  rationale: z.string().describe('Objective reason for this categorization'),
  suggestedAlternative: z.string().optional().describe('Optional counter-proposal wording'),
});
export type NegotiationCard = z.infer<typeof NegotiationCardSchema>;

export const NegotiationGuideSchema = z.object({
  pushBack: z.array(NegotiationCardSchema).describe('Terms that typically warrant counter-proposal'),
  acceptAsIs: z.array(NegotiationCardSchema).describe('Terms that are standard and reasonable'),
  flagForLawyer: z.array(NegotiationCardSchema).describe('Terms requiring licensed legal review'),
  recommendation: z.string().describe('Overall strategic summary without prescriptive advice'),
});
export type NegotiationGuide = z.infer<typeof NegotiationGuideSchema>;

export const FavorabilityMetricsSchema = z.object({
  clausesFavoringDocA: z.number().int().nonnegative().describe('Count of clauses favoring Document A'),
  clausesFavoringDocB: z.number().int().nonnegative().describe('Count of clauses favoring Document B'),
  criticalInconsistencies: z.number().int().nonnegative().describe('Count of critical severity inconsistencies'),
});
export type FavorabilityMetrics = z.infer<typeof FavorabilityMetricsSchema>;

export const ExtractedClauseSchema = z.object({
  category: z.string().describe('Legal category/domain of the extracted clause'),
  excerpt: z.string().describe('Key clause text excerpt, max ~300 chars'),
});
export type ExtractedClause = z.infer<typeof ExtractedClauseSchema>;

export const Pass1ExtractionSchema = z.object({
  clauses: z.array(ExtractedClauseSchema).describe('Key legal clauses extracted from document'),
});
export type Pass1Extraction = z.infer<typeof Pass1ExtractionSchema>;

export const ComparisonSchema = z.object({
  favorabilityVerdict: FavorabilityEnum.describe('Overall favorability assessment across both documents'),
  verdictRationale: z.string().describe('Objective plain-English justification for the overall verdict'),
  favorabilityMetrics: FavorabilityMetricsSchema.describe('Quantitative metrics summarizing favorability and severe issues'),
  differences: z.array(ClauseDiffSchema).describe('Side-by-side clause-level comparison items'),
  inconsistencies: z.array(InconsistencyItemSchema).describe('Contradictions, ambiguities, or internal conflicts identified'),
  negotiationGuide: NegotiationGuideSchema.describe('Structured action-oriented negotiation strategy cards'),
});
export type Comparison = z.infer<typeof ComparisonSchema>;
export type ComparisonAnalysis = z.infer<typeof ComparisonSchema>;
