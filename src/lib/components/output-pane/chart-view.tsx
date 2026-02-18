import { useState } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  findArrayPaths,
  getColumns,
  getValueAtPath,
} from '@/lib/utils/table-utils';

import { ChartRenderer } from './chart-renderer';

type ChartViewProps = {
  data: unknown;
};

export type ChartType = 'bar' | 'line' | 'pie' | 'scatter';

function getNumericColumns(
  rows: Array<Record<string, unknown>>,
  columns: Array<string>,
): Array<string> {
  return columns.filter((col) =>
    rows.some((row) => typeof row[col] === 'number'),
  );
}

function getLabelColumns(
  rows: Array<Record<string, unknown>>,
  columns: Array<string>,
): Array<string> {
  return columns.filter((col) =>
    rows.some(
      (row) => typeof row[col] === 'string' || typeof row[col] === 'number',
    ),
  );
}

export function ChartView({ data }: ChartViewProps) {
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [xAxis, setXAxis] = useState<string | null>(null);
  const [yAxes, setYAxes] = useState<Array<string>>([]);

  const allArrayPaths = findArrayPaths(data);

  const activePath =
    selectedPath ?? (allArrayPaths.length > 0 ? allArrayPaths[0].path : null);

  const activeData = activePath ? getValueAtPath(data, activePath) : data;

  const { rows, columns } = (() => {
    if (
      Array.isArray(activeData) &&
      activeData.length > 0 &&
      typeof activeData[0] === 'object'
    ) {
      const cols = getColumns(activeData);
      return {
        rows: activeData as Array<Record<string, unknown>>,
        columns: cols,
      };
    }
    return {
      rows: [] as Array<Record<string, unknown>>,
      columns: [] as Array<string>,
    };
  })();

  const numericCols = getNumericColumns(rows, columns);
  const labelCols = getLabelColumns(rows, columns);

  const effectiveX = xAxis ?? labelCols[0] ?? columns[0] ?? '';
  const effectiveY =
    yAxes.length > 0 ? yAxes : numericCols.length > 0 ? [numericCols[0]] : [];

  if (rows.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Chart view works best with arrays of objects containing numeric fields.
      </div>
    );
  }

  const toggleYAxis = (col: string) => {
    setYAxes((prev) => {
      if (prev.length === 0) {
        const defaults = numericCols.length > 0 ? [numericCols[0]] : [];
        if (defaults.includes(col)) {
          return defaults.filter((c) => c !== col);
        }
        return [...defaults, col];
      }
      if (prev.includes(col)) {
        return prev.filter((c) => c !== col);
      }
      return [...prev, col];
    });
  };

  const chartData = rows.map((row) => {
    const entry: Record<string, unknown> = {};
    entry[effectiveX] = row[effectiveX];
    for (const y of effectiveY) {
      entry[y] = typeof row[y] === 'number' ? row[y] : 0;
    }
    return entry;
  });

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-3 border-b px-3 py-1.5">
        {allArrayPaths.length > 1 && (
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            Source:
            <Select
              value={activePath ?? ''}
              onValueChange={(v) => {
                setSelectedPath(v);
                setXAxis(null);
                setYAxes([]);
              }}
            >
              <SelectTrigger className="h-6 w-auto min-w-20 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {allArrayPaths.map((ap) => (
                  <SelectItem key={ap.path} value={ap.path}>
                    {ap.label} ({ap.length})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          Chart:
          <Select
            value={chartType}
            onValueChange={(v) => setChartType(v as ChartType)}
          >
            <SelectTrigger className="h-6 w-auto min-w-16 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bar">Bar</SelectItem>
              <SelectItem value="line">Line</SelectItem>
              <SelectItem value="pie">Pie</SelectItem>
              <SelectItem value="scatter">Scatter</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          X:
          <Select value={effectiveX} onValueChange={(v) => setXAxis(v)}>
            <SelectTrigger className="h-6 w-auto min-w-16 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {labelCols.map((col) => (
                <SelectItem key={col} value={col}>
                  {col}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          Y:
          {numericCols.map((col) => (
            <button
              key={col}
              type="button"
              onClick={() => toggleYAxis(col)}
              className={`rounded px-1.5 py-0.5 text-xs transition-colors ${
                effectiveY.includes(col)
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {col}
            </button>
          ))}
          {numericCols.length === 0 && (
            <span className="text-xs italic">No numeric fields</span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-4">
        <ChartRenderer
          chartType={chartType}
          chartData={chartData}
          xAxis={effectiveX}
          yAxes={effectiveY}
        />
      </div>
    </div>
  );
}
