# Safety Companion

AI-powered construction safety analysis platform with multi-agent JHA (Job Hazard Analysis) generation.

## System Architecture
```
Frontend (React + TypeScript)
         ↓
FastAPI Backend (Python)
         ↓
4-Agent Pipeline:
  1. OSHA Validator
  2. Risk Assessor (Fatal Four)
  3. Swiss Cheese Analyzer
  4. Report Synthesizer
         ↓
Neon Postgres
```

## Features

- **Master JHA Checklist**: 20-question OSHA-compliant assessment
- **Real-time Risk Scoring**: Quantitative 0-100 risk analysis
- **OSHA Fatal Four**: Falls (36.5%), Struck-by (10.1%), Electrocution (8.5%), Caught-between (7.3%)
- **Swiss Cheese Model**: Predictive incident analysis with defense failure identification
- **Weather Integration**: Real-time conditions with safety thresholds
- **Live Updates**: Voice-enabled field updates with automatic re-analysis

## Technology Stack

**Backend:**
- FastAPI (Python 3.12)
- SQLAlchemy (async ORM)
- Gemini 2.5 Flash (AI)
- Neon Postgres (database)

**Frontend:**
- React + TypeScript
- Vite
- Tailwind CSS

**Infrastructure:**
- Railway (hosting)
- Neon (database)
- GitHub Actions (CI/CD)

## Quick Start

See `/backend/README.md` and `/frontend/README.md` for detailed setup.

## Deployment

Production system running at: [your-railway-url]

## License

Proprietary - All Rights Reserved