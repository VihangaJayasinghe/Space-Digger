# SpaceDigger 🚀💎

**A high-performance, procedurally generated mining adventure built with Next.js and Phaser 3.**

### [🔴 **PLAY LIVE DEMO**](https://spacedigger.vercel.app)

## 📖 About the Project

**SpaceDigger** is a 2D browser-based mining game where players pilot a drilling unit deep into a procedurally generated alien crust. The goal is simple: Dig deep, gather resources, manage oxygen, and upgrade your ship—all while syncing progress in real-time to the cloud.

This project demonstrates a complex integration of a **Game Engine (Phaser 3)** running inside a **Modern Web Framework (Next.js)**, utilizing a **Serverless Backend (Supabase)** for state persistence.

## ✨ Key Features

* **🌍 Procedural Generation:** Infinite, seed-based world generation with distinct ore distribution.
* **☁️ Real-Time Cloud Sync:** Custom "Split-Save" architecture separates lightweight player stats from heavy map data to ensure instant, lag-free saves.
* **🔐 "Pilot" Auth System:** A masked authentication flow that allows users to login with a "Callsign" (Username) while maintaining secure email-based identity management behind the scenes.
* **🏎️ Optimized Performance:** Uses Zustand middleware to handle race conditions between local storage caching and server hydration.
* **🛠️ Reactive UI:** A HUD built in React that overlays the Canvas engine, reacting instantly to game state changes (Oxygen, Cargo, Money).

## 🛠️ Tech Stack

* **Frontend:** TypeScript, Next.js 14, React
* **Game Engine:** Phaser 3 (Arcade Physics)
* **State Management:** Zustand (with Persist Middleware)
* **Backend & DB:** Supabase (PostgreSQL, Auth, Row Level Security)
* **Styling:** Tailwind CSS
* **Deployment:** Vercel

## 🚀 Getting Started

To run this project locally, follow these steps:

### 1. Clone the repository
```bash
git clone [https://github.com/your-username/spacedigger.git](https://github.com/your-username/spacedigger.git)
cd spacedigger
