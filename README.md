# TaskFlow — ASP.NET Core + Vue 3 + Playwright

A full-stack task management application with a .NET 8 Web API backend, Vue 3 frontend, Playwright E2E tests, and a GitHub Actions CI pipeline for self-hosted Linux runners.

---

## Project Structure

```
solution/
├── api/                        # ASP.NET Core 8 Web API
│   ├── Controllers/
│   │   └── TasksController.cs  # REST endpoints
│   ├── Models/
│   │   └── TaskItem.cs         # Domain model + DTOs
│   ├── Repositories/
│   │   └── TaskRepository.cs   # In-memory repository
│   ├── Program.cs
│   └── Api.csproj
│
├── frontend/                   # Vue 3 + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── TaskCard.vue
│   │   │   └── CreateTaskModal.vue
│   │   ├── services/
│   │   │   └── taskService.js  # Axios API layer
│   │   ├── App.vue
│   │   ├── main.js
│   │   └── style.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── tests/                      # Playwright E2E
│   ├── e2e/
│   │   ├── tasks.spec.js       # UI tests
│   │   └── api.spec.js         # API smoke tests
│   ├── playwright.config.js
│   └── package.json
│
└── .github/
    └── workflows/
        └── ci.yml              # GitHub Actions pipeline
```

---

## Prerequisites

| Tool     | Minimum version |
| -------- | --------------- |
| .NET SDK | 10.0            |
| Node.js  | 24.x            |
| npm      | 11.x            |

---

## Running Locally

### 1 — Start the API

```bash
cd api
dotnet restore
dotnet run
# API available at http://localhost:5000
# Swagger UI at http://localhost:5000/swagger
```

### 2 — Start the Frontend

```bash
cd frontend
npm install
npm run dev
# App available at http://localhost:5173
```

### 3 — Run Playwright Tests

Ensure both the API and frontend are running, then:

```bash
cd tests
npm install
npx playwright install --with-deps
npx playwright test
# HTML report:
npx playwright show-report
```

---

## API Endpoints

| Method | Path            | Description    |
| ------ | --------------- | -------------- |
| GET    | /health         | Health check   |
| GET    | /api/tasks      | List all tasks |
| GET    | /api/tasks/{id} | Get task by ID |
| POST   | /api/tasks      | Create a task  |
| PUT    | /api/tasks/{id} | Update a task  |
| DELETE | /api/tasks/{id} | Delete a task  |

### Example — Create a Task

```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"My Task","description":"Details here","priority":1}'
```

Priority values: `0` = Low, `1` = Medium, `2` = High

---

## GitHub Actions CI

The workflow (`.github/workflows/ci.yml`) runs on **self-hosted Linux runners** and consists of four jobs:

| Job              | What it does                                           |
| ---------------- | ------------------------------------------------------ |
| `build-api`      | Restores, builds, and publishes the .NET API           |
| `build-frontend` | Installs, lints, and builds the Vue app                |
| `e2e-tests`      | Starts both servers and runs all Playwright tests      |
| `ci-success`     | Gate job — fails the pipeline if any earlier job fails |

### Registering a Self-Hosted Runner

1. Go to **GitHub repo → Settings → Actions → Runners → New self-hosted runner**
2. Select **Linux** and follow the installation instructions
3. Add the labels **`self-hosted`** and **`linux`** to the runner
4. The runner needs .NET 8 SDK, Node.js 20, and `libgtk` / `libnss` for Playwright browsers

```bash
# Install Playwright system deps on the runner (once)
npx playwright install-deps
```

---

## Tech Stack

- **Backend**: ASP.NET Core 8, C# 12, Swashbuckle/Swagger, in-memory repository
- **Frontend**: Vue 3 (Composition API), Vite, Axios
- **Testing**: Playwright (UI + API tests, Chromium + Firefox)
- **CI/CD**: GitHub Actions, self-hosted Linux runner
