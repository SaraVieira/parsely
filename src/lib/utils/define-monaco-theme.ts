import type { Monaco } from '@monaco-editor/react';

import { MONACO_THEMES, themeModules } from '@/lib/utils/monaco-themes';

const definedThemes = new Set<string>();

export async function defineMonacoTheme(
  monaco: Monaco,
  themeId: string,
): Promise<void> {
  if (themeId === 'vs-dark' || themeId === 'vs') {
    return;
  }

  if (definedThemes.has(themeId)) {
    return;
  }

  const entry = MONACO_THEMES.find((t) => t.id === themeId);
  if (!entry?.fileName) {
    return;
  }

  const loader =
    themeModules[`/node_modules/monaco-themes/themes/${entry.fileName}.json`];
  if (!loader) {
    return;
  }

  const themeData = (await loader()) as {
    default: Parameters<typeof monaco.editor.defineTheme>[1];
  };
  monaco.editor.defineTheme(themeId, themeData.default);
  definedThemes.add(themeId);
}
