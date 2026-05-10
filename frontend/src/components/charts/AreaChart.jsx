import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const tooltipStyle = {
  backgroundColor: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: '12px',
  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.08)',
  fontSize: '13px',
}

export default function ChartArea({
  data = [],
  areas = [],
  xKey = 'month',
  height = 280,
  yFormatter,
  tooltipFormatter,
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
        <defs>
          {areas.map((a, i) => (
            <linearGradient key={i} id={`areaGrad-${a.dataKey || i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={a.color || '#4f46e5'} stopOpacity={0.15} />
              <stop offset="95%" stopColor={a.color || '#4f46e5'} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey={xKey} tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} dy={8} />
        <YAxis
          tick={{ fontSize: 12, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
          dx={-4}
          tickFormatter={yFormatter}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={tooltipFormatter}
        />
        {areas.map((a, i) => (
          <Area
            key={i}
            type="monotone"
            dataKey={a.dataKey}
            stroke={a.color || '#4f46e5'}
            strokeWidth={a.strokeWidth || 2.5}
            fill={`url(#areaGrad-${a.dataKey || i})`}
            name={a.name || a.dataKey}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  )
}
