# SkillBridge AI – Smart Skill-Gap and Training Planner

SkillBridge AI is a full-stack workforce skill-gap analysis, assessment, personalized learning roadmap, and talent pipeline platform built with strict separation across three tiers:

1. **Frontend (`/`)**: React 19 + TypeScript + Vite + Material UI (MUI) + Recharts + Axios + React Router
2. **Backend (`/backend`)**: .NET 10 ASP.NET Core Web API (Clean Architecture: `Domain`, `Application`, `Infrastructure`, `API`, `UnitTests`) + Entity Framework Core + Microsoft SQL Server + ASP.NET Core Identity + JWT + Refresh Token Rotation + Hangfire + Swagger + Serilog + QuestPDF
3. **AI Service (`/ai-service`)**: Python + FastAPI + Google Gemini (`google-genai` SDK) + Scikit-learn (`StandardScaler` + `KMeans` when assessed sample size `>= 15`, falling back transparently to `ExplainableRuleBased` analysis for smaller cohorts)

---

## Folder Structure

```text
├── src/                        # React 19 + TypeScript + MUI frontend (23 Figma screens + Admin Approvals)
├── backend/
│   ├── SkillBridge.sln
│   ├── src/
│   │   ├── SkillBridge.Domain/
│   │   ├── SkillBridge.Application/
│   │   ├── SkillBridge.Infrastructure/
│   │   └── SkillBridge.API/
│   └── tests/
│       └── SkillBridge.UnitTests/
└── ai-service/                 # Python FastAPI microservice (Gemini + Scikit-learn)
    ├── app/
    │   ├── core/config.py
    │   ├── schemas/contracts.py
    │   ├── services/
    │   │   ├── gemini_client.py
    │   │   └── skill_clustering.py
    │   └── main.py
    ├── requirements.txt
    └── .env.example
```

---

## Local Development Setup

### Prerequisites
- **Node.js** 20+
- **.NET 10 SDK**
- **Microsoft SQL Server** (LocalDB, SQL Server Express, or Docker SQL Server)
- **Python 3.10+**
- **Google Gemini API Key**

---

### 1. Start Python FastAPI AI Service (`/ai-service`)

```bash
cd ai-service
python -m venv .venv
# Windows: .venv\Scripts\activate
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Edit `ai-service/.env`:
- Set `GEMINI_API_KEY` to your Gemini API key.
- Set `INTERNAL_SERVICE_KEY` to a shared secret string (must match `AiService:InternalKey` in the .NET API).

Start FastAPI on port `8000`:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Verify health at `http://localhost:8000/ai/v1/health`.

---

### 2. Configure & Run .NET 10 Backend (`/backend`)

Copy the example config:
```bash
cd backend/src/SkillBridge.API
cp appsettings.Development.json.example appsettings.Development.json
```

Edit `appsettings.Development.json` (or use `dotnet user-secrets`):
- `ConnectionStrings:DefaultConnection`: Your SQL Server instance connection string.
- `Jwt:SecretKey`: A strong random key (32+ characters).
- `AiService:InternalKey`: Matches `INTERNAL_SERVICE_KEY` in `ai-service/.env`.
- `Seed:AdminPassword`: Set a strong local password to seed the bootstrap Administrator account (`admin@skillbridge.ai`).

Create and apply the initial EF Core SQL Server migration:
```bash
cd backend
dotnet tool install --global dotnet-ef
dotnet ef migrations add InitialCreate \
  --project src/SkillBridge.Infrastructure \
  --startup-project src/SkillBridge.API \
  --output-dir Persistence/Migrations
dotnet ef database update \
  --project src/SkillBridge.Infrastructure \
  --startup-project src/SkillBridge.API
```

Run tests and start the `.NET 10` API on port `5000`:
```bash
dotnet test
dotnet run --project src/SkillBridge.API --urls "http://localhost:5000"
```

- **Swagger UI**: `http://localhost:5000/swagger`
- **Hangfire Dashboard (Development)**: `http://localhost:5000/hangfire`

---

### 3. Run React + Vite Frontend (`/`)

```bash
npm install
cp .env.example .env
npm run dev
```

Vite runs on `http://localhost:3000` and proxies `/api/*` requests directly to `http://localhost:5000`.

---

## Authentication & Role Workflows

1. **Seeded Development Accounts (created automatically by `DbInitializer` on API startup):**
   - **Employee Portal (`/login`):** `samyukthasahana2004@gmail.com` / `samyuktha`
   - **Manager Portal (`/login/manager`):** `manager@skillbridge.ai` / `Manager@2026`
2. **Employees** can also register directly via `/signup` -> `Employee` tab (`ApprovalStatus = Active`), take assessments, view explainable skill gaps, generate Gemini learning roadmaps, track progress, and chat with the 5-mode AI Assistant.
3. **Managers** register via `/signup` -> `Manager` tab:
   - With a cryptographic single-use invitation code issued by an Admin: activated immediately (`Active`).
   - Without an invitation code: created as `PendingApproval` until an Admin approves the request.
4. **Administrators** sign in at `/login/manager` using `admin@skillbridge.ai` (configured via `Seed:AdminPassword`) and manage invitations & pending approvals at `/admin/approvals`.
