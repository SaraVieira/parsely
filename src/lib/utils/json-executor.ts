import _ from "lodash";

type ExecuteResult = {
  result: unknown;
  error: string | null;
};

export function executeTransformCode(
  code: string,
  jsonData: unknown,
): ExecuteResult {
  try {
    const fn = new Function("_", "data", `'use strict';\n${code}`);
    const result = fn(_, jsonData);
    return { result, error: null };
  } catch (e) {
    return {
      result: null,
      error: e instanceof Error ? e.message : "Transform execution failed",
    };
  }
}
