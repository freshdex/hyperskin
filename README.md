# HyperSkin

A desktop command center for **Windows Terminal**, **Hyper Terminal**, and **Claude Code** workflows. Manage projects, themes, terminal configs, Oh My Posh prompts, and Claude Code launch flags — all from one app.

![Electron](https://img.shields.io/badge/Electron-33-47848F?logo=electron&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

---

## What is HyperSkin?

HyperSkin is an Electron app that eliminates the tedium of managing multiple Claude Code projects, terminal configurations, and theme setups. Instead of manually editing `settings.json`, `.hyper.js`, or remembering CLI flags, HyperSkin gives you a visual interface to configure everything and launch with one click.

### Key Features

- **Project Manager** — Scan directories, detect git repos, configure per-project Claude Code launch flags (model, permission mode, system prompt, max turns, custom flags), and launch directly into your terminal
- **Project Hero Images** — Drop a `hyperskin.png` (1920x1080) in any project root for a visual tile on the dashboard
- **Windows Terminal Config Editor** — Edit profiles, color schemes, global settings, and persistent command history without touching `settings.json`
- **Hyper Terminal Config Editor** — Full `.hyper.js` visual editor for fonts, colors, cursor, shell, keymaps, plugins, and CSS injection (CRT effects, glitch shaders)
- **Theme Management** — Browse themes from [windowsterminalthemes.dev](https://windowsterminalthemes.dev), Hyper plugin registry, and 10 built-in presets (Dracula, Nord, Gruvbox, Cyberpunk Neon, Matrix CRT, and more)
- **App Self-Skinning** — Customize HyperSkin's own appearance (accent colors, fonts, border radius, glow effects)
- **Oh My Posh** — Install Oh My Posh via winget, browse and apply prompt themes, configure per-shell (PowerShell, Bash, Zsh, Fish, Nushell)
- **Claude Code Instances** — Manage multiple Claude Code installations, track rate-limit status, set defaults
- **MCP & Plugins** — View and manage MCP servers from `~/.claude/claude_desktop_config.json`
- **Community Theme Sharing** — Upload, browse, rate, and download themes via PostgreSQL (self-hosted)
- **Update Checker** — Check for new releases from GitHub/npm
- **Debug Logger** — Built-in live log viewer with level filtering, file persistence, and copy/export

---

## Screenshots

> Add a `hyperskin.png` to each project root to see hero images on project cards.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [npm](https://www.npmjs.com/) 9+
- [Windows Terminal](https://aka.ms/terminal) (for WT config editing)
- [Hyper Terminal](https://hyper.is/) (optional, for Hyper config editing)
- [Claude Code](https://claude.ai/claude-code) CLI installed

### Install

```bash
git clone https://github.com/freshdex/hyperskin.git
cd hyperskin
npm install
```

### Development

```bash
npm run dev
```

This launches Electron with hot-reload via electron-vite. The app window opens automatically.

### Build

```bash
npm run build
```

### Package for Distribution

```bash
# Windows (NSIS installer)
npm run package:win

# macOS (DMG)
npm run package:mac

# Auto-detect platform
npm run package
```

---

## Project Structure

```
hyperskin/
├── src/
│   ├── main/                    # Electron main process
│   │   ├── index.ts             # Window creation, custom protocol, lifecycle
│   │   ├── ipc/                 # IPC handlers (16 modules)
│   │   ├── services/            # Business logic (13 services)
│   │   ├── store/               # electron-store persistence
│   │   └── utils/               # Path + platform helpers
│   │
│   ├── preload/                 # Context bridge (renderer ↔ main)
│   │   ├── index.ts             # API exposure via contextBridge
│   │   └── index.d.ts           # window.api type declarations
│   │
│   ├── renderer/                # React frontend (Vite)
│   │   └── src/
│   │       ├── App.tsx           # Root layout, sidebar navigation, greeting
│   │       ├── components/
│   │       │   ├── ui/           # shadcn/ui primitives (17 components)
│   │       │   ├── layout/       # Sidebar, Header, PageShell, WelcomeDialog
│   │       │   ├── projects/     # Project cards with hero images + launch config
│   │       │   ├── terminal-config/  # Windows Terminal settings editor
│   │       │   ├── hyper-config/     # Hyper .hyper.js editor
│   │       │   ├── themes/           # Theme browser + self-skinning + community
│   │       │   ├── omp/              # Oh My Posh installer + theme picker
│   │       │   ├── claude/           # Claude instance manager
│   │       │   ├── mcp/              # MCP server + plugin management
│   │       │   ├── updates/          # Update checker + changelog
│   │       │   └── settings/         # App settings + DB config
│   │       └── lib/utils.ts
│   │
│   └── shared/                  # Shared between main + renderer
│       ├── types.ts             # All TypeScript interfaces
│       ├── ipc-channels.ts      # ~80 IPC channel constants
│       └── defaults.ts          # Defaults, greeting templates, option arrays
│
├── resources/
│   └── builtin-themes/          # 10 shipped theme presets (JSON)
│
├── sql/                         # PostgreSQL migrations (community sharing)
│   ├── 001_create_users.sql
│   ├── 002_create_themes.sql
│   ├── 003_create_favorites.sql
│   └── 004_create_ratings.sql
│
├── electron.vite.config.ts
├── electron-builder.yml
├── tailwind.config.ts
└── package.json
```

---

## Architecture

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop Framework | Electron 33 + electron-vite 5 |
| Frontend | React 18 + TypeScript 5.7 |
| Bundler | Vite 6 |
| UI Components | shadcn/ui + Radix UI primitives |
| Styling | Tailwind CSS 3.4 + tailwindcss-animate |
| Color Pickers | react-colorful |
| Icons | lucide-react |
| Local Storage | electron-store |
| Database | PostgreSQL (pg) for community features |
| Packaging | electron-builder (NSIS + DMG) |

### IPC Pattern

All communication between renderer and main process uses a typed `IpcResult<T>` wrapper:

```typescript
interface IpcResult<T> {
  success: boolean
  data?: T
  error?: string
}
```

Channel names are centralized in `src/shared/ipc-channels.ts`. The preload script exposes a typed `window.api` object with 16 feature groups.

### Terminal Config Parsing

- **Windows Terminal**: Reads `settings.json` (JSONC with comment stripping) from `%LOCALAPPDATA%/Packages/Microsoft.WindowsTerminal_*/LocalState/`
- **Hyper**: Parses `.hyper.js` using Node.js `vm.runInNewContext()` sandbox with 2-second timeout

### Project Launching

Generates a temporary `.bat` script per launch containing `cd /d "project\path" && claude --model opus --verbose ...`, spawns the target terminal with the script, and cleans up after 30 seconds.

### Custom Protocol

A `hyperskin-file://` protocol serves local `hyperskin.png` images from project directories to the renderer securely via Electron's `protocol.handle()`.

---

## Built-in Themes

| Theme | Style |
|-------|-------|
| Matrix CRT | Green-on-black with CRT scanlines |
| Cyberpunk Neon | Hot pink + cyan on deep purple |
| Dracula | Classic Dracula palette |
| Nord | Arctic blue-gray tones |
| Solarized Dark | Ethan Schoonover's dark variant |
| Solarized Light | Ethan Schoonover's light variant |
| Gruvbox | Retro warm earth tones |
| Monokai | Sublime Text classic |
| One Dark | Atom editor dark theme |
| Retro Amber | Amber phosphor CRT nostalgia |

---

## Community Theme Sharing (Optional)

HyperSkin supports sharing themes via a self-hosted PostgreSQL database.

### Setup

1. Create a PostgreSQL database
2. Run the migrations in order:
   ```bash
   psql -d hyperskin < sql/001_create_users.sql
   psql -d hyperskin < sql/002_create_themes.sql
   psql -d hyperskin < sql/003_create_favorites.sql
   psql -d hyperskin < sql/004_create_ratings.sql
   ```
3. Configure the connection in HyperSkin's Settings page (host, port, database, user, password)
4. Browse, upload, rate, and download community themes

---

## Claude Code Integration

### Per-Project Launch Flags

Each project card has a configurable launch panel:

| Flag | Control |
|------|---------|
| `--model` | Dropdown (Opus, Sonnet, Haiku) |
| `--permission-mode` | Dropdown (Plan, Auto-edit, Full auto) |
| `--verbose` | Toggle |
| `--max-turns` | Number input |
| `--system-prompt` | Textarea |
| Custom flags | Key-value rows |

### Instance Management

- Detect installed Claude Code versions
- Track rate-limit status per instance
- Set a default instance for all launches
- Switch instances when one hits rate limits

### MCP Server Management

- View configured MCP servers from Claude's config
- Add, remove, enable/disable servers
- Edit server configurations

---

## Oh My Posh

- **Install**: One-click install via `winget install JanDeDobbeleer.OhMyPosh`
- **Themes**: Browse and preview all Oh My Posh themes
- **Apply**: Auto-configures your shell profile (PowerShell, Bash, Zsh, Fish, Nushell)
- **Shell Selection**: Choose which shell to configure

---

## Development

### Environment Variables

Copy `.env.example` to `.env` for PostgreSQL community features:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hyperskin
DB_USER=postgres
DB_PASSWORD=your_password
```

### Adding shadcn/ui Components

The project uses a manual shadcn/ui setup. Components live in `src/renderer/src/components/ui/`.

### Adding IPC Channels

1. Add the channel constant to `src/shared/ipc-channels.ts`
2. Add the handler in `src/main/ipc/`
3. Expose it in `src/preload/index.ts`
4. Add the type in `src/preload/index.d.ts`

---

## License

[MIT](LICENSE)

---

Built with [Claude Code](https://claude.ai/claude-code)
