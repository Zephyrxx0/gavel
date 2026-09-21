import { z } from 'zod';

export const RiskLevelEnum = z.enum(['high', 'caution', 'standard']);
export type RiskLevel = z.infer<typeof RiskLevelEnum>;

export const ActionTimingEnum = z.enum(['immediate', 'before_signing', 'after_signing']);
export type ActionTiming = z.infer<typeof ActionTimingEnum>;

export const ActionTypeEnum = z.enum(['negotiate', 'verify', 'refuse', 'accept']);
export type ActionType = z.infer<typeof ActionTypeEnum>;

export const InconsistencySeverityEnum = z.enum(['critical', 'notable', 'minor']);
export type InconsistencySeverity = z.infer<typeof InconsistencySeverityEnum>;

export const ErrorResponseSchema = z.object({
  error: z.string().describe('Machine-readable error identifier or code'),
  message: z.string().describe('Human-readable explanation of the error'),
  details: z.unknown().optional().describe('Optional contextual error diagnostics'),
});
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
