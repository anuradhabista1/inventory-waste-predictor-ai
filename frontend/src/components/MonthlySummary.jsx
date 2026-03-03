import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const RESTAURANT_ID = 'R001'

const today = new Date()
const defaultMonth = today.toISOString().slice(0, 7)

const WASTE_STYLES = {
  green: { bar: 'bg-green-500', badge: 'bg-green-100 text-green-700', icon: '🟢' },
  amber: { bar: 'bg-amber-400', badge: 'bg-amber-100 text-amber-700', icon: '🟡' },
  red:   { bar: 'bg-red-500',   badge: 'bg-red-100 text-red-700',     icon: '🔴' },
}

function WasteBadge({ level, pct }) {
  const s = WASTE_STYLES[level] || WASTE_STYLES.green
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${s.badge}`}>
      {s.icon} {pct}%
    </span>
  )
}

function WasteBar({ pct }) {
  const level = pct <= 15 ? 'green' : pct <= 30 ? 'amber' : 'red'
  return (
    <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1">
      <div
        className={`h-1.5 rounded-full transition-all ${WASTE_STYLES[level].bar}`}
        style={{ width: `${Math.min(pct, 100)}%` }}
      />
    </div>
  )
}

export default function MonthlySummary() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const isManager = user?.role === 'Manager'

  const [month, setMonth] = useState(defaultMonth)
  const [data, setData] = useState(null)
  const [consumed, setConsumed] = useState({})   // { item_id: value }
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  const fetchSummary = async (m) => {
    setLoading(true)
    setError('')
    setSaved(false)
    try {
      const res = await fetch(
        `/inventory/summary/?restaurant_id=${RESTAURANT_ID}&month=${m}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      )
      const json = await res.json()
      if (!res.ok) throw new Error(json.detail || 'Failed to load summary.')
      setData(json)
      // Seed editable consumed values from fetched data
      const init = {}
      json.items.forEach(i => { init[i.item_id] = i.units_consumed })
      setConsumed(init)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSummary(month) }, [])

  const handleMonthChange = (m) => { setMonth(m); fetchSummary(m) }

  // Live-calculate waste for a row using current consumed input
  const liveRow = (item) => {
    const c = Number(consumed[item.item_id] ?? item.units_consumed)
    const waste = Math.max(item.units_purchased - c, 0)
    const pct = item.units_purchased ? Math.round((waste / item.units_purchased) * 100 * 10) / 10 : 0
    const level = pct <= 15 ? 'green' : pct <= 30 ? 'amber' : 'red'
    return { consumed: c, waste, pct, level }
  }

  const liveTotals = () => {
    if (!data) return { purchased: 0, consumed: 0, waste: 0, pct: 0, level: 'green' }
    const purchased = data.items.reduce((s, i) => s + i.units_purchased, 0)
    const cons = data.items.reduce((s, i) => s + Number(consumed[i.item_id] ?? i.units_consumed), 0)
    const waste = Math.max(purchased - cons, 0)
    const pct = purchased ? Math.round((waste / purchased) * 100 * 10) / 10 : 0
    const level = pct <= 15 ? 'green' : pct <= 30 ? 'amber' : 'red'
    return { purchased, consumed: cons, waste, pct, level }
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      const entries = Object.entries(consumed).map(([item_id, units_consumed]) => ({
        item_id,
        units_consumed: Number(units_consumed),
      }))
      const res = await fetch('/inventory/summary/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ restaurant_id: RESTAURANT_ID, month, entries }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.detail || 'Failed to save.')
      setSaved(true)
      fetchSummary(month)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const totals = liveTotals()

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">📊 Monthly Consumption Summary</h2>
          <p className="text-sm text-slate-500 mt-0.5">Restaurant {RESTAURANT_ID} — track purchased vs consumed</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="text-sm px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
        >
          ← Back to Inventory
        </button>
      </div>

      {/* Month picker */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 px-6 py-4 flex items-end gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Month</label>
          <input
            type="month"
            value={month}
            onChange={e => handleMonthChange(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {!isManager && (
          <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
            <span>🔒</span><span>View-only — only Managers can enter consumed quantities</span>
          </div>
        )}
      </div>

      {/* Summary card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

        {/* Totals bar */}
        {data && (
          <div className="grid grid-cols-4 divide-x divide-slate-100 border-b border-slate-200">
            {[
              { label: 'Total Purchased', value: totals.purchased, color: 'text-blue-600' },
              { label: 'Total Consumed',  value: totals.consumed,  color: 'text-green-600' },
              { label: 'Total Waste',     value: totals.waste,     color: 'text-red-600' },
              { label: 'Overall Waste %', value: null,             color: '' },
            ].map(({ label, value, color }, i) => (
              <div key={i} className="px-6 py-4 text-center">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">{label}</p>
                {value !== null
                  ? <p className={`text-2xl font-bold ${color}`}>{value}</p>
                  : <div className="flex flex-col items-center gap-1">
                      <WasteBadge level={totals.level} pct={totals.pct} />
                      <WasteBar pct={totals.pct} />
                    </div>
                }
              </div>
            ))}
          </div>
        )}

        {/* Table */}
        {loading && (
          <div className="text-center py-16 text-slate-400">
            <div className="text-3xl mb-2 animate-spin">⏳</div>
            <p>Loading summary…</p>
          </div>
        )}

        {error && (
          <div className="m-4 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm flex items-center gap-2">
            <span>⚠️</span><span>{error}</span>
          </div>
        )}

        {!loading && !error && data && data.items.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <div className="text-4xl mb-3">📭</div>
            <p className="font-medium">No intake records for {month}</p>
            <p className="text-sm mt-1">Add inventory first via the intake form</p>
          </div>
        )}

        {!loading && !error && data && data.items.length > 0 && (
          <div className="overflow-x-auto">
            {/* Table header */}
            <div className="grid grid-cols-12 bg-slate-50 border-b border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide min-w-[700px]">
              <div className="col-span-2">Item ID</div>
              <div className="col-span-2">Name</div>
              <div className="col-span-1">Category</div>
              <div className="col-span-2 text-right">Purchased</div>
              <div className="col-span-2 text-right">Consumed</div>
              <div className="col-span-1 text-right">Waste</div>
              <div className="col-span-2 text-right">Waste %</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-slate-100 min-w-[700px]">
              {data.items.map(item => {
                const live = liveRow(item)
                return (
                  <div key={item.item_id} className="grid grid-cols-12 px-4 py-3 items-center hover:bg-slate-50 transition-colors text-sm text-slate-700">
                    <div className="col-span-2 font-mono text-xs text-slate-500">{item.item_id}</div>
                    <div className="col-span-2 font-medium">{item.name}</div>
                    <div className="col-span-1">
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{item.category}</span>
                    </div>
                    <div className="col-span-2 text-right font-semibold text-blue-700">{item.units_purchased}</div>
                    <div className="col-span-2 text-right">
                      {isManager ? (
                        <input
                          type="number"
                          min="0"
                          max={item.units_purchased}
                          value={consumed[item.item_id] ?? item.units_consumed}
                          onChange={e => setConsumed(prev => ({ ...prev, [item.item_id]: e.target.value }))}
                          className="w-24 border border-slate-300 rounded-lg px-2 py-1 text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500 ml-auto"
                        />
                      ) : (
                        <span className="font-semibold text-green-700">{live.consumed}</span>
                      )}
                    </div>
                    <div className="col-span-1 text-right font-semibold text-red-600">{live.waste}</div>
                    <div className="col-span-2 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <WasteBadge level={live.level} pct={live.pct} />
                        <WasteBar pct={live.pct} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Save footer — Manager only */}
        {isManager && data && data.items.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <div className="text-sm text-slate-500">
              {saved && <span className="text-green-600 font-medium">✅ Saved successfully</span>}
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-lg transition-colors flex items-center gap-2"
            >
              {saving ? <><span className="animate-spin">⏳</span> Saving…</> : <>💾 Save Summary</>}
            </button>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-xs text-slate-500">
        <span className="font-medium">Waste thresholds:</span>
        <span className="flex items-center gap-1">🟢 &lt;15% acceptable</span>
        <span className="flex items-center gap-1">🟡 15–30% monitor</span>
        <span className="flex items-center gap-1">🔴 &gt;30% action required</span>
      </div>
    </div>
  )
}
