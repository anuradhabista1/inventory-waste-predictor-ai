# Inventory Waste Predictor powered by AI

An AI-powered system that predicts inventory waste, spoilage, and overstock to help businesses reduce losses and optimize supply chain decisions.

## Features
- Forecast surplus and waste by product, category, and location
- Time-series demand prediction using historical sales data
- Waste risk scoring per SKU
- REST API for integration with ERP/WMS systems
- Interactive dashboards for insights

## Quick Start

```bash
# Clone the repo
git clone https://github.com/anuradhabista1/inventory-waste-predictor-ai.git
cd inventory-waste-predictor-ai

# Install dependencies
pip install -r requirements.txt

# Run the API
uvicorn src.api.main:app --reload
```

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/predict` | Get waste prediction for a product |
| GET | `/items` | List tracked inventory items |
| GET | `/report` | Summary waste risk report |

## License
MIT
