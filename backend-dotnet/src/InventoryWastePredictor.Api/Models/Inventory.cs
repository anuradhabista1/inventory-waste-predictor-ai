namespace InventoryWastePredictor.Api.Models;

public record InventoryItem(
    string ItemId,
    string Name,
    string Category,
    int Units,
    string DeliveryDate);

public record InventoryListResponse(
    string RestaurantId,
    string FromDate,
    string ToDate,
    int TotalItems,
    int TotalUnits,
    List<InventoryItem> Items);

public record EditItemRequest(string Name, string Category, int Units);
