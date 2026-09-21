import { z } from 'zod';

export const UploadErrorCodeEnum = z.enum([
  'INVALID_REQUEST',
  'PAYLOAD_TOO_LARGE',
  'UNSUPPORTED_TYPE',
  'CORRUPT_FILE',
  'PASSWORD_PROTECTED',
  'EMPTY_TEXT',
  'INTERNAL_ERROR',
]);
export type UploadErrorCode = z.infer<typeof UploadErrorCodeEnum>;

export const UploadDataSchema = z.object({
  text: z.string().describe('Sanitized plain text extracted from the document'),
  isImage: z.boolean().describe('Indicates whether the uploaded file is an image requiring multimodal inference'),
  rawBase64: z.string().optional().describe('Base64-encoded file payload for multimodal vision models'),
  mimeType: z.string().describe('MIME type of the uploaded file'),
  fileName: z.string().describe('Sanitized original file name'),
  sizeBytes: z.number().nonnegative().describe('File size in bytes'),
  wordCount: z.number().nonnegative().describe('Word count calculated from extracted text'),
});
export type UploadData = z.infer<typeof UploadDataSchema>;

export const UploadResponseSchema = z.object({
  success: z.boolean().describe('Whether the upload and extraction succeeded'),
  data: UploadDataSchema.optional().describe('Extracted payload on successful upload'),
  error: UploadErrorCodeEnum.optional().describe('Machine-readable error code on failure'),
  message: z.string().optional().describe('Human-readable error description or guidance'),
});
export type UploadResponse = z.infer<typeof UploadResponseSchema>;
