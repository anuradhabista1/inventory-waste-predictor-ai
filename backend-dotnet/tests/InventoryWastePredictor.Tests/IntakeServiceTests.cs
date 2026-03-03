using FluentAssertions;
using InventoryWastePredictor.Api.Services;
using Xunit;

namespace InventoryWastePredictor.Tests;

public class IntakeServiceTests
{
    private static IntakeService NewService() => new IntakeService();

    [Fact]
    public void ReturnsCorrectRestaurantAndMonth()
    {
        var svc    = NewService();
        var result = svc.GetMonthlyIntake("R001", "2026-03");

        result["restaurant_id"].Should().Be("R001");
        result["month"].Should().Be("2026-03");
    }

    [Fact]
    public void TotalUnitsAndItems()
    {
        var svc    = NewService();
        var result = svc.GetMonthlyIntake("R001", "2026-03");

        ((int)result["total_items_received"]).Should().Be(3);  // SKU001, SKU002, SKU003
        ((int)result["total_units"]).Should().Be(535);          // 200 + 220 + 115
    }

    [Fact]
    public void PerItemBreakdown()
    {
        var svc    = NewService();
        var result = svc.GetMonthlyIntake("R001", "2026-03");
        var intake = (List<Dictionary<string, object>>)result["intake"];
        var milk   = intake.First(i => (string)i["item_id"] == "SKU001");

        ((int)milk["units_received"]).Should().Be(200);
        ((List<string>)milk["delivery_dates"]).Should().HaveCount(3);
        ((string)milk["category"]).Should().Be("dairy");
    }

    [Fact]
    public void ExcludesOtherMonths()
    {
        var svc    = NewService();
        var result = svc.GetMonthlyIntake("R001", "2026-02");

        ((int)result["total_items_received"]).Should().Be(1);
        var intake = (List<Dictionary<string, object>>)result["intake"];
        ((string)intake[0]["item_id"]).Should().Be("SKU004");
    }

    [Fact]
    public void ExcludesOtherRestaurants()
    {
        var svc    = NewService();
        var result = svc.GetMonthlyIntake("R002", "2026-03");
        var intake = (List<Dictionary<string, object>>)result["intake"];
        var ids    = intake.Select(i => (string)i["item_id"]).ToHashSet();

        ids.Should().NotContain("SKU001");
        ids.Should().Contain("SKU005");
        ids.Should().Contain("SKU006");
    }

    [Fact]
    public void EmptyResultForUnknownRestaurant()
    {
        var svc    = NewService();
        var result = svc.GetMonthlyIntake("R999", "2026-03");

        ((int)result["total_items_received"]).Should().Be(0);
        ((int)result["total_units"]).Should().Be(0);
        ((List<Dictionary<string, object>>)result["intake"]).Should().BeEmpty();
    }

    [Fact]
    public void InvalidMonthRaisesArgumentException()
    {
        var svc = NewService();
        var act = () => svc.GetMonthlyIntake("R001", "March-2026");
        act.Should().Throw<ArgumentException>().WithMessage("*Invalid month format*");
    }

    [Fact]
    public void AddIntakeRecords_AppendsNewEntries()
    {
        var svc = NewService();
        var before = svc.GetMonthlyIntake("R001", "2026-04");
        ((int)before["total_items_received"]).Should().Be(0);

        svc.AddIntakeRecords("R001", "2026-04-01",
            new[] { ("SKU007", "Butter", "dairy", 25) });

        var after = svc.GetMonthlyIntake("R001", "2026-04");
        ((int)after["total_items_received"]).Should().Be(1);
        ((int)after["total_units"]).Should().Be(25);
    }
}
