import type { SkillCategory } from "@/types/pro";

export interface SkillEntry {
  canonical: string;      // e.g., "TypeScript"
  aliases: string[];      // e.g., ["ts", "typescript", "TS"]
  category: SkillCategory;
  // File patterns that prove usage of this skill
  filePatterns?: string[];
  // Dependency keys in package.json, requirements.txt, etc.
  dependencyKeys?: string[];
  // GitHub topics that map to this skill
  topicAliases?: string[];
}

// ─── SKILL TAXONOMY ──────────────────────────────────────────
// 500+ skills organized by category. Each entry has aliases,
// file patterns, and dependency keys for evidence matching.

export const SKILL_TAXONOMY: SkillEntry[] = [
  // ─── Languages ─────────────────────────────────────────────
  { canonical: "TypeScript", aliases: ["typescript", "ts"], category: "language", filePatterns: [".ts", ".tsx", "tsconfig.json"] },
  { canonical: "JavaScript", aliases: ["javascript", "js", "ecmascript", "es6", "es2015"], category: "language", filePatterns: [".js", ".jsx", ".mjs"] },
  { canonical: "Python", aliases: ["python", "py", "python3"], category: "language", filePatterns: [".py", "requirements.txt", "setup.py", "pyproject.toml"] },
  { canonical: "Go", aliases: ["go", "golang"], category: "language", filePatterns: [".go", "go.mod", "go.sum"] },
  { canonical: "Rust", aliases: ["rust", "rs"], category: "language", filePatterns: [".rs", "Cargo.toml", "Cargo.lock"] },
  { canonical: "Java", aliases: ["java", "jvm"], category: "language", filePatterns: [".java", "pom.xml", "build.gradle"] },
  { canonical: "Kotlin", aliases: ["kotlin", "kt"], category: "language", filePatterns: [".kt", ".kts"] },
  { canonical: "Swift", aliases: ["swift"], category: "language", filePatterns: [".swift", "Package.swift"] },
  { canonical: "C++", aliases: ["c++", "cpp", "cxx", "cplusplus"], category: "language", filePatterns: [".cpp", ".cc", ".cxx", ".hpp", "CMakeLists.txt"] },
  { canonical: "C", aliases: ["c", "clang"], category: "language", filePatterns: [".c", ".h", "Makefile"] },
  { canonical: "C#", aliases: ["c#", "csharp", "cs", "dotnet", ".net"], category: "language", filePatterns: [".cs", ".csproj", ".sln"] },
  { canonical: "Ruby", aliases: ["ruby", "rb"], category: "language", filePatterns: [".rb", "Gemfile", "Rakefile"] },
  { canonical: "PHP", aliases: ["php"], category: "language", filePatterns: [".php", "composer.json"] },
  { canonical: "Scala", aliases: ["scala"], category: "language", filePatterns: [".scala", "build.sbt"] },
  { canonical: "R", aliases: ["r", "rstats", "r-lang"], category: "language", filePatterns: [".R", ".Rmd", "DESCRIPTION"] },
  { canonical: "Julia", aliases: ["julia", "jl"], category: "language", filePatterns: [".jl", "Project.toml"] },
  { canonical: "Dart", aliases: ["dart"], category: "language", filePatterns: [".dart", "pubspec.yaml"] },
  { canonical: "Elixir", aliases: ["elixir", "ex"], category: "language", filePatterns: [".ex", ".exs", "mix.exs"] },
  { canonical: "Haskell", aliases: ["haskell", "hs"], category: "language", filePatterns: [".hs", "stack.yaml", ".cabal"] },
  { canonical: "Lua", aliases: ["lua"], category: "language", filePatterns: [".lua"] },
  { canonical: "Shell", aliases: ["shell", "bash", "sh", "zsh", "shellscript"], category: "language", filePatterns: [".sh", ".bash", ".zsh"] },
  { canonical: "PowerShell", aliases: ["powershell", "pwsh", "ps1"], category: "language", filePatterns: [".ps1", ".psm1"] },
  { canonical: "SQL", aliases: ["sql", "mysql", "postgresql", "sqlite"], category: "language", filePatterns: [".sql"] },
  { canonical: "HTML", aliases: ["html", "html5"], category: "language", filePatterns: [".html", ".htm"] },
  { canonical: "CSS", aliases: ["css", "css3", "stylesheet"], category: "language", filePatterns: [".css"] },
  { canonical: "Solidity", aliases: ["solidity", "sol", "smart-contracts"], category: "language", filePatterns: [".sol"] },
  { canonical: "Zig", aliases: ["zig"], category: "language", filePatterns: [".zig", "build.zig"] },
  { canonical: "OCaml", aliases: ["ocaml", "ml"], category: "language", filePatterns: [".ml", ".mli", "dune-project"] },
  { canonical: "Clojure", aliases: ["clojure", "clj"], category: "language", filePatterns: [".clj", ".cljs", "project.clj"] },
  { canonical: "Perl", aliases: ["perl", "pl"], category: "language", filePatterns: [".pl", ".pm"] },
  { canonical: "WASM", aliases: ["wasm", "webassembly", "web-assembly"], category: "language" },

  // ─── Frontend Frameworks ───────────────────────────────────
  { canonical: "React", aliases: ["react", "reactjs", "react.js"], category: "framework", dependencyKeys: ["react", "react-dom"], topicAliases: ["react", "reactjs"] },
  { canonical: "Next.js", aliases: ["next", "nextjs", "next.js"], category: "framework", dependencyKeys: ["next"], topicAliases: ["nextjs"] },
  { canonical: "Vue.js", aliases: ["vue", "vuejs", "vue.js"], category: "framework", dependencyKeys: ["vue"], topicAliases: ["vuejs", "vue"] },
  { canonical: "Nuxt", aliases: ["nuxt", "nuxtjs", "nuxt.js"], category: "framework", dependencyKeys: ["nuxt"], topicAliases: ["nuxtjs"] },
  { canonical: "Svelte", aliases: ["svelte", "sveltekit"], category: "framework", dependencyKeys: ["svelte"], topicAliases: ["svelte", "sveltekit"] },
  { canonical: "Angular", aliases: ["angular", "angularjs", "ng"], category: "framework", dependencyKeys: ["@angular/core"], topicAliases: ["angular"] },
  { canonical: "Astro", aliases: ["astro"], category: "framework", dependencyKeys: ["astro"] },
  { canonical: "Remix", aliases: ["remix"], category: "framework", dependencyKeys: ["@remix-run/react"] },
  { canonical: "Solid.js", aliases: ["solid", "solidjs", "solid.js"], category: "framework", dependencyKeys: ["solid-js"] },
  { canonical: "jQuery", aliases: ["jquery"], category: "framework", dependencyKeys: ["jquery"] },
  { canonical: "Tailwind CSS", aliases: ["tailwind", "tailwindcss"], category: "framework", dependencyKeys: ["tailwindcss"] },
  { canonical: "Bootstrap", aliases: ["bootstrap"], category: "framework", dependencyKeys: ["bootstrap"] },
  { canonical: "Material UI", aliases: ["mui", "material-ui", "material ui"], category: "framework", dependencyKeys: ["@mui/material"] },
  { canonical: "Chakra UI", aliases: ["chakra", "chakra-ui"], category: "framework", dependencyKeys: ["@chakra-ui/react"] },
  { canonical: "Three.js", aliases: ["three", "threejs", "three.js", "3d"], category: "framework", dependencyKeys: ["three"] },

  // ─── Backend Frameworks ────────────────────────────────────
  { canonical: "Node.js", aliases: ["node", "nodejs", "node.js"], category: "framework", filePatterns: ["package.json"] },
  { canonical: "Express", aliases: ["express", "expressjs"], category: "framework", dependencyKeys: ["express"] },
  { canonical: "Fastify", aliases: ["fastify"], category: "framework", dependencyKeys: ["fastify"] },
  { canonical: "NestJS", aliases: ["nestjs", "nest"], category: "framework", dependencyKeys: ["@nestjs/core"] },
  { canonical: "Django", aliases: ["django"], category: "framework", dependencyKeys: ["django", "Django"], topicAliases: ["django"] },
  { canonical: "Flask", aliases: ["flask"], category: "framework", dependencyKeys: ["flask", "Flask"] },
  { canonical: "FastAPI", aliases: ["fastapi"], category: "framework", dependencyKeys: ["fastapi"] },
  { canonical: "Spring Boot", aliases: ["spring", "spring-boot", "springboot"], category: "framework", topicAliases: ["spring-boot"] },
  { canonical: "Rails", aliases: ["rails", "ruby-on-rails", "ror"], category: "framework", filePatterns: ["Gemfile"], topicAliases: ["rails"] },
  { canonical: "Laravel", aliases: ["laravel"], category: "framework", topicAliases: ["laravel"] },
  { canonical: "Gin", aliases: ["gin", "gin-gonic"], category: "framework", topicAliases: ["gin"] },
  { canonical: "Fiber", aliases: ["fiber", "gofiber"], category: "framework" },
  { canonical: "Actix", aliases: ["actix", "actix-web"], category: "framework" },
  { canonical: "Phoenix", aliases: ["phoenix", "phoenix-framework"], category: "framework" },
  { canonical: "GraphQL", aliases: ["graphql", "gql"], category: "framework", dependencyKeys: ["graphql", "apollo-server", "@apollo/server"], topicAliases: ["graphql"] },
  { canonical: "tRPC", aliases: ["trpc"], category: "framework", dependencyKeys: ["@trpc/server"] },
  { canonical: "gRPC", aliases: ["grpc", "protobuf"], category: "framework", filePatterns: [".proto"], topicAliases: ["grpc"] },

  // ─── Mobile ────────────────────────────────────────────────
  { canonical: "React Native", aliases: ["react-native", "rn"], category: "framework", dependencyKeys: ["react-native"], topicAliases: ["react-native"] },
  { canonical: "Flutter", aliases: ["flutter"], category: "framework", filePatterns: ["pubspec.yaml"], topicAliases: ["flutter"] },
  { canonical: "SwiftUI", aliases: ["swiftui"], category: "framework", topicAliases: ["swiftui"] },
  { canonical: "Jetpack Compose", aliases: ["compose", "jetpack-compose"], category: "framework" },
  { canonical: "Expo", aliases: ["expo"], category: "framework", dependencyKeys: ["expo"] },

  // ─── Databases ─────────────────────────────────────────────
  { canonical: "PostgreSQL", aliases: ["postgres", "postgresql", "pg"], category: "database", topicAliases: ["postgresql", "postgres"] },
  { canonical: "MySQL", aliases: ["mysql", "mariadb"], category: "database", topicAliases: ["mysql"] },
  { canonical: "MongoDB", aliases: ["mongodb", "mongo"], category: "database", dependencyKeys: ["mongoose", "mongodb"], topicAliases: ["mongodb"] },
  { canonical: "Redis", aliases: ["redis"], category: "database", dependencyKeys: ["redis", "ioredis"], topicAliases: ["redis"] },
  { canonical: "SQLite", aliases: ["sqlite", "sqlite3"], category: "database", dependencyKeys: ["better-sqlite3", "sqlite3"] },
  { canonical: "Elasticsearch", aliases: ["elasticsearch", "elastic", "es"], category: "database" },
  { canonical: "DynamoDB", aliases: ["dynamodb", "dynamo"], category: "database" },
  { canonical: "Cassandra", aliases: ["cassandra"], category: "database" },
  { canonical: "Neo4j", aliases: ["neo4j", "graph-database"], category: "database" },
  { canonical: "Supabase", aliases: ["supabase"], category: "database", dependencyKeys: ["@supabase/supabase-js"] },
  { canonical: "Firebase", aliases: ["firebase", "firestore"], category: "database", dependencyKeys: ["firebase", "firebase-admin"] },
  { canonical: "Prisma", aliases: ["prisma"], category: "database", dependencyKeys: ["prisma", "@prisma/client"], filePatterns: ["schema.prisma"] },
  { canonical: "Drizzle", aliases: ["drizzle", "drizzle-orm"], category: "database", dependencyKeys: ["drizzle-orm"] },

  // ─── Infrastructure & DevOps ───────────────────────────────
  { canonical: "Docker", aliases: ["docker", "containers", "containerization"], category: "infrastructure", filePatterns: ["Dockerfile", "docker-compose.yml", "docker-compose.yaml", ".dockerignore"], topicAliases: ["docker"] },
  { canonical: "Kubernetes", aliases: ["kubernetes", "k8s", "kube"], category: "infrastructure", filePatterns: ["k8s/", "kubernetes/"], topicAliases: ["kubernetes"] },
  { canonical: "Terraform", aliases: ["terraform", "tf", "iac", "infrastructure-as-code"], category: "infrastructure", filePatterns: [".tf", "main.tf"], topicAliases: ["terraform"] },
  { canonical: "Ansible", aliases: ["ansible"], category: "infrastructure", filePatterns: ["ansible/", "playbook.yml"] },
  { canonical: "Helm", aliases: ["helm", "helm-charts"], category: "infrastructure", filePatterns: ["Chart.yaml"] },
  { canonical: "Nginx", aliases: ["nginx"], category: "infrastructure", filePatterns: ["nginx.conf"] },
  { canonical: "GitHub Actions", aliases: ["github-actions", "gh-actions", "ci/cd"], category: "infrastructure", filePatterns: [".github/workflows/"] },
  { canonical: "Jenkins", aliases: ["jenkins"], category: "infrastructure", filePatterns: ["Jenkinsfile"] },
  { canonical: "CircleCI", aliases: ["circleci"], category: "infrastructure", filePatterns: [".circleci/"] },
  { canonical: "GitLab CI", aliases: ["gitlab-ci", "gitlab"], category: "infrastructure", filePatterns: [".gitlab-ci.yml"] },
  { canonical: "Prometheus", aliases: ["prometheus"], category: "infrastructure" },
  { canonical: "Grafana", aliases: ["grafana"], category: "infrastructure" },
  { canonical: "Linux", aliases: ["linux", "unix", "ubuntu", "debian", "centos"], category: "infrastructure" },
  { canonical: "Vercel", aliases: ["vercel", "zeit"], category: "infrastructure", filePatterns: ["vercel.json"] },
  { canonical: "Netlify", aliases: ["netlify"], category: "infrastructure", filePatterns: ["netlify.toml"] },

  // ─── Cloud ─────────────────────────────────────────────────
  { canonical: "AWS", aliases: ["aws", "amazon-web-services", "amazon web services", "ec2", "s3", "lambda", "sqs", "sns", "ecs", "eks", "rds", "cloudformation", "cdk"], category: "cloud", topicAliases: ["aws"] },
  { canonical: "GCP", aliases: ["gcp", "google-cloud", "google cloud", "google cloud platform", "cloud-run", "bigquery", "cloud functions"], category: "cloud", topicAliases: ["gcp", "google-cloud"] },
  { canonical: "Azure", aliases: ["azure", "microsoft-azure", "microsoft azure", "azure-devops"], category: "cloud", topicAliases: ["azure"] },
  { canonical: "Cloudflare", aliases: ["cloudflare", "workers", "cf-workers"], category: "cloud", filePatterns: ["wrangler.toml"] },
  { canonical: "DigitalOcean", aliases: ["digitalocean", "do"], category: "cloud" },
  { canonical: "Serverless", aliases: ["serverless", "faas"], category: "cloud", filePatterns: ["serverless.yml"] },

  // ─── ML / AI ───────────────────────────────────────────────
  { canonical: "PyTorch", aliases: ["pytorch", "torch"], category: "domain", dependencyKeys: ["torch", "pytorch"], topicAliases: ["pytorch"] },
  { canonical: "TensorFlow", aliases: ["tensorflow", "tf", "keras"], category: "domain", dependencyKeys: ["tensorflow", "keras"], topicAliases: ["tensorflow"] },
  { canonical: "scikit-learn", aliases: ["sklearn", "scikit-learn", "sci-kit-learn"], category: "domain", dependencyKeys: ["scikit-learn", "sklearn"] },
  { canonical: "Pandas", aliases: ["pandas"], category: "domain", dependencyKeys: ["pandas"] },
  { canonical: "NumPy", aliases: ["numpy"], category: "domain", dependencyKeys: ["numpy"] },
  { canonical: "Hugging Face", aliases: ["huggingface", "hugging-face", "transformers"], category: "domain", dependencyKeys: ["transformers"] },
  { canonical: "OpenCV", aliases: ["opencv", "cv2"], category: "domain", dependencyKeys: ["opencv-python"] },
  { canonical: "LangChain", aliases: ["langchain"], category: "domain", dependencyKeys: ["langchain"] },
  { canonical: "ONNX", aliases: ["onnx", "onnxruntime"], category: "domain", dependencyKeys: ["onnxruntime", "onnx"] },
  { canonical: "JAX", aliases: ["jax"], category: "domain", dependencyKeys: ["jax", "jaxlib"] },
  { canonical: "MLflow", aliases: ["mlflow"], category: "domain", dependencyKeys: ["mlflow"] },
  { canonical: "Jupyter", aliases: ["jupyter", "notebook", "ipython"], category: "domain", filePatterns: [".ipynb"] },
  { canonical: "NLP", aliases: ["nlp", "natural-language-processing", "natural language processing", "spacy", "nltk"], category: "domain", topicAliases: ["nlp"] },
  { canonical: "Computer Vision", aliases: ["cv", "computer-vision", "image-recognition", "object-detection"], category: "domain", topicAliases: ["computer-vision"] },
  { canonical: "Deep Learning", aliases: ["deep-learning", "neural-networks", "dl"], category: "domain", topicAliases: ["deep-learning"] },
  { canonical: "Machine Learning", aliases: ["machine-learning", "ml", "data-science"], category: "domain", topicAliases: ["machine-learning"] },
  { canonical: "Generative AI", aliases: ["generative-ai", "gen-ai", "llm", "large-language-model", "chatgpt", "gpt"], category: "domain" },

  // ─── Testing ───────────────────────────────────────────────
  { canonical: "Jest", aliases: ["jest"], category: "practice", dependencyKeys: ["jest"] },
  { canonical: "Vitest", aliases: ["vitest"], category: "practice", dependencyKeys: ["vitest"] },
  { canonical: "Cypress", aliases: ["cypress", "e2e-testing"], category: "practice", dependencyKeys: ["cypress"] },
  { canonical: "Playwright", aliases: ["playwright"], category: "practice", dependencyKeys: ["@playwright/test", "playwright"] },
  { canonical: "Pytest", aliases: ["pytest"], category: "practice", dependencyKeys: ["pytest"] },
  { canonical: "Testing Library", aliases: ["testing-library", "rtl"], category: "practice", dependencyKeys: ["@testing-library/react"] },
  { canonical: "Selenium", aliases: ["selenium"], category: "practice" },
  { canonical: "Storybook", aliases: ["storybook"], category: "practice", dependencyKeys: ["@storybook/react"] },

  // ─── Practices ─────────────────────────────────────────────
  { canonical: "CI/CD", aliases: ["ci-cd", "ci/cd", "continuous-integration", "continuous-deployment", "continuous integration", "continuous deployment"], category: "practice" },
  { canonical: "TDD", aliases: ["tdd", "test-driven-development", "test-driven"], category: "practice" },
  { canonical: "Agile", aliases: ["agile", "scrum", "kanban", "sprint"], category: "practice" },
  { canonical: "Microservices", aliases: ["microservices", "micro-services", "service-oriented"], category: "practice", topicAliases: ["microservices"] },
  { canonical: "REST API", aliases: ["rest", "rest-api", "restful", "api-design"], category: "practice" },
  { canonical: "Event-Driven", aliases: ["event-driven", "event-sourcing", "cqrs", "message-queue"], category: "practice" },
  { canonical: "Monorepo", aliases: ["monorepo", "turborepo", "nx", "lerna"], category: "practice", dependencyKeys: ["turbo", "nx", "lerna"] },
  { canonical: "Git", aliases: ["git", "version-control", "github", "gitlab", "bitbucket"], category: "practice" },
  { canonical: "Design Patterns", aliases: ["design-patterns", "solid", "clean-architecture", "clean architecture", "ddd", "domain-driven-design"], category: "practice" },

  // ─── Domain Skills ─────────────────────────────────────────
  { canonical: "Distributed Systems", aliases: ["distributed-systems", "distributed systems", "distributed computing", "consensus", "raft", "paxos"], category: "domain" },
  { canonical: "Systems Programming", aliases: ["systems-programming", "systems programming", "low-level", "embedded"], category: "domain" },
  { canonical: "Compiler Design", aliases: ["compiler", "compilers", "parser", "ast", "lexer", "interpreter"], category: "domain" },
  { canonical: "Cryptography", aliases: ["cryptography", "crypto", "encryption", "security"], category: "domain" },
  { canonical: "Blockchain", aliases: ["blockchain", "web3", "ethereum", "smart-contract", "defi"], category: "domain", topicAliases: ["blockchain", "web3"] },
  { canonical: "Game Development", aliases: ["gamedev", "game-development", "game-dev", "unity", "unreal", "godot"], category: "domain" },
  { canonical: "Data Engineering", aliases: ["data-engineering", "data engineering", "etl", "data-pipeline", "apache-spark", "airflow"], category: "domain" },
  { canonical: "WebRTC", aliases: ["webrtc", "real-time-communication"], category: "domain" },
  { canonical: "AR/VR", aliases: ["ar", "vr", "augmented-reality", "virtual-reality", "xr", "mixed-reality"], category: "domain" },

  // ─── Soft Skills ───────────────────────────────────────────
  { canonical: "Leadership", aliases: ["leadership", "team-lead", "tech-lead", "engineering-manager", "management", "managed", "led", "leading"], category: "soft" },
  { canonical: "Mentoring", aliases: ["mentoring", "mentor", "mentored", "coaching", "coached"], category: "soft" },
  { canonical: "Communication", aliases: ["communication", "presenting", "documentation", "technical-writing", "public-speaking"], category: "soft" },
  { canonical: "Architecture", aliases: ["architecture", "system-design", "system design", "architected", "designed", "solution-architect"], category: "soft" },
  { canonical: "Project Management", aliases: ["project-management", "project management", "pm", "roadmap", "planning", "sprint-planning"], category: "soft" },
  { canonical: "Cross-functional", aliases: ["cross-functional", "cross functional", "stakeholder", "product", "collaboration"], category: "soft" },
];

// ─── Lookup Helpers ──────────────────────────────────────────

const _aliasIndex = new Map<string, SkillEntry>();
for (const entry of SKILL_TAXONOMY) {
  _aliasIndex.set(entry.canonical.toLowerCase(), entry);
  for (const alias of entry.aliases) {
    _aliasIndex.set(alias.toLowerCase(), entry);
  }
}

/**
 * Look up a skill by any alias. Case-insensitive.
 */
export function findSkill(name: string): SkillEntry | undefined {
  return _aliasIndex.get(name.toLowerCase().trim());
}

/**
 * Extract all matching skills from a text blob (CV text, README, etc.)
 */
export function extractSkillsFromText(text: string): SkillEntry[] {
  const found = new Set<string>();
  const results: SkillEntry[] = [];
  const lowerText = text.toLowerCase();

  for (const entry of SKILL_TAXONOMY) {
    if (found.has(entry.canonical)) continue;

    const allNames = [entry.canonical.toLowerCase(), ...entry.aliases.map((a) => a.toLowerCase())];
    for (const name of allNames) {
      // Word boundary match to avoid false positives
      const regex = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
      if (regex.test(lowerText)) {
        found.add(entry.canonical);
        results.push(entry);
        break;
      }
    }
  }

  return results;
}

/**
 * Get all skills in a specific category
 */
export function getSkillsByCategory(category: SkillCategory): SkillEntry[] {
  return SKILL_TAXONOMY.filter((s) => s.category === category);
}
