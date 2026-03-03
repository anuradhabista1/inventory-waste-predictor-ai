import {
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts'

const COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16',
]

export default function ForecastChart({ history, forecast }) {
  const { months, series } = history
  const { forecast_month, forecasts } = forecast

  // Build chart data: one object per month + forecast month
  const allMonths = [...months, forecast_month]

  const chartData = allMonths.map((month, i) => {
    const isForcast = i === allMonths.length - 1
    const point = { month: month.slice(5), fullMonth: month, isForecast: isForcast }

    if (!isForcast) {
      series.forEach(s => {
        point[s.item_id] = s.consumed[i] ?? 0
      })
    } else {
      forecasts.forEach(f => {
        point[f.item_id] = f.predicted_consumption
        point[`${f.item_id}_low`] = f.confidence_low
        point[`${f.item_id}_high`] = f.confidence_high
      })
    }
    return point
  })

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    const isForecast = allMonths.find(m => m.slice(5) === label) === forecast_month
    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3 text-sm max-w-xs">
        <p className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
          {allMonths.find(m => m.slice(5) === label)}
          {isForecast && (
            <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">
              AI Forecast
            </span>
          )}
        </p>
        {payload
          .filter(p => !p.dataKey.includes('_low') && !p.dataKey.includes('_high') && !p.dataKey.includes('band'))
          .map(p => {
            const fc = isForecast && forecasts.find(f => f.item_id === p.dataKey)
            return (
              <p key={p.dataKey} style={{ color: p.color }} className="flex items-center gap-2 py-0.5">
                <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
                {series.find(s => s.item_id === p.dataKey)?.name || p.dataKey}:
                <strong>{p.value}</strong>
                {fc && <span className="text-xs text-slate-400">(±{fc.predicted_consumption - fc.confidence_low})</span>}
              </p>
            )
          })}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
        <span className="flex items-center gap-1">
          <span className="inline-block w-6 border-t-2 border-slate-400"></span> Historical
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-6 border-t-2 border-dashed border-purple-500"></span> AI Forecast
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm bg-purple-100 opacity-70"></span> Confidence range
        </span>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} />
          <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} width={40} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => {
              const s = series.find(s => s.item_id === value)
              return s ? `${s.name}` : value
            }}
            wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
          />
          <ReferenceLine
            x={forecast_month.slice(5)}
            stroke="#a855f7"
            strokeDasharray="4 2"
            label={{ value: 'Forecast', position: 'top', fontSize: 10, fill: '#a855f7' }}
          />

          {series.map((s, i) => {
            const color = COLORS[i % COLORS.length]
            const fc = forecasts.find(f => f.item_id === s.item_id)
            return [
              // Confidence band (forecast month only)
              fc && (
                <Area
                  key={`band-${s.item_id}`}
                  type="monotone"
                  dataKey={`${s.item_id}_high`}
                  fill={color}
                  stroke="none"
                  fillOpacity={0.08}
                  legendType="none"
                  tooltipType="none"
                />
              ),
              // Main line — solid for historical, dashed for forecast
              <Line
                key={s.item_id}
                type="monotone"
                dataKey={s.item_id}
                stroke={color}
                strokeWidth={2}
                dot={(props) => {
                  const { cx, cy, index } = props
                  if (index === chartData.length - 1) {
                    return <circle key={`dot-${s.item_id}-${index}`} cx={cx} cy={cy} r={5} fill={color} stroke="white" strokeWidth={2} />
                  }
                  return <circle key={`dot-${s.item_id}-${index}`} cx={cx} cy={cy} r={3} fill={color} />
                }}
                strokeDasharray={(props) => ''}
                connectNulls
              />,
            ]
          })}
        </ComposedChart>
      </ResponsiveContainer>

      {/* Forecast cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
        {forecasts.map((f, i) => (
          <div key={f.item_id} className="bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
            <p className="text-xs font-medium text-slate-600 truncate">{f.name}</p>
            <p className="text-lg font-bold mt-0.5" style={{ color: COLORS[i % COLORS.length] }}>
              {f.predicted_consumption}
              <span className="text-xs font-normal text-slate-400 ml-1">units</span>
            </p>
            <p className="text-xs text-slate-400">
              Range: {f.confidence_low}–{f.confidence_high}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
