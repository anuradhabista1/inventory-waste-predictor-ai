using FluentAssertions;
using InventoryWastePredictor.Api.Services;
using Xunit;

namespace InventoryWastePredictor.Tests;

public class SummaryServiceTests
{
    private static (IntakeService Intake, SummaryService Summary) NewServices()
    {
        var intake  = new IntakeService();
        var summary = new SummaryService(intake);
        return (intake, summary);
    }

    [Fact]
    public void SummaryReturnsCorrectMonth()
    {
        var (_, summary) = NewServices();
        var result = summary.GetMonthlySummary("R001", "2026-03");

        result["restaurant_id"].Should().Be("R001");
        result["month"].Should().Be("2026-03");
        ((List<Dictionary<string, object>>)result["items"]).Should().HaveCount(3);
    }

    [Fact]
    public void WasteCalculatedCorrectly()
    {
        var (_, summary) = NewServices();
        var result = summary.GetMonthlySummary("R001", "2026-03");
        var items  = (List<Dictionary<string, object>>)result["items"];
        var milk   = items.First(i => (string)i["item_id"] == "SKU001");

        ((int)milk["units_purchased"]).Should().Be(200);
        ((int)milk["units_consumed"]).Should().Be(160);
        ((int)milk["waste"]).Should().Be(40);
        ((double)milk["waste_pct"]).Should().Be(20.0);
        ((string)milk["waste_level"]).Should().Be("amber");
    }

    [Fact]
    public void TotalsAreCorrect()
    {
        var (_, summary) = NewServices();
        var result = summary.GetMonthlySummary("R001", "2026-03");

        ((int)result["total_purchased"]).Should().Be(535);
        ((int)result["total_consumed"]).Should().Be(410);
        ((int)result["total_waste"]).Should().Be(125);
    }

    [Fact]
    public void WasteLevelGreen()
    {
        var (_, summary) = NewServices();
        var result = summary.GetMonthlySummary("R001", "2026-03");
        var items  = (List<Dictionary<string, object>>)result["items"];
        var bread  = items.First(i => (string)i["item_id"] == "SKU002");

        ((string)bread["waste_level"]).Should().Be("green");
    }

    [Fact]
    public void WasteLevelRed()
    {
        var (_, summary) = NewServices();
        var result   = summary.GetMonthlySummary("R001", "2026-03");
        var items    = (List<Dictionary<string, object>>)result["items"];
        var tomatoes = items.First(i => (string)i["item_id"] == "SKU003");

        ((string)tomatoes["waste_level"]).Should().Be("red");
    }

    [Fact]
    public void SaveConsumption_UpdatesWaste()
    {
        var (_, summary) = NewServices();
        summary.SaveConsumption("R001", "2026-03",
            new[] { ("SKU001", 195) });

        var result = summary.GetMonthlySummary("R001", "2026-03");
        var items  = (List<Dictionary<string, object>>)result["items"];
        var milk   = items.First(i => (string)i["item_id"] == "SKU001");

        ((int)milk["units_consumed"]).Should().Be(195);
        ((int)milk["waste"]).Should().Be(5);
        ((string)milk["waste_level"]).Should().Be("green");
    }

    [Fact]
    public void EmptyMonthReturnsNoItems()
    {
        var (_, summary) = NewServices();
        var result = summary.GetMonthlySummary("R001", "2020-01");

        ((List<Dictionary<string, object>>)result["items"]).Should().BeEmpty();
        ((int)result["total_purchased"]).Should().Be(0);
        ((int)result["total_waste"]).Should().Be(0);
    }

    [Fact]
    public void OverallWasteLevelReflectsTotals()
    {
        var (_, summary) = NewServices();
        var result = summary.GetMonthlySummary("R001", "2026-03");

        result.Should().ContainKey("overall_waste_pct");
        result.Should().ContainKey("overall_waste_level");
        ((string)result["overall_waste_level"]).Should().BeOneOf("green", "amber", "red");
    }
}
