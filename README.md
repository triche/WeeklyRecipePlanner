# Weekly Menu Planner

AI-powered weekly meal planner with macro tracking and shopping list generation. Uses OpenAI to create personalized 7-day meal plans based on your dietary preferences, restrictions, and macro goals.

## Features

- **Macro-based meal planning** — Set daily targets for protein, carbs, fats, fiber, and calories
- **Day-of-week selector** — Choose which days to include in your plan (all 7 on by default)
- **Meal selector** — Choose which meals to include per day: Breakfast, Morning Snack, Lunch, Afternoon Snack, Dinner (all on by default)
- **AI-generated plans** — Full 7-day meal plans with breakfast, lunch, dinner, and morning/afternoon snacks
- **Dietary preferences** — Support for restrictions (vegetarian, gluten-free, etc.) and favorite cuisines
- **Consolidated shopping list** — Aggregated by category (Produce, Dairy, Meat & Seafood, etc.)
- **Export options** — Copy shopping list to clipboard or download as Markdown
- **Recipe viewer** — Click any meal name to view a full AI-generated recipe with ingredients and step-by-step instructions in a modal; recipes are cached per session for instant re-access, and can be copied to clipboard or saved as Markdown
- **Free text input** — Provide any additional context for the AI to consider
- **Dev Console** — Built-in developer console for real-time log monitoring and error details (toggle with Ctrl+Shift+D)
- **Dockerized** — Run locally or deploy to any cloud platform

## Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Frontend  | React 18, TypeScript, Vite              |
| Backend   | Node.js, Express, TypeScript            |
| AI        | OpenAI API (GPT-5.2 or later)            |
| Infra     | Docker, Docker Compose, GitHub Actions  |
| Testing   | Vitest, React Testing Library, Supertest|

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- An OpenAI API key

### Setup

```bash
# Clone the repository
git clone <repo-url>
cd WeeklyRecipePlanner

# Create your environment file
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY

# Install root dependencies
npm install

# Install server dependencies
cd server && npm install && cd ..

# Install client dependencies
cd client && npm install && cd ..
```

### Development

```bash
# Run both client and server in development mode
npm run dev

# Or run them separately:
npm run dev:server   # Backend on http://localhost:3001
npm run dev:client   # Frontend on http://localhost:3000
```

### Testing

```bash
# Run all tests
npm test

# Run server tests only
npm run test:server

# Run client tests only
npm run test:client
```

### Linting

```bash
npm run lint
```

### Docker

```bash
# Build and start all services
docker-compose up --build

# Stop services
docker-compose down
```

The app will be available at `http://localhost:3000` with the API at `http://localhost:3001`.

## Project Structure

```
WeeklyRecipePlanner/
├── client/                  # React frontend (Vite)
│   ├── index.html
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── DayOfWeekSelector.tsx # Day picker toggle chips
│   │   │   ├── DevConsole.tsx     # Dev mode log viewer
│   │   │   ├── MealPlanForm.tsx
│   │   │   ├── MealPlanDisplay.tsx
│   │   │   ├── MealSlotSelector.tsx # Meal slot toggle chips
│   │   │   ├── RecipeModal.tsx     # On-demand recipe viewer modal
│   │   │   ├── ShoppingListDisplay.tsx
│   │   │   └── TagInput.tsx
│   │   ├── services/        # API client & dev logger
│   │   ├── App.tsx
│   │   ├── App.css
│   │   └── types.ts
│   ├── vite.config.ts
│   ├── vitest.config.ts
│   ├── eslint.config.js
│   ├── Dockerfile
│   └── nginx.conf
├── server/                  # Express backend
│   ├── src/
│   │   ├── routes/          # API route handlers
│   │   ├── services/        # AI provider abstraction
│   │   ├── app.ts           # Express app setup
│   │   ├── config.ts        # Environment config
│   │   ├── index.ts         # Server entry point
│   │   └── types.ts         # Shared types & Zod schemas
│   └── Dockerfile
├── docs/
│   └── theory-of-operation.md
├── .github/workflows/ci.yml # CI pipeline
├── docker-compose.yml
└── .env.example
```

## Environment Variables

| Variable        | Required | Default   | Description                 |
|-----------------|----------|-----------|-----------------------------|
| `OPENAI_API_KEY`| Yes      | —         | Your OpenAI API key         |
| `OPENAI_MODEL`  | No       | `gpt-5.2` | OpenAI model to use         |
| `PORT`          | No       | `3001`    | Server port                 |
| `NODE_ENV`      | No       | `development` | Environment              |
| `CORS_ORIGIN`   | No       | `http://localhost:3000` | Allowed CORS origin |
| `VITE_API_URL`  | No       | `/api`    | Client API base URL         |

## Dev Mode

The app includes a built-in developer console for debugging. It captures all `console.log`, `console.info`, `console.warn`, and `console.error` output, plus unhandled errors and promise rejections.

**How to activate:**
- Click the 🛠 button in the bottom-right corner of the screen
- Or press **Ctrl+Shift+D** (Cmd+Shift+D on Mac)

**Features:**
- Real-time log stream with color-coded levels (log, info, warn, error)
- Filter by log level with badge counts for errors and warnings
- Click error entries to expand full stack traces
- Clear button to reset the console
- API requests are automatically logged with request/response details

## CI/CD

GitHub Actions runs on every pull request and push to `main`:
1. **Server lint & test**
2. **Client lint & test**
3. **Docker build** (after tests pass)

## License

See [LICENSE](LICENSE) for details.
