# Visualbase

**GitHub Repository Visualizer** - Transform any GitHub repository into an interactive, visual experience with AI-powered explanations.

## Features

- **URL Input**: Enter any GitHub repository URL
- **File Explorer**: Navigate repository structure like VS Code
- **Interactive Graph**: Visualize project architecture with React Flow
- **AI Explanations**: Get instant explanations powered by GPT-4
- **Tech Stack Detection**: Automatically identify technologies
- **Dark Mode**: Beautiful dark/light theme

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS v4
- React Flow (graph visualization)
- Framer Motion (animations)
- Zustand (state management)

### Backend (Optional)
- Supabase Edge Functions
- GitHub REST API
- OpenAI API

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Configuration

Create a `.env` file:

```env
# Optional: Supabase for AI explanations
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# Optional: GitHub Token (increases rate limits)
VITE_GITHUB_TOKEN=your_github_token

# Optional: OpenAI API Key (for AI features)
OPENAI_API_KEY=your_openai_key
```

## Project Structure

```
visualbase/
├── src/
│   ├── components/
│   │   ├── ui/           # Reusable UI components
│   │   ├── layout/       # Layout components
│   │   ├── features/     # Feature components
│   │   └── graph/       # Graph node components
│   ├── lib/              # Utilities and API
│   ├── stores/           # Zustand stores
│   ├── hooks/            # Custom hooks
│   └── types/            # TypeScript types
├── supabase/
│   └── functions/       # Edge functions
└── public/
```

## Deployment

### Frontend (Vercel)
```bash
npm install -g vercel
vercel
```

### Backend (Supabase)
```bash
supabase login
supabase init
supabase functions deploy fetch-repo
supabase functions deploy explain-repo
```

## Development

```bash
# Run linter
npm run lint

# Type check
npm run typecheck

# Preview production build
npm run preview
```

## License

MIT License
