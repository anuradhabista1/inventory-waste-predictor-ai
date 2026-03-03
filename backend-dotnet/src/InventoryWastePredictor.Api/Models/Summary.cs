namespace InventoryWastePredictor.Api.Models;

public record SummaryItem(
    string ItemId,
    string Name,
    string Category,
    int UnitsPurchased,
    int UnitsConsumed,
    int Waste,
    double WastePct,
    string WasteLevel);

public record SummaryResponse(
    string RestaurantId,
    string Month,
    List<SummaryItem> Items,
    int TotalPurchased,
    int TotalConsumed,
    int TotalWaste,
    double OverallWastePct,
    string OverallWasteLevel);

public record ConsumptionEntry(string ItemId, int UnitsConsumed);

public record SaveConsumptionRequest(
    string RestaurantId,
    string Month,
    List<ConsumptionEntry> Entries);
