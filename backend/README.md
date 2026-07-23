# RecDel Backend

Stateless Node.js + Express API for the RecDel Android app. No database,
no auth, no user content — see Section 5 of the requirement spec. All
config is flat-file JSON under `src/data/`, git-managed.

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | Liveness check |
| GET | `/config/app-version` | Force/soft-update check |
| GET | `/config/remote-flags` | Feature flags |
| GET | `/config/supported-apps` | Metadata for apps RecDel specially integrates with |
| GET | `/legal/privacy-policy` | Hosted privacy policy (markdown) |
| GET | `/legal/terms` | Hosted terms & conditions (markdown) |
| POST | `/telemetry/event` | Anonymous, allowlisted event counters only |

## Run

```bash
npm install
npm start        # production
npm run dev       # auto-restart on change
npm test
```

Configure `PORT` and `CORS_ORIGIN` via `.env` (see `.env.example`).
