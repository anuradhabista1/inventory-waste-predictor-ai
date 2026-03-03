const CATEGORY_COLORS = {
  dairy:      'bg-blue-100 text-blue-700',
  bakery:     'bg-yellow-100 text-yellow-700',
  produce:    'bg-green-100 text-green-700',
  meat:       'bg-red-100 text-red-700',
  'dry-goods':'bg-slate-100 text-slate-700',
  beverages:  'bg-purple-100 text-purple-700',
  frozen:     'bg-cyan-100 text-cyan-700',
}

export default function InventoryTable({ items, isManager, onEdit }) {
  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        <div className="text-4xl mb-3">📭</div>
        <p className="font-medium">No inventory records found</p>
        <p className="text-sm mt-1">Try adjusting the date filter</p>
      </div>
    )
  }

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className={`grid ${isManager ? 'grid-cols-12' : 'grid-cols-11'} bg-slate-50 border-b border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide`}>
        <div className="col-span-2">Item ID</div>
        <div className="col-span-3">Name</div>
        <div className="col-span-2">Category</div>
        <div className="col-span-2 text-right">Units</div>
        <div className="col-span-2 text-right">Delivery Date</div>
        {isManager && <div className="col-span-1"></div>}
      </div>

      {/* Rows */}
      <div className="divide-y divide-slate-100">
        {items.map((item, i) => (
          <div
            key={i}
            className={`grid ${isManager ? 'grid-cols-12' : 'grid-cols-11'} px-4 py-3 items-center hover:bg-slate-50 transition-colors text-sm text-slate-700`}
          >
            <div className="col-span-2 font-mono text-xs text-slate-500">{item.item_id}</div>
            <div className="col-span-3 font-medium">{item.name}</div>
            <div className="col-span-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[item.category] || 'bg-slate-100 text-slate-600'}`}>
                {item.category}
              </span>
            </div>
            <div className="col-span-2 text-right font-semibold">{item.units}</div>
            <div className="col-span-2 text-right text-slate-500">{item.delivery_date}</div>
            {isManager && (
              <div className="col-span-1 flex justify-end">
                <button
                  onClick={() => onEdit(item)}
                  className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
                >
                  ✏️ Edit
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
