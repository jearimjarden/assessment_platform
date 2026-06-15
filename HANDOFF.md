# Lightrees Platform - AI Agent Handoff

## Project Context

This project is a 5-day MVP trial project for Lightrees Group.

Goal:
Build an assessment platform where mentors create self-assessment tests and users complete them to receive reports.

Priority:
1. Working product
2. Business value
3. Clean enough architecture
4. Fast iteration

Avoid:
- overengineering
- unnecessary abstractions
- premature scaling


---

# Tech Stack

Frontend:
- Next.js
- TypeScript
- Tailwind CSS

Backend:
- Next.js API Routes

Database:
- PostgreSQL
- Drizzle ORM

Auth:
- JWT
- bcrypt password hashing

Development:
- PostgreSQL runs using Docker


---

# Architecture Philosophy

Keep separation:

API Route
    ↓
Service Layer
    ↓
Database Layer


Rules:

- Route handlers handle HTTP only
- Business logic belongs in services
- Database access through Drizzle
- Frontend never calculates business results


---

# Important AI Philosophy

AI should NOT calculate facts.

Correct:

Backend:
- scoring
- statistics
- KPIs
- calculations

AI:
- explanation
- insights
- recommendations


Future AI layer plugs AFTER deterministic calculation.


---

# User Roles

## ADMIN

Purpose:
Lightrees internal operator

Capabilities:
- login
- create mentors
- view mentors


Important:
Admins are NOT publicly registered.


---

## MENTOR

Purpose:
Assessment creator

Capabilities:

- login
- create assessments
- edit assessments
- publish assessments
- create questions
- create choices
- configure scoring
- create report templates


Important:
Mentors are created by admins only.


---

## USER

Purpose:
Assessment taker

Capabilities:

- signup
- login
- take assessments
- receive reports


---

# Completed Backend Features

## Authentication

Status:
DONE

Features:

- POST /api/auth/signup

Creates USER only.

- POST /api/auth/login

Returns JWT.


Security:

- Password hashing with bcrypt
- JWT authentication
- Role based authorization


---

# Admin System

Status:
DONE


Endpoints:

POST /api/admin/mentors

Creates mentor account.


GET /api/admin/mentors

Lists mentors.


Rules:

Requires:
ADMIN role


---

# Assessment System

Status:
DONE


Mentor can:

Create assessment

POST /api/assessments


Update assessment

PATCH /api/assessments/:id


Delete assessment

DELETE /api/assessments/:id


Publish assessment

PATCH /api/assessments/:id/publish


Rules:

Mentor can only modify own assessments.


---

# Question System

Status:
DONE


Endpoint:

POST /api/assessments/:assessmentId/questions


Creates:

Question
+
Multiple choices


Example:

Question:
"I enjoy leading"

Choices:

Strongly disagree
score = 1

Strongly agree
score = 5


Important:

Scores are hidden from users.


---

# User Assessment Flow

Status:
DONE


User opens assessment:

GET /api/assessments/:id


Returns:

assessment
questions
choices


Important:

DO NOT expose choice scores.


---

Submit attempt:

POST /api/assessments/:id/attempts


Input:

{
 answers:[
  {
   questionId,
   choiceId
  }
 ]
}


Backend:

1. validates choices
2. gets scores
3. calculates total
4. saves attempt
5. saves answers


Never accept score from frontend.


---

# Report System

Status:
IN PROGRESS


Purpose:

Convert:

score

↓

meaningful report


Example:

Score 0-10:

"Beginner leadership"


Score 11-20:

"Strong leadership"


---

Needed:

Mentor creates report template:

POST /api/assessments/:id/reports


Fields:

- minScore
- maxScore
- freeReport
- premiumReport


After attempt:

Find matching report

Create user_report

Return free report


Premium report stays locked.


---

# Database Tables

Existing:

users

assessments

questions

choices

assessment_attempts

answers

report_templates

user_reports


---

# Development Commands

Start database:

docker compose up -d


Run app:

npm run dev


Generate migration:

npx drizzle-kit generate


Apply migration:

npx drizzle-kit migrate


---

# Testing Accounts

Development admin:

test@test.com


Mentor:

mentor@test.com


---

# Known Next.js Issues Encountered

## Dynamic Params

Next.js App Router params may require:

await params


Be careful with:

params.assessmentId


---

## Common Codex Mistakes

Previous issues:

1.
Wrong relative imports

Example:

../../../../lib/middleware


Check actual structure.


2.
Duplicate imports

Example:

requireRole imported twice.


3.
Missing return Response.json()


Always test endpoints with curl.


---

# Frontend MVP

Status:
DONE


All pages built in:

lightrees-platform/


Pages:

/ — Landing page

/login — Login (redirects by role)

/signup — User signup

/admin — Create and list mentors (ADMIN only)

/mentor — Assessment list with create/publish/delete (MENTOR only)

/mentor/assessments/[id] — Question builder + report templates (MENTOR only)

/dashboard — List published assessments (USER only)

/dashboard/[id] — Take assessment, submit answers

/results/[attemptId] — Score + free report + locked premium


New files:

lib/auth-utils.ts — localStorage helpers (getToken, saveAuth, clearAuth, getUser)

lib/api-client.ts — All fetch calls with auto Bearer token

components/Button.tsx — primary / secondary / danger variants

components/Input.tsx — labeled input with error state

components/Card.tsx — white shadow card wrapper

components/Navbar.tsx — role-aware nav + logout


Backend addition:

GET /api/assessments added.

Returns PUBLISHED assessments to any authenticated user.

Required for user dashboard listing.

listPublishedAssessments() added to lib/assessments.ts.


Design:

Emerald green primary color.

Slate gray backgrounds.

Clean minimal SaaS style.


Token:

Stored in localStorage (key: token).

User object stored in localStorage (key: user).

Route protection via useEffect + getUser() check.


---

# Current Development Direction

Next priorities:

1. Demo polish
2. Add AI insight layer


---

# Product Vision

This is NOT a ChatGPT wrapper.

Architecture:

Business Data
      ↓
Automation Pipeline
      ↓
Calculation Engine
      ↓
AI Insight Layer
      ↓
Dashboard
      ↓
Management Decision Support