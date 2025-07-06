# Project Structure

```
stock-analysis-platform/
├── frontend/                 # React.js application
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── Dockerfile
├── backend/                  # Node.js API
│   ├── src/
│   ├── tests/
│   ├── package.json
│   └── Dockerfile
├── infrastructure/           # Terraform configurations
│   ├── modules/
│   ├── environments/
│   └── main.tf
├── .github/                 # GitHub Actions workflows
│   └── workflows/
├── docker-compose.yml       # Local development
├── nginx/                   # Reverse proxy config
├── monitoring/              # Prometheus, Grafana configs
├── scripts/                 # Deployment scripts
└── docs/                    # Documentation
```
