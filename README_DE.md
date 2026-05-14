[English](README.md) · [Deutsch](README_DE.md)

# Enterprise Chatbot Widget

Einbettbares Chatbot-Widget für das Enterprise RAG-System. Deploybar per einzelnem `<script>`-Tag auf jeder HTML/ASPX-Seite.

## Funktionen

- **Streaming-Antworten** — Echtzeit-Ausgabe mit Tippanimation
- **Quellenangaben** — Inzeilenreferenzen mit Typ-Badges und Download-Links
- **Kategorie-Filterung** — Suche nach Dokumentkategorien filtern
- **Embedding-Modell-Umschalter** — Zwischen schneller (nomic) und präziser (qwen) Suche wechseln
- **Archivierte einschließen** — Option, archivierte Dokumente in die Suche einzubeziehen
- **Sitzungspersistenz** — Chat-Verlauf bleibt über Seitennavigation erhalten
- **Erweiterbares Fenster** — Zwischen Normal- und Großansicht umschalten
- **Einstellungs-Panel** — Sucheinstellungen konfigurieren
- **Feedback** — Daumen hoch/runter mit optionalem Kommentar
- **Kopier-Schaltfläche** — Antworten per Klick kopieren
- **Shadow DOM-Isolation** — Stile beeinflussen die Host-Seite nicht
- **Deutsche Benutzeroberfläche** — Alle Beschriftungen auf Deutsch (anpassbar)

## Schnellstart

### Docker Build

```bash
# Mit eingebetteter API-Adresse bauen
VITE_API_URL=https://ihre-rag-api.example.com docker compose --profile build up --build

# Ausgabe: ./dist/chatbot-widget.js
```

### Docker Serve (Testen)

```bash
VITE_API_URL=http://localhost:8080 docker compose --profile serve up --build
# Öffnen: http://localhost:8000
```

## Integration

Zur HTML-Seite hinzufügen:

```html
<script src="chatbot-widget.js" data-auto-init="true"></script>
```

Oder mit benutzerdefinierten Optionen:

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

## Konfiguration

### Build-Zeit

| Variable | Beschreibung | Standard |
|---|---|---|
| `VITE_API_URL` | RAG-API-Endpunkt (in das Bundle eingebettet) | `http://localhost:8080` |

### Laufzeit

| Option | Typ | Standard | Beschreibung |
|---|---|---|---|
| `position` | `'bottom-right' \| 'bottom-left'` | `'bottom-right'` | Widget-Position |
| `theme.primaryColor` | `string` | `'#1a73e8'` | Primäre Markenfarbe |
| `theme.fontFamily` | `string` | Systemschriften | Schriftfamilie |
| `labels.*` | `string` | Deutsche Standardwerte | UI-Beschriftungen (Titel, Platzhalter usw.) |
| `categories` | `Array<{value, label}>` | `[]` | Kategorie-Filteroptionen |
| `sessionTimeout` | `number` | `30` | Sitzungs-Timeout in Minuten |
| `features.copyButton` | `boolean` | `true` | Kopier-Schaltfläche anzeigen |
| `features.feedbackButtons` | `boolean` | `true` | Daumen hoch/runter anzeigen |
| `features.chatHistory` | `boolean` | `true` | Chat-Kontext senden |
| `features.includeArchived` | `boolean` | `false` | Archivierte Dokumente einbeziehen |

## API-Anforderungen

### POST /search/stream

SSE-Streaming-Endpunkt.

**Anfrage:**
```json
{
  "query": "Benutzerfrage",
  "k": 8,
  "history": [
    {"role": "user", "content": "vorherige Frage"},
    {"role": "assistant", "content": "vorherige Antwort"}
  ],
  "include_archived": false,
  "categories": ["HR"],
  "embedding_model": "nomic"
}
```

**SSE-Events:**
- `meta` — `{"complexity": 1.0, "hits": 5}`
- `sources` — `[{"index": 1, "title": "...", "location": "...", "snippet": "...", "source_type": "pdf", "download_url": "..."}]`
- `chunk` — `"Textfragment"`
- `done` — `{"status": "complete"}`
- `error` — `{"error": "Nachricht"}`

### POST /feedback

```json
{
  "query": "Benutzerfrage",
  "answer": "Assistenten-Antwort",
  "feedback": "up",
  "comment": "optionaler Kommentar",
  "sources": [...],
  "category": "HR",
  "embedding_model": "nomic",
  "settings": {
    "chatHistory": true,
    "includeArchived": false
  }
}
```

## Kubernetes-Deployment

Siehe `k8s/deployment.yaml` für Kubernetes-Manifeste inkl. Deployment, Service und Ingress.

## Projektstruktur

```
enterprise-chatbot-widget/
├── src/
│   ├── index.ts                 # Einstiegspunkt, Auto-Init
│   ├── widget.ts                # Haupt-Widget-Klasse
│   ├── types.ts                 # TypeScript-Interfaces
│   ├── components/
│   │   ├── ChatBubble.ts        # Schwebende Schaltfläche mit Maskottchen
│   │   ├── ChatWindow.ts        # Chat-Panel und Einstellungen
│   │   ├── MessageList.ts       # Nachrichten-Rendering
│   │   ├── InputArea.ts         # Texteingabe
│   │   ├── Mascot.ts            # Animierter Roboter
│   │   ├── SourceCard.ts        # Zitationsanzeige
│   │   ├── CopyButton.ts        # In Zwischenablage kopieren
│   │   └── FeedbackButtons.ts   # Daumen hoch/runter
│   ├── services/
│   │   ├── api.ts               # SSE-Streaming-Client
│   │   └── storage.ts           # sessionStorage-Wrapper
│   └── styles/
│       └── styles.ts            # CSS-in-JS-Stile
├── dist/
│   └── chatbot-widget.js        # Fertiges Bundle
├── demo/
│   ├── index.html               # Testseite
│   └── static/                  # Statische Assets
├── k8s/
│   └── deployment.yaml          # Kubernetes-Manifeste
├── Dockerfile                   # Mehrstufiger Build
├── docker-compose.yml           # Build- und Serve-Profile
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Lizenz

Apache-2.0 — siehe [`LICENSE`](LICENSE).

## Autor

HN-Tran — <https://github.com/HN-Tran>
