export const DEFAULT_MONACO_THEME = 'all-hallows-eve';

export type MonacoThemeEntry = {
  id: string;
  label: string;
  fileName: string;
};

export const themeModules = import.meta.glob(
  '/node_modules/monaco-themes/themes/*.json',
);

const builtinThemes: Array<MonacoThemeEntry> = [
  { id: 'vs-dark', label: 'VS Dark (Default)', fileName: '' },
  { id: 'vs', label: 'VS Light', fileName: '' },
];

const prefix = '/node_modules/monaco-themes/themes/';
const suffix = '.json';

const packageThemes: Array<MonacoThemeEntry> = Object.keys(themeModules)
  .filter((path) => !path.endsWith('themelist.json'))
  .map((path) => {
    const fileName = path.slice(prefix.length, -suffix.length);
    const id = fileName
      .toLowerCase()
      .replaceAll(/[()]/g, '')
      .replaceAll(/[\s_]+/g, '-');
    return { id, label: fileName, fileName };
  })
  .sort((a, b) => a.label.localeCompare(b.label));

export const MONACO_THEMES: Array<MonacoThemeEntry> = [
  ...builtinThemes,
  ...packageThemes,
];
