DRIVE LINK FOR VIDEO
https://drive.google.com/file/d/1qWZLducavnaZnKHssclxY2f-7KBMXj44/view?usp=sharing


FESTO – Campus Event & Utility Platform


FESTO is a unified campus platform combining academics, events, food, and administration with role-based access and event-specific roles.
Built with a dark black + orange theme, optimized for clarity, scalability, and real campus workflows.

🔑 Core Concept (What Makes FESTO Different)

User Roles: Student, Teacher,  Admin

Event Roles (Dynamic):

Participant

Organizer (Admin-approved)

➡️ A single user (Student/Teacher) can switch event roles without breaking system security.

👤 User Roles Overview
Student / Teacher (Base Roles)

Both Students and Teachers can:

Use academic & utility features

Apply to become an Event Organizer

Join events as Participants

🎟️ Event Roles (New)
Participant

Register for events

View event passes (QR-based – future-ready)

Track registered events

View event schedule & updates

Dashboard Includes

Upcoming events

Registered passes

Event timeline

Organizer (Admin Approved)

Users must request organizer access.

Flow

Student/Teacher selects “Become Organizer”

Request sent to Admin

Admin approves / rejects

Organizer dashboard unlocked

Organizer Features

Create & manage events

View participants list

Check-in management (future-ready)

Event performance analytics

Organizer Dashboard

Total events created

Total registrations

Event-wise analytics

Engagement stats

🛡️ Admin Role (Phase 2 – Expanded)
Admin Responsibilities

Approve / reject:

Organizer requests

Teacher registrations

Manage:

Events (CRUD + publish)

Internship / Job posts

Monitor platform-wide analytics

Admin Analytics Dashboard

Total users (students / teachers / organizers)

Active events

Event participation stats

Revenue-ready metrics (future Razorpay)

🎒 Features by Role
Student

Timetable Management

Vertical days, horizontal time slots

Highlighted breaks

Sticky headers, responsive grid

Event Discovery

Event cards with badges

Date, time, location, organizer

Register as Participant

Resource Booking (scaffold-ready)

Campus Map (voice assistance reserved)

Attendance (view-only scaffold)

Internships / Jobs (scaffold-ready)

Teacher

Dashboard with quick actions

Timetable (same grid system)

Attendance Management

Date & section selector

Per-student toggle

Event participation or organizer request

🔐 Auth & Session

Login: POST /api/login

{ "email": "", "password": "", "role": "" }


Signup

/api/signup/student

/api/signup/teacher

/api/signup/canteen

Passwords hashed using bcrypt

Session stored in localStorage

isLoggedIn

userRole

currentUser

eventRole (participant / organizer)

User Menu

Avatar initials

Name & role

Logout

🎨 UI / UX Highlights

Dark theme with orange accents

Consistent design system via components/ui/*

Role-based sidebars:

Student

Teacher

Participant

Organizer

Admin

Sticky timetable grid

High-contrast accessibility support

🗄️ Data Models (MongoDB)

Student

Profile, academics, interests, skills

avatarInitials

eventRoles

Teacher

Professional details, subjects

avatarInitials

eventRoles

OrganizerRequest

userId

status (pending / approved / rejected)


Business details

Operating hours

Banking info

🧭 Key Routes Map
User

/student/dashboard

/teacher/dashboard

Event Roles

/participant/dashboard

/organizer/dashboard

/organizer/create-event


Admin

/admin/dashboard

/admin/approvals

/admin/events

/admin/user

🚀 Quick Start
npm install
npm run dev


Set MONGODB_URI in .env.local

🛣️ Roadmap

Organizer

Razorpay payments

Event passes & ticketing

Campus navigation with voice

Advanced analytics (Admin & Organizer)

🧪 Troubleshooting

API 500 → Check MongoDB URI & Atlas IP

Login fails → Ensure role matches user

CSS issues → Restart Tailwind JIT server



