# Gintel - GitHub Intelligence Layer

![Gintel](https://img.shields.io/badge/Status-Live_Beta-00ff88?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase)

**Gintel** transforms raw GitHub data into a clear, career-aligned analysis—identifying developer archetypes, scoring portfolios, and detecting actionable gaps to help engineers level up their profiles.

## 🚀 Vision and Approaches
Gintel moves beyond simple GitHub stat tracking by applying data science principles to developer metrics:
*   **Gamified Archetype Progression:** Users unlock and level up to 15 different specialized Archetypes (e.g., Full-Stack Engineer, Web3 Engineer, ML Engineer) based on semantic footprint, languages, and repo topics.
*   **Weighted Scoring Engines:** Calculates scores across 6 core dimensions (Project Quality, Consistency, Breadth, Depth, Documentation, Community). Uses methodologies like Shannon entropy for language diversity and Coefficient of Variation for commit consistency.
*   **Career Intelligence (Pro):** Modules evaluating Temporal Intelligence (trait shifts), Market Positioning, missing deployment signals, and Credibility Matrix to map users to roles (Backend, ML, DevOps, etc.).

## 🛠 Tech Stack & Choices

### Core Application
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router) - Chosen for seamless React Server Components, high performance, and built-in API routes.
- **Language**: TypeScript - Used extensively for strict typing of API responses, metrics, and complex scoring interfaces.

### Data & Backend
- **Authentication**: `NextAuth.js` integrated specifically with GitHub OAuth to fetch user profiles, scopes, and private repositories.
- **Database & Global Metrics**: `Supabase` (PostgreSQL) is utilized to transition from local to global metrics tracking, ensuring consistency across all user devices.
- **Email Delivery**: `Resend` for transactional email logic (such as user feedback forms).

### User Interface & Styling
- **Styling**: `Tailwind CSS` coupled with `clsx` and `tailwind-merge` for rapid, responsive utility-first styling.
- **Components**: Primitive components leveraging `lucide-react` for iconography. 
- **Data Visualization**: `Recharts` for interactive Radar, Heatmap, and Bar charts to visualize the developer's skill taxonomy and commit consistency.
- **Branding**: Includes a cohesive design system, custom cursor packs, and tailored loading screens to present a premium developer tool aesthetic. 

### Utilities & Exporting
- **PDF Generation**: Combines `jsPDF` and `html2canvas` to allow developers to export their professional intelligence reports and visual analytics into shareable PDFs.
- **Parsing**: `mammoth` and `pdf-parse` for handling document processing capabilities within the app.

## 📁 Architecture Overview

```text
/
├── app/                  # Next.js App Router
│   ├── api/              # API and Backend Integrations
│   │   ├── auth/         # NextAuth configuration
│   │   ├── feedback/     # Supabase and Resend integrations
│   │   ├── github/       # Proxied Data fetching
│   │   ├── cv/           # Parsing operations
│   │   └── platform-data/# Supabase metric endpoints
│   ├── dashboard/        # Main intelligence dashboard UI
│   └── page.tsx          # Landing page
├── components/           
│   ├── charts/           # Recharts wrappers (Radar, Heatmap, Bar)
│   ├── pro/              # Pro intelligence modules (Credibility, Market, Temporal)
│   └── ui/               # Core atomic UI primitives, Gintel styling
├── lib/                  
│   ├── pro/              # Engine mechanics: temporal, trajectory, collaboration scoring
│   ├── scoring-engine.ts # Core logic for Archetypes, Entropy, Portfolio logic
│   └── metrics.ts        # Global metrics tracking utilities
└── types/                # Strict TypeScript interfaces defining GitHub objects
```

## 💻 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/Kritagya21Loomba/Gintel.git
cd Gintel
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root of your project and configure your variables mapping to GitHub OAuth, Supabase, and Resend:
```env
# NextAuth Configuration
# Generate a secret: openssl rand -base64 32
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# GitHub OAuth credentials (required for app login)
GITHUB_CLIENT_ID=your_oauth_app_client_id
GITHUB_CLIENT_SECRET=your_oauth_app_client_secret

# Supabase (required for global metrics and feedback)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_role_key

# Resend (required for feedback email routing)
RESEND_API_KEY=your_resend_api_key
FEEDBACK_TO_EMAIL=your_email@domain.com
```

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. Log in with your GitHub account to generate your parsed intelligence report.

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---
*Gintel — Not affiliated with GitHub, Inc.*
