export default function ItemRow({ row, index, categories, onChange, onRemove, canRemove }) {
  return (
    <div className="grid grid-cols-12 px-4 py-2.5 items-center hover:bg-slate-50 transition-colors">
      <div className="col-span-2 pr-2">
        <input
          type="text"
          placeholder="SKU001"
          value={row.itemId}
          onChange={e => onChange(row.id, 'itemId', e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="col-span-4 pr-2">
        <input
          type="text"
          placeholder="e.g. Whole Milk"
          value={row.name}
          onChange={e => onChange(row.id, 'name', e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="col-span-3 pr-2">
        <select
          value={row.category}
          onChange={e => onChange(row.id, 'category', e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">Category…</option>
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div className="col-span-2 pr-2">
        <input
          type="number"
          placeholder="0"
          min="1"
          value={row.units}
          onChange={e => onChange(row.id, 'units', e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="col-span-1 flex justify-center">
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(row.id)}
            className="text-slate-400 hover:text-red-500 transition-colors text-lg leading-none"
            title="Remove row"
          >
            ×
          </button>
        )}
      </div>
    </div>
  )
}
