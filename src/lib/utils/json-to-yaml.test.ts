import { describe, expect, it } from 'vitest';

import { jsonToYaml } from '@/lib/utils/json-to-yaml';

describe('jsonToYaml', () => {
  it('converts a simple object', () => {
    expect(jsonToYaml({ name: 'Alice', age: 30 })).toBe('name: Alice\nage: 30');
  });

  it('converts nested objects', () => {
    const result = jsonToYaml({ user: { name: 'Bob', active: true } });
    expect(result).toContain('user:');
    expect(result).toContain('  name: Bob');
    expect(result).toContain('  active: true');
  });

  it('converts arrays', () => {
    const result = jsonToYaml({ items: [1, 2, 3] });
    expect(result).toContain('items:');
    expect(result).toContain('- 1');
    expect(result).toContain('- 2');
  });

  it('converts arrays of objects', () => {
    const result = jsonToYaml([
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
    ]);
    expect(result).toContain('name: Alice');
    expect(result).toContain('age: 30');
    expect(result).toContain('name: Bob');
    expect(result).toContain('age: 25');
  });

  it('handles null and undefined', () => {
    expect(jsonToYaml(null)).toBe('null');
    expect(jsonToYaml(undefined)).toBe('null');
  });

  it('handles booleans', () => {
    expect(jsonToYaml(true)).toBe('true');
    expect(jsonToYaml(false)).toBe('false');
  });

  it('handles numbers', () => {
    expect(jsonToYaml(42)).toBe('42');
    expect(jsonToYaml(3.14)).toBe('3.14');
  });

  it('handles empty object and array', () => {
    expect(jsonToYaml({})).toBe('{}');
    expect(jsonToYaml([])).toBe('[]');
  });

  it('escapes YAML reserved words in strings', () => {
    expect(jsonToYaml({ val: 'true' })).toBe('val: "true"');
    expect(jsonToYaml({ val: 'false' })).toBe('val: "false"');
    expect(jsonToYaml({ val: 'null' })).toBe('val: "null"');
    expect(jsonToYaml({ val: 'yes' })).toBe('val: "yes"');
    expect(jsonToYaml({ val: 'no' })).toBe('val: "no"');
  });

  it('escapes strings that start with numbers', () => {
    expect(jsonToYaml({ val: '123abc' })).toBe('val: "123abc"');
  });

  it('escapes strings with special characters', () => {
    expect(jsonToYaml({ val: 'hello: world' })).toBe('val: "hello: world"');
    expect(jsonToYaml({ val: 'has # comment' })).toBe('val: "has # comment"');
  });

  it('escapes empty strings', () => {
    expect(jsonToYaml({ val: '' })).toBe('val: ""');
  });

  it('escapes strings with leading/trailing spaces', () => {
    expect(jsonToYaml({ val: ' space' })).toBe('val: " space"');
    expect(jsonToYaml({ val: 'space ' })).toBe('val: "space "');
  });

  it('escapes strings with newlines', () => {
    expect(jsonToYaml({ val: 'line1\nline2' })).toBe('val: "line1\\nline2"');
  });

  it('quotes keys with special characters', () => {
    const result = jsonToYaml({ 'key with spaces': 'value' });
    expect(result).toBe('"key with spaces": value');
  });
});
