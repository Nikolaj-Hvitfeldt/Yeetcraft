# Yeetcraft

A clean, minimal fullstack project template inspired by HLTV.org, designed for tracking WoW dungeon mistakes (wipes, deaths, yeets) among friends.

## Tech Stack

### Backend
- **Kotlin** + **Ktor** - Lightweight async web framework
- **PostgreSQL** (via Supabase) - Database
- **Plain SQL** - Direct database access (HikariCP connection pooling)
- **Explicit layered architecture**: Routes → Controllers → Services → Repositories

### Frontend
- **React** + **TypeScript** + **Vite** - Modern frontend stack
- **Plain CSS** - No CSS frameworks, no CSS-in-JS
- **API-driven** - Simple fetch-based data fetching

## Architecture

### Backend Structure
```
backend/
  src/main/kotlin/
    config/          # Configuration (env vars, database setup)
    routes/          # Route definitions (thin, delegates to controllers)
    controllers/     # HTTP request/response handling
    services/        # Business logic
    repositories/    # Database access (plain SQL)
    db/              # Database utilities
    Application.kt   # Entry point
```

### Frontend Structure
```
frontend/
  src/
    api/             # API client functions
    components/      # React components (if needed)
    pages/           # Page components (if needed)
    styles/          # CSS files
    App.tsx          # Main app component
    main.tsx         # Entry point
```

## Setup

### Prerequisites
- JDK 17+ (for backend)
- Node.js 18+ and npm/yarn (for frontend)
- Supabase account with PostgreSQL database

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Set up environment variables (create `.env` or export):
   ```bash
   export DB_HOST=your-supabase-host.supabase.co
   export DB_PORT=5432
   export DB_NAME=postgres
   export DB_USER=postgres
   export DB_PASSWORD=your-supabase-password
   export DB_SSL_MODE=require
   export SERVER_HOST=0.0.0.0
   export SERVER_PORT=8080
   ```

3. Build and run:
   ```bash
   ./gradlew build
   ./gradlew run
   ```

   Or use your IDE to run `Application.kt`.

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (optional):
   Create `.env` file:
   ```bash
   VITE_API_BASE_URL=http://localhost:8080
   ```

4. Run development server:
   ```bash
   npm run dev
   ```

   Frontend will be available at `http://localhost:3000`

## API Endpoints

- `GET /api/health` - Health check endpoint
- `GET /api/mistakes` - Get all mistakes (currently returns mock data)

## Development Notes

### Database Connection
The backend connects to Supabase PostgreSQL using environment variables. The connection is pooled using HikariCP for efficiency.

### Adding New Features

1. **New endpoint**: Add route in `routes/Routes.kt`, create controller in `controllers/`, service in `services/`, repository in `repositories/`
2. **New frontend feature**: Add API function in `frontend/src/api/api.ts`, add TypeScript types in `frontend/src/api/types.ts`, update components

### TODO Items
The codebase contains TODO comments indicating where future features would go:
- Database migrations
- Additional endpoints (CRUD operations, filtering, pagination)
- Authentication (if needed later)
- Frontend enhancements (player stats, dungeon leaderboard)

## Project Goals

- **Boring, predictable, maintainable** structure
- **Easy to extend** with clear separation of concerns
- **Minimal dependencies** - only what's necessary
- **No overengineering** - simple and straightforward

## License

Private project - for friends only.
