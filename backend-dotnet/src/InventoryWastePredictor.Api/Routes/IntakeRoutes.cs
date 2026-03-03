using System.Text.RegularExpressions;
using InventoryWastePredictor.Api.Models;
using InventoryWastePredictor.Api.Services;
using static InventoryWastePredictor.Api.Routes.AuthRoutes;

namespace InventoryWastePredictor.Api.Routes;

public static class IntakeRoutes
{
    private static readonly Regex MonthPattern = new(@"^\d{4}-\d{2}$", RegexOptions.Compiled);
    private static readonly Regex DatePattern  = new(@"^\d{4}-\d{2}-\d{2}$", RegexOptions.Compiled);

    public static void MapIntakeRoutes(this WebApplication app)
    {
        var group = app.MapGroup("/inventory/intake").WithTags("Intake");

        group.MapGet("/", (HttpContext ctx, AuthService auth, IntakeService intake,
            string? restaurant_id, string? month) =>
        {
            var err = RequireAuth(ctx, auth, out _);
            if (err is not null) return err;

            if (string.IsNullOrEmpty(restaurant_id) || string.IsNullOrEmpty(month))
                return Results.BadRequest(new { detail = "restaurant_id and month are required." });

            if (!MonthPattern.IsMatch(month))
                return Results.UnprocessableEntity(new { detail = $"Invalid month format '{month}'. Expected YYYY-MM." });

            try
            {
                var data = intake.GetMonthlyIntake(restaurant_id, month);
                var items = ((List<Dictionary<string, object>>)data["intake"]).Select(i =>
                    new IntakeItem(
                        (string)i["item_id"],
                        (string)i["name"],
                        (string)i["category"],
                        (int)i["units_received"],
                        (List<string>)i["delivery_dates"]
                    )).ToList();

                return Results.Ok(new IntakeResponse(
                    (string)data["restaurant_id"],
                    (string)data["month"],
                    (int)data["total_items_received"],
                    (int)data["total_units"],
                    items));
            }
            catch (ArgumentException ex)
            {
                return Results.UnprocessableEntity(new { detail = ex.Message });
            }
        });

        group.MapPost("/", (HttpContext ctx, AuthService auth, IntakeService intake,
            SubmitIntakeRequest body) =>
        {
            var err = RequireRole(ctx, auth, "Manager", out _);
            if (err is not null) return err;

            if (!MonthPattern.IsMatch(body.Month))
                return Results.UnprocessableEntity(new { detail = "Month must match YYYY-MM." });
            if (!DatePattern.IsMatch(body.DeliveryDate))
                return Results.UnprocessableEntity(new { detail = "DeliveryDate must match YYYY-MM-DD." });
            if (!body.DeliveryDate.StartsWith(body.Month))
                return Results.UnprocessableEntity(new
                {
                    detail = $"Delivery date {body.DeliveryDate} is outside month {body.Month}."
                });
            if (body.Items.Count == 0)
                return Results.UnprocessableEntity(new { detail = "Items list must not be empty." });

            intake.AddIntakeRecords(
                body.RestaurantId, body.DeliveryDate,
                body.Items.Select(i => (i.ItemId, i.Name, i.Category, i.Units)));

            return Results.Ok(new SubmitIntakeResponse(
                "Intake recorded successfully.",
                body.RestaurantId,
                body.Month,
                body.DeliveryDate,
                body.Items.Count,
                body.Items.Sum(i => i.Units)));
        });
    }
}
