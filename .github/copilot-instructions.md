applyTo: '**'
---

# Copilot Instructions for Weekly Menu Planner

## Project Overview
This is an AI-powered weekly meal planning application with a React frontend and Node.js/Express backend. It uses OpenAI to generate personalized 7-day meal plans with macro tracking and consolidated shopping lists.

## Development Principles
- Always create tests for any new features added or bugs fixed
- Always update the README.md with any new features or changes to existing features
- Follow TypeScript strict mode — no `any` types without justification
- Use Zod schemas for all API request validation
- Keep the AI provider interface generic to allow easy model upgrades

## Architecture
- **Frontend**: React 18 with TypeScript, Vite, functional components, hooks
- **Backend**: Node.js + Express + TypeScript, structured as routes/services/types
- **AI**: OpenAI API via the `openai` npm package, abstracted behind an `AIProvider` interface
- **Testing**: Vitest + React Testing Library (frontend), Jest + Supertest (backend)
- **Infrastructure**: Docker + Docker Compose, GitHub Actions CI

## Coding Standards
- Use functional React components with TypeScript interfaces for props
- Express routes should use Zod validation for request bodies
- API errors should return structured JSON with `error` and optional `details` fields
- Keep components focused — one component per file
- CSS uses custom properties defined in App.css

## File Organization
- `server/src/types.ts` — Shared types and Zod schemas
- `server/src/services/` — Business logic and AI integration
- `server/src/routes/` — Express route handlers
- `client/src/components/` — React UI components
- `client/src/services/` — API client functions
- `client/src/types.ts` — Frontend type definitions

## Testing Requirements
- All new features must include unit tests
- Backend route changes need integration tests using supertest
- Frontend component changes need React Testing Library tests
- Run `npm test` from root to execute all tests before committing
