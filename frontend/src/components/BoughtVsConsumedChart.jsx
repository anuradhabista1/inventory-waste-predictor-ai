import { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

export default function BoughtVsConsumedChart({ months, series }) {
  const [selectedItem, setSelectedItem] = useState(series[0]?.item_id || '')

  const item = series.find(s => s.item_id === selectedItem) || series[0]

  if (!item) return (
    <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
      No data available
    </div>
  )

  const chartData = months.map((month, i) => ({
    month: month.slice(5),   // show MM only
    fullMonth: month,
    Purchased: item.purchased[i] ?? 0,
    Consumed: item.consumed[i] ?? 0,
  }))

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3 text-sm">
        <p className="font-semibold text-slate-700 mb-2">{months.find(m => m.slice(5) === label)}</p>
        {payload.map(p => (
          <p key={p.name} style={{ color: p.color }} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
            {p.name}: <strong>{p.value}</strong> units
          </p>
        ))}
        <p className="text-slate-500 mt-1 border-t border-slate-100 pt-1">
          Waste: <strong className="text-red-500">
            {Math.max((payload.find(p => p.name === 'Purchased')?.value || 0) -
              (payload.find(p => p.name === 'Consumed')?.value || 0), 0)}
          </strong> units
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Item selector */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-slate-600">Item:</label>
        <select
          value={selectedItem}
          onChange={e => setSelectedItem(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          {series.map(s => (
            <option key={s.item_id} value={s.item_id}>
              {s.name} ({s.item_id})
            </option>
          ))}
        </select>
        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
          {item.category}
        </span>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} />
          <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} width={40} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
          />
          <Line
            type="monotone"
            dataKey="Purchased"
            stroke="#3b82f6"
            strokeWidth={2.5}
            dot={{ r: 4, fill: '#3b82f6' }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="Consumed"
            stroke="#10b981"
            strokeWidth={2.5}
            dot={{ r: 4, fill: '#10b981' }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
