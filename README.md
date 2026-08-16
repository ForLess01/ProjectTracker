# ProjectTracker

A collaborative project and task tracking platform featuring a **Liquid Glass Design System**, interactive spreadsheet tables, and visual Kanban boards.

---

## Features

- **Workspace Hub**: Centralized dashboard organizing workspaces, teams, and active projects with real-time connectivity insights.
- **Interactive Sheet Table**:
  - Dynamic spreadsheet interface with custom column resizing and drag-and-drop reordering.
  - Multi-cell drag selection with bulk actions (copy, clear, delete).
  - Inline rich text and GFM Markdown formatting (`**bold**`, `*italic*`, `\`code\``, bullet lists).
  - Pinned sticky ID column and table header.
  - Auto-hiding centered mini scrollbars when content fits within viewport.
- **Kanban Board View**: Visual status workflow cards with drag-and-drop transitions across customizable stages.
- **Media & Attachments**: Floating Masonry grid modal supporting image uploads and previews with cloud storage (S3 / R2 compatible).
- **Data Portability**: Full CSV and JSON import/export workflows with column mapping.
- **KPI Metrics Summary**: Real-time progress bar, priority counters, and completion tracking.
- **Design System**: Liquid Glass aesthetic with squircle contours, frosted glass blur, glowing white neon focus states, and responsive mobile adaptation.

---

## Tech Stack

- **Framework**: [Astro](https://astro.build/) (Server-Side Rendering with `@astrojs/node`)
- **UI Components**: [React 19](https://react.dev/)
- **Database & ORM**: PostgreSQL with [Drizzle ORM](https://orm.drizzle.team/) & Drizzle Kit
- **Styling**: Vanilla CSS Liquid Glass Design System
- **Icons**: [Lucide React](https://lucide.dev/)
- **Markdown**: [Marked](https://marked.js.org/)

---

## Getting Started

### Prerequisites

- **Node.js** v20+
- **pnpm** (preferred package manager)
- **PostgreSQL** instance (local or hosted)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd ProjectTracker
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your PostgreSQL connection string and optional S3/storage credentials.

4. **Initialize Database:**
   ```bash
   # Push schema migrations
   pnpm run db:push

   # (Optional) Seed initial demo data
   pnpm run db:seed
   ```

5. **Start Development Server:**
   ```bash
   pnpm run dev
   ```
   Open `http://localhost:4321` in your browser.

---

## Available Scripts

| Command | Description |
|---|---|
| `pnpm run dev` | Starts local development server at `http://localhost:4321` |
| `pnpm run build` | Builds production-ready bundle |
| `pnpm run preview` | Previews production build locally |
| `pnpm run db:push` | Syncs Drizzle schema with database |
| `pnpm run db:generate` | Generates Drizzle migration files |
| `pnpm run db:studio` | Launches Drizzle Studio GUI for database inspection |
| `pnpm run db:seed` | Seeds database with initial sample data |

---

## License

MIT
