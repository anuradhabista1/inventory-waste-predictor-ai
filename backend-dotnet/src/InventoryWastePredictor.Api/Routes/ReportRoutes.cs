using InventoryWastePredictor.Api.Models;
using InventoryWastePredictor.Api.Services;
using static InventoryWastePredictor.Api.Routes.AuthRoutes;

namespace InventoryWastePredictor.Api.Routes;

public static class ReportRoutes
{
    public static void MapReportRoutes(this WebApplication app)
    {
        var group = app.MapGroup("/inventory/report").WithTags("Reports");

        group.MapGet("/history", (HttpContext ctx, AuthService auth, ReportService report,
            string? restaurant_id, int months = 6) =>
        {
            var err = RequireAuth(ctx, auth, out _);
            if (err is not null) return err;

            if (string.IsNullOrEmpty(restaurant_id))
                return Results.BadRequest(new { detail = "restaurant_id is required." });

            months = Math.Clamp(months, 2, 12);

            var data   = report.GetHistory(restaurant_id, months);
            var series = ((List<Dictionary<string, object>>)data["series"]).Select(s =>
                new ItemSeries(
                    (string)s["item_id"],
                    (string)s["name"],
                    (string)s["category"],
                    (List<int>)s["purchased"],
                    (List<int>)s["consumed"]
                )).ToList();

            return Results.Ok(new HistoryResponse(
                (string)data["restaurant_id"],
                (List<string>)data["months"],
                series));
        });

        group.MapGet("/forecast", (HttpContext ctx, AuthService auth, ReportService report,
            string? restaurant_id) =>
        {
            var err = RequireAuth(ctx, auth, out _);
            if (err is not null) return err;

            if (string.IsNullOrEmpty(restaurant_id))
                return Results.BadRequest(new { detail = "restaurant_id is required." });

            var data      = report.GetForecast(restaurant_id);
            var forecasts = ((List<Dictionary<string, object>>)data["forecasts"]).Select(f =>
                new ForecastItem(
                    (string)f["item_id"],
                    (string)f["name"],
                    (string)f["category"],
                    (int)f["predicted_consumption"],
                    (int)f["confidence_low"],
                    (int)f["confidence_high"]
                )).ToList();

            return Results.Ok(new ForecastResponse(
                (string)data["restaurant_id"],
                (string)data["forecast_month"],
                forecasts));
        });
    }
}
