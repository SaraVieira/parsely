import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { ChartType } from './chart-view';

type ChartRendererProps = {
  chartType: ChartType;
  chartData: Array<Record<string, unknown>>;
  xAxis: string;
  yAxes: Array<string>;
};

const CHART_COLORS = [
  'hsl(142, 76%, 36%)',
  'hsl(221, 83%, 53%)',
  'hsl(262, 83%, 58%)',
  'hsl(24, 95%, 53%)',
  'hsl(350, 89%, 60%)',
  'hsl(47, 96%, 53%)',
  'hsl(173, 80%, 40%)',
  'hsl(292, 84%, 61%)',
];

const TOOLTIP_STYLE = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '6px',
  fontSize: '12px',
};

const TICK_STYLE = { fontSize: 11, fill: 'hsl(var(--muted-foreground))' };
const GRID_STROKE = 'hsl(var(--border))';

function RenderBarChart({
  data,
  xAxis,
  yAxes,
}: {
  data: Array<Record<string, unknown>>;
  xAxis: string;
  yAxes: Array<string>;
}) {
  return (
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
      <XAxis dataKey={xAxis} tick={TICK_STYLE} stroke={GRID_STROKE} />
      <YAxis tick={TICK_STYLE} stroke={GRID_STROKE} />
      <Tooltip contentStyle={TOOLTIP_STYLE} />
      {yAxes.length > 1 && <Legend />}
      {yAxes.map((y, i) => (
        <Bar
          key={y}
          dataKey={y}
          fill={CHART_COLORS[i % CHART_COLORS.length]}
          radius={[2, 2, 0, 0]}
        />
      ))}
    </BarChart>
  );
}

function RenderLineChart({
  data,
  xAxis,
  yAxes,
}: {
  data: Array<Record<string, unknown>>;
  xAxis: string;
  yAxes: Array<string>;
}) {
  return (
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
      <XAxis dataKey={xAxis} tick={TICK_STYLE} stroke={GRID_STROKE} />
      <YAxis tick={TICK_STYLE} stroke={GRID_STROKE} />
      <Tooltip contentStyle={TOOLTIP_STYLE} />
      {yAxes.length > 1 && <Legend />}
      {yAxes.map((y, i) => (
        <Line
          key={y}
          type="monotone"
          dataKey={y}
          stroke={CHART_COLORS[i % CHART_COLORS.length]}
          strokeWidth={2}
          dot={{ r: 3 }}
        />
      ))}
    </LineChart>
  );
}

function RenderPieChart({
  data,
  xAxis,
  yAxes,
}: {
  data: Array<Record<string, unknown>>;
  xAxis: string;
  yAxes: Array<string>;
}) {
  return (
    <PieChart>
      <Tooltip contentStyle={TOOLTIP_STYLE} />
      <Legend />
      <Pie
        data={data}
        dataKey={yAxes[0] ?? ''}
        nameKey={xAxis}
        cx="50%"
        cy="50%"
        outerRadius="80%"
        label={{ fontSize: 11 }}
      >
        {data.map((_, i) => (
          <Cell
            // biome-ignore lint/suspicious/noArrayIndexKey: pie slices are static
            key={i}
            fill={CHART_COLORS[i % CHART_COLORS.length]}
          />
        ))}
      </Pie>
    </PieChart>
  );
}

function RenderScatterChart({
  data,
  xAxis,
  yAxes,
}: {
  data: Array<Record<string, unknown>>;
  xAxis: string;
  yAxes: Array<string>;
}) {
  return (
    <ScatterChart>
      <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
      <XAxis
        dataKey={xAxis}
        name={xAxis}
        tick={TICK_STYLE}
        stroke={GRID_STROKE}
        type="number"
      />
      <YAxis
        dataKey={yAxes[0] ?? ''}
        name={yAxes[0] ?? ''}
        tick={TICK_STYLE}
        stroke={GRID_STROKE}
      />
      <Tooltip contentStyle={TOOLTIP_STYLE} />
      <Scatter data={data} fill={CHART_COLORS[0]} />
    </ScatterChart>
  );
}

const CHART_MAP: Record<ChartType, typeof RenderBarChart> = {
  bar: RenderBarChart,
  line: RenderLineChart,
  pie: RenderPieChart,
  scatter: RenderScatterChart,
};

export function ChartRenderer({
  chartType,
  chartData,
  xAxis,
  yAxes,
}: ChartRendererProps) {
  const Chart = CHART_MAP[chartType];
  return (
    <ResponsiveContainer width="100%" height="100%">
      <Chart data={chartData} xAxis={xAxis} yAxes={yAxes} />
    </ResponsiveContainer>
  );
}
