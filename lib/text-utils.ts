/**
 * Cleans extracted legal text while strictly preserving clause numbering,
 * Roman numerals, section titles, and indentation hierarchy.
 *
 * Implements ASVS V5.1.4 control character sanitization and D-03 / INGEST-06.
 */
export function cleanText(input: string): string {
  if (!input) return '';

  const normalized = input
    // 1. Remove null bytes and unprintable ASCII control characters
    // Preserves \t (0x09), \n (0x0A), and \r (0x0D) for whitespace processing
    .replace(/[\x00\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // 2. Normalize Windows CRLF and classic Mac CR line breaks to standard Unix LF (\n)
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // 3. Convert single tabs (\t) to 4 spaces to maintain indentation structure
    .replace(/\t/g, '    ')
    // 4. Trim trailing whitespace on individual lines while strictly preserving leading indentation
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    // 5. Collapse 3 or more consecutive newlines to exactly 2 newlines (preserve paragraph boundaries)
    .replace(/\n{3,}/g, '\n\n');

  // 6. Remove leading and trailing blank lines while strictly preserving leading indentation
  const lines = normalized.split('\n');
  while (lines.length > 0 && lines[0].trim() === '') {
    lines.shift();
  }
  while (lines.length > 0 && lines[lines.length - 1].trim() === '') {
    lines.pop();
  }

  return lines.join('\n');
}

/**
 * Calculates word count based on whitespace separation.
 * Handles empty and whitespace-only strings cleanly.
 */
export function countWords(text: string): number {
  if (!text || !text.trim()) return 0;
  return text.trim().split(/\s+/).length;
}

/**
 * Counts characters of cleaned legal text.
 * Strips control noise before calculating character length.
 */
export function countCharacters(text: string): number {
  if (!text) return 0;
  return cleanText(text).length;
}

/**
 * Validates whether extracted legal text meets the minimum character threshold.
 * Defaults to 50 characters per D-02 and INGEST-07.
 */
export function isValidLegalText(text: string, minChars = 50): boolean {
  return cleanText(text).length >= minChars;
}
