[English](README.md) · [Deutsch](README_DE.md)

# Enterprise Chatbot Widget

Embeddable chatbot widget for the Enterprise RAG system. Deployable via a single `<script>` tag on any HTML/ASPX page.

## Features

- **Streaming responses** - Real-time answer display with typing animation
- **Source citations** - Inline references with type badges and download links
- **Category filtering** - Filter search by document categories
- **Embedding model toggle** - Switch between fast (nomic) and precise (qwen) search
- **Include archived** - Option to include archived documents in search
- **Session persistence** - Chat history preserved across page navigation
- **Expandable window** - Toggle between normal and large view
- **Settings panel** - Configure search preferences
- **Feedback** - Thumbs up/down with optional comments
- **Copy button** - One-click copy of answers
- **Shadow DOM isolation** - Styles don't leak into host page
- **German UI** - All labels in German (customizable)

## Quick Start

### Docker Build

```bash
# Build with your API endpoint baked in
VITE_API_URL=https://your-rag-api.example.com docker compose --profile build up --build

# Output: ./dist/chatbot-widget.js
```

### Docker Serve (Testing)

```bash
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
    position: 'bottom-right',
    theme: {
      primaryColor: '#1a73e8',
      fontFamily: 'Arial, sans-serif'
    },
    labels: {
      title: 'Dokument-Assistent',
      placeholder: 'Stellen Sie eine Frage...',
      welcomeMessage: 'Hallo! Wie kann ich Ihnen helfen?'
    },
    categories: [
      { value: 'HR', label: 'Personal' },
      { value: 'IT', label: 'IT-Support' },
      { value: 'Finance', label: 'Finanzen' }
    ],
    features: {
      copyButton: true,
      feedbackButtons: true,
      chatHistory: true,
      includeArchived: false
    }
  });
</script>
```

## Configuration

### Build-time

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | RAG API endpoint (baked into bundle) | `http://localhost:8080` |

### Runtime

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `position` | `'bottom-right' \| 'bottom-left'` | `'bottom-right'` | Widget position |
| `theme.primaryColor` | `string` | `'#1a73e8'` | Primary brand color |
| `theme.fontFamily` | `string` | System fonts | Font family |
| `labels.*` | `string` | German defaults | UI labels (title, placeholder, etc.) |
| `categories` | `Array<{value, label}>` | `[]` | Category filter options |
| `sessionTimeout` | `number` | `30` | Session timeout in minutes |
| `features.copyButton` | `boolean` | `true` | Show copy button |
| `features.feedbackButtons` | `boolean` | `true` | Show thumbs up/down |
| `features.chatHistory` | `boolean` | `true` | Send chat context |
| `features.includeArchived` | `boolean` | `false` | Include archived docs |

## API Requirements

### POST /search/stream

SSE streaming endpoint.

**Request:**
```json
{
  "query": "user question",
  "k": 8,
  "history": [
    {"role": "user", "content": "previous question"},
    {"role": "assistant", "content": "previous answer"}
  ],
  "include_archived": false,
  "categories": ["HR"],
  "embedding_model": "nomic"
}
```

**SSE Events:**
- `meta` - `{"complexity": 1.0, "hits": 5}`
- `sources` - `[{"index": 1, "title": "...", "location": "...", "snippet": "...", "source_type": "pdf", "download_url": "..."}]`
- `chunk` - `"text fragment"`
- `done` - `{"status": "complete"}`
- `error` - `{"error": "message"}`

### POST /feedback

```json
{
  "query": "user question",
  "answer": "assistant response",
  "feedback": "up",
  "comment": "optional comment",
  "sources": [...],
  "category": "HR",
  "embedding_model": "nomic",
  "settings": {
    "chatHistory": true,
    "includeArchived": false
  }
}
```

## Kubernetes Deployment

See `k8s/deployment.yaml` for Kubernetes manifests including Deployment, Service, and Ingress.

## Project Structure

```
enterprise-chatbot-widget/
├── src/
│   ├── index.ts                 # Entry point, auto-init
│   ├── widget.ts                # Main widget class
│   ├── types.ts                 # TypeScript interfaces
│   ├── components/
│   │   ├── ChatBubble.ts        # Floating button with mascot
│   │   ├── ChatWindow.ts        # Chat panel and settings
│   │   ├── MessageList.ts       # Message rendering
│   │   ├── InputArea.ts         # Text input
│   │   ├── Mascot.ts            # Animated robot
│   │   ├── SourceCard.ts        # Citation display
│   │   ├── CopyButton.ts        # Copy to clipboard
│   │   └── FeedbackButtons.ts   # Thumbs up/down
│   ├── services/
│   │   ├── api.ts               # SSE streaming client
│   │   └── storage.ts           # sessionStorage wrapper
│   └── styles/
│       └── styles.ts            # CSS-in-JS styles
├── dist/
│   └── chatbot-widget.js        # Built bundle
├── demo/
│   ├── index.html               # Test page
│   └── static/                  # Static assets
├── k8s/
│   └── deployment.yaml          # Kubernetes manifests
├── Dockerfile                   # Multi-stage build
├── docker-compose.yml           # Build and serve profiles
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## License

Apache-2.0 — see [`LICENSE`](LICENSE).

## Author

HN-Tran — <https://github.com/HN-Tran>
