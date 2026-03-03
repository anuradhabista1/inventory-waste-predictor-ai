using InventoryWastePredictor.Api.Models;
using InventoryWastePredictor.Api.Services;

namespace InventoryWastePredictor.Api.Routes;

public static class PredictRoutes
{
    public static void MapPredictRoutes(this WebApplication app)
    {
        app.MapPost("/predict/", (PredictRequest body, PredictorService predictor) =>
        {
            var result = predictor.PredictWaste(
                body.ItemId, body.CurrentStock, body.AvgDailySales, body.DaysToExpiry);

            return Results.Ok(new PredictResponse(
                (string)result["item_id"],
                (double)result["waste_risk_score"],
                (double)result["predicted_waste_units"],
                (string)result["risk_level"],
                (string)result["recommendation"]));
        }).WithTags("Prediction");
    }
}
