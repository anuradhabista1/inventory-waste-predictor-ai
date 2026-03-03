using System.Text.RegularExpressions;
using InventoryWastePredictor.Api.Models;
using InventoryWastePredictor.Api.Services;
using static InventoryWastePredictor.Api.Routes.AuthRoutes;

namespace InventoryWastePredictor.Api.Routes;

public static class InventoryRoutes
{
    private static readonly Regex DatePattern = new(@"^\d{4}-\d{2}-\d{2}$", RegexOptions.Compiled);

    public static void MapInventoryRoutes(this WebApplication app)
    {
        var group = app.MapGroup("/inventory/list").WithTags("Inventory");

        group.MapGet("/", (HttpContext ctx, AuthService auth, IntakeService intake,
            string? restaurant_id, string? from_date, string? to_date) =>
        {
            var err = RequireAuth(ctx, auth, out _);
            if (err is not null) return err;

            if (string.IsNullOrEmpty(restaurant_id) || string.IsNullOrEmpty(from_date) || string.IsNullOrEmpty(to_date))
                return Results.BadRequest(new { detail = "restaurant_id, from_date, and to_date are required." });

            if (!DatePattern.IsMatch(from_date) || !DatePattern.IsMatch(to_date))
                return Results.UnprocessableEntity(new { detail = "Dates must match YYYY-MM-DD." });

            var data  = intake.GetInventoryByDate(restaurant_id, from_date, to_date);
            var items = ((List<Dictionary<string, object>>)data["items"]).Select(i =>
                new InventoryItem(
                    (string)i["item_id"],
                    (string)i["name"],
                    (string)i["category"],
                    (int)i["units"],
                    (string)i["delivery_date"]
                )).ToList();

            return Results.Ok(new InventoryListResponse(
                (string)data["restaurant_id"],
                (string)data["from"],
                (string)data["to"],
                (int)data["total_items"],
                (int)data["total_units"],
                items));
        });

        group.MapPatch("/{itemId}", (HttpContext ctx, AuthService auth, IntakeService intake,
            string itemId, EditItemRequest body,
            string? restaurant_id, string? delivery_date) =>
        {
            var err = RequireRole(ctx, auth, "Manager", out _);
            if (err is not null) return err;

            if (string.IsNullOrEmpty(restaurant_id) || string.IsNullOrEmpty(delivery_date))
                return Results.BadRequest(new { detail = "restaurant_id and delivery_date are required." });

            if (!DatePattern.IsMatch(delivery_date))
                return Results.UnprocessableEntity(new { detail = "delivery_date must match YYYY-MM-DD." });

            var updated = intake.UpdateIntakeRecord(
                restaurant_id, itemId, delivery_date, body.Name, body.Category, body.Units);

            if (!updated)
                return Results.NotFound(new { detail = "Record not found." });

            return Results.Ok(new { message = "Record updated successfully." });
        });
    }
}
