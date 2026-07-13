import { describe, expect, it } from 'vitest';

import {
  applyReceipt,
  type ContentDocument,
  EXPORT_VERSION,
  exportPackage,
  parseContentDocument,
  performanceReport,
  RECEIPT_VERSION,
} from './content-packages';

function variant(id: string, format: string, hypothesis: string, hook: string) {
  const payoff = `The concrete payoff for ${id}`;
  return {
    id,
    state: 'approved' as const,
    format,
    hypothesis,
    hook,
    payoff,
    targetDurationSeconds: 20,
    scenes: [
      {
        label: 'hook',
        durationSeconds: 1.5,
        narration: hook,
        onScreenText: hook,
        visual: 'Close crop with visible motion',
      },
      {
        label: 'payoff',
        durationSeconds: 8,
        narration: payoff,
        onScreenText: payoff,
        visual: 'Demonstrate the result clearly',
      },
    ],
    visualDirection: 'High-contrast practical demonstration',
    caption: `${hook} ${payoff}`,
    cta: 'Read the guide',
    destinationUrl: 'https://significanthobbies.com/blog/start-watercolor',
    tags: ['watercolor', 'hobbies'],
    provenance: {
      sourceIds: ['section:start-small'],
      sourceUrls: ['https://significanthobbies.com/blog/start-watercolor'],
      generatedAt: '2026-07-13T08:00:00.000Z',
      approvedAt: '2026-07-13T09:00:00.000Z',
      approvedBy: 'fixture-owner',
      audience: 'Adults beginning watercolor',
    },
    receipts: [],
    metrics: [],
  };
}

function validDocument(): ContentDocument {
  return parseContentDocument({
    schemaVersion: 1,
    packages: [
      {
        id: 'watercolor-001',
        revision: 1,
        state: 'ready',
        slug: 'start-watercolor',
        title: 'Start Watercolor Without Overthinking It',
        excerpt: 'A sourced, practical route into watercolor.',
        category: 'Getting Started',
        emoji: '🎨',
        readTime: 6,
        relatedHobbies: ['Watercolor'],
        sections: [
          {
            heading: 'Start small',
            paragraphs: ['Use one brush and three colors for the first study.'],
          },
        ],
        takeaways: ['Small constraints make practice easier.'],
        productActions: [{ label: 'Build your timeline', url: '/timeline/new' }],
        sources: [
          {
            title: 'Watercolor handbook',
            url: 'https://example.com/watercolor',
            claim: 'Basic materials guidance.',
          },
        ],
        youtube: null,
        reels: [
          variant(
            'demo',
            'demonstration',
            'A visible result earns attention',
            'Three colors are enough for your first painting'
          ),
          variant(
            'myth',
            'myth-bust',
            'Challenge gear anxiety',
            'Your expensive brush is not the missing ingredient'
          ),
          variant(
            'steps',
            'three-steps',
            'A numbered plan improves saves',
            'Try this tiny watercolor plan after work'
          ),
        ],
      },
    ],
  });
}

function publicationReceipt(externalId = 'youtube-123') {
  return {
    schema: RECEIPT_VERSION,
    receiptId: `scr_${externalId === 'youtube-123' ? '1'.repeat(64) : '2'.repeat(64)}`,
    stage: 'upload' as const,
    packageId: 'watercolor-001',
    packageRevision: 1,
    variantId: 'demo',
    attributionKey: 'watercolor-001:1:demo',
    provider: 'youtube',
    status: 'published' as const,
    externalId,
    externalUrl: `https://youtube.com/watch?v=${externalId}`,
    occurredAt: '2026-07-13T10:00:00.000Z',
    metrics: null,
    evidenceWindow: null,
    details: {
      thumbnailUrl: 'https://example.com/thumb.jpg',
      chapters: [{ title: 'The hook', startSeconds: 0 }],
    },
  };
}

describe('content package validation', () => {
  it('accepts and normalizes a complete ready package', () => {
    const document = validDocument();
    expect(document.packages[0].reels).toHaveLength(3);
    expect(document.packages[0].reels[0].receipts).toEqual([]);
  });

  it('rejects unsupported document versions with a field path', () => {
    expect(() => parseContentDocument({ schemaVersion: 2, packages: [] })).toThrow(/schemaVersion/);
  });

  it('rejects weak hooks once a variant is approved', () => {
    const document = validDocument();
    document.packages[0].reels[0].hook = 'In this video we paint a leaf';
    document.packages[0].reels[0].scenes[0].narration = 'In this video we paint a leaf';
    expect(() => parseContentDocument(document)).toThrow(/weak hook preamble/);
  });

  it('rejects insufficient variant diversity', () => {
    const document = validDocument();
    for (const reel of document.packages[0].reels) {
      reel.format = 'talking-head';
      reel.hypothesis = 'The same hypothesis';
    }
    expect(() => parseContentDocument(document)).toThrow(/distinct format\/hypothesis/);
  });
});

describe('content handoff and receipts', () => {
  it('exports only approved variants in the versioned envelope', () => {
    const document = validDocument();
    document.packages[0].reels[1].state = 'draft';
    document.packages[0].reels.push({
      ...variant(
        'exported',
        'list',
        'Previously exported variant',
        'One brush changed how I practiced'
      ),
      state: 'exported',
    });
    const envelope = exportPackage(document.packages[0], '2026-07-13T12:00:00.000Z');
    expect(envelope.schema).toBe(EXPORT_VERSION);
    expect(envelope.exportedAt).toBe('2026-07-13T12:00:00.000Z');
    expect(envelope.variants.map((item) => item.id)).toEqual(['demo', 'steps', 'exported']);
    expect(envelope.variants.every((item) => item.status === 'approved')).toBe(true);
    expect(envelope.variants[0].scenes[0]).toEqual({
      label: 'hook',
      durationSeconds: 1.5,
      narration: 'Three colors are enough for your first painting',
      onScreenText: 'Three colors are enough for your first painting',
      visual: 'Close crop with visible motion',
    });
  });

  it('applies identical publication receipts idempotently', () => {
    const first = applyReceipt(validDocument(), publicationReceipt());
    const second = applyReceipt(first.document, publicationReceipt());
    expect(first.changed).toBe(true);
    expect(first.document.packages[0].youtube?.videoId).toBe('youtube-123');
    expect(first.document.packages[0].reels[0].state).toBe('posted');
    expect(second).toEqual({ document: first.document, changed: false });
  });

  it('rejects a conflicting platform id without mutating the document', () => {
    const applied = applyReceipt(validDocument(), publicationReceipt()).document;
    const before = structuredClone(applied);
    expect(() => applyReceipt(applied, publicationReceipt('youtube-456'))).toThrow(
      /conflicting youtube id/
    );
    expect(applied).toEqual(before);
  });

  it('ranks comparable metrics and produces a draft-only follow-up brief', () => {
    let document = validDocument();
    for (const [variantId, views] of [
      ['demo', 1000],
      ['myth', 500],
    ] as const) {
      document = applyReceipt(document, {
        schema: RECEIPT_VERSION,
        receiptId: `scr_${variantId === 'demo' ? '3'.repeat(64) : '4'.repeat(64)}`,
        stage: 'metrics',
        packageId: 'watercolor-001',
        packageRevision: 1,
        variantId,
        attributionKey: `watercolor-001:1:${variantId}`,
        provider: 'instagram',
        status: 'collected',
        externalId: `post-${variantId}`,
        externalUrl: null,
        occurredAt: `2026-07-13T1${variantId === 'demo' ? 1 : 2}:00:00.000Z`,
        metrics: {
          views,
          watchTimeSeconds: null,
          averageViewDurationSeconds: null,
          retentionRate: null,
          likes: 25,
          comments: 5,
          shares: null,
          saves: null,
          engagementRate: null,
        },
        evidenceWindow: null,
        details: null,
      }).document;
    }
    const [report] = performanceReport(document);
    expect(report.comparable).toBe(true);
    expect(report.variants[0].variantId).toBe('demo');
    expect(report.followUpBrief).toContain('Draft a follow-up');
    expect(document.packages[0].state).toBe('ready');
  });
});
