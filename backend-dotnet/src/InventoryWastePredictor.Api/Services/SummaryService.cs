namespace InventoryWastePredictor.Api.Services;

public class SummaryService
{
    private static readonly int WasteThresholdGreen = 15;
    private static readonly int WasteThresholdAmber = 30;

    internal readonly Dictionary<(string RestaurantId, string ItemId, string Month), int> Consumption = new()
    {
        [("R001", "SKU001", "2026-03")] = 160,
        [("R001", "SKU002", "2026-03")] = 190,
        [("R001", "SKU003", "2026-03")] = 60,
        [("R001", "SKU004", "2026-02")] = 35,
    };

    private readonly IntakeService _intakeService;

    public SummaryService(IntakeService intakeService)
    {
        _intakeService = intakeService;
    }

    private static string WasteLevel(double wastePct) =>
        wastePct <= WasteThresholdGreen ? "green" :
        wastePct <= WasteThresholdAmber ? "amber" : "red";

    public Dictionary<string, object> GetMonthlySummary(string restaurantId, string month)
    {
        // Aggregate purchased per item_id for the month
        var purchased = new Dictionary<string, (string Name, string Category, int Units)>();
        foreach (var r in _intakeService.IntakeRecords)
        {
            if (r.RestaurantId == restaurantId && r.DeliveryDate.StartsWith(month))
            {
                if (!purchased.ContainsKey(r.ItemId))
                    purchased[r.ItemId] = (r.Name, r.Category, 0);
                var entry = purchased[r.ItemId];
                purchased[r.ItemId] = (entry.Name, entry.Category, entry.Units + r.Units);
            }
        }

        var items = new List<Dictionary<string, object>>();
        foreach (var (itemId, p) in purchased.OrderBy(kv => kv.Key))
        {
            var consumed = Consumption.TryGetValue((restaurantId, itemId, month), out var c) ? c : 0;
            var waste = Math.Max(p.Units - consumed, 0);
            var wastePct = p.Units > 0 ? Math.Round((double)waste / p.Units * 100, 1) : 0.0;
            items.Add(new Dictionary<string, object>
            {
                ["item_id"]        = itemId,
                ["name"]           = p.Name,
                ["category"]       = p.Category,
                ["units_purchased"] = p.Units,
                ["units_consumed"] = consumed,
                ["waste"]          = waste,
                ["waste_pct"]      = wastePct,
                ["waste_level"]    = WasteLevel(wastePct),
            });
        }

        var totalPurchased = items.Sum(i => (int)i["units_purchased"]);
        var totalConsumed  = items.Sum(i => (int)i["units_consumed"]);
        var totalWaste     = Math.Max(totalPurchased - totalConsumed, 0);
        var overallWastePct = totalPurchased > 0
            ? Math.Round((double)totalWaste / totalPurchased * 100, 1) : 0.0;

        return new Dictionary<string, object>
        {
            ["restaurant_id"]      = restaurantId,
            ["month"]              = month,
            ["items"]              = items,
            ["total_purchased"]    = totalPurchased,
            ["total_consumed"]     = totalConsumed,
            ["total_waste"]        = totalWaste,
            ["overall_waste_pct"]  = overallWastePct,
            ["overall_waste_level"] = WasteLevel(overallWastePct),
        };
    }

    public void SaveConsumption(string restaurantId, string month,
                                IEnumerable<(string ItemId, int UnitsConsumed)> entries)
    {
        foreach (var (itemId, units) in entries)
            Consumption[(restaurantId, itemId, month)] = units;
    }
}
