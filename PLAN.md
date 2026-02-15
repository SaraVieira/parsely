# Parsley - JSON Editor for Engineers

## Context

Build a developer-focused JSON manipulation tool. Engineers paste JSON on the right, write JavaScript on the left to transform it, and see results visually as a node graph (like jsoncrack.com) or as text. Lodash is pre-loaded. All client-side.

## Layout

```
┌─────────────────────┬──────────────────────────┐
│  LEFT PANE          │  RIGHT PANE              │
│                     │                          │
│  JS Code Editor     │  JSON Input (paste here) │
│  (Monaco, JS mode)  │  (Monaco, JSON mode)     │
│                     │                          │
│  [Run] button +     ├──────────────────────────┤
│  Cmd+Enter          │  Output: [Graph] [Text]  │
│                     │                          │
│  Error display      │  Graph: React Flow nodes │
│  if transform fails │  Text: Monaco read-only  │
│                     │                          │
└─────────────────────┴──────────────────────────┘
```

## Dependencies to Install

```bash
pnpm add @monaco-editor/react @xyflow/react lodash zustand
pnpm add -D @types/lodash
pnpm dlx shadcn@latest add toggle-group resizable separator tabs
```

## Implementation Steps

### 1. Zustand Store
**New file**: `src/lib/stores/parsley-store.ts`

State: `jsonInput`, `parsedJson`, `jsonError`, `transformCode`, `transformError`, `transformedJson`, `viewMode` ('graph' | 'text'), `history` array for revert.

Actions: `setJsonInput` (parses + validates), `setTransformCode`, `executeTransform`, `setViewMode`, `revert`, `reset`.

Default state includes sample JSON (fruits array like jsoncrack) and sample transform code showing lodash usage.

### 2. Utility Functions

**`src/lib/utils/json-to-graph.ts`** - Converts parsed JSON into React Flow `Node[]` and `Edge[]`. Recursively traverses the JSON structure. Each object/array becomes a card node showing its key-value pairs. Uses a simple tree layout algorithm for positioning (horizontal, left-to-right like jsoncrack).

Custom node types:
- `objectNode`: Card showing key-value pairs for objects
- `arrayNode`: Card showing item count, links to children
- `valueNode`: Leaf node for primitives

**`src/lib/utils/json-executor.ts`** - Safely executes user JavaScript using `Function` constructor:
```ts
const fn = new Function('_', 'data', `'use strict';\n${code}`);
const result = fn(lodash, jsonData);
```
Wrapped in try-catch, returns `{ result, error }`.

### 3. UI Components

**`src/lib/components/split-pane.tsx`** - Uses shadcn `Resizable` for horizontal split pane (50/50 default).

**`src/lib/components/code-editor.tsx`** - Left pane. Monaco in JavaScript mode. Toolbar with Run button. Error alert below editor. Cmd+Enter keyboard shortcut to execute.

**`src/lib/components/json-viewer/index.tsx`** - Right pane wrapper. Top half: Monaco in JSON mode for pasting input. Bottom half: output area with Graph/Text toggle.

**`src/lib/components/json-viewer/graph-view.tsx`** - React Flow with custom node components styled as cards (like jsoncrack screenshot). Background grid, controls, minimap. Uses `jsonToGraph()` to convert data to nodes/edges.

**`src/lib/components/json-viewer/text-view.tsx`** - Monaco in read-only JSON mode showing `JSON.stringify(result, null, 2)`.

### 4. Page Integration
**Modify**: `src/lib/pages/home/index.tsx` - Replace welcome content with the split-pane editor layout, full height.

**Modify**: `src/lib/layout/index.tsx` - Remove footer or make it minimal. Remove max-width wrapper constraint so editor takes full width.

**Modify**: `src/lib/styles/globals.css` - Remove `.wrapper` max-width constraint.

### 5. Theme Integration
Monaco theme syncs with the app's dark/light theme from ThemeProvider. React Flow nodes styled with Tailwind to respect dark mode.

### 6. Polish
- Debounce JSON parsing on input change
- Memoize graph generation with `useMemo`
- Keyboard shortcut: Cmd+Enter to run transform
- Copy result to clipboard button
- Revert button to undo last transform

## Key Files Modified/Created

| File | Action |
|------|--------|
| `package.json` | Add dependencies |
| `src/lib/stores/parsley-store.ts` | **New** - Zustand store |
| `src/lib/utils/json-to-graph.ts` | **New** - JSON to React Flow converter |
| `src/lib/utils/json-executor.ts` | **New** - Safe JS execution |
| `src/lib/components/split-pane.tsx` | **New** - Resizable split pane |
| `src/lib/components/code-editor.tsx` | **New** - JS code editor |
| `src/lib/components/json-viewer/index.tsx` | **New** - JSON viewer wrapper |
| `src/lib/components/json-viewer/graph-view.tsx` | **New** - React Flow graph |
| `src/lib/components/json-viewer/text-view.tsx` | **New** - Text output view |
| `src/lib/pages/home/index.tsx` | **Modify** - Main editor page |
| `src/lib/layout/index.tsx` | **Modify** - Full-width layout |
| `src/lib/styles/globals.css` | **Modify** - Remove width constraint |
| `src/components/ui/*.tsx` | **New** - shadcn components (resizable, toggle-group, etc.) |
