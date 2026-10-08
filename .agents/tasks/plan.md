# Implementation Plan — Alumni Portal: Full-Stack Fix

## Pre-fix Findings Summary

### Controller Status
| Controller | Real MongoDB | Issues |
|---|---|---|
| authController | ✅ Real | None critical |
| mentorshipController | ✅ Real | Missing `title` in Notification.create (x3); `Mentorship.create` missing required `request` field; `populate('student', 'name email avatar')` — User has no `name` field (has `firstName`/`lastName`) |
| mentorController | ✅ Real | Filters on `profileQuery.domain`/`department`/`batch` but Profile has `domains[]`; `department`/`batch` are on User not Profile; selects `name` from User which doesn't exist |
| dashboardController | ✅ Real | Uses `Referral` model (file is `Referral.js`) — OK. Response shape doesn't match frontend's `DashboardStats` interface |
| notificationController | ✅ Real | None |
| opportunityController | ✅ Real | None |
| eventController | ✅ Real | None |

### Critical Bugs Found
1. **`server/src/routes/mentorshipRoutes.js`** — No `authenticate` middleware on ANY route. `req.user` is always `undefined`, so every handler crashes.
2. **`server/src/routes/mentorRoutes.js`** — No `authenticate` middleware. Profile match scoring can't identify the logged-in student.
3. **`server/src/controllers/mentorshipController.js` line 122** — `Mentorship.create(...)` missing required `request: newRequest._id` field → `ValidationError` when mentor accepts.
4. **`server/src/controllers/mentorshipController.js` lines ~53, ~131, ~141** — All three `Notification.create()` calls are missing required `title` field → crashes the `requestMentor`, `updateRequestStatus` handlers.
5. **`server/src/controllers/mentorshipController.js`** — `populate('student', 'name email avatar')` selects non-existent `name` field. User schema has `firstName`/`lastName`. All `mentorName`/`studentName` mappings will be `undefined`.
6. **`server/src/controllers/mentorController.js`** — Filters on `profile.domain`, `profile.department`, `profile.batch` — none exist. Profile has `domains[]`, and `department`/`batch` live on User. Fix: join through User for department/batch, use `$in` for domains.
7. **`server/src/controllers/dashboardController.js`** — Returns role-specific shaped objects but frontend `DashboardStats` interface expects `{totalAlumni, activeMentorships, upcomingEvents, openOpportunities}`. Need admin-style stats normalized for all roles + actual event/alumni counts.
8. **`client/.../requests/requests.component.html`** — Checks `req.status === 'PENDING'` but backend returns lowercase `'pending'`. Accept/Decline buttons never appear.
9. **`client/.../mentors-list/mentors-list.component.ts` line 77** — `this.selectedMentor.id` will be `undefined` because API returns `_id`. The `Mentor` model interface maps to Profile data which uses `_id`.
10. **`client/src/app/core/guards/auth.guard.ts`** — `isLoggedIn()` requires both `token AND currentUserValue`. On hard refresh, token exists but `currentUserValue` is `null` until `getMe()` resolves → redirect to login. Guard should check token only; `getMe()` failure handles the invalid token case.
11. **`client/.../dashboard/dashboard.component.ts`** — On API error, falls back to hardcoded fake stats `{totalAlumni: 120, activeMentorships: 34, ...}`. The chartData is always hardcoded monthly data, never from API.
12. **`server/src/.env` does not exist** — Falls back to insecure `fallback_secret_do_not_use_in_prod` JWT secret.
13. **Events, Opportunities, Messages features** — Route files point to `ComingSoonComponent`. Backend routes and controllers exist but Angular components are not built.
14. **`authService.getMe()` response shape** — Returns `{success, data: {user, profile}}` but `getMe()` in service expects `{success, data: User}` (flat) → `currentUserSubject.next(response.data)` stores `{user, profile}` object instead of `User`.

---

## Implementation Plan

> **Execution order:** Server fixes first (items 1–5), then client fixes (items 6–12), then integration fix (items 13–15), then feature completion (items 16–19).

---

- [ ] 1. **Create `server/.env` file with all required environment variables**

  The server config (`config/index.js`) reads from `process.env` with insecure fallbacks. The file must be created at the repo root of the server package so `dotenv.config()` finds it.

  Files: `server/.env` (create new — do NOT commit secrets; add to `.gitignore`)
  Also create: `server/.env.example` documenting all variables

  Content for `.env`:
  ```
  NODE_ENV=development
  PORT=3000
  MONGODB_URI=mongodb://localhost:27017/alumni_network
  JWT_SECRET=<generate a 64-char random hex string>
  JWT_EXPIRES_IN=7d
  CLIENT_URL=http://localhost:4200
  ```

  Also add `server/.env` to `server/.gitignore` (create if missing).

  Verify: `cd server && node -e "require('dotenv').config({path:'.env'}); const c=require('./src/config'); console.log(c.jwtSecret !== 'fallback_secret_do_not_use_in_prod')"` → prints `true`.

---

- [ ] 2. **Fix `mentorshipRoutes.js` — add `authenticate` middleware to all routes**

  Currently no route in this file is protected. `req.user` is `undefined` for every handler, crashing all mentorship operations. This is the **root cause** of "Request Mentorship does nothing on the other end."

  Files: `server/src/routes/mentorshipRoutes.js`

  Add at top of file:
  ```js
  const { authenticate } = require('../middleware/auth');
  ```
  Then add `authenticate` as the first middleware on every route:
  - `router.post('/request', authenticate, [...validation], requestMentor)`
  - `router.get('/requests', authenticate, getRequests)`
  - `router.patch('/request/:id/status', authenticate, [...validation], updateRequestStatus)`
  - `router.get('/my', authenticate, getMyMentorships)`
  - `router.get('/:id', authenticate, getMentorshipDetails)`
  - `router.patch('/:id/goals', authenticate, [...validation], updateGoals)`
  - `router.patch('/:id/milestones', authenticate, [...validation], updateMilestones)`
  - `router.get('/:id/milestones', authenticate, getMilestones)`

  Verify: `cd server && npm run dev` starts without error; `curl -X POST http://localhost:3000/api/mentorship/request` without a token returns `401 You are not logged in`.

---

- [ ] 3. **Fix `mentorRoutes.js` — add `authenticate` middleware**

  `getMentors` uses `req.user` for match scoring but `req.user` is always `undefined` — match scoring silently skips. More critically this needs to be an authenticated-only endpoint.

  Files: `server/src/routes/mentorRoutes.js`

  Change:
  ```js
  router.get('/', getMentors);
  ```
  To:
  ```js
  const { authenticate } = require('../middleware/auth');
  router.get('/', authenticate, getMentors);
  ```

  Verify: `curl http://localhost:3000/api/mentors` without token → `401`. With token → `200` with mentors list.

---

- [ ] 4. **Fix `mentorshipController.js` — three Notification.create calls missing required `title` field**

  `Notification` schema has `title: { type: String, required: true }`. All three `Notification.create()` calls in `mentorshipController` omit this field, causing a `ValidationError` that crashes `requestMentor` and `updateRequestStatus`.

  Files: `server/src/controllers/mentorshipController.js`

  Fix all three `Notification.create()` calls by adding a `title` field:

  1. In `requestMentor` (around line 53):
     ```js
     await Notification.create({
       user: mentorId,
       type: 'MENTORSHIP_REQUEST',
       title: 'New Mentorship Request',           // ADD THIS
       message: `You have a new mentorship request.`,
       relatedId: newRequest._id
       // remove relatedModel — not in schema
     });
     ```

  2. In `updateRequestStatus` acceptance branch (~line 131):
     ```js
     await Notification.create({
       user: request.student,
       type: 'MENTORSHIP_ACCEPTED',
       title: 'Mentorship Request Accepted',      // ADD THIS
       message: `Your mentorship request has been accepted.`,
       relatedId: mentorship._id
     });
     ```

  3. In `updateRequestStatus` declined branch (~line 141):
     ```js
     await Notification.create({
       user: request.student,
       type: 'MENTORSHIP_DECLINED',
       title: 'Mentorship Request Declined',      // ADD THIS
       message: `Your mentorship request was declined.`,
       relatedId: request._id
     });
     ```

  Also remove `relatedModel` from all three calls — that field does not exist in the Notification schema and can cause strict-mode issues.

  Verify: After fix, run server; POST a mentorship request through the API with valid auth tokens for student+mentor — no `ValidationError`, response is `201` with the created request.

---

- [ ] 5. **Fix `mentorshipController.js` — `Mentorship.create` missing required `request` field; `populate` field mismatch**

  Two separate bugs:

  **Bug A:** `Mentorship` schema has `request: { type: ObjectId, required: true }`. The `Mentorship.create()` call in `updateRequestStatus` (~line 122) omits `request: request._id`. This causes a `ValidationError` when a mentor tries to Accept a request.

  Fix in `updateRequestStatus` acceptance branch:
  ```js
  mentorship = await Mentorship.create({
    student: request.student,
    mentor: request.mentor,
    request: request._id,      // ADD THIS — required field
    status: 'active',
    goals: [],
    milestones: []
  });
  ```

  **Bug B:** All `.populate('student', 'name email avatar')` and `.populate('mentor', 'name email avatar')` calls select `name` which doesn't exist in User schema. User has `firstName` and `lastName`. The `mentorName`/`studentName` mapped fields will be `undefined`.

  Fix all populate calls:
  ```js
  .populate('student', 'firstName lastName email')
  .populate('mentor', 'firstName lastName email')
  ```

  Then update all mapping code to build the full name:
  ```js
  const mapped = requests.map(r => ({
    ...r.toObject(),
    mentorId: r.mentor._id.toString(),
    mentorName: `${r.mentor.firstName} ${r.mentor.lastName}`,
    studentId: r.student._id.toString(),
    studentName: `${r.student.firstName} ${r.student.lastName}`
  }));
  ```
  Apply the same pattern in `getMyMentorships` and `getMilestones`.

  Files: `server/src/controllers/mentorshipController.js`

  Verify: GET `/api/mentorship/requests` returns populated `mentorName`/`studentName` as full strings. PATCH `/api/mentorship/request/:id/status` with `{status: "accepted"}` returns `201` with both `request` and `mentorship` objects — no `ValidationError`.

---

- [ ] 6. **Fix `mentorController.js` — profile filter field names and User `name` field mismatch**

  The `getMentors` controller has two bugs:

  **Bug A — Wrong filter fields:** `profileQuery.department`, `profileQuery.domain`, `profileQuery.batch` target fields that don't exist in Profile. Profile has `domains: [String]` (not `domain`). `department` and `batch` are on the User model, not Profile.

  **Bug B — Populates `name` from User:** `Profile.find(...).populate('user', 'name email avatar role')` — User has no `name` field.

  Fix: 
  1. Change populate to: `populate('user', 'firstName lastName email role department batch')`
  2. Fix filter queries: map `domain` filter to `{ domains: domain }` ($in or exact string in array). For `department`/`batch`, fetch User IDs pre-filtered: query `User.find({ role: 'alumni', ...(department && {department}), ...(batch && {batch}) })` and pass the resulting IDs to the profile query. For `company`, map to `currentCompany` field on Profile (not `experience.company` which doesn't exist in schema).
  3. In the returned data, map `mentor.user.firstName + mentor.user.lastName` for the name.

  The full fix flow for `getMentors`:
  ```js
  const userFilter = { role: 'alumni' };
  if (department) userFilter.department = department;
  if (batch) userFilter.batch = batch;
  const alumniUsers = await User.find(userFilter).select('_id firstName lastName email department batch');
  const alumniUserIds = alumniUsers.map(u => u._id);

  const profileQuery = { user: { $in: alumniUserIds } };
  if (domain) profileQuery.domains = domain;              // 'domains' is the array field
  if (company) profileQuery.currentCompany = new RegExp(company, 'i');

  let mentors = await Profile.find(profileQuery)
    .populate('user', 'firstName lastName email department batch');
  ```
  Then in the response mapping, include `name: mentor.user.firstName + ' ' + mentor.user.lastName`, `department: mentor.user.department`, `batch: mentor.user.batch`, `company: mentor.currentCompany`, `jobTitle: mentor.currentRole`.

  Files: `server/src/controllers/mentorController.js`

  Verify: GET `/api/mentors` with auth token returns array of mentor profiles with non-null `name`, `department`, and `batch` values.

---

- [ ] 7. **Fix `dashboardController.js` — response shape mismatch and add missing stats**

  Frontend `DashboardStats` interface expects: `{ totalAlumni, activeMentorships, upcomingEvents, openOpportunities, alumniImpactScore? }`. Backend returns different shapes per role.

  Fix: Normalize the response to always include the fields the frontend needs (role-specific fields still in `stats` sub-object but also include the four global fields):

  ```js
  // Always fetch these regardless of role:
  const [totalAlumni, upcomingEventsCount, openOpportunitiesCount] = await Promise.all([
    User.countDocuments({ role: 'alumni' }),
    Event.countDocuments({ date: { $gte: new Date() } }),
    Opportunity.countDocuments({ status: 'active' })
  ]);
  ```

  For `activeMentorships`:
  - For student: `Mentorship.countDocuments({ student: userId, status: 'active' })`
  - For alumni: `Mentorship.countDocuments({ mentor: userId, status: 'active' })`
  - For admin: `Mentorship.countDocuments({ status: 'active' })`

  Return structure:
  ```js
  {
    totalAlumni,
    activeMentorships,
    upcomingEvents: upcomingEventsCount,
    openOpportunities: openOpportunitiesCount,
    alumniImpactScore: role === 'alumni' ? impactScore : undefined,
    stats: { ...roleSpecificStats },
    chartData: realChartData  // from DB, not hardcoded
  }
  ```

  Also remove the `Referral` require at the top — it imports `../models/Referral` which exists, but also used for `dashboardController.js` using `Referral.countDocuments({ alumni: userId })` correctly. Keep it.

  Files: `server/src/controllers/dashboardController.js`

  Verify: GET `/api/dashboard/stats` as student returns `{ success: true, data: { totalAlumni: <N>, activeMentorships: <N>, upcomingEvents: <N>, openOpportunities: <N> } }`.

---

- [ ] 8. **Fix `auth.guard.ts` — race condition on hard refresh**

  `isLoggedIn()` requires `token AND currentUserValue`. On hard refresh, token exists in localStorage but `currentUserValue` is `null` until the async `getMe()` call resolves. This redirects the user to login on every page refresh.

  Fix: Change the guard to check token presence only. The invalid-token case is handled by `getMe()` failing → `authService.logout()` in the `AuthService` constructor.

  Files: `client/src/app/core/guards/auth.guard.ts`

  Change:
  ```ts
  if (authService.isLoggedIn()) {
  ```
  To:
  ```ts
  if (authService.getToken()) {
  ```

  Verify: Log in, then hard-refresh the page — user stays on the dashboard instead of being redirected to login.

---

- [ ] 9. **Fix `AuthService.getMe()` — response shape mismatch**

  `authController.getMe` returns `{ success, data: { user, profile } }` but `AuthService.getMe()` types the response as `{success, data: User}` and does `this.currentUserSubject.next(response.data)` — storing `{user, profile}` object as the User, breaking `currentUser$.role`, `currentUser$.firstName`, etc.

  Files: `client/src/app/core/services/auth.service.ts`

  Fix the `getMe()` method:
  ```ts
  getMe(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/auth/me`).pipe(
      tap(response => {
        if (response.success && response.data?.user) {
          this.currentUserSubject.next(response.data.user);
        }
      })
    );
  }
  ```

  Verify: After login and hard refresh, `authService.currentUserValue?.firstName` returns the actual user name (not undefined).

---

- [ ] 10. **Fix `requests.component` — status case mismatch and error handling**

  **Bug A:** Template checks `req.status === 'PENDING'` but backend returns lowercase `'pending'`. Accept/Decline buttons never show for received requests.

  **Bug B:** `loadRequests()` has no error handler — if the API call fails, `loading` stays `true` forever.

  **Bug C:** `updateStatus()` has no loading/error state feedback.

  Files: `client/src/app/features/mentorship/requests/requests.component.html`, `client/src/app/features/mentorship/requests/requests.component.ts`

  Fix A — change template check:
  ```html
  <div class="actions" *ngIf="activeTab === 'RECEIVED' && req.status === 'pending'">
  ```
  Also update the status badge binding to handle lowercase:
  ```html
  <span class="status-badge" [ngClass]="req.status">{{ req.status | titlecase }}</span>
  ```

  Fix B — add error handler to `loadRequests()`:
  ```ts
  loadRequests() {
    this.loading = true;
    this.errorMessage = '';
    this.mentorshipService.getRequests().subscribe({
      next: res => { this.requests = res.data || []; this.loading = false; },
      error: () => { this.errorMessage = 'Failed to load requests'; this.loading = false; }
    });
  }
  ```

  Fix C — add `updatingId` state to component, show "Processing..." on the action buttons:
  ```ts
  updatingId: string | null = null;
  updateStatus(id: string, status: 'accepted' | 'declined') {
    this.updatingId = id;
    this.mentorshipService.updateRequestStatus(id, status).subscribe({
      next: () => { this.loadRequests(); this.updatingId = null; },
      error: () => { this.updatingId = null; }
    });
  }
  ```

  Add `errorMessage = ''` property and display it in the template.

  Verify: Log in as student, send a request. Log in as alumni/mentor, navigate to `/mentorship/requests` — the request card appears in "Received" tab with Accept/Decline buttons visible.

---

- [ ] 11. **Fix `mentors-list.component.ts` — `selectedMentor.id` mapping from API response**

  The `Mentor` interface has field `id` but the API returns MongoDB `_id`. The `mentorController` returns Profile documents (populated with User) — the Profile document `_id` is the profile ID, not the user ID. The mentorship request needs the **user's** `_id` as `mentorId`.

  Fix: Update `mentorController` response (already in item 6) to include a `userId` field in the response mapping. Then in `mentors-list.component.ts`, use `selectedMentor.userId` as the mentorId when calling `requestMentorship()`:

  In `mentorController.getMentors`, add to the return mapping:
  ```js
  userId: mentor.user._id.toString(),
  id: mentor._id.toString(),  // profile id
  name: `${mentor.user.firstName} ${mentor.user.lastName}`,
  ...
  ```

  In `mentors-list.component.ts`, change:
  ```ts
  this.mentorshipService.requestMentorship(this.selectedMentor.id, ...)
  ```
  To:
  ```ts
  this.mentorshipService.requestMentorship(this.selectedMentor.userId, ...)
  ```

  Update the `Mentor` model interface to add `userId`:
  ```ts
  export interface Mentor {
    id: string;       // profile _id
    userId: string;   // user _id — used for mentorship requests
    ...
  }
  ```

  Also fix `submitting = false` not being reset on success: move it into `next` callback, not `complete`.

  Files: `client/src/app/core/models/mentorship.model.ts`, `client/src/app/features/mentors/mentors-list/mentors-list.component.ts`, `server/src/controllers/mentorController.js` (already part of item 6)

  Verify: Click "Request Mentorship" on a mentor card, enter a message, click "Send Request" → shows "Sending...", then on success closes the modal without JS errors.

---

- [ ] 12. **Fix dashboard component — remove hardcoded fallback data, normalize stats display**

  **Bug A:** On API error, component falls back to hardcoded `{totalAlumni: 120, activeMentorships: 34, ...}` — fake stats shown to real users.

  **Bug B:** `chartData` is always the hardcoded monthly array — never from the real API response.

  **Bug C:** Template always shows `stats.totalAlumni` etc. but for a student role the backend's new normalized response sends those. However, the template still shows the same 4 cards regardless of role — that's fine after the dashboard backend fix.

  Fix A — replace error fallback with `null` stats (show empty state):
  ```ts
  error: () => {
    this.stats = null;
    this.loading = false;
  }
  ```

  Fix B — use `chartData` from API response:
  ```ts
  next: (res) => {
    if (res.success) {
      this.stats = res.data as DashboardStats;
      this.chartData = res.data.chartData?.data || [];
    }
    this.loading = false;
  }
  ```

  Fix C — add `loading = true` state and a loading spinner, empty state message when `stats` is null.

  Update the `DashboardStats` interface to match the normalized backend response.

  Files: `client/src/app/features/dashboard/dashboard/dashboard.component.ts`, `client/src/app/features/dashboard/dashboard/dashboard.component.html`

  Verify: Visit `/dashboard` after login — stats show real DB counts (0 if nothing in DB, not 120/34 fake values). On API error, an empty state message is shown instead of fake numbers.

---

- [ ] 13. **Fix `notification.service.ts` — response shape mismatch**

  `notificationController.getNotifications` returns `{success, results, data: {notifications}}` but `NotificationService.getNotifications()` types the response as `{success, data: Notification[]}` — `data` is actually `{notifications: [...]}`. This means the notification list never populates.

  Also, `getUnreadCount` returns `{success, data: {count}}` but service expects `{success, count}`.

  Files: `client/src/app/core/services/notification.service.ts`

  Fix `getNotifications()`:
  ```ts
  getNotifications(page = 1): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/notifications?page=${page}`);
  }
  // In components, access res.data.notifications
  ```

  Fix `getUnreadCount()`:
  ```ts
  getUnreadCount(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/notifications/unread-count`).pipe(
      tap(res => {
        if (res.success) {
          this.unreadCountSubject.next(res.data?.count ?? 0);
        }
      })
    );
  }
  ```

  Verify: After login, the notification bell count updates from 0 (or real unread count from DB).

---

- [ ] 14. **Build Events feature — list and RSVP (replace ComingSoonComponent)**

  Backend exists: `GET /api/events` and `POST /api/events/:id/rsvp`.

  Create Angular components:
  - `client/src/app/features/events/events-list/events-list.component.ts` + `.html` + `.scss`
    - Shows list of events from `GET /api/events`
    - Each event card shows title, date, type, location, attendee count
    - "RSVP" button calls `POST /api/events/:id/rsvp`, shows loading/already-rsvp'd state
    - Loading state while fetching, empty state if no events
  - Create `client/src/app/core/services/event.service.ts` with `getEvents()` and `rsvpEvent(id)` methods

  Update route file:
  ```ts
  // client/src/app/features/events/events.routes.ts
  export const EVENT_ROUTES: Routes = [
    { path: '', component: EventsListComponent }
  ];
  ```

  Files: `client/src/app/features/events/events-list/events-list.component.ts`, `.html`, `.scss`, `client/src/app/core/services/event.service.ts`, `client/src/app/features/events/events.routes.ts`

  Verify: Navigate to `/events` — event list loads from backend. RSVP button works, shows success state.

---

- [ ] 15. **Build Opportunities feature — list and apply (replace ComingSoonComponent)**

  Backend exists: `GET /api/opportunities` and `POST /api/opportunities/:id/apply`.

  Create Angular components:
  - `client/src/app/features/opportunities/opportunities-list/opportunities-list.component.ts` + `.html` + `.scss`
    - Shows list of opportunities from `GET /api/opportunities`
    - Each card shows title, company, type, description, deadline
    - "Apply" button calls `POST /api/opportunities/:id/apply`, shows loading/already-applied state
    - Loading state, empty state
  - Create `client/src/app/core/services/opportunity.service.ts` with `getOpportunities()` and `applyOpportunity(id)` methods

  Update route file:
  ```ts
  // client/src/app/features/opportunities/opportunities.routes.ts
  export const OPPORTUNITY_ROUTES: Routes = [
    { path: '', component: OpportunitiesListComponent }
  ];
  ```

  Files: `client/src/app/features/opportunities/opportunities-list/opportunities-list.component.ts`, `.html`, `.scss`, `client/src/app/core/services/opportunity.service.ts`, `client/src/app/features/opportunities/opportunities.routes.ts`

  Verify: Navigate to `/opportunities` — opportunities list loads. Apply button works.

---

- [ ] 16. **Fix `mentorship-list.component.ts` — add error handling and empty state**

  Currently uses `(res as any).data` cast with no error handling. If the API fails, `loading` stays `true`.

  Files: `client/src/app/features/mentorship/list/mentorship-list.component.ts`, `.html`

  Fix: 
  ```ts
  ngOnInit() {
    this.mentorshipService.getActiveMentorships().subscribe({
      next: res => { this.mentorships = res.data || []; this.loading = false; },
      error: () => { this.loading = false; this.error = true; }
    });
  }
  ```
  Add `error = false` property. Add empty state and error state to template.

  Verify: Navigate to `/mentorship` as a student with no active mentorships — shows "No active mentorships" message instead of loading spinner.

---

- [ ] 17. **Remove `Messages` ComingSoonComponent stub — provide functional page**

  `GET /api/messages` and `POST /api/messages` exist on the backend (`messageController` + `messageRoutes`). The Angular feature is just a route pointing to `ComingSoonComponent`.

  Read `messageController.js` and `messageRoutes.js`, then create a basic messages list component. At minimum: list conversations from `GET /api/messages` (or basic thread list). This follows the same pattern as events/opportunities above.

  Files: `client/src/app/features/messages/messages-list/messages-list.component.ts`, `.html`, `.scss`, `client/src/app/core/services/message.service.ts`, `client/src/app/features/messages/messages.routes.ts`

  Verify: Navigate to `/messages` — shows messages/conversations from backend, or an empty state if none exist.

---

- [ ] 18. **Ensure `.gitignore` for both packages excludes secrets**

  Files: `server/.gitignore` (create/update), `client/.gitignore` (verify `node_modules` is excluded)

  `server/.gitignore` must include:
  ```
  node_modules/
  .env
  dist/
  ```

  Verify: `git status` does not show `.env` as a tracked file.

---

- [ ] 19. **End-to-end mentorship flow integration test (manual verification steps)**

  This is the final verification item, not a code change. After all above items are applied, test:

  **Setup:**
  - Register a student account (e.g. `student@test.com` / `Password123`)
  - Register an alumni account (e.g. `alumni@test.com` / `Password123`)
  - (Alumni accounts start with `alumniStatus: 'pending'` — for testing, manually set it to `'verified'` in MongoDB, or use the admin panel if available)

  **Flow to verify:**
  1. Log in as student → navigate to `/mentors` → mentor list loads (may be empty if no alumni profiles yet)
  2. Click "Request Mentorship" on an alumni mentor → modal appears, enter message → click "Send Request" → shows "Sending..." → success message → modal closes
  3. Log in as alumni → navigate to `/mentorship/requests` → "Received" tab → see the student's request with name, message, and Accept/Decline buttons visible
  4. Click "Accept" → button shows processing → request disappears from pending list
  5. Log back in as student → navigate to `/mentorship/requests` → "Sent" tab → status shows "accepted"
  6. Navigate to `/mentorship` → the accepted mentorship appears in the list
  7. Hard-refresh any authenticated page → stays logged in (auth guard race condition fix)
  8. Navigate to `/events` → event list loads (empty state if no events)
  9. Navigate to `/opportunities` → opportunities list loads (empty state if no opportunities)
  10. Check notification bell icon → unread count reflects real DB state

---

## Commands to run the project

### Backend
```bash
cd "e:\da\Alumini proj\server"
# Install dependencies if needed:
npm install
# Start dev server:
npm run dev
# Runs on http://localhost:3000
```

### Frontend
```bash
cd "e:\da\Alumini proj\client"
# Install dependencies if needed:
npm install
# Start dev server (proxy to localhost:3000 is configured in angular.json):
npm start
# Runs on http://localhost:4200
```

### Required environment variables (`server/.env`)
```
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/alumni_network
JWT_SECRET=<min 32 chars random string>
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:4200
```

MongoDB must be running locally (default port 27017) or provide a MongoDB Atlas URI.

---

## Dependency Order Summary

Items 1-7 are backend fixes — must be done before client testing.
Items 8-13 are client core fixes — can be done after backend fixes.
Items 14-17 are new feature completions — independent of each other, depend on 1-7 being done.
Item 18 is housekeeping — can be done any time.
Item 19 is integration verification — must be last.
