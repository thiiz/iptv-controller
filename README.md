# IPTV Controller API

A Node.js middleware API that masks the original IPTV provider URLs from end users.

## Features

- Hides original IPTV provider URLs
- Supports multiple IPTV providers
- Handles login, stream requests, and API endpoints
- Easy configuration through environment variables
- Provider status monitoring
- Session management for tracking active connections

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Copy the example environment file and configure your providers:
   ```
   cp .env.example .env
   ```
4. Edit the `.env` file with your provider URLs
5. Start the server:
   ```
   npm start
   ```
   
For development with automatic restarts:
```
npm run dev
```

## API Endpoints

### Login / API Access

```
GET /api/:identifier/player_api?username={user}&password={pass}
```

- `:identifier` - Provider identifier as defined in .env (e.g., "cdn4")
- `username` - IPTV account username
- `password` - IPTV account password

Example:
```
http://localhost:3000/api/cdn4/player_api?username=user123&password=pass123
```

### Stream Access

```
GET /api/:identifier/stream/:streamType/:streamId?username={user}&password={pass}
```

- `:identifier` - Provider identifier
- `:streamType` - Type of stream (live, movie, series)
- `:streamId` - ID of the stream
- `username` - IPTV account username
- `password` - IPTV account password

### Session Management

View active sessions:
```
GET /api/sessions
```

### Provider Management

List all available providers:
```
GET /providers
```

Test provider connectivity:
```
GET /providers/test/:identifier
```

## Environment Variables

- `PORT` - Server port (default: 3000)
- `PROVIDER_DEFAULT_URL` - Default provider URL
- `PROVIDER_CDN4_URL` - URL for CDN4 provider

You can add more providers by adding new environment variables following the pattern `PROVIDER_NAME_URL`. 