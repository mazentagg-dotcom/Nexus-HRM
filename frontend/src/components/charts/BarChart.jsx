import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const tooltipStyle = {
  backgroundColor: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: '12px',
  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.08)',
  fontSize: '13px',
}

export default function ChartBar({
  data = [],
  dataKey = 'value',
  xKey = 'name',
  height = 280,
  color = '#4f46e5',
  colors,
  layout = 'horizontal',
  barSize = 32,
  yFormatter,
  tooltipFormatter,
}) {
  const isVertical = layout === 'vertical'

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }} layout={isVertical ? 'vertical' : 'horizontal'} barSize={barSize}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={!isVertical} />
        <XAxis
          type={isVertical ? 'number' : 'category'}
          dataKey={isVertical ? undefined : xKey}
          tick={{ fontSize: 11, fill: isVertical ? '#94a3b8' : '#64748b' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={!isVertical ? undefined : yFormatter}
        />
        <YAxis
          type={isVertical ? 'category' : 'number'}
          dataKey={isVertical ? xKey : undefined}
          tick={{ fontSize: 11, fill: isVertical ? '#64748b' : '#94a3b8' }}
          axisLine={false}
          tickLine={false}
          width={isVertical ? 80 : undefined}
          tickFormatter={isVertical ? undefined : yFormatter}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={tooltipFormatter}
        />
        <Bar dataKey={dataKey} fill={color} radius={[6, 6, 0, 0]}>
          {colors && data.map((_, i) => <Cell key={i} fill={colors[i] || color} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
