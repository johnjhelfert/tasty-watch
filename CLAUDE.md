# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Tasty-Watch** is a SvelteKit-based stock watchlist application that integrates with the Tastytrade API through internal API routes. The application allows users to authenticate, manage multiple watchlists, view real-time market data, and interact with detailed symbol information including price charts.

### Key Features
- **Authentication**: Session-based auth with Tastytrade API
- **Watchlist Management**: Create, read, update, delete watchlists and symbols
- **Real-time Data**: WebSocket streaming for live market data updates
- **Symbol Search**: Autocomplete symbol search functionality  
- **Price Charts**: 24-hour candlestick charts for detailed symbol analysis
- **Accessibility**: WAI-ARIA compliant with keyboard navigation support

### Bonus Features Implemented
- **Streaming Market Data**: WebSocket integration instead of polling
- **Interactive Charts**: Clickable symbols show detailed price charts

## Architecture & Design Philosophy

This application follows **staff engineer principles** emphasizing:
- **Simplicity**: Clean, maintainable code over clever abstractions
- **Readability**: Self-documenting code with clear naming conventions
- **Performance**: Efficient real-time data handling with minimal re-renders
- **Accessibility**: WCAG 2.1 AA compliant with semantic HTML

### Tech Stack
- **Framework**: SvelteKit 2.22.0 + Svelte 5 (full-stack with API routes)
- **Build Tool**: Vite 7.0.4 (fast builds, minimal bundle size)
- **HTTP Client**: Native fetch with SvelteKit API proxy layer
- **WebSocket**: Native WebSocket API with reconnection logic
- **Charts**: Lightweight Charts library for candlestick visualization
- **Styling**: Modern CSS Grid/Flexbox with CSS custom properties

## Development Commands

```bash
# Install dependencies
npm install

# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npm run check
```

## API Integration

### Authentication Flow
1. POST `/api/auth` with username/password credentials → session token
2. Client stores token in localStorage with expiration timestamp
3. API routes include `Authorization: {token}` header to Tastytrade API
4. Handle token expiration with automatic validation and re-authentication

### API Architecture
The application uses a **proxy pattern** with SvelteKit API routes:
- Client calls internal API routes (`/api/*`)
- API routes proxy requests to Tastytrade API
- Handles authentication and error management server-side

### Internal API Routes
- **Auth**: `POST /api/auth` - Exchange credentials for session token
- **Watchlists**: `GET/POST/PUT/DELETE /api/watchlists` - CRUD operations
- **Symbol Search**: `GET /api/symbols/search/{query}` - Autocomplete search
- **Market Data**: `GET /api/market-data/{symbol}` - Quote snapshots
- **Streaming**: WebSocket at `wss://streamer.cert.tastyworks.com` - Real-time data

### Rate Limiting & Performance
- **Quote Polling**: 5-second intervals (fallback mode)
- **WebSocket**: Preferred for real-time updates
- **Search Debouncing**: 300ms delay for symbol search
- **Error Handling**: Exponential backoff for failed requests

## Project Structure

```
src/
├── lib/
│   ├── components/          # Reusable UI components
│   │   ├── auth/           # Authentication forms
│   │   ├── watchlist/      # Watchlist table and controls
│   │   ├── symbols/        # Symbol search and details
│   │   └── ui/             # Generic UI components
│   ├── services/           # Client-side services
│   │   ├── api.ts          # HTTP client for internal API routes
│   │   ├── websocket.ts    # WebSocket manager
│   ├── stores/             # Svelte stores for state management
│   │   ├── auth.ts         # Session state management
│   │   ├── watchlists.ts   # Watchlist data
│   │   └── quotes.ts       # Real-time quote data
│   └── utils/              # Utility functions
│       └── formatters.ts   # Price/number formatting
├── routes/                 # SvelteKit routes and pages
│   ├── api/               # Server-side API routes (proxy to Tastytrade)
│   │   ├── auth/          # Authentication endpoints
│   │   ├── watchlists/    # Watchlist CRUD operations
│   │   ├── market-data/   # Market data endpoints
│   │   └── symbols/       # Symbol search endpoints
│   └── +page.svelte       # Main application page
└── app.html               # HTML template
```

## Development Guidelines

### State Management
- Use Svelte stores for global state (auth, watchlists, quotes)
- Component-level state for UI interactions
- Reactive statements for derived data

### Error Handling
- Centralized error handling in API service layer
- User-friendly error messages with actionable guidance
- Graceful degradation when WebSocket unavailable

### Performance Considerations
- Use `tick()` for DOM updates before measurements
- Implement virtual scrolling for large watchlists (if needed)
- Debounce search inputs and resize handlers
- Lazy load chart components

### Accessibility Requirements
- Semantic HTML with proper heading hierarchy
- ARIA labels for dynamic content and controls
- Keyboard navigation for all interactive elements
- Screen reader announcements for quote updates
- High contrast mode support

### Code Quality
- Follow existing code patterns and conventions
- Use TypeScript for type safety
- Implement error boundaries for graceful failure handling
- Document complex business logic with comments

## Common Development Tasks

### Adding a New Watchlist Feature
1. Update `watchlists.ts` store with new state
2. Add server-side API route in `src/routes/api/`
3. Update client-side API service in `lib/services/api.ts`
4. Create/update UI components

### Integrating New Market Data
1. Update WebSocket message handlers in `lib/services/websocket.ts`
2. Update store reactivity in `quotes.ts` store
3. Add new API route if needed for additional data sources
4. Test real-time updates

### Performance Optimization
- Profile with Chrome DevTools
- Check bundle size with `npm run build`
- Monitor WebSocket message frequency
- Review Svelte reactive statement efficiency

## Environment Variables

```bash
# .env.local
VITE_TASTYTRADE_API_URL=https://api.cert.tastyworks.com
VITE_TASTYTRADE_WS_URL=wss://streamer.cert.tastyworks.com
VITE_MOCK_API=false  # Set to true for development without API calls
```

## Deployment Notes

- Build artifacts in `dist/` directory
- Requires HTTPS for WebSocket connections in production
- Consider CDN for static assets
- Monitor API rate limits in production environment