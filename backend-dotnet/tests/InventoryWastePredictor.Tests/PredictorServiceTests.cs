using FluentAssertions;
using InventoryWastePredictor.Api.Services;
using Xunit;

namespace InventoryWastePredictor.Tests;

public class PredictorServiceTests
{
    private static PredictorService NewService() => new PredictorService();

    [Fact]
    public void HighWasteRisk()
    {
        var svc    = NewService();
        var result = svc.PredictWaste("SKU001", currentStock: 100, avgDailySales: 5, daysToExpiry: 3);

        ((string)result["risk_level"]).Should().Be("high");
        ((double)result["waste_risk_score"]).Should().BeGreaterThanOrEqualTo(0.25);
    }

    [Fact]
    public void LowWasteRisk()
    {
        var svc    = NewService();
        var result = svc.PredictWaste("SKU002", currentStock: 10, avgDailySales: 10, daysToExpiry: 30);

        ((string)result["risk_level"]).Should().Be("low");
    }

    [Fact]
    public void ResponseShape()
    {
        var svc    = NewService();
        var result = svc.PredictWaste("SKU003", currentStock: 50, avgDailySales: 8, daysToExpiry: 7);

        result.Should().ContainKey("waste_risk_score");
        result.Should().ContainKey("predicted_waste_units");
        result.Should().ContainKey("recommendation");
    }
}
