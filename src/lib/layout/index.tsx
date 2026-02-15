import type { ReactNode } from 'react';

import { ThemeProvider } from '@/lib/components/theme-provider';

import { Header } from './components/header';

type LayoutProps = {
  children: ReactNode;
};

export const Layout = ({ children }: LayoutProps) => {
  return (
    <ThemeProvider>
      <div className="flex h-screen flex-col dark:bg-black dark:text-white">
        <Header />
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </ThemeProvider>
  );
};
