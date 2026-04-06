# Gintel - GitHub Intelligence Layer

![Gintel](https://img.shields.io/badge/Status-Live_Beta-00ff88?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)

**Gintel** transforms your raw GitHub data into a clear, career-aligned analysis—identifying your developer archetype, scoring your portfolio, and detecting actionable gaps to help you level up your engineering profile.

## 🚀 Features

- **Developer Identity**: Classified into 7 archetypes based on your actual commit patterns and codebase contributions, not just your job title.
- **Portfolio Score**: A 0–100 weighted score evaluating project quality, consistency, depth, and community signals.
- **Career Alignment**: Maps your GitHub footprint to relevant engineering roles (Backend, Machine Learning, DevOps, Frontend, etc.).
- **Actionable Gaps**: Get highly specific, prioritized recommendations directly tied to your existing repositories. 
- **Temporal Intelligence**: Analyzes trait shifts and contribution habits over time.
- **Visual Analytics**: Interactive radar charts, heatmaps, and repository scorecards powered by Recharts.

## 🛠 Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Authentication**: [NextAuth.js](https://next-auth.js.org/) (GitHub OAuth)
- **Styling**: Tailwind CSS, CSS Modules
- **Icons**: Lucide React
- **Data Visualization**: Recharts
- **PDF Generation**: jsPDF & html2canvas

## 📁 Project Structure

```text
/
├── app/                  # Next.js App Router (Pages, Layouts, API routes)
│   ├── api/auth/         # NextAuth GitHub configuration
│   ├── dashboard/        # Main intelligence dashboard UI
│   └── page.tsx          # Landing page
├── components/           # Reusable UI components
│   ├── charts/           # Recharts wrappers (Radar, Heatmap, Bar)
│   ├── dashboard/        # Dashboard specific layouts and navs
│   ├── pro/              # Pro intelligence modules (DNA, Market Pos, etc.)
│   └── ui/               # Core atomic UI primitives
├── lib/                  # Application logic and data models
│   ├── pro/              # Scoring engines (Trajectory, Market, Temporal)
│   └── github-api.ts     # Data fetching and parsing layer
└── types/                # Strict TypeScript interfaces and types
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
Create a `.env.local` file in the root of your project and configure your GitHub OAuth keys:
```env
# Generate a secret: openssl rand -base64 32
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# GitHub OAuth credentials
GITHUB_ID=your_oauth_app_client_id
GITHUB_SECRET=your_oauth_app_client_secret
```

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. Log in with GitHub to view your parsed intelligence report.

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---
*Gintel — Not affiliated with GitHub, Inc.*
