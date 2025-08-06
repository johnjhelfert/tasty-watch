# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Tasty-Watch** is a Svelte-based stock watchlist application that integrates with the Tastytrade API. The application allows users to authenticate, manage multiple watchlists, view real-time market data, and interact with detailed symbol information including price charts.

### Key Features
- **Authentication**: OAuth2 access tokens with Tastytrade API
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
- **Frontend**: Svelte 4 + Vite (fast builds, minimal bundle size)
- **HTTP Client**: Native fetch with custom API service layer
- **WebSocket**: Native WebSocket API with reconnection logic
- **Charts**: Lightweight Chart library for candlestick visualization
- **Styling**: Modern CSS Grid/Flexbox with CSS custom properties
- **Testing**: Vitest + @testing-library/svelte

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

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run check
```

## API Integration

### Authentication Flow
1. POST `/sessions` with username/password credentials → access token
2. Include `Authorization: {token}` header in all requests
3. Handle token expiration with automatic validation and re-authentication
4. Tokens are stored with expiration timestamps for client-side validation

### Key Endpoints
- **Auth**: `POST /oauth/token` - Exchange credentials for OAuth2 access token
- **Watchlists**: `GET/POST/PUT/DELETE /watchlists` - CRUD operations
- **Symbol Search**: `GET /symbols/search/{query}` - Autocomplete search
- **Market Data**: `GET /market-data/{symbol}` - Quote snapshots
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
│   ├── services/           # API and WebSocket services
│   │   ├── api.ts          # HTTP API client with OAuth2
│   │   ├── websocket.ts    # WebSocket manager
│   ├── stores/             # Svelte stores for state management
│   │   ├── auth.ts         # OAuth2 session state
│   │   ├── watchlists.ts   # Watchlist data
│   │   └── quotes.ts       # Real-time quote data
│   └── utils/              # Utility functions
│       └── formatters.ts   # Price/number formatting
├── routes/                 # SvelteKit routes (if using SvelteKit)
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

### Testing Strategy
- Unit tests for utility functions and API services
- Component tests for user interactions
- Integration tests for authentication flow
- E2E tests for critical user journeys

## Common Development Tasks

### Adding a New Watchlist Feature
1. Update `watchlists.ts` store with new state
2. Add API service method in `api.ts`
3. Create/update UI components
4. Add tests for new functionality

### Integrating New Market Data
1. Update WebSocket message handlers in `websocket.ts`
2. Update store reactivity in `quotes.ts` store
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
```

## Deployment Notes

- Build artifacts in `dist/` directory
- Requires HTTPS for WebSocket connections in production
- Consider CDN for static assets
- Monitor API rate limits in production environment