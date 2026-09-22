import { describe, it, expect } from 'vitest';
import {
  // Common
  RiskLevelEnum,
  ActionTimingEnum,
  ActionTypeEnum,
  InconsistencySeverityEnum,
  ErrorResponseSchema,
  // Upload
  UploadErrorCodeEnum,
  UploadDataSchema,
  UploadResponseSchema,
  // Document (Mode 1)
  ClauseObligationEnum,
  ClauseSchema,
  ActionItemSchema,
  LawyerQuestionSchema,
  DocumentAnalysisSchema,
  // Situation (Mode 2)
  DisputeCategoryEnum,
  RoadmapUrgencyEnum,
  StatutoryRightSchema,
  RoadmapStepSchema,
  DocumentEvidenceSchema,
  SituationAnalysisSchema,
  // Comparison (Mode 3)
  FavorabilityEnum,
  ClauseDiffSchema,
  InconsistencyItemSchema,
  ComparisonSchema,
} from '@/lib/schemas';

describe('Domain-Modular Zod Schemas', () => {
  describe('Canonical Enums (lib/schemas/common.ts)', () => {
    it('validates RiskLevelEnum values correctly', () => {
      expect(RiskLevelEnum.parse('high')).toBe('high');
      expect(RiskLevelEnum.parse('caution')).toBe('caution');
      expect(RiskLevelEnum.parse('standard')).toBe('standard');

      expect(() => RiskLevelEnum.parse('critical')).toThrow();
      expect(() => RiskLevelEnum.parse('low')).toThrow();
      expect(() => RiskLevelEnum.parse('')).toThrow();
    });

    it('validates ActionTimingEnum values correctly', () => {
      expect(ActionTimingEnum.parse('immediate')).toBe('immediate');
      expect(ActionTimingEnum.parse('before_signing')).toBe('before_signing');
      expect(ActionTimingEnum.parse('after_signing')).toBe('after_signing');

      expect(() => ActionTimingEnum.parse('later')).toThrow();
      expect(() => ActionTimingEnum.parse('pre_signing')).toThrow();
    });

    it('validates ActionTypeEnum values correctly', () => {
      expect(ActionTypeEnum.parse('negotiate')).toBe('negotiate');
      expect(ActionTypeEnum.parse('verify')).toBe('verify');
      expect(ActionTypeEnum.parse('refuse')).toBe('refuse');
      expect(ActionTypeEnum.parse('accept')).toBe('accept');

      expect(() => ActionTypeEnum.parse('sue')).toThrow();
      expect(() => ActionTypeEnum.parse('ignore')).toThrow();
    });

    it('validates InconsistencySeverityEnum values correctly', () => {
      expect(InconsistencySeverityEnum.parse('critical')).toBe('critical');
      expect(InconsistencySeverityEnum.parse('notable')).toBe('notable');
      expect(InconsistencySeverityEnum.parse('minor')).toBe('minor');

      expect(() => InconsistencySeverityEnum.parse('high')).toThrow();
      expect(() => InconsistencySeverityEnum.parse('low')).toThrow();
    });

    it('validates ErrorResponseSchema', () => {
      const valid = {
        error: 'RESOURCE_NOT_FOUND',
        message: 'The requested document does not exist.',
        details: { docId: '123' },
      };
      expect(ErrorResponseSchema.parse(valid)).toEqual(valid);

      const minimal = {
        error: 'GENERIC_ERROR',
        message: 'Something went wrong.',
      };
      expect(ErrorResponseSchema.parse(minimal)).toEqual(minimal);

      expect(() => ErrorResponseSchema.parse({ error: 'FAIL' })).toThrow();
    });
  });

  describe('Upload Schemas (lib/schemas/upload.ts)', () => {
    it('validates all canonical UploadErrorCodeEnum values', () => {
      const codes = [
        'INVALID_REQUEST',
        'PAYLOAD_TOO_LARGE',
        'UNSUPPORTED_TYPE',
        'CORRUPT_FILE',
        'PASSWORD_PROTECTED',
        'EMPTY_TEXT',
        'INTERNAL_ERROR',
      ];
      for (const code of codes) {
        expect(UploadErrorCodeEnum.parse(code)).toBe(code);
      }

      expect(() => UploadErrorCodeEnum.parse('UNKNOWN_ERROR')).toThrow();
    });

    it('validates UploadDataSchema for text documents and image payloads', () => {
      const textData = {
        text: 'This is the contract text.',
        isImage: false,
        mimeType: 'application/pdf',
        fileName: 'lease.pdf',
        sizeBytes: 1024,
        wordCount: 5,
      };
      expect(UploadDataSchema.parse(textData)).toEqual(textData);

      const imageData = {
        text: '',
        isImage: true,
        rawBase64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        mimeType: 'image/png',
        fileName: 'scan.png',
        sizeBytes: 2048,
        wordCount: 0,
      };
      expect(UploadDataSchema.parse(imageData)).toEqual(imageData);

      // Negative sizeBytes or wordCount should fail
      expect(() =>
        UploadDataSchema.parse({
          ...textData,
          sizeBytes: -1,
        })
      ).toThrow();
      expect(() =>
        UploadDataSchema.parse({
          ...textData,
          wordCount: -1,
        })
      ).toThrow();
    });

    it('validates UploadResponseSchema for success and failure envelopes', () => {
      const successResp = {
        success: true,
        data: {
          text: 'Extracted text',
          isImage: false,
          mimeType: 'application/pdf',
          fileName: 'doc.pdf',
          sizeBytes: 500,
          wordCount: 2,
        },
      };
      expect(UploadResponseSchema.parse(successResp).success).toBe(true);

      const failureResp = {
        success: false,
        error: 'PASSWORD_PROTECTED',
        message: 'The file is encrypted.',
      };
      expect(UploadResponseSchema.parse(failureResp).error).toBe('PASSWORD_PROTECTED');

      // Invalid error code in envelope should fail
      expect(() =>
        UploadResponseSchema.parse({
          success: false,
          error: 'INVALID_ENUM_CODE',
        })
      ).toThrow();
    });
  });

  describe('Mode 1 Document Schemas (lib/schemas/document.ts)', () => {
    it('validates ClauseSchema and contains non-UPL directives in description', () => {
      const validClause = {
        id: 'clause-1',
        title: 'Liquidated Damages',
        originalText: 'Tenant shall pay $5,000 for early termination.',
        simplified: 'Specifies a $5,000 fee if the agreement ends prematurely.',
        risk: 'high',
        riskReason: 'Imposes substantial unilateral financial liability on tenant.',
        obligation: 'user',
      };
      expect(ClauseSchema.parse(validClause)).toEqual(validClause);

      // Verify non-UPL directive embedded in simplified description
      const desc = ClauseSchema.shape.simplified.description;
      expect(desc).toBeDefined();
      expect(desc).toContain('DO NOT use prescriptive directives');
      expect(desc).toContain('"you should"');

      // Invalid risk level should throw
      expect(() =>
        ClauseSchema.parse({
          ...validClause,
          risk: 'extreme',
        })
      ).toThrow();

      // Invalid obligation should throw
      expect(() =>
        ClauseSchema.parse({
          ...validClause,
          obligation: 'landlord_only',
        })
      ).toThrow();
    });

    it('validates ActionItemSchema and LawyerQuestionSchema', () => {
      const actionItem = {
        id: 'action-1',
        timing: 'before_signing',
        actionType: 'negotiate',
        description: 'Request removal or cap of early termination penalty fee.',
        relatedClauseId: 'clause-1',
      };
      expect(ActionItemSchema.parse(actionItem)).toEqual(actionItem);

      const lawyerQuestion = {
        id: 'question-1',
        question: 'Is the $5,000 early termination clause enforceable under local tenancy law?',
        context: 'Section 4 imposes an immediate fixed fee regardless of mitigation.',
        relatedClauseId: 'clause-1',
      };
      expect(LawyerQuestionSchema.parse(lawyerQuestion)).toEqual(lawyerQuestion);
    });

    it('validates full DocumentAnalysisSchema composite contract', () => {
      const analysis = {
        documentType: 'Residential Lease Agreement',
        parties: ['Jane Doe (Tenant)', 'Acme Properties LLC (Landlord)'],
        summary: 'Standard residential lease with onerous early termination liquidated damages.',
        clauses: [
          {
            id: 'clause-1',
            title: 'Liquidated Damages',
            originalText: 'Tenant shall pay $5,000 for early termination.',
            simplified: 'Specifies a $5,000 fee if the agreement ends prematurely.',
            risk: 'high',
            riskReason: 'Imposes substantial unilateral financial liability.',
            obligation: 'user',
          },
        ],
        checklist: [
          {
            id: 'action-1',
            timing: 'before_signing',
            actionType: 'negotiate',
            description: 'Request removal or cap on liquidated damages.',
            relatedClauseId: 'clause-1',
          },
        ],
        lawyerQuestions: [
          {
            id: 'question-1',
            question: 'Is this liquidated damages sum enforceable under statutory caps?',
            context: 'Early termination provision Section 4.',
            relatedClauseId: 'clause-1',
          },
        ],
      };

      const parsed = DocumentAnalysisSchema.parse(analysis);
      expect(parsed.documentType).toBe('Residential Lease Agreement');
      expect(parsed.clauses).toHaveLength(1);
      expect(parsed.checklist).toHaveLength(1);
      expect(parsed.lawyerQuestions).toHaveLength(1);
    });
  });

  describe('Mode 2 Situation Schemas (lib/schemas/situation.ts)', () => {
    it('validates DisputeCategoryEnum and RoadmapUrgencyEnum', () => {
      const categories = [
        'tenancy',
        'employment',
        'consumer',
        'civil',
        'family',
        'property',
        'financial',
        'other',
      ];
      for (const cat of categories) {
        expect(DisputeCategoryEnum.parse(cat)).toBe(cat);
      }
      expect(() => DisputeCategoryEnum.parse('criminal_defense')).toThrow();

      expect(RoadmapUrgencyEnum.parse('immediate')).toBe('immediate');
      expect(RoadmapUrgencyEnum.parse('within-7-days')).toBe('within-7-days');
      expect(RoadmapUrgencyEnum.parse('within-30-days')).toBe('within-30-days');
      expect(RoadmapUrgencyEnum.parse('when-ready')).toBe('when-ready');
      expect(() => RoadmapUrgencyEnum.parse('soon')).toThrow();
      expect(() => RoadmapUrgencyEnum.parse('informational')).toThrow();
      expect(() => RoadmapUrgencyEnum.parse('low')).toThrow();

      expect(
        DocumentEvidenceSchema.parse({
          document: 'Move-in inspection checklist',
          why: 'Establishes baseline condition of the rental unit',
        })
      ).toEqual({
        document: 'Move-in inspection checklist',
        why: 'Establishes baseline condition of the rental unit',
      });
      expect(() => DocumentEvidenceSchema.parse({ document: 'Missing why' })).toThrow();
    });

    it('validates SituationAnalysisSchema composite structure', () => {
      const situation = {
        disputeCategory: 'tenancy',
        summary: 'Landlord is withholding security deposit citing normal wear and tear.',
        rights: [
          {
            title: 'Right to Itemized Deductions',
            explanation: 'Landlords are typically required to provide an itemized list of deductions with receipts.',
            statuteReference: 'Cal. Civ. Code § 1950.5(g)(2)',
          },
        ],
        roadmap: [
          {
            step: 'Demand Letter',
            description: 'Send a formal written demand requesting return of deposit within statutory timeframe.',
            urgency: 'immediate',
            doableWithoutLawyer: true,
          },
        ],
        documentsToGather: [
          {
            document: 'Move-in inspection checklist',
            why: 'Establishes baseline condition of the rental unit',
          },
          {
            document: 'Move-out photographs',
            why: 'Provides visual proof of apartment condition upon surrender',
          },
          {
            document: 'Bank transfer receipt',
            why: 'Confirms original security deposit payment amount and date',
          },
        ],
        whenToCallLawyer: ['If landlord files small claims counterclaim exceeding deposit amount'],
        deadlineFlags: ['21 days from surrender of premises for return of security deposit'],
        estimatedTimeline: 'Typically 1–3 months via formal demand letter, or 6–12 months in small claims forum',
      };

      const parsed = SituationAnalysisSchema.parse(situation);
      expect(parsed.disputeCategory).toBe('tenancy');
      expect(parsed.rights).toHaveLength(1);
      expect(parsed.roadmap[0].doableWithoutLawyer).toBe(true);
      expect(parsed.documentsToGather).toHaveLength(3);
      expect(parsed.documentsToGather[0].why).toContain('baseline condition');
      expect(parsed.deadlineFlags).toHaveLength(1);
      expect(parsed.estimatedTimeline).toContain('Typically 1–3 months');
    });
  });

  describe('Mode 3 Comparison Schemas (lib/schemas/comparison.ts)', () => {
    it('validates FavorabilityEnum', () => {
      expect(FavorabilityEnum.parse('docA')).toBe('docA');
      expect(FavorabilityEnum.parse('docB')).toBe('docB');
      expect(FavorabilityEnum.parse('neutral')).toBe('neutral');

      expect(() => FavorabilityEnum.parse('docC')).toThrow();
      expect(() => FavorabilityEnum.parse('both')).toThrow();
    });

    it('validates ComparisonSchema composite structure', () => {
      const comparison = {
        favorabilityVerdict: 'docA',
        verdictRationale: 'Document A offers broader liability caps and mutual indemnification.',
        differences: [
          {
            category: 'Indemnification',
            textDocA: 'Each party indemnifies the other for third party claims.',
            textDocB: 'Vendor alone indemnifies Client for all claims.',
            favors: 'docA',
            riskRating: 'standard',
            notes: 'Doc A establishes bilateral protection while Doc B is one-sided.',
          },
        ],
        inconsistencies: [
          {
            clauseTitle: 'Termination Notice Period',
            description: 'Doc A specifies 30 days written notice while Section 12 says immediate termination.',
            severity: 'notable',
          },
        ],
        negotiationGuide: [
          'Propose adopting Doc A mutual indemnification structure.',
          'Reconcile Section 12 termination clause with 30-day notice requirement.',
        ],
      };

      const parsed = ComparisonSchema.parse(comparison);
      expect(parsed.favorabilityVerdict).toBe('docA');
      expect(parsed.differences).toHaveLength(1);
      expect(parsed.inconsistencies[0].severity).toBe('notable');
      expect(parsed.negotiationGuide).toHaveLength(2);
    });
  });
});
