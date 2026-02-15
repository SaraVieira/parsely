import { Copy } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useParsleyStore } from "@/lib/stores/parsley-store";
import { jsonToTypeScript } from "@/lib/utils/json-to-types";
import { ThemeToggle } from "@/lib/components/theme-toggle";
import { GraphView } from "./graph-view";
import { TextView } from "./text-view";
import { TypesView } from "./types-view";
import { DiffView } from "./diff-view";
import { TableView } from "./table-view";

export function OutputPane() {
  const { transformedJson, viewMode, setViewMode } = useParsleyStore();

  const handleCopy = () => {
    try {
      const text =
        viewMode === "types"
          ? jsonToTypeScript(transformedJson)
          : JSON.stringify(transformedJson, null, 2);
      navigator.clipboard.writeText(text);
    } catch {
      // ignore
    }
  };

  return (
    <Tabs
      value={viewMode}
      onValueChange={(v) => setViewMode(v as "graph" | "text" | "types" | "diff" | "table")}
      className="flex h-full flex-col"
    >
      <div className="flex items-center justify-between border-b px-2">
        <TabsList className="h-10 bg-transparent">
          <TabsTrigger value="graph">Graph</TabsTrigger>
          <TabsTrigger value="text">Text</TabsTrigger>
          <TabsTrigger value="types">Types</TabsTrigger>
          <TabsTrigger value="table">Table</TabsTrigger>
          <TabsTrigger value="diff">Diff</TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={handleCopy}
            title="Copy result to clipboard"
          >
            <Copy className="size-3.5" />
          </Button>
          <ThemeToggle />
        </div>
      </div>

      <TabsContent value="graph" className="mt-0 flex-1 overflow-hidden">
        <GraphView data={transformedJson} />
      </TabsContent>

      <TabsContent value="text" className="mt-0 flex-1 overflow-hidden">
        <TextView data={transformedJson} />
      </TabsContent>

      <TabsContent value="types" className="mt-0 flex-1 overflow-hidden">
        <TypesView data={transformedJson} />
      </TabsContent>

      <TabsContent value="table" className="mt-0 flex-1 overflow-hidden">
        <TableView data={transformedJson} />
      </TabsContent>

      <TabsContent value="diff" className="mt-0 flex-1 overflow-hidden">
        <DiffView />
      </TabsContent>
    </Tabs>
  );
}
