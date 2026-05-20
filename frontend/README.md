# GreenLens Frontend

Production-grade React + Vite frontend for the AI-powered carbon tracking platform.

## Setup & Installation

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:8000" > .env

# Start development server
npm run dev
```

Frontend will run at `http://localhost:3000`

## Build for Production

```bash
npm run build
# Output: dist/ folder ready for deployment
```

## Pages

- **Home** - Hero page with campus stats & live CO₂ counter
- **Login/Register** - JWT authentication
- **Dashboard** - Personal carbon stats, weekly chart, activity breakdown
- **Log Today** - Quick 60-second activity logger with CO₂ preview
- **AI Coach** - Personalized tips and nudge history
- **Leaderboard** - Campus rankings with streaks & badges
- **Impact** - 30-day sustainability journey & aggregate stats

## Design System

- **Colors**: Forest Black (#0D1F0F), Emerald Glow (#69F0AE), Bright Green (#4CAF50)
- **Components**: Glassmorphism cards, gradient backgrounds, smooth animations
- **Framework**: Tailwind CSS, Recharts for data viz, Lucide icons

## Integration with Backend

Update API_URL in `.env`:

```
VITE_API_URL=https://your-backend-url.railway.app
```

All API calls use JWT Bearer token from localStorage.

## Deployment

### Vercel (Recommended)

```bash
vercel
```

### Netlify

```bash
npm run build
# Drag dist/ folder to Netlify
```

### Docker

```bash
docker build -t greenlens-frontend .
docker run -p 3000:3000 greenlens-frontend
```
