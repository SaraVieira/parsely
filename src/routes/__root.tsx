/// <reference types="vite/client" />

import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from '@tanstack/react-router';
import type { ReactNode } from 'react';

import { TooltipProvider } from '@/components/ui/tooltip';
import { Layout } from '@/lib/layout';

import '@/lib/styles/globals.css';

const title = 'Parsley';
const description = 'A browser-based JSON editor and transformer for engineers';
const url = 'https://parsley.dotenv.dev';

export const Route = createRootRoute({
  ssr: false,
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        title,
      },
      {
        name: 'description',
        content: description,
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1.0',
      },
      {
        name: 'application-name',
        content: title,
      },
      {
        name: 'apple-mobile-web-app-capable',
        content: 'yes',
      },
      {
        name: 'apple-mobile-web-app-status-bar-style',
        content: 'default',
      },
      {
        name: 'apple-mobile-web-app-title',
        content: title,
      },
      {
        name: 'theme-color',
        content: '#000000',
      },
      {
        name: 'og:type',
        content: 'website',
      },
      {
        name: 'og:url',
        content: url,
      },
      {
        name: 'og:title',
        content: title,
      },
      {
        name: 'og:description',
        content: description,
      },
      {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
      {
        name: 'twitter:url',
        content: url,
      },
      {
        name: 'twitter:title',
        content: title,
      },
      {
        name: 'twitter:description',
        content: description,
      },
    ],
    links: [
      {
        rel: 'icon',
        href: '/favicon.ico',
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap',
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body suppressHydrationWarning>
        <div id="shell-loading" style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          background: '#09090b',
          color: '#f4f4f5',
          fontFamily: 'Inter, -apple-system, sans-serif',
        }}>
          {/* Header bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            height: 40,
            flexShrink: 0,
            borderBottom: '1px solid #1a1a22',
            padding: '0 12px',
            gap: 6,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 17 3.5s1.5 2 2.1 5.5M14.7 14c.8-1.2 1.3-2.8 1.3-4.5 0-1.2-.2-2.2-.6-3" />
              <path d="M6.7 19.5a9 9 0 0 1-.7-3.5c0-3.4 1.9-6.3 4.6-7.8" />
              <path d="M12 20c-1.1 0-2-.9-2-2V6" />
            </svg>
            <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em' }}>parsley</span>
            <div style={{ display: 'flex', gap: 2, marginLeft: 8 }}>
              <div style={{ width: 32, height: 24, borderRadius: 4, background: '#27272a' }} />
              <div style={{ width: 48, height: 24, borderRadius: 4, background: '#27272a' }} />
            </div>
          </div>
          {/* Toolbar skeleton */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            height: 36,
            flexShrink: 0,
            borderBottom: '1px solid #1a1a22',
            padding: '0 12px',
            gap: 4,
          }}>
            {[60, 48, 44, 52, 40].map((w, i) => (
              <div key={i} style={{
                width: w,
                height: 22,
                borderRadius: 4,
                background: i === 0 ? '#10b98118' : '#27272a',
              }} />
            ))}
          </div>
          {/* Split pane skeleton */}
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            <div style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[0.7, 0.4, 0.85, 0.55, 0.3, 0.65, 0.5, 0.75, 0.4, 0.6].map((w, i) => (
                <div key={i} style={{
                  height: 14,
                  width: `${w * 80}%`,
                  borderRadius: 3,
                  background: '#27272a',
                  opacity: 1 - (i * 0.07),
                }} />
              ))}
            </div>
            <div style={{ width: 1, background: '#1a1a22' }} />
            <div style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[0.5, 0.8, 0.35, 0.65, 0.45, 0.7, 0.55, 0.4, 0.6, 0.3].map((w, i) => (
                <div key={i} style={{
                  height: 14,
                  width: `${w * 80}%`,
                  borderRadius: 3,
                  background: '#27272a',
                  opacity: 1 - (i * 0.07),
                }} />
              ))}
            </div>
          </div>
        </div>
        {children}
        <Scripts />
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            var el = document.getElementById('shell-loading');
            if (!el) return;
            var obs = new MutationObserver(function() {
              if (document.querySelector('main')) {
                el.style.transition = 'opacity 150ms ease-out';
                el.style.opacity = '0';
                setTimeout(function() { el.remove(); }, 150);
                obs.disconnect();
              }
            });
            obs.observe(document.body, { childList: true, subtree: true });
          })();
        `}} />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <TooltipProvider delayDuration={300}>
      <Layout>
        <Outlet />
      </Layout>
    </TooltipProvider>
  );
}
