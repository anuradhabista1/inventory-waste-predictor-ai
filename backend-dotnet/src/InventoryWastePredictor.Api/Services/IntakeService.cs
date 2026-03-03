namespace InventoryWastePredictor.Api.Services;

public class IntakeRecord
{
    public string RestaurantId { get; set; } = "";
    public string ItemId       { get; set; } = "";
    public string Name         { get; set; } = "";
    public string Category     { get; set; } = "";
    public int    Units        { get; set; }
    public string DeliveryDate { get; set; } = "";
}

public class IntakeService
{
    internal readonly List<IntakeRecord> IntakeRecords = new()
    {
        new() { RestaurantId = "R001", ItemId = "SKU001", Name = "Whole Milk",      Category = "dairy",     Units = 80,  DeliveryDate = "2026-03-01" },
        new() { RestaurantId = "R001", ItemId = "SKU001", Name = "Whole Milk",      Category = "dairy",     Units = 70,  DeliveryDate = "2026-03-08" },
        new() { RestaurantId = "R001", ItemId = "SKU001", Name = "Whole Milk",      Category = "dairy",     Units = 50,  DeliveryDate = "2026-03-15" },
        new() { RestaurantId = "R001", ItemId = "SKU002", Name = "Sourdough Bread", Category = "bakery",    Units = 120, DeliveryDate = "2026-03-02" },
        new() { RestaurantId = "R001", ItemId = "SKU002", Name = "Sourdough Bread", Category = "bakery",    Units = 100, DeliveryDate = "2026-03-16" },
        new() { RestaurantId = "R001", ItemId = "SKU003", Name = "Tomatoes",        Category = "produce",   Units = 60,  DeliveryDate = "2026-03-03" },
        new() { RestaurantId = "R001", ItemId = "SKU003", Name = "Tomatoes",        Category = "produce",   Units = 55,  DeliveryDate = "2026-03-17" },
        new() { RestaurantId = "R001", ItemId = "SKU004", Name = "Chicken Breast",  Category = "meat",      Units = 40,  DeliveryDate = "2026-02-10" },
        new() { RestaurantId = "R002", ItemId = "SKU005", Name = "Olive Oil",       Category = "dry-goods", Units = 30,  DeliveryDate = "2026-03-05" },
        new() { RestaurantId = "R002", ItemId = "SKU006", Name = "Pasta",           Category = "dry-goods", Units = 90,  DeliveryDate = "2026-03-05" },
        new() { RestaurantId = "R002", ItemId = "SKU006", Name = "Pasta",           Category = "dry-goods", Units = 90,  DeliveryDate = "2026-03-20" },
    };

    public Dictionary<string, object> GetMonthlyIntake(string restaurantId, string month)
    {
        if (!System.Text.RegularExpressions.Regex.IsMatch(month, @"^\d{4}-\d{2}$"))
            throw new ArgumentException($"Invalid month format '{month}'. Expected YYYY-MM.");

        var records = IntakeRecords
            .Where(r => r.RestaurantId == restaurantId && r.DeliveryDate.StartsWith(month))
            .ToList();

        var aggregated = new Dictionary<string, dynamic>();
        foreach (var r in records)
        {
            if (!aggregated.ContainsKey(r.ItemId))
                aggregated[r.ItemId] = new
                {
                    item_id        = r.ItemId,
                    name           = r.Name,
                    category       = r.Category,
                    units_received = 0,
                    delivery_dates = new List<string>(),
                };
            // Use a mutable helper class instead
        }

        // Use a proper mutable structure
        var agg = new Dictionary<string, (string ItemId, string Name, string Category, int Units, List<string> Dates)>();
        foreach (var r in records)
        {
            if (!agg.ContainsKey(r.ItemId))
                agg[r.ItemId] = (r.ItemId, r.Name, r.Category, 0, new List<string>());
            var entry = agg[r.ItemId];
            agg[r.ItemId] = (entry.ItemId, entry.Name, entry.Category, entry.Units + r.Units,
                             entry.Dates.Append(r.DeliveryDate).ToList());
        }

        var intake = agg.Values
            .OrderBy(x => x.ItemId)
            .Select(x => new Dictionary<string, object>
            {
                ["item_id"]        = x.ItemId,
                ["name"]           = x.Name,
                ["category"]       = x.Category,
                ["units_received"] = x.Units,
                ["delivery_dates"] = x.Dates,
            })
            .ToList();

        return new Dictionary<string, object>
        {
            ["restaurant_id"]       = restaurantId,
            ["month"]               = month,
            ["total_items_received"] = intake.Count,
            ["total_units"]         = intake.Sum(i => (int)i["units_received"]),
            ["intake"]              = intake,
        };
    }

    public Dictionary<string, object> GetInventoryByDate(string restaurantId, string fromDate, string toDate)
    {
        var records = IntakeRecords
            .Where(r => r.RestaurantId == restaurantId
                     && string.Compare(r.DeliveryDate, fromDate, StringComparison.Ordinal) >= 0
                     && string.Compare(r.DeliveryDate, toDate, StringComparison.Ordinal) <= 0)
            .OrderBy(r => r.DeliveryDate)
            .ToList();

        var items = records.Select(r => new Dictionary<string, object>
        {
            ["item_id"]       = r.ItemId,
            ["name"]          = r.Name,
            ["category"]      = r.Category,
            ["units"]         = r.Units,
            ["delivery_date"] = r.DeliveryDate,
        }).ToList();

        return new Dictionary<string, object>
        {
            ["restaurant_id"] = restaurantId,
            ["from"]          = fromDate,
            ["to"]            = toDate,
            ["total_items"]   = items.Count,
            ["total_units"]   = records.Sum(r => r.Units),
            ["items"]         = items,
        };
    }

    public bool UpdateIntakeRecord(string restaurantId, string itemId, string deliveryDate,
                                   string name, string category, int units)
    {
        var record = IntakeRecords.FirstOrDefault(r =>
            r.RestaurantId == restaurantId &&
            r.ItemId == itemId &&
            r.DeliveryDate == deliveryDate);

        if (record is null) return false;

        record.Name     = name;
        record.Category = category;
        record.Units    = units;
        return true;
    }

    public void AddIntakeRecords(string restaurantId, string deliveryDate,
                                  IEnumerable<(string ItemId, string Name, string Category, int Units)> items)
    {
        foreach (var item in items)
            IntakeRecords.Add(new IntakeRecord
            {
                RestaurantId = restaurantId,
                ItemId       = item.ItemId,
                Name         = item.Name,
                Category     = item.Category,
                Units        = item.Units,
                DeliveryDate = deliveryDate,
            });
    }
}
