using System.Text.RegularExpressions;
using InventoryWastePredictor.Api.Models;
using InventoryWastePredictor.Api.Services;
using static InventoryWastePredictor.Api.Routes.AuthRoutes;

namespace InventoryWastePredictor.Api.Routes;

public static class SummaryRoutes
{
    private static readonly Regex MonthPattern = new(@"^\d{4}-\d{2}$", RegexOptions.Compiled);

    public static void MapSummaryRoutes(this WebApplication app)
    {
        var group = app.MapGroup("/inventory/summary").WithTags("Summary");

        group.MapGet("/", (HttpContext ctx, AuthService auth, SummaryService summary,
            string? restaurant_id, string? month) =>
        {
            var err = RequireAuth(ctx, auth, out _);
            if (err is not null) return err;

            if (string.IsNullOrEmpty(restaurant_id) || string.IsNullOrEmpty(month))
                return Results.BadRequest(new { detail = "restaurant_id and month are required." });

            if (!MonthPattern.IsMatch(month))
                return Results.UnprocessableEntity(new { detail = "month must match YYYY-MM." });

            var data  = summary.GetMonthlySummary(restaurant_id, month);
            var items = ((List<Dictionary<string, object>>)data["items"]).Select(i =>
                new SummaryItem(
                    (string)i["item_id"],
                    (string)i["name"],
                    (string)i["category"],
                    (int)i["units_purchased"],
                    (int)i["units_consumed"],
                    (int)i["waste"],
                    (double)i["waste_pct"],
                    (string)i["waste_level"]
                )).ToList();

            return Results.Ok(new SummaryResponse(
                (string)data["restaurant_id"],
                (string)data["month"],
                items,
                (int)data["total_purchased"],
                (int)data["total_consumed"],
                (int)data["total_waste"],
                (double)data["overall_waste_pct"],
                (string)data["overall_waste_level"]));
        });

        group.MapPost("/", (HttpContext ctx, AuthService auth, SummaryService summary,
            SaveConsumptionRequest body) =>
        {
            var err = RequireRole(ctx, auth, "Manager", out _);
            if (err is not null) return err;

            if (!MonthPattern.IsMatch(body.Month))
                return Results.UnprocessableEntity(new { detail = "month must match YYYY-MM." });
            if (body.Entries.Count == 0)
                return Results.UnprocessableEntity(new { detail = "entries list must not be empty." });

            summary.SaveConsumption(
                body.RestaurantId, body.Month,
                body.Entries.Select(e => (e.ItemId, e.UnitsConsumed)));

            return Results.Ok(new { message = "Consumption data saved successfully." });
        });
    }
}
