import { useState } from 'react'
import ItemRow from './ItemRow'
import SuccessSummary from './SuccessSummary'

const RESTAURANTS = [
  { id: 'R001', name: 'Downtown Kitchen' },
  { id: 'R002', name: 'Harbour Bistro' },
  { id: 'R003', name: 'Uptown Grill' },
]

const CATEGORIES = ['dairy', 'bakery', 'produce', 'meat', 'dry-goods', 'beverages', 'frozen']

const emptyRow = () => ({ id: crypto.randomUUID(), itemId: '', name: '', category: '', units: '' })

export default function IntakeForm() {
  const [restaurantId, setRestaurantId] = useState('R001')
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7))
  const [deliveryDate, setDeliveryDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [rows, setRows] = useState([emptyRow()])
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(null)
  const [error, setError] = useState(null)

  const addRow = () => setRows(r => [...r, emptyRow()])

  const removeRow = (id) => setRows(r => r.filter(row => row.id !== id))

  const updateRow = (id, field, value) =>
    setRows(r => r.map(row => row.id === id ? { ...row, [field]: value } : row))

  const validate = () => {
    for (const row of rows) {
      if (!row.itemId.trim()) return 'Item ID is required for all rows.'
      if (!row.name.trim()) return 'Item name is required for all rows.'
      if (!row.category) return 'Category is required for all rows.'
      if (!row.units || isNaN(row.units) || Number(row.units) <= 0)
        return 'Units must be a positive number for all rows.'
    }
    if (!deliveryDate) return 'Delivery date is required.'
    if (!deliveryDate.startsWith(month)) return `Delivery date must be within ${month}.`
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    const validationError = validate()
    if (validationError) { setError(validationError); return }

    setSubmitting(true)
    try {
      const payload = {
        restaurant_id: restaurantId,
        month,
        delivery_date: deliveryDate,
        items: rows.map(r => ({
          item_id: r.itemId.trim(),
          name: r.name.trim(),
          category: r.category,
          units: Number(r.units),
        })),
      }
      const res = await fetch('/inventory/intake/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.detail || `Server error ${res.status}`)
      }
      const data = await res.json()
      setSubmitted({ payload, response: data })
      setRows([emptyRow()])
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => { setSubmitted(null); setError(null) }

  if (submitted) {
    return <SuccessSummary data={submitted} onAddMore={handleReset} />
  }

  return (
    <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
      {/* Card header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
        <h2 className="text-white text-xl font-semibold">Add Monthly Inventory Intake</h2>
        <p className="text-blue-100 text-sm mt-1">Log all inventory received for a restaurant in a given month</p>
      </div>

      <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">

        {/* Restaurant + Month + Date */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Restaurant</label>
            <select
              value={restaurantId}
              onChange={e => setRestaurantId(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {RESTAURANTS.map(r => (
                <option key={r.id} value={r.id}>{r.id} — {r.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Month</label>
            <input
              type="month"
              value={month}
              onChange={e => setMonth(e.target.value)}
              required
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Delivery Date</label>
            <input
              type="date"
              value={deliveryDate}
              onChange={e => setDeliveryDate(e.target.value)}
              required
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Inventory table */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-slate-700">Inventory Items</label>
            <span className="text-xs text-slate-400">{rows.length} row{rows.length !== 1 ? 's' : ''}</span>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-12 bg-slate-50 border-b border-slate-200 px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              <div className="col-span-2">Item ID</div>
              <div className="col-span-4">Item Name</div>
              <div className="col-span-3">Category</div>
              <div className="col-span-2">Units</div>
              <div className="col-span-1"></div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-slate-100">
              {rows.map((row, idx) => (
                <ItemRow
                  key={row.id}
                  row={row}
                  index={idx}
                  categories={CATEGORIES}
                  onChange={updateRow}
                  onRemove={removeRow}
                  canRemove={rows.length > 1}
                />
              ))}
            </div>

            {/* Add row button */}
            <button
              type="button"
              onClick={addRow}
              className="w-full py-3 text-sm text-blue-600 font-medium hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 border-t border-slate-200"
            >
              <span className="text-lg leading-none">+</span> Add Row
            </button>
          </div>
        </div>

        {/* Totals bar */}
        <div className="bg-slate-50 rounded-xl px-4 py-3 flex items-center justify-between text-sm">
          <span className="text-slate-600">
            Total items: <strong className="text-slate-800">{rows.length}</strong>
          </span>
          <span className="text-slate-600">
            Total units: <strong className="text-slate-800">
              {rows.reduce((sum, r) => sum + (Number(r.units) || 0), 0)}
            </strong>
          </span>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm flex items-start gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => { setRows([emptyRow()]); setError(null) }}
            className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Clear
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
          >
            {submitting ? (
              <><span className="animate-spin">⏳</span> Submitting…</>
            ) : (
              <><span>✅</span> Submit Intake</>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
