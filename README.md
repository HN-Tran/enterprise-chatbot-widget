# Enterprise Chatbot Widget

Embeddable chatbot widget for the Enterprise RAG system. Deployable via a single `<script>` tag on any HTML/ASPX page.

## Features

- **Streaming responses** - Real-time answer display with typing animation
- **Source citations** - Inline references to source documents
- **Session persistence** - Chat history preserved across page navigation (sessionStorage)
- **Expandable window** - Toggle between normal and large view
- **Settings panel** - Toggle chat history context on/off
- **Feedback** - Thumbs up/down saved to backend
- **Copy button** - One-click copy of answers
- **Animated mascot** - Friendly robot with state animations
- **German UI** - All labels in German (customizable)

## Quick Start

### Option 1: Docker Build (Recommended)

```bash
# Build with your API endpoint baked in
VITE_API_URL=https://your-rag-api.example.com docker compose --profile build up --build

# Output: ./dist/chatbot-widget.js
```

### Option 2: Local Build

```bash
# Install dependencies
npm install

# Build with custom API URL
VITE_API_URL=https://your-rag-api.example.com npm run build

# Output: ./dist/chatbot-widget.js
```

### Option 3: Docker Serve (Testing)

```bash
# Serve the demo page with widget
VITE_API_URL=http://localhost:8080 docker compose --profile serve up --build

# Open http://localhost:8000
```

## Integration

Add to your HTML page:

```html
<script src="chatbot-widget.js" data-auto-init="true"></script>
```

Or with custom options:

```html
<script src="chatbot-widget.js"></script>
<script>
  EnterpriseChat.init({
    position: 'bottom-left',           // 'bottom-right' (default) or 'bottom-left'
    theme: {
      primaryColor: '#1a73e8',         // Brand color
      fontFamily: 'Arial, sans-serif'
    },
    labels: {
      title: 'Dokument-Assistent',
      placeholder: 'Stellen Sie eine Frage...',
      welcomeMessage: 'Hallo! Wie kann ich Ihnen helfen?'
    },
    sessionTimeout: 30,                // Minutes before session expires
    features: {
      copyButton: true,
      feedbackButtons: true,
      chatHistory: true                // Send context for follow-up questions
    }
  });
</script>
```

## Configuration

### Build-time Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | RAG API endpoint (baked into bundle) | `http://localhost:8080` |

### Runtime Configuration

All options passed to `EnterpriseChat.init()`:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `position` | `'bottom-right' \| 'bottom-left'` | `'bottom-right'` | Widget position |
| `theme.primaryColor` | `string` | `'#1a73e8'` | Primary brand color |
| `theme.fontFamily` | `string` | System fonts | Font family |
| `labels.*` | `string` | German defaults | UI labels |
| `sessionTimeout` | `number` | `30` | Session timeout in minutes |
| `features.copyButton` | `boolean` | `true` | Show copy button |
| `features.feedbackButtons` | `boolean` | `true` | Show thumbs up/down |
| `features.chatHistory` | `boolean` | `true` | Send chat context |

## API Requirements

The widget expects a RAG API with the following endpoint:

### POST /search/stream

Server-Sent Events (SSE) streaming endpoint.

**Request:**
```json
{
  "query": "user question",
  "k": 8,
  "history": [
    {"role": "user", "content": "previous question"},
    {"role": "assistant", "content": "previous answer"}
  ]
}
```

**SSE Events:**
- `meta` - `{"complexity": 1.0, "hits": 5}`
- `sources` - `[{"index": 1, "title": "...", "location": "...", "snippet": "..."}]`
- `chunk` - `"text fragment"` (streamed answer)
- `done` - `{"status": "complete"}`
- `error` - `{"error": "message"}`

### POST /feedback

```json
{
  "query": "user question",
  "answer": "assistant response",
  "feedback": "up"  // or "down"
}
```

### CORS

Enable CORS on your API:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Development

```bash
# Install dependencies
npm install

# Start dev server (with hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
enterprise-chatbot-widget/
├── src/
│   ├── index.ts              # Entry point, auto-init
│   ├── widget.ts             # Main widget class
│   ├── types.ts              # TypeScript interfaces
│   ├── components/
│   │   ├── ChatBubble.ts     # Floating button
│   │   ├── ChatWindow.ts     # Chat panel
│   │   ├── MessageList.ts    # Message rendering
│   │   ├── InputArea.ts      # Text input
│   │   ├── Mascot.ts         # Animated robot
│   │   ├── SourceCard.ts     # Citation display
│   │   ├── CopyButton.ts     # Copy to clipboard
│   │   └── FeedbackButtons.ts
│   ├── services/
│   │   ├── api.ts            # SSE streaming client
│   │   └── storage.ts        # sessionStorage wrapper
│   └── styles/
│       └── styles.ts         # CSS-in-JS
├── dist/
│   └── chatbot-widget.js     # Built bundle (~10KB gzipped)
├── demo/
│   └── index.html            # Test page
├── Dockerfile
├── docker-compose.yml
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## License

Proprietary - Internal use only.

## Author

HN-Tran
