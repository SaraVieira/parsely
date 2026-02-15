import {
  useCallback,
  useEffect,
  useState,
  useRef,
  type DragEvent,
} from "react";
import Editor, { type Monaco } from "@monaco-editor/react";
import {
  Play,
  RotateCcw,
  RotateCw,
  WrapText,
  AlignLeft,
  ChevronDown,
  Share2,
  Check,
  TreePine,
  Code,
  Zap,
  Trash2,
  ChevronUp,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useParsleyStore } from "@/lib/stores/parsley-store";
import { useResolvedTheme } from "@/lib/hooks/use-resolved-theme";
import { EditorLoading } from "@/lib/components/editor-loading";
import { JsonTreeView } from "@/lib/components/json-tree-view";
import { registerTransformCompletions } from "@/lib/utils/transform-snippets";
import { TRANSFORM_PRESETS } from "../utils/constants";

function formatLogArg(arg: unknown): string {
  if (arg === null) return "null";
  if (arg === undefined) return "undefined";
  if (typeof arg === "string") return arg;
  if (typeof arg === "object") {
    try {
      return JSON.stringify(arg, null, 2);
    } catch {
      return String(arg);
    }
  }
  return String(arg);
}

function ConsolePanel() {
  const consoleLogs = useParsleyStore((s) => s.consoleLogs);
  const clearConsoleLogs = useParsleyStore((s) => s.clearConsoleLogs);
  const [collapsed, setCollapsed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [consoleLogs]);

  const levelColors: Record<string, string> = {
    log: "text-foreground",
    info: "text-blue-500 dark:text-blue-400",
    warn: "text-amber-500 dark:text-amber-400",
    error: "text-red-500 dark:text-red-400",
  };

  const levelPrefixes: Record<string, string> = {
    log: "",
    info: "ℹ ",
    warn: "⚠ ",
    error: "✗ ",
  };

  return (
    <div
      className={`border-t border-border/60 flex flex-col ${collapsed ? "" : "min-h-[100px] max-h-[200px]"}`}
    >
      <div className="flex items-center justify-between bg-muted/30 px-2 py-0.5">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground hover:text-foreground"
        >
          <ChevronUp
            className={`size-3 transition-transform ${collapsed ? "rotate-180" : ""}`}
          />
          Console
          {consoleLogs.length > 0 && (
            <span className="rounded-full bg-muted px-1.5 text-[9px]">
              {consoleLogs.length}
            </span>
          )}
        </button>
        {!collapsed && consoleLogs.length > 0 && (
          <button
            onClick={clearConsoleLogs}
            className="text-muted-foreground hover:text-foreground"
            title="Clear console"
          >
            <Trash2 className="size-3" />
          </button>
        )}
      </div>
      {!collapsed && (
        <div
          ref={scrollRef}
          className="flex-1 overflow-auto px-2 py-1 font-mono text-xs"
        >
          {consoleLogs.length === 0 ? (
            <div className="py-2 text-center text-[10px] text-muted-foreground">
              Use console.log() in your transform to see output here
            </div>
          ) : (
            consoleLogs.map((entry, i) => (
              <div
                key={i}
                className={`py-0.5 whitespace-pre-wrap break-all ${levelColors[entry.level] ?? ""}`}
              >
                <span className="opacity-50">{levelPrefixes[entry.level]}</span>
                {entry.args.map(formatLogArg).join(" ")}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export function EditorPane() {
  const {
    jsonInput,
    jsonError,
    transformCode,
    transformError,
    setJsonInput,
    setTransformCode,
    executeTransform,
    revert,
    reset,
    history,
    autoRun,
    setAutoRun,
  } = useParsleyStore();

  const resolvedTheme = useResolvedTheme();
  const monacoTheme = resolvedTheme === "dark" ? "vs-dark" : "light";
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState("json");
  const [jsonViewMode, setJsonViewMode] = useState<"editor" | "tree">("editor");
  const [shareCopied, setShareCopied] = useState(false);
  const parsedJson = useParsleyStore((s) => s.parsedJson);
  const jsonTreeError = useParsleyStore((s) => s.jsonError);
  const snippetsRegistered = useRef(false);
  const autoRunTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTransformEditorMount = useCallback(
    (_editor: unknown, monaco: Monaco) => {
      if (!snippetsRegistered.current) {
        registerTransformCompletions(monaco);
        snippetsRegistered.current = true;
      }
    },
    [],
  );

  const handleRun = useCallback(() => {
    executeTransform();
  }, [executeTransform]);

  // Auto-run on transform code change
  const handleTransformChange = useCallback(
    (value: string | undefined) => {
      setTransformCode(value ?? "");
      if (autoRun) {
        if (autoRunTimerRef.current) clearTimeout(autoRunTimerRef.current);
        autoRunTimerRef.current = setTimeout(() => {
          executeTransform();
        }, 500);
      }
    },
    [setTransformCode, autoRun, executeTransform],
  );

  const handleShare = useCallback(() => {
    try {
      const payload = JSON.stringify({ j: jsonInput, t: transformCode });
      const encoded = btoa(unescape(encodeURIComponent(payload)));
      const url = `${window.location.origin}${window.location.pathname}#share=${encoded}`;
      navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch {
      // ignore
    }
  }, [jsonInput, transformCode]);

  // Cmd+Enter shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleRun();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleRun]);

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (!file) return;

    if (!file.name.endsWith(".json")) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === "string") {
        setJsonInput(text);
        setActiveTab("json");
      }
    };
    reader.readAsText(file);
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="flex h-full flex-col"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex items-center justify-between border-b px-2">
        <TabsList className="h-10 bg-transparent">
          <TabsTrigger value="json">JSON Input</TabsTrigger>
          <TabsTrigger value="transform">Transform</TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-1">
          {activeTab === "transform" && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="xs">
                    Presets
                    <ChevronDown className="ml-1 size-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="max-h-[300px] overflow-y-auto"
                >
                  {TRANSFORM_PRESETS.map((preset) => (
                    <DropdownMenuItem
                      key={preset.label}
                      onClick={() => {
                        setTransformCode(preset.code);
                      }}
                    >
                      {preset.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant={autoRun ? "default" : "ghost"}
                size="icon-xs"
                onClick={() => setAutoRun(!autoRun)}
                title={
                  autoRun
                    ? "Auto-run enabled (click to disable)"
                    : "Enable auto-run on change"
                }
                className={
                  autoRun
                    ? "bg-amber-500/20 text-amber-600 hover:bg-amber-500/30 dark:text-amber-400"
                    : ""
                }
              >
                <Zap className="size-3.5" />
              </Button>
            </>
          )}
          {activeTab === "json" && (
            <>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() =>
                  setJsonViewMode(jsonViewMode === "editor" ? "tree" : "editor")
                }
                title={
                  jsonViewMode === "editor"
                    ? "Switch to tree view"
                    : "Switch to editor"
                }
              >
                {jsonViewMode === "editor" ? (
                  <TreePine className="size-3.5" />
                ) : (
                  <Code className="size-3.5" />
                )}
              </Button>
              {jsonViewMode === "editor" && (
                <>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => {
                      try {
                        setJsonInput(
                          JSON.stringify(JSON.parse(jsonInput), null, 2),
                        );
                      } catch {
                        /* invalid JSON, ignore */
                      }
                    }}
                    title="Format JSON"
                  >
                    <WrapText className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => {
                      try {
                        setJsonInput(JSON.stringify(JSON.parse(jsonInput)));
                      } catch {
                        /* invalid JSON, ignore */
                      }
                    }}
                    title="Minify JSON"
                  >
                    <AlignLeft className="size-3.5" />
                  </Button>
                </>
              )}
            </>
          )}
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={revert}
            disabled={history.length === 0}
            title="Revert last transform"
          >
            <RotateCcw className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={reset}
            title="Reset all"
          >
            <RotateCw className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={handleShare}
            title="Copy shareable link"
          >
            {shareCopied ? (
              <Check className="size-3.5 text-emerald-500" />
            ) : (
              <Share2 className="size-3.5" />
            )}
          </Button>
          <Button
            size="xs"
            onClick={handleRun}
            title="Run transform (Cmd+Enter)"
          >
            <Play className="size-3" />
            Run
          </Button>
        </div>
      </div>

      <TabsContent
        value="json"
        className="relative mt-0 flex-1 overflow-hidden"
      >
        {isDragging && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-primary/10 border-2 border-dashed border-primary rounded-md">
            <p className="text-sm font-medium text-primary">
              Drop JSON file here
            </p>
          </div>
        )}
        {jsonViewMode === "tree" ? (
          !jsonTreeError && parsedJson !== undefined ? (
            <JsonTreeView data={parsedJson} />
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
              Fix JSON errors to use tree view
            </div>
          )
        ) : (
          <Editor
            loading={<EditorLoading />}
            language="json"
            theme={monacoTheme}
            value={jsonInput}
            onChange={(value) => setJsonInput(value ?? "")}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              wordWrap: "on",
              automaticLayout: true,
              tabSize: 2,
            }}
          />
        )}
        {jsonError && (
          <div className="border-t border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {jsonError}
          </div>
        )}
      </TabsContent>

      <TabsContent
        value="transform"
        className="mt-0 flex-1 overflow-hidden flex flex-col"
      >
        <div className="flex-1 overflow-hidden">
          <Editor
            loading={<EditorLoading />}
            language="javascript"
            theme={monacoTheme}
            value={transformCode}
            onChange={handleTransformChange}
            onMount={handleTransformEditorMount}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              wordWrap: "on",
              automaticLayout: true,
              tabSize: 2,
            }}
          />
        </div>
        {transformError && (
          <div className="border-t border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {transformError}
          </div>
        )}
        <ConsolePanel />
      </TabsContent>
    </Tabs>
  );
}
