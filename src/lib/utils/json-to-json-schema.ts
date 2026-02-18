import { mergeObjectShapes } from '@/lib/utils/shared';

type JsonSchema = {
  $schema?: string;
  type?: string;
  properties?: Record<string, JsonSchema>;
  items?: JsonSchema;
  required?: Array<string>;
  enum?: Array<unknown>;
  [key: string]: unknown;
};

function inferSchema(value: unknown): JsonSchema {
  if (value === null) {
    return { type: 'null' };
  }
  if (value === undefined) {
    return {};
  }

  switch (typeof value) {
    case 'string':
      return { type: 'string' };
    case 'number':
      return Number.isInteger(value) ? { type: 'integer' } : { type: 'number' };
    case 'boolean':
      return { type: 'boolean' };
    default:
      break;
  }

  if (Array.isArray(value)) {
    return inferArraySchema(value);
  }

  if (typeof value === 'object') {
    return inferObjectSchema(value as Record<string, unknown>);
  }

  return {};
}

function inferArraySchema(value: Array<unknown>): JsonSchema {
  if (value.length === 0) {
    return { type: 'array', items: {} };
  }

  const first = value[0];
  if (typeof first === 'object' && first !== null && !Array.isArray(first)) {
    const merged = mergeObjectShapes(
      value.filter((v) => typeof v === 'object' && v !== null),
    );
    return { type: 'array', items: inferObjectSchema(merged) };
  }

  return { type: 'array', items: inferSchema(first) };
}

function inferObjectSchema(obj: Record<string, unknown>): JsonSchema {
  const properties: Record<string, JsonSchema> = {};
  const required: Array<string> = [];

  for (const [key, val] of Object.entries(obj)) {
    properties[key] = inferSchema(val);
    if (val !== undefined && val !== null) {
      required.push(key);
    }
  }

  const schema: JsonSchema = { type: 'object', properties };
  if (required.length > 0) {
    schema.required = required;
  }
  return schema;
}

export function jsonToJsonSchema(data: unknown, rootName = 'Root'): string {
  const schema = inferSchema(data);
  schema.$schema = 'http://json-schema.org/draft-07/schema#';
  schema.title = rootName;
  return JSON.stringify(schema, null, 2);
}
