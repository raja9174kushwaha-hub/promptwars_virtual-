<p align="center">
  <img src="src/assets/logo-glyph.png" alt="EventSpark Logo" width="80" />
</p>

<h1 align="center">EventSpark — SmartVenue Super-App</h1>

<p align="center">
  <strong>A full-stack, role-based event management platform for organizers and attendees.</strong>
  <br />
  Create branded events, manage registrations, track analytics, and provide a seamless attendee experience — all from one beautiful dashboard.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Supabase-Backend-3FCF8E?logo=supabase&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white" />
</p>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Supabase Setup](#-supabase-setup)
- [Deployment](#-deployment)
- [Security](#-security)
- [Screenshots](#-screenshots)
- [License](#-license)

---

## 🌟 Overview

**EventSpark** is a modern, multi-portal event management super-app designed for both **Event Organizers** and **Attendees**. It features strict role-based access control (RBAC), real-time data powered by Supabase, and a premium UI built with React and Tailwind CSS.

Users select their role at login — **"Attend Events"** or **"Host Events"** — and are routed to completely isolated portals with no cross-access.

---

## ✨ Features

### 🎯 Organizer Portal (`/dashboard`)

| Feature | Description |
|---|---|
| **Event Creation** | Create events with custom branding, templates (split, minimal, stacked, landing, cards), ticket pricing, QR payment codes, and custom form fields |
| **Attendee Management** | View all registrations per event, verify payment receipts, filter by status |
| **Analytics Dashboard** | Real-time charts for registrations, traffic sources, conversion rates |
| **Seating Arrangement** | Visual drag-and-drop seating designer for different venue types (concert, cricket, workshop, etc.) |
| **Security & IoT** | Simulated CCTV monitoring, crowd density alerts, incident tracking dashboard |
| **Crowd Map** | Live venue floor plan with real-time crowd heat zones |
| **Integrations** | Connect with Zoom, HubSpot, Mailchimp, Slack, Stripe, and more |
| **Settings** | Profile editing, company branding, theme customization |

### 👤 Attendee Portal (`/attendee`)

| Feature | Description |
|---|---|
| **Home Dashboard** | Personalized welcome, registration stats, upcoming events |
| **Explore Events** | Browse all live events with search and filters |
| **My Events** | Track registered events (upcoming & past) with status badges |
| **Digital Tickets** | QR-code based entry passes for registered events |
| **Venue Map** | Interactive map to navigate the event venue |
| **Emergency SOS** | One-tap emergency button that dispatches an alert with seat/location info to event security |

### 🔓 Public Pages

| Page | Description |
|---|---|
| **Landing Page** | Animated hero, feature bento grid, testimonials, CTA sections |
| **Registration Page** | 5 beautiful templates for event registration, supports paid events with QR payment + receipt upload |
| **Company Page** | Public-facing company profile with all their events |
| **Entry Pass** | Shareable digital pass page with QR code for gate entry |
| **Venue Live** | Public real-time venue crowd visualization |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | Tailwind CSS, shadcn/ui (Radix primitives) |
| **Animations** | Framer Motion |
| **State Management** | TanStack React Query |
| **Backend / Database** | Supabase (PostgreSQL, Auth, Storage, RLS) |
| **Authentication** | Supabase Auth (Email/Password + Google OAuth) |
| **Charts** | Recharts |
| **Forms** | React Hook Form + Zod validation |
| **QR Codes** | react-qr-code, qrcode |
| **Routing** | React Router v6 |
| **Icons** | Lucide React |

---

## 📁 Project Structure

```
src/
├── assets/                  # Static images (event photos, avatars, logo)
├── components/
│   ├── layout/              # DashboardLayout, AppSidebar
│   ├── ui/                  # shadcn/ui components (Button, Card, Dialog, etc.)
│   ├── Logo.tsx             # Brand logo component
│   ├── NavLink.tsx          # Active-aware navigation link
│   └── ProtectedRoute.tsx   # RBAC route guard
├── contexts/
│   └── AuthContext.tsx       # Auth state provider (session, user, signOut)
├── hooks/
│   ├── useEvents.ts          # CRUD operations for events
│   ├── useFormFields.ts      # Dynamic form field management
│   ├── useMyRegistrations.ts # Attendee's own registrations + public events
│   ├── useProfile.ts         # User profile management
│   ├── useRegistrations.ts   # Organizer-side registration management
│   └── useVenue.ts           # Venue zones and crowd data
├── integrations/
│   └── supabase/
│       ├── client.ts         # Supabase client initialization
│       └── types.ts          # Auto-generated database types
├── pages/
│   ├── attendee/             # Attendee portal pages
│   │   ├── AttendeeHome.tsx
│   │   ├── AttendeeLayout.tsx
│   │   ├── AttendeeTicket.tsx
│   │   ├── ExploreEvents.tsx
│   │   ├── MyEvents.tsx
│   │   └── VenueMap.tsx
│   ├── dashboard/            # Organizer portal pages
│   │   ├── Analytics.tsx
│   │   ├── Attendees.tsx
│   │   ├── CreateEvent.tsx
│   │   ├── EventDetail.tsx
│   │   ├── Events.tsx
│   │   ├── Integrations.tsx
│   │   ├── SeatingArrangement.tsx
│   │   ├── SecurityIoT.tsx
│   │   ├── SettingsPage.tsx
│   │   ├── VenueLive.tsx
│   │   └── VenueMapAdmin.tsx
│   ├── Auth.tsx              # Login / Signup with role selection
│   ├── Landing.tsx           # Public landing page
│   ├── Register.tsx          # Event registration (5 templates)
│   └── ...
├── App.tsx                   # Root router with RBAC route config
└── main.tsx                  # Entry point
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- A **Supabase** project ([supabase.com](https://supabase.com))

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/promptwars_virtual-.git
cd promptwars_virtual-

# 2. Install dependencies
npm install

# 3. Set up environment variables (see below)
cp .env.example .env

# 4. Start development server
npm run dev
```

The app will be running at `http://localhost:5173`

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest tests |

---

## 🔐 Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-id
```

> ⚠️ **Never commit `.env` to version control.** It is already included in `.gitignore`.

---

## 🗄 Supabase Setup

### Required Tables

| Table | Purpose |
|---|---|
| `profiles` | User profiles (name, company, avatar) |
| `events` | Event data (name, date, template, pricing, branding) |
| `form_fields` | Dynamic registration form fields per event |
| `registrations` | Attendee registration data (JSONB) |
| `entry_passes` | QR-based digital entry passes |
| `venue_zones` | Venue floor plan zones for crowd tracking |

### Row Level Security (RLS)

All tables have RLS enabled with strict policies:

- **Events**: Only the creator (`user_id = auth.uid()`) can perform CRUD operations. Public can view `live` events.
- **Registrations**: Organizers see registrations for their events. Attendees can only see their own (matched by email in JWT).
- **Entry Passes**: Restricted to the event owner and the specific attendee linked to the pass.
- **Profiles**: Users can only read/update their own profile.
- **Storage (`event-assets`)**: Authenticated users can upload. Only the owner can update/delete.

### Google OAuth Setup

1. Enable **Google** provider in Supabase → Authentication → Providers
2. Add your `Google Client ID` and `Client Secret`
3. Set the redirect URL to: `https://your-domain.com/auth`

---

## 📦 Deployment

### Build for Production

```bash
npm run build
```

The output will be in the `dist/` directory — a static SPA ready for deployment.

### Deploy to Vercel

```bash
npm i -g vercel
vercel --prod
```

### Deploy to Netlify

1. Connect your GitHub repo
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in the Netlify dashboard

> **Important**: For SPA routing to work, configure your hosting to redirect all routes to `index.html`.

---

## 🛡 Security

| Feature | Implementation |
|---|---|
| **Authentication** | Supabase Auth with JWT (Email/Password + Google OAuth) |
| **Role-Based Access** | `userMode` persisted in localStorage, enforced by `ProtectedRoute` component with `requiredMode` prop |
| **Route Isolation** | Organizer (`/dashboard/*`) and Attendee (`/attendee/*`) portals are completely isolated |
| **Database Security** | Row Level Security (RLS) on all tables — no cross-user data access |
| **Session Cleanup** | `signOut()` clears auth session AND role data |
| **API Keys** | `.env` excluded from version control via `.gitignore` |
| **No Cross-Portal Links** | No "Switch View" buttons — users must log out and re-select role |

---

## 📸 Screenshots

<details>
<summary><strong>Landing Page</strong></summary>

- Animated hero with rotating text
- Confetti burst animations
- Event card showcase
- Bento-grid feature section
- Testimonials with real avatars

</details>

<details>
<summary><strong>Organizer Dashboard</strong></summary>

- Event listing with status badges
- Rich event creation form (5 template previews)
- Attendee management with payment verification
- Live analytics with Recharts
- Seating arrangement designer
- Security IoT monitoring panel

</details>

<details>
<summary><strong>Attendee Portal</strong></summary>

- Personalized home with stats cards
- Event exploration with live event cards
- Digital ticket with QR code
- Emergency SOS button with confirmation dialog
- Interactive venue map

</details>

---

## 👨‍💻 Author

**Raja Kushwaha**

---

## 📄 License

This project is private and proprietary. All rights reserved.