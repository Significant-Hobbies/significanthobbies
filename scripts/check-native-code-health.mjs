#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { readdirSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
// Xcode versions disagree slightly on which generated/bridging Swift lines are
// executable (63.2521% locally, 63.2105% on GitHub's Xcode 16.4 image). Keep a
// percentage ratchet just below both observed denominators so source regressions
// still fail without coupling the gate to one Xcode coverage model.
const minimumProductionCoverage = 0.632;

function capture(command, args) {
  const result = spawnSync(command, args, {
    cwd: projectRoot,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    process.stdout.write(result.stdout ?? '');
    process.stderr.write(result.stderr ?? '');
    throw new Error(`${command} exited with status ${result.status}`);
  }
  return result.stdout ?? '';
}

function simulatorDestination() {
  if (process.env.SH_SIMULATOR_DESTINATION) return process.env.SH_SIMULATOR_DESTINATION;
  const report = JSON.parse(capture('xcrun', ['simctl', 'list', 'devices', 'available', '-j']));
  const candidates = Object.entries(report.devices)
    .filter(([runtime]) => runtime.includes('iOS'))
    .flatMap(([runtime, devices]) =>
      devices
        .filter((device) => device.isAvailable && device.name.startsWith('iPhone'))
        .map((device) => ({ ...device, runtime }))
    )
    .sort((left, right) => {
      if (left.state === 'Booted' && right.state !== 'Booted') return -1;
      if (right.state === 'Booted' && left.state !== 'Booted') return 1;
      return right.runtime.localeCompare(left.runtime, undefined, { numeric: true });
    });
  if (candidates.length === 0) throw new Error('No available iPhone simulator was found.');
  return `platform=iOS Simulator,id=${candidates[0].udid}`;
}

function latestResultBundle(derivedData) {
  const logDirectory = join(derivedData, 'Logs', 'Test');
  const bundles = readdirSync(logDirectory)
    .filter((name) => name.endsWith('.xcresult'))
    .map((name) => ({
      path: join(logDirectory, name),
      modified: statSync(join(logDirectory, name)).mtimeMs,
    }))
    .sort((left, right) => right.modified - left.modified);
  if (bundles.length === 0) throw new Error(`No xcresult bundle found under ${logDirectory}.`);
  return bundles[0].path;
}

function productionCoverage(resultBundle) {
  const report = JSON.parse(
    capture('xcrun', ['xccov', 'view', '--report', '--json', resultBundle])
  );
  const productionTargets = report.targets.filter((target) =>
    ['Significant Hobbies.app', 'SignificantHobbiesCore.framework'].includes(target.name)
  );
  if (productionTargets.length !== 2) {
    throw new Error('The native coverage report did not contain both production targets.');
  }
  const coveredLines = productionTargets.reduce((sum, target) => sum + target.coveredLines, 0);
  const executableLines = productionTargets.reduce(
    (sum, target) => sum + target.executableLines,
    0
  );
  return { coveredLines, executableLines, ratio: coveredLines / executableLines };
}

try {
  const derivedData =
    process.env.SH_DERIVED_DATA ?? join(tmpdir(), 'significant-hobbies-code-health-ios-derived');
  const destination = simulatorDestination();
  console.log(`Native gate: ${destination}`);
  const result = spawnSync('zsh', ['ios/scripts/check.sh'], {
    cwd: projectRoot,
    env: {
      ...process.env,
      SH_DERIVED_DATA: derivedData,
      SH_SIMULATOR_DESTINATION: destination,
    },
    stdio: 'inherit',
  });
  if (result.error) throw result.error;
  if (result.status !== 0)
    throw new Error(`Native tests/build exited with status ${result.status}`);

  const coverage = productionCoverage(latestResultBundle(derivedData));
  console.log(
    `Native coverage: ${coverage.coveredLines}/${coverage.executableLines} production lines ` +
      `(${(coverage.ratio * 100).toFixed(4)}%).`
  );
  if (coverage.ratio < minimumProductionCoverage) {
    throw new Error(
      `Native production coverage regressed: ${(coverage.ratio * 100).toFixed(4)}% < ` +
        `${(minimumProductionCoverage * 100).toFixed(2)}%`
    );
  }
  console.log('Native gate: unit tests, UI tests, release build, and coverage ratchet passed.');
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
