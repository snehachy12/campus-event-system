# ACE Campus Platform

A unified campus solution with role-based access (Student, Teacher, Canteen, Admin-ready) in a dark black/orange theme.

## Features Overview

### Student

- Timetable Management
  - Days vertically, time slots horizontally
  - Break slots highlighted and labeled
  - Responsive grid with sticky headers
- Food Ordering
  - Category chips, search, filter
  - Food cards: veg/spicy badges, rating, price, prep time
  - Actions: Order Now, Schedule
  - Recent orders section
- Event Discovery
  - Event cards with category badges, date/time/location/organizer
  - Stats (upcoming count, participants, categories)
  - Register action
- Resource Booking (scaffold-ready)
  - Library and seminar hall routes reserved
- Campus Map (scaffold-ready)
  - Route reserved for voice-based assistance
- Attendance (view-only scaffold-ready)
- Internship/Jobs (scaffold-ready)

### Teacher

- Dashboard
  - Quick links to primary tools: Timetable, Attendance, Food
  - Profile dropdown with initials, name, role, logout
- Timetable
  - Same grid as Student with break slots
- Attendance Management
  - Date picker and section selector
  - Mark all present/clear
  - Per-student Present/Absent toggle
  - Save action
- Food Ordering
  - Same UI/UX as Student (categories, search/filter, rich cards)

### Canteen (Phase 2 scaffolding)

- Registration captures business and operations data
- Planned modules
  - Stock management
  - Orders (current/completed/history)
  - Queue and scheduled orders

### Admin (Phase 2 scaffolding)

- Events CRUD and publish
- Internship/job posts CRUD
- Approvals for teachers and canteen

## Auth and Session

- Login (Student, Teacher): `POST /api/login`
  - Request: `{ email, password, role }`
  - Response: `{ id, name, email, role, avatarInitials }`
- Signup: `POST /api/signup/{student|teacher|canteen}`
- Passwords hashed with bcrypt
- Client session stored in `localStorage`: `isLoggedIn`, `userRole`, `currentUser`
- User dropdown (`components/user-menu.tsx`)
  - Shows initials-based avatar, name, role
  - Logout clears local storage and redirects to `/`

## UI/UX Highlights

- Global dark theme with orange accents
- Consistent button/card styles via `components/ui/*`
- Sidebars
  - `StudentSidebar` and `TeacherSidebar` with active route state
- Timetable grid
  - Sticky first column and header row
  - Horizontal scroll for many time slots
- Accessibility
  - High-contrast labels and focus outlines

## Data Models (MongoDB)

- Student: core profile, academics, guardians, interests, skills, `avatarInitials`
- Teacher: core profile, professional details, subjects, specializations, `avatarInitials`
- Canteen: business, cuisines, operating hours, banking, `avatarInitials`

## Key Routes Map

- Student: `/student/dashboard`, `/student/timetable`, `/student/food`, `/student/events`, `/student/resources`, `/student/map`, `/student/attendance`, `/student/internships`
- Teacher: `/teacher/dashboard`, `/teacher/timetable`, `/teacher/food`, `/teacher/attendance-management`
- API: `/api/login`, `/api/signup/student`, `/api/signup/teacher`, `/api/signup/canteen`

## Quick Start

- Set `MONGODB_URI` in `.env.local`
- `npm i` then `npm run dev`

## Roadmap

- Admin panel: Events and internships management
- Resource booking: Library and seminar hall flows
- Campus navigation with voice assistance
- Razorpay integration for payments
- Canteen stock, queues, scheduled pickups

## Troubleshooting

- API 500: check `MONGODB_URI` and Atlas IP access
- Login failure: ensure user exists for chosen role
- CSS glitches: restart dev server to refresh Tailwind JIT
