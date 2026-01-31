# OnTrack Backend

Backend server for the OnTrack application, providing course scraping from Coursicle and (future) AI integration.

## Features

- 🔍 **Course Scraper**: Scrapes Temple University courses from Coursicle
- 📊 **Prerequisite Parser**: Parses prerequisites into structured format for comparison
- 💾 **Database Integration**: Stores scraped data in Supabase
- 🌐 **REST API**: Express server for triggering scrapes and retrieving data

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Install Playwright Browsers

```bash
npx playwright install chromium
```

### 3. Configure Environment Variables

Create a `.env` file in the backend directory:

```env
# Supabase Configuration
# Get these from: Supabase Dashboard → Project Settings → API
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Server Configuration
PORT=3001

# Scraper Configuration (optional)
SCRAPE_DELAY_MS=1000
MAX_CONCURRENT_PAGES=3
```

> ⚠️ **Important**: Use the **service role key** (not the anon key) for backend operations.

## Usage

### Command Line Scraping

```bash
# List all available subjects
npm run scrape:subjects

# Scrape all subjects (takes a while!)
npm run scrape

# Scrape specific subjects only
npm run scrape -- CIS MATH PHYS

# Preview scrape without saving to database
npm run scrape -- --dry-run CIS
```

### Running the Server

```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm run build
npm start
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/scraper/status` | Get scraper status |
| POST | `/api/scraper/scrape` | Start scraping (body: `{ subjects?: string[] }`) |
| GET | `/api/scraper/stats` | Get course statistics |
| GET | `/api/scraper/subjects` | List available subjects |

#### Example API Usage

```bash
# Check health
curl http://localhost:3001/health

# Start scraping CIS courses
curl -X POST http://localhost:3001/api/scraper/scrape \
  -H "Content-Type: application/json" \
  -d '{"subjects": ["CIS"]}'

# Check scraper status
curl http://localhost:3001/api/scraper/status
```

## Prerequisite Structure

Prerequisites are parsed into a structured format that supports:

- Simple requirements: `{ type: 'course', course: 'CIS 1057' }`
- AND logic: `{ type: 'AND', children: [...] }`
- OR logic: `{ type: 'OR', children: [...] }`
- Nested combinations

### Example

Input: `"(CIS 1057 or CIS 1068) and MATH 1041"`

Output:
```json
{
  "type": "AND",
  "children": [
    {
      "type": "OR",
      "children": [
        { "type": "course", "course": "CIS 1057" },
        { "type": "course", "course": "CIS 1068" }
      ]
    },
    { "type": "course", "course": "MATH 1041" }
  ]
}
```

### Checking Prerequisites in Frontend

```typescript
import { checkPrerequisites } from './scraper/prerequisites';

const userCompletedCourses = ['CIS 1057', 'MATH 1041', 'ENGL 0802'];
const coursePrereqs = course.prerequisites;

const canTake = checkPrerequisites(coursePrereqs, userCompletedCourses);
```

## Project Structure

```
backend/
├── src/
│   ├── index.ts              # Express server entry
│   ├── config/
│   │   └── supabase.ts       # Supabase client configuration
│   ├── routes/
│   │   └── scraper.ts        # API routes for scraping
│   ├── scraper/
│   │   ├── coursicle.ts      # Main Coursicle scraper
│   │   └── prerequisites.ts  # Prerequisite parser & checker
│   ├── scripts/
│   │   ├── scrape-temple.ts  # CLI scraping script
│   │   └── scrape-subjects.ts# List subjects script
│   ├── types/
│   │   └── index.ts          # TypeScript type definitions
│   └── utils/
│       └── db.ts             # Database utility functions
├── package.json
├── tsconfig.json
└── README.md
```

## Database Schema

The scraper populates the following tables:

- **courses**: Course information (subject, number, title, credits, prerequisites, etc.)
- **universities**: University information (Temple is created automatically)

## Notes

- Coursicle uses JavaScript rendering, so Playwright is required for scraping
- Default delay between requests is 1 second to be respectful to the server
- The scraper handles dynamic content and various page structures
- Prerequisites are stored as JSONB in Supabase for flexible querying

