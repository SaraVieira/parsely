import { useCallback, useEffect, useState, useRef, type DragEvent } from "react";
import Editor, { type Monaco } from "@monaco-editor/react";
import { Play, RotateCcw, RotateCw, WrapText, AlignLeft, ChevronDown, Share2, Check, TreePine, Code } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const TRANSFORM_PRESETS = [
  { label: "Filter", code: "// Filter items by condition\nreturn _.filter(data, item => item.age > 25)" },
  { label: "Map", code: "// Transform each item\nreturn _.map(data, item => ({\n  ...item,\n  name: item.name.toUpperCase()\n}))" },
  { label: "Pick keys", code: "// Keep only specific keys\nreturn _.map(data, item => _.pick(item, ['name', 'id']))" },
  { label: "Omit keys", code: "// Remove specific keys\nreturn _.map(data, item => _.omit(item, ['bio', 'version']))" },
  { label: "Sort by", code: "// Sort by a key\nreturn _.sortBy(data, 'name')" },
  { label: "Group by", code: "// Group items by a key\nreturn _.groupBy(data, 'language')" },
  { label: "Unique by", code: "// Get unique items by a key\nreturn _.uniqBy(data, 'language')" },
  { label: "Flatten", code: "// Flatten nested arrays\nreturn _.flatMap(data, item => item.tags || item)" },
  { label: "Count by", code: "// Count occurrences by key\nreturn _.countBy(data, 'language')" },
  { label: "First N", code: "// Take first N items\nreturn _.take(data, 5)" },
  { label: "Pluck", code: "// Extract a single field\nreturn _.map(data, 'name')" },
  { label: "Key by", code: "// Index items by a key\nreturn _.keyBy(data, 'id')" },
];
import { useParsleyStore } from "@/lib/stores/parsley-store";
import { useResolvedTheme } from "@/lib/hooks/use-resolved-theme";
import { EditorLoading } from "@/lib/components/editor-loading";
import { JsonTreeView } from "@/lib/components/json-tree-view";
import { registerTransformCompletions } from "@/lib/utils/transform-snippets";

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

  const handleTransformEditorMount = useCallback((_editor: unknown, monaco: Monaco) => {
    if (!snippetsRegistered.current) {
      registerTransformCompletions(monaco);
      snippetsRegistered.current = true;
    }
  }, []);

  const handleRun = useCallback(() => {
    executeTransform();
  }, [executeTransform]);

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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="xs">
                  Presets
                  <ChevronDown className="ml-1 size-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="max-h-[300px] overflow-y-auto">
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
          )}
          {activeTab === "json" && (
            <>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => setJsonViewMode(jsonViewMode === "editor" ? "tree" : "editor")}
                title={jsonViewMode === "editor" ? "Switch to tree view" : "Switch to editor"}
              >
                {jsonViewMode === "editor" ? <TreePine className="size-3.5" /> : <Code className="size-3.5" />}
              </Button>
              {jsonViewMode === "editor" && (
                <>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => {
                      try {
                        setJsonInput(JSON.stringify(JSON.parse(jsonInput), null, 2));
                      } catch { /* invalid JSON, ignore */ }
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
                      } catch { /* invalid JSON, ignore */ }
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
            {shareCopied ? <Check className="size-3.5 text-emerald-500" /> : <Share2 className="size-3.5" />}
          </Button>
          <Button size="xs" onClick={handleRun} title="Run transform (Cmd+Enter)">
            <Play className="size-3" />
            Run
          </Button>
        </div>
      </div>

      <TabsContent value="json" className="relative mt-0 flex-1 overflow-hidden">
        {isDragging && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-primary/10 border-2 border-dashed border-primary rounded-md">
            <p className="text-sm font-medium text-primary">Drop JSON file here</p>
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

      <TabsContent value="transform" className="mt-0 flex-1 overflow-hidden">
        <Editor
          loading={<EditorLoading />}
          language="javascript"
          theme={monacoTheme}
          value={transformCode}
          onChange={(value) => setTransformCode(value ?? "")}
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
        {transformError && (
          <div className="border-t border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {transformError}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
