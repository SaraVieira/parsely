import { loader } from '@monaco-editor/react';
import { useEffect, useState } from 'react';

import { useParsleyStore } from '@/lib/stores/parsley-store';
import { defineMonacoTheme } from '@/lib/utils/define-monaco-theme';

export function useMonacoTheme() {
  const monacoTheme = useParsleyStore((s) => s.monacoTheme);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    loader.init().then(async (monaco) => {
      await defineMonacoTheme(monaco, monacoTheme);
      if (!cancelled) {
        setReady(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [monacoTheme]);

  return { monacoTheme, ready };
}
