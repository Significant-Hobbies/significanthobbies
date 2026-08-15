#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, extname, join, resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const currentFile = fileURLToPath(import.meta.url);
const projectRoot = resolve(dirname(currentFile), '..');
const productionPaths = ['src', 'ios/Sources', 'scripts'];

const baselines = {
  complexity: {
    violations: 82,
    maxCcn: 46,
    maxLength: 741,
    maxParams: 12,
  },
  duplication: {
    clones: 50,
    duplicatedLines: 771,
    percentage: 1.308154331670569,
  },
  unused: {
    files: 0,
    exports: 0,
    types: 0,
    dependencies: 0,
    devDependencies: 0,
    unlisted: 0,
    unresolved: 0,
  },
  suppressions: 11,
  nativeFormatErrors: 184,
};

const acceptedHighAdvisories = new Set([
  'GHSA-28wg-ghj8-5hjv',
  'GHSA-2p49-hgcm-8545',
  'GHSA-2pvr-wf23-7pc7',
  'GHSA-2v37-7h3g-55p8',
  'GHSA-4c8g-83qw-93j6',
  'GHSA-4cwx-7wf7-3272',
  'GHSA-52cp-r559-cp3m',
  'GHSA-5p4m-2wfm-xmqj',
  'GHSA-6g55-p6wh-862q',
  'GHSA-7p8r-x3mc-p8w7',
  'GHSA-88fw-hqm2-52qc',
  'GHSA-8hv8-536x-4wqp',
  'GHSA-9wv6-86v2-598j',
  'GHSA-f88m-g3jw-g9cj',
  'GHSA-mh99-v99m-4gvg',
  'GHSA-mwp4-54f8-5fhr',
  'GHSA-q3j6-qgpj-74h6',
  'GHSA-r28c-9q8g-f849',
  'GHSA-rgw5-rvv9-x895',
  'GHSA-v2hh-gcrm-f6hx',
  'GHSA-v39h-62p7-jpjc',
]);

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? projectRoot,
    encoding: 'utf8',
    env: { ...process.env, ...(options.env ?? {}) },
    maxBuffer: 64 * 1024 * 1024,
  });
  if (result.error) throw result.error;
  if (result.status !== 0 && !options.allowFailure) {
    process.stdout.write(result.stdout ?? '');
    process.stderr.write(result.stderr ?? '');
    throw new Error(`${command} exited with status ${result.status}`);
  }
  return {
    status: result.status ?? 1,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  };
}

function commandWithUvx(command, uvxArgs) {
  const probe = spawnSync(command, ['--version'], { encoding: 'utf8' });
  return probe.status === 0 ? { command, prefix: [] } : { command: 'uvx', prefix: uvxArgs };
}

function parseJson(result, label) {
  try {
    return JSON.parse(result.stdout);
  } catch {
    process.stderr.write(result.stderr);
    throw new Error(`${label} did not return valid JSON`);
  }
}

function issueCount(issues, key) {
  return issues.reduce((sum, issue) => sum + (issue[key]?.length ?? 0), 0);
}

function failRegressions(label, observed, baseline) {
  const regressions = Object.entries(baseline).filter(([key, maximum]) => observed[key] > maximum);
  if (regressions.length > 0) {
    throw new Error(
      regressions
        .map(([key, maximum]) => `${label} ${key} regressed: ${observed[key]} > ${maximum}`)
        .join('\n')
    );
  }
  if (Object.entries(baseline).some(([key, maximum]) => observed[key] < maximum)) {
    console.log(`${label} improved; lower the checked-in baseline in the next intentional update.`);
  }
}

function checkUnused() {
  const report = parseJson(
    run('pnpm', ['exec', 'knip', '--reporter', 'json', '--no-exit-code', '--no-progress'], {
      allowFailure: true,
    }),
    'Knip'
  );
  const issues = report.issues ?? [];
  const observed = Object.fromEntries(
    Object.keys(baselines.unused).map((key) => [key, issueCount(issues, key)])
  );
  console.log(
    `Unused: files=${observed.files}, exports=${observed.exports}, types=${observed.types}, ` +
      `dependencies=${observed.dependencies}, devDependencies=${observed.devDependencies}, ` +
      `unlisted=${observed.unlisted}, unresolved=${observed.unresolved}.`
  );
  failRegressions('Unused', observed, baselines.unused);
}

function checkComplexity() {
  const lizard = commandWithUvx('lizard', ['--from', 'lizard==1.23.0', 'lizard']);
  const result = run(lizard.command, [
    ...lizard.prefix,
    ...productionPaths,
    '-x',
    '**/*.test.*',
    '--csv',
  ]);
  const rows = result.stdout
    .trim()
    .split('\n')
    .map((line) => line.match(/^(\d+),(\d+),(\d+),(\d+),(\d+),/u))
    .filter(Boolean)
    .map((match) => match.slice(1).map(Number));
  const observed = {
    functions: rows.length,
    nloc: rows.reduce((sum, row) => sum + row[0], 0),
    violations: rows.filter((row) => row[1] > 15 || row[4] > 100 || row[3] > 7).length,
    maxCcn: Math.max(...rows.map((row) => row[1])),
    maxLength: Math.max(...rows.map((row) => row[4])),
    maxParams: Math.max(...rows.map((row) => row[3])),
  };
  console.log(
    `Complexity: ${observed.functions} functions, ${observed.nloc} NLOC, ` +
      `${observed.violations} violations; max CCN ${observed.maxCcn}, ` +
      `max length ${observed.maxLength}, max params ${observed.maxParams}.`
  );
  failRegressions('Complexity', observed, baselines.complexity);
}

function checkDuplication() {
  const outputDirectory = mkdtempSync(join(tmpdir(), 'significant-hobbies-jscpd-'));
  run('pnpm', [
    'exec',
    'jscpd',
    ...productionPaths,
    '--min-lines',
    '8',
    '--min-tokens',
    '60',
    '--mode',
    'strict',
    '--ignore',
    '**/*.test.*,**/node_modules/**,**/coverage/**,**/.next/**,**/out/**,**/dist/**',
    '--reporters',
    'json',
    '--output',
    outputDirectory,
    '--silent',
    '--no-tips',
  ]);
  const observed = JSON.parse(readFileSync(join(outputDirectory, 'jscpd-report.json'), 'utf8'))
    .statistics.total;
  console.log(
    `Duplication: ${observed.clones} groups, ${observed.duplicatedLines}/${observed.lines} lines ` +
      `(${observed.percentage.toFixed(4)}%) across ${observed.sources} files.`
  );
  failRegressions('Duplication', observed, baselines.duplication);
}

function checkCycles() {
  const report = parseJson(
    run(
      'pnpm',
      ['exec', 'knip', '--cycles', '--reporter', 'json', '--no-exit-code', '--no-progress'],
      { allowFailure: true }
    ),
    'Knip cycle analysis'
  );
  const cycles = (report.issues ?? []).flatMap((issue) => issue.cycles ?? []);
  if (cycles.length > 0) throw new Error(`TypeScript dependency cycles detected: ${cycles.length}`);
  console.log(
    'Cycles: zero TypeScript import cycles; the native Xcode gate resolves the Swift target graph.'
  );
}

function checkDependencies() {
  const report = parseJson(run('pnpm', ['audit', '--json'], { allowFailure: true }), 'pnpm audit');
  const severe = Object.values(report.advisories ?? {}).filter((advisory) =>
    ['critical', 'high'].includes(advisory.severity)
  );
  const critical = new Set(
    severe
      .filter((advisory) => advisory.severity === 'critical')
      .map((advisory) => advisory.github_advisory_id)
  );
  const high = new Set(
    severe
      .filter((advisory) => advisory.severity === 'high')
      .map((advisory) => advisory.github_advisory_id)
  );
  const unexpected = [...critical, ...high].filter((id) => !acceptedHighAdvisories.has(id));
  const disappeared = [...acceptedHighAdvisories].filter((id) => !high.has(id));
  console.log(
    `Dependencies: ${critical.size} critical, ${high.size} distinct high, ` +
      `${unexpected.length} unexpected; ${high.size - unexpected.length} accepted legacy advisories.`
  );
  if (critical.size > 0 || unexpected.length > 0) {
    throw new Error(`Unexpected critical/high advisories: ${unexpected.join(', ') || 'critical'}`);
  }
  if (disappeared.length > 0) {
    console.log(
      `Dependency risk improved; remove resolved advisory baselines: ${disappeared.join(', ')}.`
    );
  }
}

const suppressionPattern =
  /biome-ignore|eslint-disable|@ts-ignore|@ts-expect-error|istanbul ignore|c8 ignore|swiftlint:disable|swift-format-ignore|XCTSkip|(?:test|base)\.skip\(|\bTODO\b|\bFIXME\b/u;
const scannedExtensions = new Set(['.cjs', '.js', '.jsx', '.mjs', '.mts', '.swift', '.ts', '.tsx']);

function sourceFiles(root) {
  const files = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) files.push(...sourceFiles(path));
    else if (entry.isFile() && scannedExtensions.has(extname(entry.name))) files.push(path);
  }
  return files;
}

function checkSuppressions() {
  const roots = ['src', 'ios/Sources', 'ios/Tests', 'scripts', 'e2e'];
  const matches = roots
    .flatMap((root) => sourceFiles(resolve(projectRoot, root)))
    .filter((file) => file !== currentFile)
    .flatMap((file) =>
      readFileSync(file, 'utf8')
        .split('\n')
        .filter((line) => suppressionPattern.test(line))
    );
  console.log(`Suppressions: ${matches.length} justified lint/test/coverage markers.`);
  if (matches.length > baselines.suppressions) {
    throw new Error(
      `Suppressions regressed: ${matches.length} > ${baselines.suppressions}. New markers need review.`
    );
  }
  if (matches.length < baselines.suppressions) {
    console.log(
      'Suppressions improved; lower the checked-in baseline in the next intentional update.'
    );
  }
}

function checkHygiene() {
  const parent = run('git', ['rev-parse', '--verify', 'HEAD^'], { allowFailure: true });
  if (parent.status === 0) run('git', ['diff', '--check', 'HEAD^', 'HEAD']);
  else run('git', ['diff-tree', '--check', '--root', '-r', 'HEAD']);
  run('git', ['diff', '--check', 'HEAD', '--', '.']);
  const conflicts = run('git', ['grep', '-nE', '^(<<<<<<< |=======|>>>>>>> )', '--', '.'], {
    allowFailure: true,
  });
  if (conflicts.status === 0) throw new Error(`Conflict markers found:\n${conflicts.stdout}`);
  if (conflicts.status > 1) throw new Error(`git grep failed with status ${conflicts.status}`);

  const untracked = run('git', ['ls-files', '--others', '--exclude-standard'])
    .stdout.trim()
    .split('\n')
    .filter(Boolean);
  const generated = untracked.filter((file) =>
    /(^|\/)(?:coverage|dist|out|\.next|\.astro|\.open-next|\.wrangler)(?:\/|$)|(?:^|\/)\.DS_Store$|\.tsbuildinfo$/u.test(
      file
    )
  );
  if (generated.length > 0) {
    throw new Error(`Untracked generated artifacts found: ${generated.join(', ')}`);
  }
  console.log(
    'Repository hygiene: whitespace, conflict markers, and generated-output boundaries pass.'
  );
}

function checkNativeFormat() {
  const result = run(
    'xcrun',
    ['swift-format', 'lint', '--strict', '--recursive', 'ios/Sources', 'ios/Tests'],
    { allowFailure: true }
  );
  const output = `${result.stdout}\n${result.stderr}`;
  const errors = output.split('\n').filter((line) => line.includes('error:')).length;
  console.log(`Native format/lint: ${errors} accepted diagnostics; no regression allowed.`);
  if (errors > baselines.nativeFormatErrors) {
    throw new Error(
      `Native format diagnostics regressed: ${errors} > ${baselines.nativeFormatErrors}`
    );
  }
  if (errors < baselines.nativeFormatErrors) {
    console.log(
      'Native format improved; lower the checked-in baseline in the next intentional update.'
    );
  }
}

const checks = {
  unused: checkUnused,
  complexity: checkComplexity,
  duplication: checkDuplication,
  cycles: checkCycles,
  dependencies: checkDependencies,
  suppressions: checkSuppressions,
  hygiene: checkHygiene,
  'native-format': checkNativeFormat,
};
const selected = process.argv[2];

if (!Object.hasOwn(checks, selected)) {
  console.error(`Usage: check-code-health.mjs <${Object.keys(checks).join('|')}>`);
  process.exit(2);
}

try {
  checks[selected]();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
