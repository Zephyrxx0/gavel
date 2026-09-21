import { z } from 'zod';
import { RiskLevelEnum, ActionTimingEnum, ActionTypeEnum } from './common';

export const ClauseObligationEnum = z.enum(['user', 'counterparty', 'mutual', 'none']);
export type ClauseObligation = z.infer<typeof ClauseObligationEnum>;

export const ClauseSchema = z.object({
  id: z.string().describe('Unique identifier for the clause, e.g. "clause-1"'),
  title: z.string().describe('Concise label for the clause, e.g. "Liquidated Damages"'),
  originalText: z.string().describe('Verbatim excerpt from the source document'),
  simplified: z.string().describe(
    'Objective plain-English explanation of what this clause entails. DO NOT use prescriptive directives like "you should" or declare illegality.'
  ),
  risk: RiskLevelEnum.describe('high (onerous/unilateral), caution (unusual/burdensome), standard (customary)'),
  riskReason: z.string().describe('Objective factual reason for the assigned risk tier'),
  obligation: ClauseObligationEnum.describe('Whom this clause places affirmative legal or contractual duties upon'),
});
export type Clause = z.infer<typeof ClauseSchema>;

export const ActionItemSchema = z.object({
  id: z.string().describe('Unique identifier for the action item'),
  timing: ActionTimingEnum.describe('When this action is typically evaluated: immediate, before_signing, or after_signing'),
  actionType: ActionTypeEnum.describe('Nature of the procedural step: negotiate, verify, refuse, or accept'),
  description: z.string().describe(
    'Concrete, educational next step phrased objectively without prescriptive legal directives.'
  ),
  relatedClauseId: z.string().optional().describe('Identifier of the associated clause if applicable'),
});
export type ActionItem = z.infer<typeof ActionItemSchema>;

export const LawyerQuestionSchema = z.object({
  id: z.string().describe('Unique identifier for the question'),
  question: z.string().describe(
    'Targeted, professional inquiry for licensed legal counsel grounded directly in verbatim clause text'
  ),
  context: z.string().describe('Factual context explaining why this inquiry is pertinent to the agreement'),
  relatedClauseId: z.string().optional().describe('Identifier of the associated clause if applicable'),
});
export type LawyerQuestion = z.infer<typeof LawyerQuestionSchema>;

export const DocumentAnalysisSchema = z.object({
  documentType: z.string().describe('Identified document classification, e.g. Residential Lease, Employment Agreement, NDA'),
  parties: z.array(z.string()).describe('Identified contracting parties or signatory entities'),
  summary: z.string().describe('Neutral plain-English executive summary under 200 words'),
  clauses: z.array(ClauseSchema).describe('Analyzed clauses with simplified terms and risk ratings'),
  checklist: z.array(ActionItemSchema).describe('Actionable checklist items sorted by procedural timing'),
  lawyerQuestions: z.array(LawyerQuestionSchema).describe('Targeted questions to ask legal counsel'),
});
export type DocumentAnalysis = z.infer<typeof DocumentAnalysisSchema>;
