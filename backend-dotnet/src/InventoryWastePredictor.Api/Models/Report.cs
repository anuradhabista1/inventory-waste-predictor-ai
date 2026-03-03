namespace InventoryWastePredictor.Api.Models;

public record ItemSeries(
    string ItemId,
    string Name,
    string Category,
    List<int> Purchased,
    List<int> Consumed);

public record HistoryResponse(
    string RestaurantId,
    List<string> Months,
    List<ItemSeries> Series);

public record ForecastItem(
    string ItemId,
    string Name,
    string Category,
    int PredictedConsumption,
    int ConfidenceLow,
    int ConfidenceHigh);

public record ForecastResponse(
    string RestaurantId,
    string ForecastMonth,
    List<ForecastItem> Forecasts);
