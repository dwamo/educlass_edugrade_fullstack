# Thesis vs. Build

**Engineering review — EduClass LMS**

A line-by-line comparison of the GIMPA final-year thesis (*AI-Powered Learning Management System for Enhanced Assessment and Scheduling*) against `educlass_edugrade` as it exists today — plus a record of the correctness and security fixes applied in this pass, and three concrete tracks for closing the gap.

Stack: FastAPI + SQLAlchemy (async) backend · React + Vite + Tailwind frontend · PostgreSQL 16.

---

## 1. The Gap

The thesis's two research objectives — AI-assisted grading and automated scheduling — are the entire academic contribution. Neither exists in the running system. What follows is what the paper describes versus what a repo audit actually found.

### Dual-model AI grading — `NOT BUILT`

*Thesis §4.2–4.4 · the paper's stated core innovation*

| Thesis §4.2–4.4 | In the repo |
|---|---|
| Fine-tuned GPT-4o-mini grades each answer against a lecturer-weighted rubric (Concept Mastery / Comprehensiveness / Clarity, summing to 100%); Gemini Flash 2.0 verifies low-confidence scores; n8n orchestrates both calls; output is a JSON score + feedback summary. | Zero `openai` / `gemini` imports anywhere in `app/`. `student_response_feedback` (feedback, detailed_breakdown, highlighted_differences, encouragement) exists as a bare table with no model or route. Grading is a manual click-to-score form over local mock JSON — `user/l/exams/grade/index.tsx`. |

### Automated scheduling — `NOT BUILT`

*Thesis §4.5 · the second research objective*

| Thesis §4.5 | In the repo |
|---|---|
| Constraint-based timetable generation across rooms, instructor availability, and course sequencing; proactive conflict detection before publish; real-time conflict monitoring with manual override. | DB has a bare `schedules` table, no SQLAlchemy model, no router. Frontend already has `@fullcalendar/*` installed and a `data/schedule/context.tsx` — scaffolding for a feature that was never wired to a backend. |

### Frontend ↔ backend wiring — `PARTIAL`

*Everything the thesis assumes is "live"*

| Actually wired | Still mock-only |
|---|---|
| Admin CRUD for courses, lecturers, programs, students, and users mostly call the real API through `services/api.tsx`, with a token-attaching axios interceptor. | The entire lecturer exam-authoring/grading flow and several admin analytics pages read from static JSON (`exams.json`, `questions.json`, `submissions.json`) with in-memory mutation — edits vanish on reload, and the real `/exams`, `/responses/bulk` endpoints already in the backend go unused. |

---

## 2. Shipped in This Pass

Before proposing new work, the existing surface got a security and correctness pass. Nothing here is a "massive change" — it's the baseline the three proposals below assume is already true.

### Security

- Six routers had **no authentication at all** — including `POST /users/`, which let anyone mint an admin account. All now require a valid JWT, with admin-only writes. *(users, courses, programs, questions, student_response, system_logs)*
- Two incompatible auth mechanisms coexisted — a token-only check with no DB lookup, and a DB-backed one. Unified on the DB-backed dependency everywhere. *(lecturers.py, students.py)*
- A student could submit exam responses under any `student_id`, not just their own. Added an ownership check. *(student_response.py)*
- `SECRET_KEY`, DB credentials, and CORS origins were hardcoded. All three now read from environment variables with the same defaults, so nothing already deployed breaks. *(auth.py, database.py, main.py)*
- Every login logged the raw JWT, decoded payload, and password-verification result to stdout. Removed. *(auth.py, login.tsx)*
- The global exception handler echoed raw Python exception text to any client. Now logged server-side, generic message to the client. *(main.py)*
- Deleted a dead debug script duplicating hardcoded DB credentials outside the app package. *(test_db_connection.py)*

### Correctness

- Four routers returned raw ORM objects through response models missing `from_attributes` — broken response serialization under Pydantic v2. *(lecturers, questions, system_logs, users)*
- `update_course` silently dropped `program_id` on every edit. *(courses.py)*
- A copy-pasted list endpoint was named `get_courses` instead of `get_system_logs`. *(system_logs.py)*
- Two endpoints defaulted their timestamp to `datetime.now()` evaluated once at import time — every row got the same frozen timestamp. *(system_logs.py, student_response.py)*

### Performance

- No foreign key in the schema was indexed. Added indexes on all 12, and applied them to the live database (it was restored from a raw SQL dump, not `create_all`). *(models.py + live DB)*
- SQL echo logging was unconditionally on — every query and parameter value, including PII, to stdout. Off by default now. *(database.py)*

### Frontend Cleanup

- Deleted an entire parallel mock-data tree with zero imports anywhere in the app. *(src/data/admin/*)*
- Removed two shadowed, unreachable duplicate components, and resolved a third duplicate (two incompatible `Schedule` type definitions) in favor of the one Vite's resolver actually picked. *(Sidebar/index.tsx ×2, schedules/types.tsx)*
- Three files hardcoded `127.0.0.1:8000` and bypassed the shared, token-attaching API client entirely — now broken by the auth fixes above until wired properly. Reconnected all three, made the API base URL environment-configurable. *(login.tsx, CourseForm.tsx, UserForm.tsx)*
- The user CRUD client was typed against fields the backend doesn't have (`name` instead of `username`, no password/role linkage) and a to-nowhere `/api/questions` call bypassed auth. Retyped to match the real schema; added the missing `getUserById`. *(services/api.tsx)*
- Removed a self-referential `"educlass": "file:"` package dependency. *(package.json)*

**Verification:** a full `tsc -b` build surfaces roughly 50 pre-existing type errors (unused locals under strict mode, mock-data type mismatches in the exam/schedule modules). Diffed against the original files to confirm none were introduced this pass — the project has evidently only ever been run via `vite dev`, which doesn't type-check. Left untouched here; folded into Track 3 below.

---

## 3. Three Tracks Forward

Ranked by how directly each one closes the gap in §1. Track 1 is the thesis; Track 2 is its second objective; Track 3 is the foundation both need to sit on.

### 1 — Real AI-Assisted Grading

*Build the feature the thesis is actually about.*

**Approach**

- **Weighted rubric config** — a lecturer sets Concept Mastery / Comprehensiveness / Clarity weights (sum to 100) per exam; store on the exam or a small linked table.
- **Grading service** — on submission, build a structured prompt from question + model answer + student answer + weights, call GPT-4o-mini for a JSON `{score, feedback}`.
- **Verification pass** — below a confidence threshold or on random sample, re-check with Gemini Flash 2.0; skip n8n and call both APIs directly from a background task — one less moving part for a v1.
- **Populate what's already there** — write into the existing, currently-empty `student_response_feedback` table instead of adding new schema.
- **Human-in-the-loop UI** — lecturer sees the AI score + feedback and confirms or overrides; never fully automatic.

**Why this first**

- It's the entire measured result in thesis §5 (70.2% grading-time reduction, 89.7% concordance) — currently nothing to defend those numbers with.
- The DB schema already anticipated this exactly (`rubric_criteria`, `expected_answer`, the feedback table) — it's wiring, not a redesign.

| Effort | External dependency | New schema |
|---|---|---|
| Medium–high | OpenAI + Gemini API keys | None — table exists, unused |

### 2 — Schedule Management

*Finish what's already half-scaffolded.*

**Approach**

- **Schedule model + CRUD** — course, room/resource, lecturer, and time window; a real router where today there's only a bare table.
- **Conflict detection** — an interval-overlap check against lecturer/room/cohort before insert; a full constraint solver is v2, not v1.
- **Wire the calendar that's already installed** — `@fullcalendar/*` is in `package.json` with no real data behind it; point it at the new endpoints instead of `data/schedule/context.tsx`'s local-only state.

**Why this is lower-risk**

- No external API, no cost, no prompt-tuning — pure CRUD plus one overlap query.
- Frontend scaffolding (calendar libraries, a schedule context) already exists; this closes the loop rather than starting cold.

| Effort | External dependency | New schema |
|---|---|---|
| Medium | None | One model on an existing bare table |

### 3 — Unify on Real Data

*The foundation the other two tracks need under them.*

**Approach**

- **Retire every remaining mock module** — the lecturer exam flow and admin analytics pages, onto the shared API client this pass already hardened.
- **Ownership checks** — a lecturer can currently edit or delete any other lecturer's exam; scope mutations to the owning lecturer.
- **Pagination** — no list endpoint has any; fine at 8 users, not at 800.
- **One auth context** — merge `context/AuthContext.tsx` and `data/auth/context.tsx`, used inconsistently across the app today.
- **Real migrations** — Alembic exists but every startup runs `create_all` instead; either track schema changes properly or drop Alembic.
- **Clean build** — resolve the ~50 pre-existing `tsc -b` errors so `npm run build` is something the project can actually run, not just `vite dev`.

**Why it can't wait indefinitely**

- Track 1's grading UI and Track 2's calendar both need real, persisted data underneath — building either on top of mock JSON just relocates the same problem.
- Mechanical and wide-reaching rather than deep — safe to do incrementally alongside 1 and 2, not a prerequisite big-bang rewrite.

| Effort | External dependency | New schema |
|---|---|---|
| Medium, incremental | None | None |

---

## 4. Suggested Sequencing

Track 3 is infrastructure, not a demo — run it alongside Track 1 rather than in front of it, so the thesis's centerpiece feature lands first.

```
Track 1 · AI grading  +  Track 3 · real data (incremental)  →  Track 2 · scheduling
```

---

*educlass_edugrade · engineering review · GIMPA School of Technology*
