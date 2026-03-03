namespace InventoryWastePredictor.Api.Models;

public record IntakeItem(
    string ItemId,
    string Name,
    string Category,
    int UnitsReceived,
    List<string> DeliveryDates);

public record IntakeResponse(
    string RestaurantId,
    string Month,
    int TotalItemsReceived,
    int TotalUnits,
    List<IntakeItem> Intake);

public record SubmitItem(string ItemId, string Name, string Category, int Units);

public record SubmitIntakeRequest(
    string RestaurantId,
    string Month,
    string DeliveryDate,
    List<SubmitItem> Items);

public record SubmitIntakeResponse(
    string Message,
    string RestaurantId,
    string Month,
    string DeliveryDate,
    int ItemsAdded,
    int TotalUnits);
