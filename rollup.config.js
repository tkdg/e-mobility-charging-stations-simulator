/* eslint-disable n/no-unpublished-import */
import * as os from 'node:os';
import { env } from 'node:process';

import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import { copy } from '@web/rollup-plugin-copy';
import { defineConfig } from 'rollup';
import analyze from 'rollup-plugin-analyzer';
import del from 'rollup-plugin-delete';

const availableParallelism = () => {
  // eslint-disable-next-line no-shadow
  let availableParallelism = 1;
  try {
    availableParallelism = os.availableParallelism();
  } catch {
    const cpus = os.cpus();
    if (Array.isArray(cpus) && cpus.length > 0) {
      availableParallelism = cpus.length;
    }
  }
  return availableParallelism;
};

const isDevelopmentBuild = env.BUILD === 'development';
const isAnalyzeBuild = env.ANALYZE;
const sourcemap = !!isDevelopmentBuild;

export default defineConfig({
  input: ['./src/start.ts', './src/charging-station/ChargingStationWorker.ts'],
  strictDeprecations: true,
  output: [
    {
      dir: './dist',
      format: 'esm',
      sourcemap,
      plugins: [terser({ maxWorkers: Math.floor(availableParallelism() / 2) })],
    },
  ],
  external: [
    '@mikro-orm/core',
    '@mikro-orm/reflection',
    'ajv',
    'ajv-formats',
    'basic-ftp',
    'chalk',
    'date-fns',
    'deep-clone',
    'http-status-codes',
    'just-merge',
    'mnemonist/lru-map-with-delete.js',
    'mnemonist/queue.js',
    'mongodb',
    'node:async_hooks',
    'node:crypto',
    'node:events',
    'node:fs',
    'node:http',
    'node:http2',
    'node:path',
    'node:perf_hooks',
    'node:process',
    'node:stream',
    'node:url',
    'node:util',
    'node:worker_threads',
    'poolifier',
    'tar',
    'winston',
    'winston-daily-rotate-file',
    'winston/lib/winston/transports/index.js',
    'ws',
  ],
  plugins: [
    json(),
    typescript({
      tsconfig: './tsconfig.json',
      compilerOptions: {
        sourceMap: sourcemap,
      },
    }),
    del({
      targets: [
        './dist/*',
        '!./dist/assets',
        './dist/assets/*.json',
        './dist/assets/json-schemas',
        './dist/assets/station-templates',
        './dist/assets/ui-protocol',
      ],
    }),
    copy({
      rootDir: './src',
      patterns: 'assets/**/*.json',
      exclude: [
        'assets/config-template.json',
        'assets/*config[-_.]*.json',
        'assets/idtags-template.json',
        'assets/authorization-tags-template.json',
        'assets/ui-protocol/**/*',
      ],
    }),
    isAnalyzeBuild && analyze(),
  ],
});