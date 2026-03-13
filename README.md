# Mentora IAS — Where Dreams Become Ranks

> Best UPSC Civil Services Coaching in Bangalore | Offline & Online Classes

[![CI](https://github.com/galagaliprashant/mentora_web_app/actions/workflows/ci.yml/badge.svg)](https://github.com/galagaliprashant/mentora_web_app/actions/workflows/ci.yml)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://mentora-web-app.vercel.app)

**Live Site:** [https://mentora-web-app.vercel.app](https://mentora-web-app.vercel.app)

---

## 📚 About

Mentora IAS is a dedicated institute for UPSC Civil Services Examination preparation, built on the vision of providing quality guidance with a student-centric approach. This repository contains the source code for the official Mentora IAS website.

### Pages

| Page | File | Description |
|------|------|-------------|
| Home | `index.html` | Hero slider, about us, faculty carousel, contact |
| Courses | `courses.html` | GS Foundation & APMC programs |
| Student Corner | `student-corner.html` | Study material, PYQs, current affairs, daily quiz |
| Videos | `videos.html` | Video lectures and content |
| Free Online Batch | `free-class.html` | Free class registration |

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Vite 7** | Build tool & dev server |
| **TypeScript** | Type-safe JavaScript |
| **ESLint 9** | Code quality & linting |
| **GitHub Actions** | CI/CD pipeline |
| **Vercel** | Production hosting & deployment |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** `^20.19.0` or `>=22.12.0`
- **npm** (comes with Node.js)

### Setup

```bash
# Clone the repository
git clone https://github.com/galagaliprashant/mentora_web_app.git
cd mentora_web_app

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The dev server will start at `http://localhost:5173`.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Production build (outputs to `dist/`) |
| `npm run preview` | Preview the production build locally |
| `npm run typecheck` | Run TypeScript type checking (`tsc --noEmit`) |
| `npm run lint` | Run ESLint with max 10 warnings |
| `npm run lint:fix` | Auto-fix ESLint issues |

---

## 🔄 CI/CD Pipeline

This project uses **GitHub Actions** for continuous integration and **Vercel** for continuous deployment. The pipeline enforces code quality on every change before it reaches production.

### Pipeline Flow

```
Feature Branch → Pull Request → CI Quality Checks → Merge to main → Vercel Deploy 🚀
```

### How It Works

1. **Developer** creates a feature branch and opens a Pull Request to `main`
2. **GitHub Actions** automatically triggers the **Quality Checks** job
3. The pipeline runs three sequential checks:

   | Step | Command | What It Checks |
   |------|---------|----------------|
   | TypeScript | `tsc --noEmit` | No type errors in the codebase |
   | ESLint | `eslint . --max-warnings 10` | Code quality standards are met |
   | Build | `vite build` | Production build compiles successfully |

4. **If any check fails** → the PR is **blocked from merging**
5. **If all checks pass** → the PR can be merged to `main`
6. **On merge** → Vercel automatically deploys to production

### Branch Protection Rules

The `main` branch is protected with the following rules:

- ❌ Direct pushes to `main` are **blocked**
- ✅ All changes must go through a **Pull Request**
- ✅ The **"Quality Checks"** CI job must pass before merging
- ✅ Branch must be **up-to-date** with `main` before merging
- ✅ Rules are **enforced for admins** — no bypassing

### CI Configuration

The workflow is defined in [`.github/workflows/ci.yml`](.github/workflows/ci.yml):

- **Triggers on:** Pull requests to `main` and pushes to `main`
- **Runs on:** `ubuntu-latest`
- **Node version:** `20.19.0`
- **Concurrency:** Cancels in-progress runs on the same branch (saves CI minutes)

### Deployment

- **Platform:** Vercel
- **Auto-deploy:** Enabled on merge to `main`
- **Preview deploys:** Vercel posts preview URLs on PRs automatically

---

## 👨‍💻 Developer Workflow

```bash
# 1. Make sure you're on the latest main
git checkout main
git pull origin main

# 2. Create a feature branch
git checkout -b feature/your-change

# 3. Make your changes...

# 4. Run checks locally before pushing
npm run typecheck    # TypeScript check
npm run lint         # ESLint check
npm run build        # Build check

# 5. Commit and push
git add .
git commit -m "feat: describe your change"
git push origin feature/your-change

# 6. Open a Pull Request on GitHub
#    → CI runs automatically
#    → Merge once all checks pass
#    → Vercel deploys to production
```

---

## 📁 Project Structure

```
mentora_web_app/
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI pipeline
├── public/                     # Static assets (images, icons)
├── src/
│   ├── main.ts                 # Application entry point
│   └── style.css               # Global styles
├── index.html                  # Home page
├── courses.html                # Courses page
├── student-corner.html         # Student corner page
├── videos.html                 # Videos page
├── free-class.html             # Free online batch page
├── eslint.config.js            # ESLint v9 flat config
├── tsconfig.json               # TypeScript configuration
├── package.json                # Dependencies & scripts
└── README.md
```

---

## 📞 Contact

- **Phone:** +91 9133333035 / +91 9133333034
- **Email:** Info@mentoraias.com
- **Location:** Bangalore, India
- **Website:** [mentoraias.com](http://mentoraias.com)

### Social Media

- [Facebook](https://www.facebook.com/profile.php?id=61579993256481)
- [Instagram](https://www.instagram.com/mentora.ias)
- [Telegram](https://t.me/MentoraIASofficial)
- [YouTube](https://youtube.com/@mentora_ias)

---

<p align="center">Copyright © 2025 Mentora IAS. All Rights Reserved.</p>
