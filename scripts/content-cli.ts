#!/usr/bin/env tsx
import { readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

import {
  applyReceipt,
  type ContentDocument,
  exportPackage,
  formatValidationError,
  parseContentDocument,
  performanceReport,
} from '../src/lib/content-packages';

const defaultDocumentPath = resolve(process.cwd(), 'src/content/content-packages.json');

function option(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function required(name: string): string {
  const value = option(name);
  if (!value) throw new Error(`missing --${name}`);
  return value;
}

async function load(path = option('document') ?? defaultDocumentPath): Promise<ContentDocument> {
  return parseContentDocument(JSON.parse(await readFile(path, 'utf8')));
}

async function atomicWrite(path: string, value: unknown) {
  const temporary = resolve(dirname(path), `.${path.split('/').at(-1)}.${process.pid}.tmp`);
  await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  await rename(temporary, path);
}

async function main() {
  const command = process.argv[2];
  const documentPath = option('document') ?? defaultDocumentPath;

  if (command === 'validate') {
    const document = await load(documentPath);
    console.log(
      JSON.stringify({
        valid: true,
        schemaVersion: document.schemaVersion,
        packages: document.packages.length,
      })
    );
    return;
  }

  if (command === 'create') {
    const document = await load(documentPath);
    const id = required('id');
    const slug = required('slug');
    if (document.packages.some((pkg) => pkg.id === id || pkg.slug === slug))
      throw new Error(`package id or slug already exists: ${id}/${slug}`);
    document.packages.push({
      id,
      revision: 1,
      state: 'draft',
      slug,
      title: required('title'),
      excerpt: option('excerpt') ?? required('title'),
      category: option('category') ?? 'Getting Started',
      emoji: option('emoji') ?? '✨',
      readTime: Number(option('read-time') ?? 5),
      relatedHobbies: [required('hobby')],
      sections: [],
      takeaways: [],
      productActions: [],
      sources: [],
      youtube: null,
      reels: [],
    });
    await atomicWrite(documentPath, parseContentDocument(document));
    console.log(JSON.stringify({ created: id, revision: 1, state: 'draft' }));
    return;
  }

  if (command === 'status') {
    const document = await load(documentPath);
    console.log(
      JSON.stringify(
        document.packages.map((pkg) => ({
          id: pkg.id,
          revision: pkg.revision,
          state: pkg.state,
          slug: pkg.slug,
          variants: pkg.reels.map((variant) => ({
            id: variant.id,
            state: variant.state,
            receipts: variant.receipts.length,
          })),
          nextAction:
            pkg.state === 'draft'
              ? 'complete editorial content and approve three diverse variants'
              : pkg.state === 'ready'
                ? 'content export'
                : pkg.youtube
                  ? 'content report'
                  : 'apply a YouTube publication receipt when available',
        })),
        null,
        2
      )
    );
    return;
  }

  if (command === 'export') {
    const document = await load(documentPath);
    const pkg = document.packages.find((item) => item.id === required('package'));
    if (!pkg) throw new Error('unknown package');
    const envelope = exportPackage(pkg, required('exported-at'));
    const output = required('output');
    await atomicWrite(resolve(output), envelope);
    for (const variant of pkg.reels) if (variant.state === 'approved') variant.state = 'exported';
    await atomicWrite(documentPath, parseContentDocument(document));
    console.log(JSON.stringify({ output: resolve(output), variants: envelope.variants.length }));
    return;
  }

  if (command === 'apply-receipt') {
    const document = await load(documentPath);
    const receipt = JSON.parse(await readFile(required('receipt'), 'utf8'));
    const result = applyReceipt(document, receipt);
    if (result.changed) await atomicWrite(documentPath, result.document);
    console.log(JSON.stringify({ applied: result.changed, idempotent: !result.changed }));
    return;
  }

  if (command === 'report') {
    const document = await load(documentPath);
    console.log(JSON.stringify(performanceReport(document, option('package')), null, 2));
    return;
  }

  throw new Error('usage: content <create|validate|status|export|apply-receipt|report> [options]');
}

main().catch((error) => {
  const message =
    error && typeof error === 'object' && 'issues' in error
      ? formatValidationError(error as never)
      : error instanceof Error
        ? error.message
        : String(error);
  console.error(message);
  process.exitCode = 1;
});
