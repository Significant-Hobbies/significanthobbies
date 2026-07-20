import { z } from 'zod';

import contentDocumentJson from '~/content/content-packages.json';

const SITE_URL = 'https://significanthobbies.com';
export const RECEIPT_VERSION = 'significant-content-receipt/v1' as const;
export const EXPORT_VERSION = 'significant-content-reels/v1' as const;

const lifecycleOrder = ['draft', 'approved', 'exported', 'rendered', 'posted'] as const;
const weakPreamble = /^(in this video|today we(?:'re| are) going to)\b/i;

const chapterSchema = z.object({
  title: z.string().min(1),
  startSeconds: z.number().nonnegative(),
});
const metricsSchema = z.object({
  views: z.number().nonnegative().nullable(),
  watchTimeSeconds: z.number().nonnegative().nullable(),
  averageViewDurationSeconds: z.number().nonnegative().nullable(),
  retentionRate: z.number().min(0).max(1).nullable(),
  likes: z.number().nonnegative().nullable(),
  comments: z.number().nonnegative().nullable(),
  shares: z.number().nonnegative().nullable(),
  saves: z.number().nonnegative().nullable(),
  engagementRate: z.number().nonnegative().nullable(),
});

const receiptSchema = z
  .object({
    schema: z.literal(RECEIPT_VERSION),
    receiptId: z.string().regex(/^scr_[a-f0-9]{64}$/),
    stage: z.enum(['render', 'upload', 'metrics']),
    packageId: z.string().min(1),
    packageRevision: z.number().int().positive(),
    variantId: z.string().min(1),
    attributionKey: z.string().min(1),
    provider: z.string().min(1),
    status: z.enum(['completed', 'published', 'scheduled', 'collected']),
    externalId: z.string().min(1).nullable(),
    externalUrl: z.url().nullable(),
    occurredAt: z.iso.datetime(),
    metrics: metricsSchema.nullable(),
    evidenceWindow: z
      .object({ start: z.iso.datetime().nullable(), end: z.iso.datetime().nullable() })
      .nullable(),
    details: z.record(z.string(), z.unknown()).nullable(),
  })
  .superRefine((receipt, ctx) => {
    const attribution = `${receipt.packageId}:${receipt.packageRevision}:${receipt.variantId}`;
    if (receipt.attributionKey !== attribution) {
      ctx.addIssue({
        code: 'custom',
        path: ['attributionKey'],
        message: `must equal ${attribution}`,
      });
    }
    if (receipt.stage === 'render' && receipt.status !== 'completed') {
      ctx.addIssue({
        code: 'custom',
        path: ['status'],
        message: 'render status must be completed',
      });
    }
    if (
      receipt.stage === 'upload' &&
      (!['published', 'scheduled'].includes(receipt.status) ||
        !receipt.externalId ||
        !receipt.externalUrl)
    ) {
      ctx.addIssue({
        code: 'custom',
        message: 'upload requires published/scheduled status and externalId/externalUrl',
      });
    }
    if (
      receipt.stage === 'metrics' &&
      (receipt.status !== 'collected' || !receipt.externalId || !receipt.metrics)
    ) {
      ctx.addIssue({
        code: 'custom',
        message: 'metrics requires collected status, externalId, and metrics',
      });
    }
  });

const storedMetricsSchema = metricsSchema.extend({
  provider: z.string().min(1),
  externalId: z.string().min(1),
  collectedAt: z.iso.datetime(),
});

const reelVariantSchema = z.object({
  id: z.string().min(1),
  state: z.enum(lifecycleOrder),
  format: z.string().min(1),
  hypothesis: z.string().min(1),
  hook: z.string().min(1),
  payoff: z.string().min(1),
  targetDurationSeconds: z.number().positive(),
  scenes: z
    .array(
      z.object({
        label: z.string().min(1),
        durationSeconds: z.number().positive(),
        narration: z.string().min(1),
        onScreenText: z.string().min(1).nullable(),
        visual: z.string().min(1),
      })
    )
    .min(1),
  visualDirection: z.string().min(1),
  caption: z.string().min(1),
  cta: z.string().min(1),
  destinationUrl: z.url(),
  tags: z.array(z.string().min(1)).min(1),
  provenance: z.object({
    sourceIds: z.array(z.string().min(1)).min(1),
    sourceUrls: z.array(z.url()).min(1),
    generatedAt: z.iso.datetime(),
    approvedAt: z.iso.datetime(),
    approvedBy: z.string().min(1),
    audience: z.string().min(1).nullable(),
  }),
  receipts: z.array(receiptSchema).default([]),
  metrics: z.array(storedMetricsSchema).default([]),
});

const contentPackageSchema = z.object({
  id: z.string().min(1),
  revision: z.number().int().positive(),
  state: z.enum(['draft', 'ready', 'published', 'archived']),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(1),
  excerpt: z.string().min(1),
  category: z.string().min(1),
  emoji: z.string().min(1),
  readTime: z.number().int().positive(),
  publishedAt: z.string().min(1).optional(),
  relatedHobbies: z.array(z.string().min(1)).min(1),
  sections: z.array(
    z.object({ heading: z.string().min(1), paragraphs: z.array(z.string().min(1)).min(1) })
  ),
  takeaways: z.array(z.string().min(1)),
  productActions: z.array(z.object({ label: z.string().min(1), url: z.string().min(1) })),
  sources: z.array(
    z.object({ title: z.string().min(1), url: z.url(), claim: z.string().min(1).optional() })
  ),
  youtube: z
    .object({
      videoId: z.string().min(1),
      url: z.url(),
      publishedAt: z.iso.datetime(),
      thumbnailUrl: z.url().optional(),
      chapters: z.array(chapterSchema).optional(),
    })
    .nullable(),
  reels: z.array(reelVariantSchema),
});

const contentDocumentSchema = z
  .object({ schemaVersion: z.literal(1), packages: z.array(contentPackageSchema) })
  .superRefine((document, ctx) => {
    const ids = new Set<string>();
    const slugs = new Set<string>();
    for (const [packageIndex, pkg] of document.packages.entries()) {
      if (ids.has(pkg.id)) addIssue(ctx, packageIndex, 'id', `duplicate package id: ${pkg.id}`);
      if (slugs.has(pkg.slug))
        addIssue(ctx, packageIndex, 'slug', `duplicate package slug: ${pkg.slug}`);
      ids.add(pkg.id);
      slugs.add(pkg.slug);

      const canonicalUrl = `${SITE_URL}/blog/${pkg.slug}`;
      const variantIds = new Set<string>();
      const normalizedHooks = new Set<string>();
      for (const [variantIndex, variant] of pkg.reels.entries()) {
        const prefix = ['packages', packageIndex, 'reels', variantIndex] as const;
        if (variantIds.has(variant.id)) {
          ctx.addIssue({
            code: 'custom',
            path: [...prefix, 'id'],
            message: 'duplicate variant id',
          });
        }
        variantIds.add(variant.id);
        if (variant.state !== 'draft') {
          const normalizedHook = normalizeHook(variant.hook);
          if (normalizedHooks.has(normalizedHook)) {
            ctx.addIssue({
              code: 'custom',
              path: [...prefix, 'hook'],
              message: 'duplicate normalized hook',
            });
          }
          normalizedHooks.add(normalizedHook);
          if (weakPreamble.test(variant.hook)) {
            ctx.addIssue({
              code: 'custom',
              path: [...prefix, 'hook'],
              message: 'weak hook preamble',
            });
          }
          const firstScene = variant.scenes[0];
          if (firstScene.durationSeconds > 1.5) {
            ctx.addIssue({
              code: 'custom',
              path: [...prefix, 'scenes', 0, 'durationSeconds'],
              message: 'first scene exceeds 1.5 seconds',
            });
          }
          if (normalizeHook(firstScene.narration) !== normalizedHook) {
            ctx.addIssue({
              code: 'custom',
              path: [...prefix, 'scenes', 0, 'narration'],
              message: 'first scene must contain the exact hook',
            });
          }
          if (
            !variant.scenes.some((scene) =>
              normalizeText(scene.narration).includes(normalizeText(variant.payoff))
            )
          ) {
            ctx.addIssue({
              code: 'custom',
              path: [...prefix, 'payoff'],
              message: 'payoff must appear in the scene plan',
            });
          }
          if (normalizeUrl(variant.destinationUrl) !== canonicalUrl) {
            ctx.addIssue({
              code: 'custom',
              path: [...prefix, 'destinationUrl'],
              message: `destination URL must resolve to ${canonicalUrl}`,
            });
          }
        }
        if (
          variant.state === 'rendered' &&
          !variant.receipts.some(
            (receipt) => receipt.stage === 'render' && receipt.status === 'completed'
          )
        ) {
          ctx.addIssue({
            code: 'custom',
            path: [...prefix, 'state'],
            message: 'rendered state requires a completed render receipt',
          });
        }
        if (
          variant.state === 'posted' &&
          !variant.receipts.some(
            (receipt) => receipt.stage === 'upload' && receipt.status === 'published'
          )
        ) {
          ctx.addIssue({
            code: 'custom',
            path: [...prefix, 'state'],
            message: 'posted state requires a published upload receipt',
          });
        }
      }

      if (pkg.state === 'ready' || pkg.state === 'published') {
        const approved = pkg.reels.filter((variant) => variant.state !== 'draft');
        if (approved.length < 3)
          addIssue(
            ctx,
            packageIndex,
            'reels',
            'ready packages require at least three approved variants'
          );
        const diversity = new Set(
          approved.map(
            (variant) => `${normalizeText(variant.format)}|${normalizeText(variant.hypothesis)}`
          )
        );
        if (diversity.size < 3)
          addIssue(
            ctx,
            packageIndex,
            'reels',
            'approved variants require three distinct format/hypothesis combinations'
          );
        if (pkg.sections.length === 0)
          addIssue(ctx, packageIndex, 'sections', 'ready packages require article sections');
        if (pkg.sources.length === 0)
          addIssue(
            ctx,
            packageIndex,
            'sources',
            'ready packages require sources for factual claims'
          );
      }
      if (pkg.state === 'published' && !pkg.publishedAt)
        addIssue(ctx, packageIndex, 'publishedAt', 'published packages require publishedAt');
    }
  });

function addIssue(ctx: z.RefinementCtx, packageIndex: number, field: string, message: string) {
  ctx.addIssue({ code: 'custom', path: ['packages', packageIndex, field], message });
}

export type ContentDocument = z.infer<typeof contentDocumentSchema>;
export type ContentPackage = z.infer<typeof contentPackageSchema>;
type ContentReceipt = z.infer<typeof receiptSchema>;

function normalizeText(value: string): string {
  return value
    .normalize('NFKC')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function normalizeHook(value: string): string {
  return normalizeText(value).replace(/^(watch|wait for it)\s+/, '');
}

function normalizeUrl(value: string): string {
  try {
    const url = new URL(value, SITE_URL);
    return `${url.origin}${url.pathname.replace(/\/$/, '')}`;
  } catch {
    return value;
  }
}

export function formatValidationError(error: z.ZodError): string {
  return error.issues
    .map((issue) => `${issue.path.join('.') || 'document'}: ${issue.message}`)
    .join('\n');
}

export function parseContentDocument(input: unknown): ContentDocument {
  const result = contentDocumentSchema.safeParse(input);
  if (!result.success) throw new Error(formatValidationError(result.error));
  return result.data;
}

const contentDocument = parseContentDocument(contentDocumentJson);

export function getPublishedPackages(
  document: ContentDocument = contentDocument
): ContentPackage[] {
  return document.packages.filter((pkg) => pkg.state === 'published');
}

export function getPackageBySlug(
  slug: string,
  document: ContentDocument = contentDocument
): ContentPackage | undefined {
  return getPublishedPackages(document).find((pkg) => pkg.slug === slug);
}

export function getPackagesForHobby(
  hobby: string,
  document: ContentDocument = contentDocument
): ContentPackage[] {
  const normalized = normalizeText(hobby);
  return getPublishedPackages(document).filter((pkg) =>
    pkg.relatedHobbies.some((name) => normalizeText(name) === normalized)
  );
}

export function exportPackage(pkg: ContentPackage, exportedAt: string) {
  if (pkg.state !== 'ready' && pkg.state !== 'published')
    throw new Error(`package ${pkg.id} is not ready for export`);
  if (!z.iso.datetime().safeParse(exportedAt).success)
    throw new Error('exportedAt must be an ISO timestamp');
  const sourceUrl = `${SITE_URL}/blog/${pkg.slug}`;
  return {
    schema: EXPORT_VERSION,
    packageId: pkg.id,
    packageRevision: pkg.revision,
    sourceUrl,
    destinationUrl: sourceUrl,
    exportedAt,
    variants: pkg.reels
      .filter((variant) => variant.state !== 'draft')
      .map(({ state: _state, receipts: _receipts, metrics: _metrics, ...variant }) => ({
        ...variant,
        status: 'approved' as const,
      })),
  };
}

function receiptKey(receipt: ContentReceipt): string {
  return receipt.receiptId;
}

export function applyReceipt(
  document: ContentDocument,
  input: unknown
): { document: ContentDocument; changed: boolean } {
  const receipt = receiptSchema.parse(input);
  const next = structuredClone(document);
  const pkg = next.packages.find(
    (item) => item.id === receipt.packageId && item.revision === receipt.packageRevision
  );
  if (!pkg)
    throw new Error(`unknown package/revision: ${receipt.packageId}@${receipt.packageRevision}`);
  const variant = pkg.reels.find((item) => item.id === receipt.variantId);
  if (!variant) throw new Error(`unknown variant: ${receipt.variantId}`);
  const key = receiptKey(receipt);
  if (variant.receipts.some((item) => item.receiptId === key)) return { document, changed: false };

  if (receipt.stage === 'upload') {
    const existingUpload = variant.receipts.find(
      (item) => item.stage === 'upload' && item.provider === receipt.provider
    );
    if (
      existingUpload?.externalId &&
      receipt.externalId &&
      existingUpload.externalId !== receipt.externalId
    ) {
      throw new Error(
        `conflicting ${receipt.provider} id for ${pkg.id}/${variant.id}: ${existingUpload.externalId} != ${receipt.externalId}`
      );
    }
  }

  if (
    receipt.stage === 'upload' &&
    receipt.status === 'published' &&
    receipt.provider === 'youtube'
  ) {
    if (pkg.youtube && pkg.youtube.videoId !== receipt.externalId) {
      throw new Error(
        `conflicting youtube id for ${pkg.id}: ${pkg.youtube.videoId} != ${receipt.externalId}`
      );
    }
    pkg.youtube = {
      videoId: receipt.externalId!,
      url: receipt.externalUrl!,
      publishedAt: receipt.occurredAt,
      ...(typeof receipt.details?.thumbnailUrl === 'string'
        ? { thumbnailUrl: receipt.details.thumbnailUrl }
        : {}),
      ...(Array.isArray(receipt.details?.chapters)
        ? { chapters: z.array(chapterSchema).parse(receipt.details.chapters) }
        : {}),
    };
  }
  if (receipt.stage === 'metrics') {
    variant.metrics.push({
      provider: receipt.provider,
      externalId: receipt.externalId!,
      collectedAt: receipt.occurredAt,
      ...receipt.metrics!,
    });
  }
  const targetState =
    receipt.stage === 'render'
      ? 'rendered'
      : receipt.stage === 'upload' && receipt.status === 'published'
        ? 'posted'
        : variant.state;
  if (lifecycleOrder.indexOf(targetState) > lifecycleOrder.indexOf(variant.state))
    variant.state = targetState;
  variant.receipts.push(receipt);
  return { document: parseContentDocument(next), changed: true };
}

export function performanceReport(document: ContentDocument, packageId?: string) {
  const packages = packageId
    ? document.packages.filter((pkg) => pkg.id === packageId)
    : document.packages;
  return packages.map((pkg) => {
    const variants = pkg.reels.map((variant) => {
      const latest = variant.metrics.at(-1);
      const engagement = latest?.views
        ? ((latest.likes ?? 0) + (latest.comments ?? 0)) / latest.views
        : null;
      return {
        variantId: variant.id,
        format: variant.format,
        hypothesis: variant.hypothesis,
        metrics: latest ?? null,
        engagementRate: engagement,
      };
    });
    const ranked = [...variants].sort(
      (a, b) => (b.metrics?.views ?? -1) - (a.metrics?.views ?? -1)
    );
    const comparable = ranked.filter((item) => typeof item.metrics?.views === 'number').length >= 2;
    return {
      packageId: pkg.id,
      revision: pkg.revision,
      comparable,
      variants: ranked,
      followUpBrief:
        comparable && ranked[0]?.metrics
          ? `Draft a follow-up testing the ${ranked[0].format} format and hypothesis: ${ranked[0].hypothesis}. Keep editorial claims and approval state unchanged.`
          : 'Collect comparable metrics from at least two variants before creating a follow-up.',
    };
  });
}
