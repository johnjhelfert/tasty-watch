# Tasty Watch - Stock Watchlist Application

A modern, real-time stock watchlist application built with **Svelte** and the **Tastytrade API**. Track your favorite stocks with live market data, manage multiple watchlists, and view detailed price charts.

![Tasty Watch Screenshot](static/tasty-watch-screen.png)

## 🚀 Features

### Core Features
- **🔐 Secure Authentication** - Session token-based authentication with Tastytrade API
- **📋 Watchlist Management** - Create, edit, and delete multiple watchlists
- **📈 Real-time Quotes** - Live market data with 5-second refresh intervals
- **🔍 Symbol Search** - Autocomplete symbol search with company name matching
- **📱 Responsive Design** - Mobile-first design that works on all devices

### Bonus Features ⭐
- **⚡ WebSocket Streaming** - Real-time market data updates via WebSocket connection
- **📊 Price Charts** - Interactive 24-hour candlestick charts with TradingView's Lightweight Charts
- **♿ Accessibility** - WCAG 2.1 AA compliant with full keyboard navigation and screen reader support

## 🛠️ Tech Stack

- **Frontend**: Svelte 5 + SvelteKit
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Modern CSS with Flexbox/Grid
- **Charts**: Lightweight Charts by TradingView
- **API**: Tastytrade REST API + WebSocket Streaming
- **Accessibility**: WAI-ARIA compliant

## 📋 Prerequisites

Before you begin, ensure you have:

1. **Node.js** (version 18 or higher)
2. **npm** (comes with Node.js)
3. **Tastytrade Sandbox Account** - Sign up at [developer.tastytrade.com](https://developer.tastytrade.com)

## ⚡ Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd tasty-watch
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables (Optional)

Copy the example environment file and customize if needed:

```bash
cp .env.local.example .env.local
```

The default configuration works with Tastytrade's sandbox environment. Only modify if you need custom API endpoints.

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 5. Login with Tastytrade Credentials

Use your Tastytrade sandbox account credentials to log in and start tracking stocks!

## 🏗️ Development

### Available Scripts

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check the project
npm run check

# Type check in watch mode
npm run check:watch
```

### Project Structure

```
src/
├── lib/
│   ├── components/          # Reusable UI components
│   │   ├── auth/           # Authentication components
│   │   ├── watchlist/      # Watchlist management
│   │   ├── symbols/        # Symbol search & details
│   │   └── ui/             # Generic UI components
│   ├── services/           # API and WebSocket services
│   │   ├── api.ts          # Tastytrade API client
│   │   └── websocket.ts    # WebSocket streaming service
│   ├── stores/             # Svelte stores for state management
│   │   ├── auth.ts         # Authentication state
│   │   ├── watchlists.ts   # Watchlist data
│   │   └── quotes.ts       # Real-time quote data
│   └── utils/              # Utility functions
│       └── formatters.ts   # Price/number formatting
├── routes/                 # SvelteKit routes
│   └── +page.svelte       # Main application page
└── app.html               # HTML template
```

## 🔧 Configuration

### Environment Variables

The application includes a `.env.local.example` file with default configuration. To customize:

1. Copy the example file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Update values as needed:
   ```bash
   # Tastytrade API Configuration
   VITE_TASTYTRADE_API_URL=https://api.cert.tastyworks.com
   ```

**Note**: The default configuration works with Tastytrade's sandbox environment. Most users won't need to modify these values.

## 📊 API Integration

### Tastytrade API Endpoints Used

- **Authentication**: `POST /sessions` - Exchange credentials for session token
- **Watchlists**: `GET/POST/PUT/DELETE /watchlists` - CRUD operations
- **Symbol Search**: `GET /symbols/search/{query}` - Autocomplete search
- **Market Data**: `GET /market-data/{symbol}` - Quote snapshots
- **WebSocket**: Real-time streaming at `wss://streamer.cert.tastyworks.com`

### Rate Limiting & Performance

- **HTTP Polling**: 5-second intervals for quote updates (fallback mode)
- **WebSocket Streaming**: Preferred method for real-time data
- **Search Debouncing**: 300ms delay for symbol search to reduce API calls
- **Error Handling**: Exponential backoff for failed requests with graceful degradation

## ♿ Accessibility Features

- **Semantic HTML** with proper heading hierarchy
- **ARIA labels** for dynamic content and interactive elements
- **Keyboard Navigation** - Full functionality without mouse
- **Screen Reader Support** - Announcements for quote updates and state changes
- **High Contrast** - Color combinations meet WCAG AA standards
- **Focus Management** - Clear focus indicators and logical tab order

### Keyboard Shortcuts

- **Tab/Shift+Tab** - Navigate between interactive elements
- **Enter/Space** - Activate buttons and links
- **Escape** - Close modal dialogs and overlays
- **Arrow Keys** - Navigate search results and symbol lists

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

The built application will be in the `dist/` directory.

### Deployment Considerations

- **HTTPS Required** - WebSocket connections require HTTPS in production
- **CORS Headers** - Ensure proper CORS configuration for API calls
- **CDN** - Consider using a CDN for static assets
- **Environment Variables** - Update API URLs for production environment

### Recommended Platforms

- **Vercel** - Zero-config deployment for SvelteKit
- **Netlify** - Simple static site hosting
- **AWS Amplify** - Full-stack deployment with CI/CD

## 🔍 Testing

The application includes comprehensive error handling and fallback mechanisms:

- **WebSocket Fallback** - Automatically falls back to HTTP polling if WebSocket fails
- **Network Resilience** - Handles network errors with exponential backoff
- **Session Management** - Automatic re-authentication for expired sessions
- **Loading States** - Clear feedback for all async operations

## 🐛 Troubleshooting

### Common Issues

**Login Issues**
- Verify Tastytrade sandbox credentials
- Check network connectivity
- Ensure API endpoints are accessible

**WebSocket Connection Problems**
- Application automatically falls back to HTTP polling
- Check browser console for WebSocket error messages
- Verify HTTPS is used in production environments

**Chart Display Issues**
- Ensure sufficient container width for chart rendering
- Check browser console for JavaScript errors
- Verify lightweight-charts library is properly loaded

### Getting Help

1. Check the browser console for error messages
2. Verify network connectivity and API responses
3. Review the CLAUDE.md file for development guidance
4. Check Tastytrade API documentation for endpoint changes

## 📄 License

This project is created for educational and demonstration purposes. Please comply with Tastytrade's API terms of service.

## 🙏 Acknowledgments

- **Tastytrade** - For providing the comprehensive trading API
- **TradingView** - For the excellent Lightweight Charts library
- **Svelte Team** - For the amazing framework and tooling
- **The Open Source Community** - For the countless libraries that made this possible

---

**Built with ❤️ using Svelte and the Tastytrade API**
