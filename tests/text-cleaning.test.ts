import { describe, it, expect } from 'vitest';
import {
  cleanText,
  countWords,
  countCharacters,
  isValidLegalText,
} from '@/lib/text-utils';

describe('Conservative Legal Text Sanitization (lib/text-utils.ts)', () => {
  describe('cleanText', () => {
    it('returns empty string for falsy or empty inputs', () => {
      expect(cleanText('')).toBe('');
      // @ts-expect-error - testing runtime type safety
      expect(cleanText(null)).toBe('');
      // @ts-expect-error - testing runtime type safety
      expect(cleanText(undefined)).toBe('');
    });

    it('strips null bytes and unprintable control characters', () => {
      const dirty = 'AGREEMENT\x00 OF\x01 LEASE\x07\x08 WITH\x1B CONTROL\x7F CODES';
      expect(cleanText(dirty)).toBe('AGREEMENT OF LEASE WITH CONTROL CODES');
    });

    it('normalizes Windows CRLF and classic Mac CR to standard Unix LF', () => {
      const crlf = 'Section 1. Term.\r\nThis lease begins on Jan 1.\r\nSection 2. Rent.\r\nRent is $2,000.';
      expect(cleanText(crlf)).toBe('Section 1. Term.\nThis lease begins on Jan 1.\nSection 2. Rent.\nRent is $2,000.');

      const cr = 'Section 1. Term.\rThis lease begins on Jan 1.\rSection 2. Rent.';
      expect(cleanText(cr)).toBe('Section 1. Term.\nThis lease begins on Jan 1.\nSection 2. Rent.');
    });

    it('replaces tabs with 4 spaces to preserve indentation structure', () => {
      const tabbed = 'Clause 3. Obligations:\n\t(a) Pay rent on the 1st.\n\t\t(i) Late fee applies after 5th.';
      const cleaned = cleanText(tabbed);
      expect(cleaned).toBe('Clause 3. Obligations:\n    (a) Pay rent on the 1st.\n        (i) Late fee applies after 5th.');
    });

    it('trims trailing line whitespace while strictly preserving leading indentation', () => {
      const trailingSpaces = '    Section 1. Definitions.   \n        1.1 "Affiliate" means...    ';
      const cleaned = cleanText(trailingSpaces);
      expect(cleaned).toBe('    Section 1. Definitions.\n        1.1 "Affiliate" means...');
    });

    it('collapses 3 or more consecutive newlines to exactly 2 newlines', () => {
      const excessiveSpacing = 'ARTICLE I\n\n\n\nDEFINITIONS\n\n\n\n\nSection 1.01\n\nSection 1.02';
      const cleaned = cleanText(excessiveSpacing);
      expect(cleaned).toBe('ARTICLE I\n\nDEFINITIONS\n\nSection 1.01\n\nSection 1.02');
    });

    it('strictly preserves legal clause numbering, Roman numerals, and section titles', () => {
      const legalText = `
Section 14.2(b)(iv) Limitation of Liability:
    (i) In no event shall either party be liable for consequential damages;
    (ii) Except for gross negligence or willful misconduct under Section 19(a);
    (iii) Total liability shall not exceed 12 months' fees under Cal. Civ. Code § 1950.5.
      `.trim();

      const cleaned = cleanText(legalText);
      expect(cleaned).toContain('Section 14.2(b)(iv) Limitation of Liability:');
      expect(cleaned).toContain('(i) In no event shall either party');
      expect(cleaned).toContain('(ii) Except for gross negligence');
      expect(cleaned).toContain('(iii) Total liability shall not exceed');
      expect(cleaned).toContain('Cal. Civ. Code § 1950.5.');
    });

    it('preserves bullet markers and statutory citations', () => {
      const textWithBullets = `
Obligations of Lessee:
• Provide 30 days written notice before vacating.
- Maintain premises in sanitary condition.
* Permit entry for routine inspections under 15 U.S.C. § 1681.
      `.trim();

      const cleaned = cleanText(textWithBullets);
      expect(cleaned).toContain('• Provide 30 days');
      expect(cleaned).toContain('- Maintain premises');
      expect(cleaned).toContain('* Permit entry');
      expect(cleaned).toContain('15 U.S.C. § 1681.');
    });
  });

  describe('countWords', () => {
    it('returns 0 for empty or whitespace-only strings', () => {
      expect(countWords('')).toBe(0);
      expect(countWords('   \n\t  ')).toBe(0);
      // @ts-expect-error - testing runtime type safety
      expect(countWords(null)).toBe(0);
      // @ts-expect-error - testing runtime type safety
      expect(countWords(undefined)).toBe(0);
    });

    it('accurately counts words across irregular spacing and newlines', () => {
      const excerpt = 'This   Agreement   is made   and\n\nentered into\nthis 1st day.';
      expect(countWords(excerpt)).toBe(10);
    });

    it('counts words in standard legal provision', () => {
      const clause = 'Tenant shall pay Landlord monthly rent of $2,500 on or before the first day of each month.';
      expect(countWords(clause)).toBe(17);
    });
  });

  describe('countCharacters', () => {
    it('returns 0 for empty or falsy strings', () => {
      expect(countCharacters('')).toBe(0);
      // @ts-expect-error - testing runtime type safety
      expect(countCharacters(null)).toBe(0);
    });

    it('returns character length after cleaning control characters and trailing spaces', () => {
      const text = 'Clause 1. Rent.\x00\x07   ';
      // 'Clause 1. Rent.' has 15 characters
      expect(countCharacters(text)).toBe(15);
    });
  });

  describe('isValidLegalText', () => {
    it('rejects empty or whitespace-only inputs', () => {
      expect(isValidLegalText('')).toBe(false);
      expect(isValidLegalText('     \n\t\n   ')).toBe(false);
    });

    it('rejects text below default 50 character threshold', () => {
      const shortSnippet = 'This is a short clause under 50 chars.';
      expect(isValidLegalText(shortSnippet)).toBe(false);
      expect(shortSnippet.length).toBeLessThan(50);
    });

    it('accepts text meeting or exceeding default 50 character threshold', () => {
      const validText = 'This Agreement is entered into by and between Tenant and Landlord on this date.';
      expect(validText.length).toBeGreaterThanOrEqual(50);
      expect(isValidLegalText(validText)).toBe(true);
    });

    it('respects custom minChars parameter', () => {
      const text = 'Short notice of dispute.';
      expect(isValidLegalText(text, 10)).toBe(true);
      expect(isValidLegalText(text, 100)).toBe(false);
    });

    it('does not allow null bytes and stripped control codes to satisfy threshold', () => {
      // 10 real characters + 45 null bytes = 55 raw chars, but only 10 clean chars
      const paddingWithNulls = 'Short text' + '\x00'.repeat(45);
      expect(isValidLegalText(paddingWithNulls, 50)).toBe(false);
    });
  });
});
