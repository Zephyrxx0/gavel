import { z } from 'zod';

export const DisputeCategoryEnum = z.enum([
  'tenancy',
  'employment',
  'consumer',
  'civil',
  'family',
  'property',
  'financial',
  'other',
]);
export type DisputeCategory = z.infer<typeof DisputeCategoryEnum>;

export const RoadmapUrgencyEnum = z.enum(['immediate', 'soon', 'informational']);
export type RoadmapUrgency = z.infer<typeof RoadmapUrgencyEnum>;

export const StatutoryRightSchema = z.object({
  title: z.string().describe('Common legal right or protection title'),
  explanation: z.string().describe('Objective plain-English explanation of this statutory protection without prescriptive advice'),
  statuteReference: z.string().describe('Relevant statutory code, regulation, or legal doctrine citation'),
});
export type StatutoryRight = z.infer<typeof StatutoryRightSchema>;

export const RoadmapStepSchema = z.object({
  step: z.string().describe('Short title of the procedural step'),
  description: z.string().describe('Objective description of the step and actions involved'),
  urgency: RoadmapUrgencyEnum.describe('Procedural urgency tier: immediate, soon, or informational'),
  doableWithoutLawyer: z.boolean().describe('Whether this procedural step can typically be taken independently without an attorney'),
});
export type RoadmapStep = z.infer<typeof RoadmapStepSchema>;

export const SituationAnalysisSchema = z.object({
  disputeCategory: DisputeCategoryEnum.describe('Categorized legal domain of the dispute or scenario'),
  summary: z.string().describe('Objective summary of the user-described situation under 200 words'),
  rights: z.array(StatutoryRightSchema).describe('Identified legal rights and statutory protections'),
  roadmap: z.array(RoadmapStepSchema).describe('Ordered procedural roadmap of next steps'),
  documentsToGather: z.array(z.string()).describe('List of evidence, communications, or documents to collect'),
  whenToCallLawyer: z.array(z.string()).describe('Specific indicators or escalation thresholds when professional counsel is necessary'),
  deadlineFlags: z.array(z.string()).describe('Identified statute of limitations, notice deadlines, or time-sensitive constraints'),
});
export type SituationAnalysis = z.infer<typeof SituationAnalysisSchema>;
