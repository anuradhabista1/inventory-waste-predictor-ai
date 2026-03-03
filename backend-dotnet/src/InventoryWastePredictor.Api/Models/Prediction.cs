namespace InventoryWastePredictor.Api.Models;

public record PredictRequest(
    string ItemId,
    string Category,
    double CurrentStock,
    double AvgDailySales,
    int? DaysToExpiry = null);

public record PredictResponse(
    string ItemId,
    double WasteRiskScore,
    double PredictedWasteUnits,
    string RiskLevel,
    string Recommendation);
