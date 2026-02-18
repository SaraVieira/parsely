import { describe, expect, it } from 'vitest';

import { jsonToJsonSchema } from '@/lib/utils/json-to-json-schema';

describe('jsonToJsonSchema', () => {
  it('generates schema for a simple object', () => {
    const schema = JSON.parse(jsonToJsonSchema({ name: 'Alice', age: 30 }));
    expect(schema.$schema).toBe('http://json-schema.org/draft-07/schema#');
    expect(schema.type).toBe('object');
    expect(schema.properties.name.type).toBe('string');
    expect(schema.properties.age.type).toBe('integer');
    expect(schema.required).toContain('name');
    expect(schema.required).toContain('age');
  });

  it('uses the provided root name as title', () => {
    const schema = JSON.parse(jsonToJsonSchema({ id: 1 }, 'User'));
    expect(schema.title).toBe('User');
  });

  it('defaults root name to Root', () => {
    const schema = JSON.parse(jsonToJsonSchema({ id: 1 }));
    expect(schema.title).toBe('Root');
  });

  it('handles arrays of objects', () => {
    const schema = JSON.parse(
      jsonToJsonSchema([
        { name: 'Alice', active: true },
        { name: 'Bob', active: false },
      ]),
    );
    expect(schema.type).toBe('array');
    expect(schema.items.type).toBe('object');
    expect(schema.items.properties.name.type).toBe('string');
    expect(schema.items.properties.active.type).toBe('boolean');
  });

  it('handles arrays of primitives', () => {
    const schema = JSON.parse(jsonToJsonSchema([1, 2, 3]));
    expect(schema.type).toBe('array');
    expect(schema.items.type).toBe('integer');
  });

  it('handles empty arrays', () => {
    const schema = JSON.parse(jsonToJsonSchema([]));
    expect(schema.type).toBe('array');
    expect(schema.items).toEqual({});
  });

  it('handles null', () => {
    const schema = JSON.parse(jsonToJsonSchema(null));
    expect(schema.type).toBe('null');
  });

  it('handles booleans', () => {
    const schema = JSON.parse(jsonToJsonSchema(true));
    expect(schema.type).toBe('boolean');
  });

  it('handles strings', () => {
    const schema = JSON.parse(jsonToJsonSchema('hello'));
    expect(schema.type).toBe('string');
  });

  it('distinguishes integer from number', () => {
    const intSchema = JSON.parse(jsonToJsonSchema(42));
    expect(intSchema.type).toBe('integer');

    const floatSchema = JSON.parse(jsonToJsonSchema(3.14));
    expect(floatSchema.type).toBe('number');
  });

  it('handles nested objects', () => {
    const schema = JSON.parse(
      jsonToJsonSchema({ user: { name: 'Alice', address: { city: 'NYC' } } }),
    );
    expect(schema.properties.user.type).toBe('object');
    expect(schema.properties.user.properties.address.type).toBe('object');
    expect(schema.properties.user.properties.address.properties.city.type).toBe(
      'string',
    );
  });

  it('marks nullable fields as not required', () => {
    const schema = JSON.parse(
      jsonToJsonSchema({ name: 'Alice', nickname: null }),
    );
    expect(schema.required).toContain('name');
    expect(schema.required).not.toContain('nickname');
  });
});
