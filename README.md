
# 🎮 Game Room Dashboard — LSU CSUDH

<p align="center">
  <img src="https://lsucsudh.org/wp-content/themes/lokerstudentunion/assets/img/lsu_cobrand.svg" alt="CSUDH | Loker Student Union Logo" width="400" />
</p>

A custom-built dashboard for managing game room operations at **Loker Student Union, Inc.** — *California State University, Dominguez Hills*. Designed to support real-time activity monitoring, revenue tracking, and staff access control.

---

## 📌 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Development Options](#development-options)
- [Deployment](#deployment)
- [Custom Domain Setup](#custom-domain-setup)
- [File Structure](#file-structure)
- [Contributing](#contributing)
- [License](#license)

---

## 🧾 Overview

This application was created to streamline internal operations for the LSU Game Room at CSUDH. It centralizes the management of games, user sessions, daily shifts, and revenue logs with a responsive interface built for campus use.

---

## ⚙️ Features

- 🎯 **Activity Management** — Track real-time usage of billiards, consoles, and board games.
- 💰 **Revenue Overview** — View session transactions, card/cash splits, and daily totals.
- 👤 **User Role Control** — Grant permissions for admins, attendants, and developers.
- 📊 **Live Dashboard** — Monitor shift activity, availability, and revenue at a glance.

---

## 🚀 Tech Stack

- **Framework**: React (TypeScript)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS, ShadCN UI
- **State/Forms**: React Hook Form, Zod
- **Package Manager**: npm

---

## 📦 Getting Started

### ✅ Prerequisites

- Node.js v18+
- npm v9+

Install using [nvm](https://github.com/nvm-sh/nvm#installing-and-updating) for easier version management.

### 🛠️ Local Setup

```bash
# Clone the repo
git clone <YOUR_GIT_URL>

# Navigate into the project
cd <your-project-name>

# Install dependencies
npm install

# Start the development server
npm run dev
```

---

## 💻 Development Options

- **Local IDE**: Use VS Code or your preferred editor for full control.
- **GitHub Web Editor**: Make changes directly in GitHub UI.
- **GitHub Codespaces**: Spin up a cloud-based development environment instantly.

---

## 📤 Deployment

1. Run `npm run build` to generate production files in the `dist/` folder.
2. Upload the `dist/` folder to your preferred static host (Netlify, Vercel, GitHub Pages).
3. Set up domain + HTTPS (optional).

---

## 🌐 Custom Domain Setup

If using a school-provided or external domain:

1. Go to your host's domain settings.
2. Point your domain to the hosting service.
3. Enable HTTPS and domain verification as required.

---

## 🗂️ File Structure

```
.
├── public/                  # Static files (e.g., favicon, manifest)
├── src/
│   ├── assets/              # Images, icons
│   ├── components/          # UI elements
│   ├── pages/               # Application views
│   ├── styles/              # Tailwind CSS + custom styles
│   ├── App.tsx              # Root component
│   └── main.tsx             # App entry point
├── vite.config.ts           # Vite configuration
├── tailwind.config.ts       # Tailwind CSS configuration
└── package.json             # Scripts, metadata, dependencies
```

---

## 🤝 Contributing

### 👤 Contributor

- **Digvijay Hethur Jagadeesha**  
  *Student Business Assistant, LSU CSUDH*  
  *Designer & Developer of Game Room Dashboard*

---

## 📄 License

All rights reserved © 2024 — **Loker Student Union, Inc.**  
California State University, Dominguez Hills

---
