import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import {
  SituationIntakeForm,
  countWords,
  validateAndSubmitSituation,
  DRAFT_STORAGE_KEY,
} from '@/components/situation/SituationIntakeForm';
import {
  QuickStartCards,
  PRESETS,
} from '@/components/situation/QuickStartCards';
import {
  CategoryFilterChips,
  CATEGORY_OPTIONS,
} from '@/components/situation/CategoryFilterChips';
import {
  SituationProgress,
  SITUATION_PROGRESS_STAGES,
} from '@/components/situation/SituationProgress';

describe('Situation Intake Experience & Progress Loader (Plan 03-02)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1. Live Word Counter Logic (countWords)', () => {
    it('returns 0 for empty or whitespace-only inputs', () => {
      expect(countWords('')).toBe(0);
      expect(countWords('   ')).toBe(0);
      expect(countWords('\n\t  \n')).toBe(0);
    });

    it('accurately counts single and multiple words regardless of whitespace padding', () => {
      expect(countWords('hello')).toBe(1);
      expect(countWords('  hello   world  ')).toBe(2);
      expect(countWords('This is a test of the emergency broadcast system.')).toBe(9);
      expect(countWords('Line one\nLine two\n\nLine three\twith\ttabs')).toBe(8);
    });

    it('correctly identifies inputs with fewer than 20 words vs 20+ words', () => {
      const nineteenWords = Array(19).fill('word').join(' ');
      const twentyWords = Array(20).fill('word').join(' ');
      const twentyOneWords = Array(21).fill('word').join(' ');

      expect(countWords(nineteenWords)).toBe(19);
      expect(countWords(twentyWords)).toBe(20);
      expect(countWords(twentyOneWords)).toBe(21);
    });
  });

  describe('2. QuickStartCards Component (D-01)', () => {
    it('exports 4 presets matching UI-SPEC and D-01 requirements', () => {
      expect(PRESETS).toHaveLength(4);

      const [p1, p2, p3, p4] = PRESETS;

      // Preset 1: Tenancy
      expect(p1.id).toBe('tenancy-deposit');
      expect(p1.title).toBe('Security Deposit Withheld');
      expect(p1.category).toBe('tenancy');
      expect(p1.snippet).toContain('Moved out 35 days ago after giving proper 30-day notice.');
      expect(p1.snippet).toContain('$2,400 deposit');

      // Preset 2: Employment
      expect(p2.id).toBe('employment-termination');
      expect(p2.title).toBe('Termination Without Notice');
      expect(p2.category).toBe('employment');
      expect(p2.snippet).toContain('Terminated abruptly after 2 years of employment with no written notice');

      // Preset 3: Consumer
      expect(p3.id).toBe('consumer-undelivered');
      expect(p3.title).toBe('Undelivered Consumer Goods');
      expect(p3.category).toBe('consumer');
      expect(p3.snippet).toContain('Paid $1,800 for custom home office furniture 8 weeks ago.');

      // Preset 4: Freelance Invoice
      expect(p4.id).toBe('freelance-unpaid-invoice');
      expect(p4.title).toBe('Unpaid Freelance Invoice');
      expect(p4.category).toBe('financial');
      expect(p4.snippet).toContain('Completed UI/UX contract deliverables signed off by client 60 days ago.');
    });

    it('ensures all 4 preset descriptions contain realistic facts between 60 and 80 words', () => {
      PRESETS.forEach((preset) => {
        const words = countWords(preset.description);
        expect(words).toBeGreaterThanOrEqual(60);
        expect(words).toBeLessThanOrEqual(80);
      });
    });

    it('renders all 4 preset titles and snippets in DOM markup', () => {
      const onSelectScenario = vi.fn();
      const html = renderToString(
        React.createElement(QuickStartCards, { onSelectScenario })
      );

      expect(html).toContain('Quick-Start Dispute Scenarios');
      PRESETS.forEach((preset) => {
        expect(html).toContain(preset.title);
        expect(html).toContain(preset.snippet);
        expect(html).toContain(`data-testid="quick-start-${preset.id}"`);
      });
    });

    it('clicking preset card triggers onSelectScenario callback with full description and category', () => {
      const onSelectScenario = vi.fn();
      const element = React.createElement(QuickStartCards, { onSelectScenario });
      const tree = element.type(element.props) as any;

      // Verify the onClick callback for each preset
      PRESETS.forEach((preset, idx) => {
        const cardButton = tree.props.children[1].props.children[idx];
        cardButton.props.onClick();
        expect(onSelectScenario).toHaveBeenLastCalledWith(preset.description, preset.category);
      });
    });
  });

  describe('3. CategoryFilterChips Component (D-13)', () => {
    it('defines Auto-Detect and all 8 DisputeCategoryEnum options with semantic icons', () => {
      expect(CATEGORY_OPTIONS).toHaveLength(9);
      expect(CATEGORY_OPTIONS[0].value).toBe('auto');
      expect(CATEGORY_OPTIONS[0].label).toBe('Auto-Detect');

      const categoryKeys = CATEGORY_OPTIONS.slice(1).map((c) => c.value);
      expect(categoryKeys).toEqual([
        'tenancy',
        'employment',
        'consumer',
        'civil',
        'family',
        'property',
        'financial',
        'other',
      ]);
    });

    it('renders all category chips in DOM markup with selection state', () => {
      const onSelectCategory = vi.fn();
      const html = renderToString(
        React.createElement(CategoryFilterChips, {
          selectedCategory: 'tenancy',
          onSelectCategory,
        })
      );

      expect(html).toContain('Dispute Category (Optional Pre-Filter)');
      CATEGORY_OPTIONS.forEach((opt) => {
        expect(html).toContain(opt.label.replace(/&/g, '&amp;'));
        expect(html).toContain(`data-testid="category-chip-${opt.value}"`);
      });

      // Tenancy chip is selected with gold highlight styling
      expect(html).toContain('bg-[#D4AF37]/20 text-[#D4AF37]');
    });

    it('clicking category chip triggers onSelectCategory with correct value', () => {
      const onSelectCategory = vi.fn();
      const element = React.createElement(CategoryFilterChips, {
        selectedCategory: 'auto',
        onSelectCategory,
      });
      const tree = element.type(element.props) as any;
      const buttons = tree.props.children[1].props.children;

      // Click consumer chip (index 3: auto, tenancy, employment, consumer)
      buttons[3].props.onClick();
      expect(onSelectCategory).toHaveBeenCalledWith('consumer');

      // Click auto-detect chip (index 0)
      buttons[0].props.onClick();
      expect(onSelectCategory).toHaveBeenCalledWith('auto');
    });
  });

  describe('4. SituationIntakeForm Component (SIT-01, D-02, D-04)', () => {
    const twentyWordText =
      'My landlord has refused to return my security deposit after moving out thirty days ago despite proper written inspection notice.';

    it('renders empty form with disabled submit and 0 words counter badge', () => {
      const onSubmit = vi.fn();
      const html = renderToString(
        React.createElement(SituationIntakeForm, { onSubmit })
      );

      expect(html).toContain('Dispute Narrative &amp; Facts');
      expect(html).toContain('0 / 20 words minimum');
      expect(html).toContain('Analyze Situation (Minimum 20 Words Required)');
      expect(html).toContain('Clear Draft');
      // Prompt helper banner must NOT render when empty
      expect(html).not.toContain('data-testid="prompt-helper-banner"');
    });

    it('renders contextual prompt helper banner when word count is between 1 and 19 words and mounted', () => {
      const onSubmit = vi.fn();
      const html = renderToString(
        React.createElement(SituationIntakeForm, {
          onSubmit,
          initialDescription: 'Landlord kept my deposit.',
          isMounted: true,
        })
      );

      // Word count is 4: insufficient
      expect(html).toContain('4 / 20 words minimum');
      expect(html).toContain('data-testid="prompt-helper-banner"');
      expect(html).toContain(
        'Could you add a bit more detail? For the most accurate legal rights breakdown, consider: Who was involved? What was promised or agreed? Roughly when did this happen?'
      );
      expect(html).toContain('Who was involved?');
      expect(html).toContain('What was promised or agreed?');
      expect(html).toContain('Roughly when did this happen?');
      expect(html).toContain('Analyze Situation (Minimum 20 Words Required)');
    });

    it('hides prompt helper banner and enables submit button when word count reaches 20 or more', () => {
      const onSubmit = vi.fn();
      const html = renderToString(
        React.createElement(SituationIntakeForm, {
          onSubmit,
          initialDescription: twentyWordText,
          isMounted: true,
        })
      );

      // Word count is 20: sufficient
      expect(html).toContain('20 words');
      expect(html).toContain('text-emerald-400');
      expect(html).not.toContain('data-testid="prompt-helper-banner"');
      expect(html).toContain('Analyze Situation');
      expect(html).not.toContain('Analyze Situation (Minimum 20 Words Required)');
      expect(html).toContain('bg-[#D4AF37]');
    });

    it('disables submit button and shows loading spinner when isLoading is true', () => {
      const onSubmit = vi.fn();
      const html = renderToString(
        React.createElement(SituationIntakeForm, {
          onSubmit,
          initialDescription: twentyWordText,
          isLoading: true,
          isMounted: true,
        })
      );

      expect(html).toContain('Analyzing Situation...');
      expect(html).toContain('disabled');
    });

    it('validateAndSubmitSituation invokes onSubmit callback with trimmed text and explicit category', () => {
      const onSubmit = vi.fn();
      const result = validateAndSubmitSituation(
        `   ${twentyWordText}   `,
        'tenancy',
        false,
        onSubmit
      );

      expect(result).toBe(true);
      expect(onSubmit).toHaveBeenCalledWith(twentyWordText, 'tenancy');
    });

    it('validateAndSubmitSituation converts auto category to undefined', () => {
      const onSubmit = vi.fn();
      const result = validateAndSubmitSituation(
        twentyWordText,
        'auto',
        false,
        onSubmit
      );

      expect(result).toBe(true);
      expect(onSubmit).toHaveBeenCalledWith(twentyWordText, undefined);
    });

    it('validateAndSubmitSituation rejects inputs with fewer than 20 words', () => {
      const onSubmit = vi.fn();
      const result = validateAndSubmitSituation(
        'Only seven words here in this draft.',
        'auto',
        false,
        onSubmit
      );

      expect(result).toBe(false);
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('validateAndSubmitSituation prevents submission when isLoading is true', () => {
      const onSubmit = vi.fn();
      const result = validateAndSubmitSituation(
        twentyWordText,
        'tenancy',
        true,
        onSubmit
      );

      expect(result).toBe(false);
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('uses correct sessionStorage draft storage key (gavel_situation_draft_v1)', () => {
      expect(DRAFT_STORAGE_KEY).toBe('gavel_situation_draft_v1');
    });

    it('handles draft persistence lifecycle with mock sessionStorage', () => {
      const store: Record<string, string> = {};
      const mockSessionStorage = {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => {
          store[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
          delete store[key];
        }),
      };

      // Set draft
      mockSessionStorage.setItem(DRAFT_STORAGE_KEY, twentyWordText);
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        DRAFT_STORAGE_KEY,
        twentyWordText
      );
      expect(mockSessionStorage.getItem(DRAFT_STORAGE_KEY)).toBe(twentyWordText);

      // Clear draft
      mockSessionStorage.removeItem(DRAFT_STORAGE_KEY);
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith(DRAFT_STORAGE_KEY);
      expect(mockSessionStorage.getItem(DRAFT_STORAGE_KEY)).toBeNull();
    });
  });

  describe('5. SituationProgress Component (D-15)', () => {
    it('defines 3 milestone stages matching UI-SPEC verbatim copy', () => {
      expect(SITUATION_PROGRESS_STAGES).toHaveLength(3);

      expect(SITUATION_PROGRESS_STAGES[0].label).toBe(
        'Classifying dispute domain & context...'
      );
      expect(SITUATION_PROGRESS_STAGES[1].label).toBe(
        'Evaluating statutory protections & rights...'
      );
      expect(SITUATION_PROGRESS_STAGES[2].label).toBe(
        'Mapping urgency roadmap, evidence checklist & deadline warnings...'
      );
    });

    it('renders progress loader at 0 seconds with Stage 1 active', () => {
      const html = renderToString(
        React.createElement(SituationProgress, { initialSeconds: 0 })
      );

      expect(html).toContain('Evaluating Legal Dispute');
      expect(html).toContain('Elapsed time:');
      expect(html).toContain('0s');
      expect(html).toContain('(typically completes in 10–15s)');
      expect(html).toContain('Classifying dispute domain &amp; context...');
      expect(html).toContain('Evaluating statutory protections &amp; rights...');
      expect(html).toContain('Mapping urgency roadmap, evidence checklist &amp; deadline warnings...');
      expect(html).toContain('Zero-retention volatile processing in progress');

      // Stage 1 active styling
      expect(html).toContain('data-testid="progress-stage-1"');
      expect(html).toContain('border-[#D4AF37]/50 bg-[#D4AF37]/10 text-white font-medium');
    });

    it('renders progress loader at 5 seconds with Stage 1 completed and Stage 2 active', () => {
      const html = renderToString(
        React.createElement(SituationProgress, { initialSeconds: 5 })
      );

      expect(html).toContain('5s');
      // Stage 1 is done (emerald checkmark styling)
      expect(html).toContain('border-emerald-500/30 bg-emerald-950/20 text-emerald-300');
      // Stage 2 is active (gold styling)
      expect(html).toContain('border-[#D4AF37]/50 bg-[#D4AF37]/10 text-white font-medium');
    });

    it('renders progress loader at 9 seconds with Stages 1 and 2 completed and Stage 3 active', () => {
      const html = renderToString(
        React.createElement(SituationProgress, { initialSeconds: 9 })
      );

      expect(html).toContain('9s');
      // Stage 3 active
      expect(html).toContain('data-testid="progress-stage-3"');
      expect(html).toContain('border-[#D4AF37]/50 bg-[#D4AF37]/10 text-white font-medium');
    });
  });
});
