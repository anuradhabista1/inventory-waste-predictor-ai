namespace InventoryWastePredictor.Api.Services;

public class PredictorService
{
    private const double WasteThreshold = 0.25;

    public Dictionary<string, object> PredictWaste(
        string itemId, double currentStock, double avgDailySales, int? daysToExpiry)
    {
        var dailySales = avgDailySales > 0 ? avgDailySales : 0.01;
        var daysOfStock = currentStock / dailySales;
        var expiryFactor = daysToExpiry.HasValue ? daysOfStock / daysToExpiry.Value : 0.5;
        var wasteRiskScore = Math.Min(Math.Round(expiryFactor * 0.6, 2), 1.0);
        var predictedWasteUnits = Math.Round(
            Math.Max(currentStock - dailySales * (daysToExpiry ?? 30), 0), 2);

        string riskLevel, recommendation;
        if (wasteRiskScore >= WasteThreshold)
        {
            riskLevel       = "high";
            recommendation  = "Discount or redistribute stock immediately.";
        }
        else if (wasteRiskScore >= 0.1)
        {
            riskLevel      = "medium";
            recommendation = "Monitor closely and consider promotions.";
        }
        else
        {
            riskLevel      = "low";
            recommendation = "No action needed.";
        }

        return new Dictionary<string, object>
        {
            ["item_id"]               = itemId,
            ["waste_risk_score"]      = wasteRiskScore,
            ["predicted_waste_units"] = predictedWasteUnits,
            ["risk_level"]            = riskLevel,
            ["recommendation"]        = recommendation,
        };
    }
}
