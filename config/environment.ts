export type EnvironmentName = 'local' | 'ci' | 'staging' | 'test';

export interface RuntimeConfig {
  baseUrl: string;
  apiBaseUrl: string;
  irsBaseUrl: string;
  environment: EnvironmentName;
  isCi: boolean;
  headless: boolean;
  workers?: number;
  retries: number;
  timeout: number;
  shardIndex?: number;
  shardTotal?: number;
}

const DEFAULT_BASE_URL = 'https://www.va.gov';
const DEFAULT_IRS_BASE_URL = 'https://www.irs.gov';

function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined) return defaultValue;

  const normalized = value.trim().toLowerCase();
  if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
  if (['false', '0', 'no', 'off'].includes(normalized)) return false;

  throw new Error(`Expected a boolean environment value, received: "${value}"`);
}

function parsePositiveInteger(name: string, value: string | undefined): number | undefined {
  if (value === undefined || value.trim() === '') return undefined;

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`${name} must be a positive integer, received: "${value}"`);
  }

  return parsed;
}

function parseUrl(name: string, value: string): string {
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error('unsupported protocol');
    return url.toString().replace(/\/$/, '');
  } catch {
    throw new Error(`${name} must be an absolute HTTP(S) URL, received: "${value}"`);
  }
}

function parseEnvironment(value: string | undefined, isCi: boolean): EnvironmentName {
  const environment = value ?? (isCi ? 'ci' : 'local');
  if (!['local', 'ci', 'staging', 'test'].includes(environment)) {
    throw new Error(`ENVIRONMENT must be local, ci, staging, or test, received: "${environment}"`);
  }
  return environment as EnvironmentName;
}

export function loadRuntimeConfig(env: NodeJS.ProcessEnv = process.env): RuntimeConfig {
  const isCi = parseBoolean(env.CI, false);
  const baseUrl = parseUrl('BASE_URL', env.BASE_URL ?? DEFAULT_BASE_URL);
  const apiBaseUrl = parseUrl('API_BASE_URL', env.API_BASE_URL ?? baseUrl);
  const irsBaseUrl = parseUrl('IRS_BASE_URL', env.IRS_BASE_URL ?? DEFAULT_IRS_BASE_URL);
  const shardIndex = parsePositiveInteger('SHARD_INDEX', env.SHARD_INDEX);
  const shardTotal = parsePositiveInteger('SHARD_TOTAL', env.SHARD_TOTAL);

  if ((shardIndex === undefined) !== (shardTotal === undefined)) {
    throw new Error('SHARD_INDEX and SHARD_TOTAL must be provided together');
  }
  if (shardIndex !== undefined && shardTotal !== undefined && shardIndex > shardTotal) {
    throw new Error('SHARD_INDEX must not be greater than SHARD_TOTAL');
  }

  return {
    baseUrl,
    apiBaseUrl,
    irsBaseUrl,
    environment: parseEnvironment(env.ENVIRONMENT, isCi),
    isCi,
    headless: parseBoolean(env.HEADLESS, true),
    workers: parsePositiveInteger('WORKERS', env.WORKERS),
    retries: parsePositiveInteger('RETRIES', env.RETRIES) ?? (isCi ? 2 : 0),
    timeout: parsePositiveInteger('TIMEOUT', env.TIMEOUT) ?? 30_000,
    shardIndex,
    shardTotal,
  };
}

export function getRuntimeConfig(): RuntimeConfig {
  return loadRuntimeConfig();
}
