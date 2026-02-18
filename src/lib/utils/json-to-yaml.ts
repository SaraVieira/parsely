const NUMERIC_START_RE = /^[\d.+-]/;
const SAFE_KEY_RE = /^[\w.-]+$/;

function indent(level: number): string {
  return '  '.repeat(level);
}

function escapeYamlString(str: string): string {
  if (
    str === '' ||
    str === 'true' ||
    str === 'false' ||
    str === 'null' ||
    str === 'yes' ||
    str === 'no' ||
    NUMERIC_START_RE.test(str) ||
    str.includes(':') ||
    str.includes('#') ||
    str.includes('\n') ||
    str.includes('"') ||
    str.includes("'") ||
    str.startsWith(' ') ||
    str.endsWith(' ')
  ) {
    return `"${str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`;
  }
  return str;
}

function toYaml(value: unknown, level: number): string {
  if (value === null || value === undefined) {
    return 'null';
  }

  if (typeof value === 'boolean') {
    return String(value);
  }

  if (typeof value === 'number') {
    return String(value);
  }

  if (typeof value === 'string') {
    return escapeYamlString(value);
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return '[]';
    }
    return value
      .map((item) => {
        const rendered = toYaml(item, level + 1);
        if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
          const lines = rendered.split('\n');
          return `${indent(level)}- ${lines[0]}\n${lines
            .slice(1)
            .map((l) => `${indent(level)}  ${l}`)
            .join('\n')}`;
        }
        return `${indent(level)}- ${rendered}`;
      })
      .join('\n');
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) {
      return '{}';
    }
    return entries
      .map(([key, val]) => {
        const safeKey = SAFE_KEY_RE.test(key) ? key : `"${key}"`;
        if (typeof val === 'object' && val !== null) {
          const rendered = toYaml(val, level + 1);
          return `${indent(level)}${safeKey}:\n${rendered}`;
        }
        return `${indent(level)}${safeKey}: ${toYaml(val, level + 1)}`;
      })
      .join('\n');
  }

  return String(value);
}

export function jsonToYaml(data: unknown): string {
  return toYaml(data, 0);
}
