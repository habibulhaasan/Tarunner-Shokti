# Phase 1: Theme + Donation/Approval flow

## Theme
`app/globals.css` re-themed to a minimal, neutral slate palette with a single
blue accent (previously forest-green + coral). The old warm/editorial serif
(Fraunces) was dropped in favor of Inter everywhere, for a flatter, more
professional look. Almost the entire file is CSS-variable driven, so this
was mostly a `:root` change plus cleanup of a handful of hardcoded hex
values (recolored into the same slate/blue/red/amber families, preserving
their original meaning — error vs. warning vs. accent).

Nothing structural changed, so all existing layouts/spacing are untouched.

## Fund donations (money contributions)
Named "fund" throughout to avoid clashing with the existing blood-donation
feature (`bloodDonations`, `DonationsTab`, etc.), which is untouched.

**Files**
- `lib/fundContributions.js` — settings/accounts, submit, review, approve/reject, balance
- `components/admin/FundAccountsPanel.jsx` — admin: toggle page visibility, manage receiving accounts (bKash/Nagad/bank, add/remove/deactivate)
- `components/admin/FundReviewPanel.jsx` — admin: pending/approved/rejected queue, approve/reject with an optional note
- `components/dashboard/ContributeTab.jsx` — member: fund balance, submit a contribution (account, amount, trxn ID, comment), track own submission history, see expense breakdown

**Wired in**
- `app/admin/page.jsx` — new "Donations" top-level tab (Review / Expenses / Accounts & visibility)
- `app/dashboard/page.jsx` — new `contribute` tab
- `components/nav/AppShell.jsx` — "Donate" nav item, shown to members only once an admin turns visibility on (admins always see it, to preview before publishing)
- `firestore.rules` — new `fundContributions/{id}` rules: a member can create their own pending submission and edit it while pending; only an admin can move it to approved/rejected; `config/fundSettings` reuses the existing `config/{docId}` rule (admin write, member read)

**Flow implemented end-to-end**
1. Admin adds one or more receiving accounts and turns the page on.
2. Member picks an account, enters amount + transaction ID + optional comment, submits.
3. Admin reviews against the real account balance, approves or rejects (with a note).
4. On approval the amount counts toward the fund balance and the member gets an in-app notification via the existing `sendNotification`.
5. On rejection the member is notified with the admin's note, if given.

## Phase 2: Expenses + Feedback

### Expenses
- `lib/fundExpenses.js` — admin adds/deletes expenses (title, amount, category, date, note); readable by any signed-in member for transparency
- `components/admin/FundExpensesPanel.jsx` — admin: record expenses, see received/spent/balance, delete entries
- `lib/fundContributions.js`'s `useFundBalance()` now returns `{ approvedTotal, expenseTotal, balance }` — balance = approved contributions − expenses. Both the admin review screen and the member Donate tab pull from this single hook, so they always agree.
- Member Donate tab (`ContributeTab.jsx`) now shows a "Where the fund has gone" section listing every expense.
- `firestore.rules` — `fundExpenses/{id}`: read = any signed-in member, write = admin only.

### Feedback
- `lib/feedback.js` — submit feedback (member), review all feedback + add a remark (admin). Adding a remark sets status to "reviewed" and sends the member a notification with the remark as the body — reusing the existing `sendNotification` plumbing, so it shows up in their regular Notifications list.
- Member: `components/dashboard/NotificationsTab.jsx` now has two sub-tabs — "Notifications" (unchanged) and "Send feedback" (new: a message box + history of past feedback with the admin's remark once reviewed).
- Admin: inside the existing "Notifications" top-level tab, two sub-tabs — "Compose" (the original broadcast/direct-message panel, untouched) and "Feedback" (new: `components/admin/FeedbackReviewPanel.jsx` — open/reviewed/all filter, write a remark, sends).
- `firestore.rules` — `feedback/{id}`: member creates their own "open" item and can't edit status/remark themselves; only admin can set `status`/`adminRemark`/`reviewedAt`/`reviewedBy`.

## Deploy notes
- `firebase deploy --only firestore:rules` to publish the new rules.
- Firestore will ask for a few composite indexes the first time these queries run (same pattern as the existing `notifications` indexes — the console error gives a one-click link):
  - `fundContributions (uid ASC, createdAt DESC)`
  - `feedback (uid ASC, createdAt DESC)`
- No other config changes needed — `config/fundSettings` uses the same top-level `config` collection that `directoryVisibility` already uses.

## Phase 3: Management committee

- `lib/committee.js` — admin-defined role list (`config/committeeSettings`, same doc pattern as the fund/directory settings) plus `useCommitteeMembers()`, which joins `profiles` with `committeeRoleId` set against that role list.
- `components/admin/CommitteeRolesPanel.jsx` — new "Committee" top-level admin tab: create/rename/reorder/delete roles (e.g. President, General Secretary, Treasurer). Order here controls display order on the member-facing page.
- `components/admin/AdminEditForm.jsx` — a "Committee role" dropdown added right under the existing admin/user role toggle, so assigning a member's committee role happens from the same member-detail screen as everything else. Saved via the existing Save button/audit-log flow (no new save button, no rules change — `profiles` is already fully admin-writable).
- `components/dashboard/CommitteeTab.jsx` — new member-facing "Committee" tab, separate from "Directory": lists everyone with a role assigned, grouped/ordered by role, reusing the existing directory-card visuals.
- Nav: "Committee" added to `DASHBOARD_TABS` in `components/nav/AppShell.jsx` (shows under the mobile "More" sheet by default, same as other non-primary tabs).
- No firestore.rules changes needed: `config/{docId}` (admin write / signed-in read) and `profiles/{uid}` (admin write / signed-in read) already cover everything this feature touches.

## Phase 4: Memos (স্মারক নং) with printable letterhead format

- `components/common/Letterhead.jsx` — standalone, reusable letterhead component. All the editable org details (name, logo, address, phone, email) live in one exported `ORG_INFO` object at the top of the file — change it once and every printable document that uses `<Letterhead />` updates. Logo currently points at the existing `/logo.png`; address/phone/email are placeholders marked TODO (same convention already used elsewhere in the codebase, e.g. `AboutTab.jsx`'s developer section) since the real ones weren't available to me.
- `lib/memos.js` — CRUD for memo documents (`memoNo`, `title`/subject, `content`, `date`, `visible`), admin list, member-visible list, and a live single-doc hook used by the print page.
- `components/admin/MemosPanel.jsx` — new "Memos" top-level admin tab: create/edit/delete a memo, per-memo visible/hidden toggle (drafts stay hidden until you flip it), and a "View / Print" link straight into the printable page.
- `components/dashboard/MemosTab.jsx` — new member-facing "Memos" tab (always in the nav, like Favorites/About): lists only memos an admin has published, each with a "View / Print" link.
- `app/memo/[id]/page.jsx` — the actual printable page: letterhead on top, then স্মারক নং/তারিখ, বিষয় (subject), and the memo body. A "Print" button (hidden when actually printing) calls `window.print()`. Global `@media print` rules added to `globals.css` hide the app's sidebar/topbar/mobile nav so what prints is just the letterhead + memo, nothing else.
- `firestore.rules` — `memos/{id}`: admin can read/write everything; a signed-in member can only read a memo where `visible == true`. Same URL works for both admin previewing a draft and a member reading a published one — the rule is what decides what's visible, not the UI.

Visibility here is **per-memo** (not a single on/off switch for the whole feature) since a memo list naturally has some published and some still drafts — that seemed like the more useful interpretation of "make it visible or invisible" for an ongoing list of documents. Let me know if you actually wanted a single global switch for the whole Memos page instead and I'll adjust.

## Phase 5: Rebrand, landing page, Bangla polish, click-to-dial

### Rebrand: IHT Portal / IHT Rangpur → তারুণ্যের শক্তি ফার্মাসিস্ট পরিষদ
Applied directly in this delivered copy (sidebar/topbar brand mark, auth pages,
`app/layout.jsx` metadata, `package.json` name, `README.md`, `components/common/Letterhead.jsx`,
About tab, landing page). Also included: `rename-brand.ps1` — a PowerShell script with the
same curated find/replace pairs, for re-running against another clone or a future fork.
It deliberately does **not** touch `lib/hospitals.json`, which contains real government
facility names like "Barishal Institute of Health Technology" — unrelated data, not this
project's branding.

Not changed (can't be done via text replace):
- `public/logo.png` — replace with your actual new logo art, same filename
- `public/IHT_Rangpur.apk` — the Android app itself would need to be rebuilt/renamed separately

### Landing page rebuild
`app/page.jsx` was previously a stub (literal leftover comments like
`{/* ... [features and footer remain the same] ... */}` — the actual sections were gone,
only the hero remained). Rebuilt in full: nav bar, hero, a "লক্ষ্য, ভিশন ও ভবিষ্যৎ পরিকল্পনা"
section (mission/vision/future plan), a features grid, the Android app download button, and
a footer — all under the new name.

### About tab
- Rewritten to match the landing page's mission/vision/future-plan content and new brand name
- Fixed the "looks narrow" issue: `.about-tab` was a single-column flex stack with no width use
  on wide screens. It's now a responsive 2-column grid (`.about-card-full` spans both columns
  for the intro/security/developer cards), so it actually fills the screen on desktop instead
  of sitting in a cramped column.

### Bangla font
Standardized on **Noto Sans Bengali** everywhere (per your instruction) — added via Google
Fonts alongside Inter, set as the primary font in `--font-body`/`--font-display`, and removed
the old "Hind Siliguri" overrides that were scattered across the landing/auth/about sections
so the whole app now uses one consistent Bangla typeface.

### Bangla content on registration + directory (bug fixes, not new features)
Found and fixed two spots that were silently storing/showing the **English** hospital/location
name even though the picker itself showed Bangla:
- `components/steps/EmploymentStep.jsx` and `components/admin/AdminEditForm.jsx`: selecting a
  hospital/office from the list now stores `hospital.nameBn` (falls back to `.name` only if a
  hospital has no Bangla name) instead of always storing the English name.
- `components/dashboard/MyProfileTab.jsx`: permanent/current address display was calling
  `getLocationLabel(...)` without the `"bn"` locale argument, so it showed English division/
  district/upazila names — now passes `"bn"`. (The Directory tab was already doing this
  correctly via `getAddressLabel(..., "bn")` — only the profile tab had the bug.)

### Directory: click-to-dial + copy phone number
New `components/common/PhoneAction.jsx`:
- `PhoneAction` — full row used on directory cards and the Committee page: the number is a
  `tel:` link (tap to call) plus a copy button with brief "copied" feedback.
- `PhoneIconLink` — compact version for the dense desktop table row (icon only, still a
  `tel:` link, tooltip shows the number).

Wired into `DirectoryTab.jsx` (both the table row and card views) and `CommitteeTab.jsx`.

## Phase 6: Financial ledger / analytics for admin

You were right — Review, Expenses, and Accounts covered the workflow but there was no
single place to actually *analyze* the fund. Added:

- `lib/fundLedger.js` — read-only projection over the existing `fundContributions` (approved
  ones only) and `fundExpenses` collections: merges both into one chronological transaction
  list with a running balance, plus a 6-month credit/debit rollup and an expense-by-category
  rollup. Nothing new is written to Firestore — this is purely a different view over data
  that already exists, so no rules changes were needed.
- `components/admin/FundLedgerPanel.jsx` — new "Ledger" sub-tab under Admin → Donations:
  - Total received / total expenses / current balance summary cards
  - A dependency-free monthly bar chart (credit vs. debit, last 6 months) — no charting
    library was in `package.json`, so this is plain SVG-free CSS bars rather than pulling in
    a new dependency for one chart
  - Expense-by-category breakdown with percentage bars
  - Full chronological transaction history showing running balance after each entry
  - "Export CSV" button — downloads the full ledger client-side, no backend endpoint needed

## Phase 7: Events & calendar, ID cards, donation certificates, public info page

### Events & calendar
- `lib/events.js` — admin CRUD for events (title, description, location, start/end time, visible flag), plus per-member RSVP stored at `events/{id}/rsvps/{uid}` (own doc per member, so Firestore rules can cleanly restrict "you can only write your own RSVP").
- `components/admin/EventsPanel.jsx` — new "Events" top-level admin tab: create/edit/delete, visible/hidden toggle, and an expandable RSVP summary (going/not-going counts + names) per event.
- `components/dashboard/EventsTab.jsx` — new member-facing "Events" tab: upcoming/past split, RSVP buttons (যাচ্ছি/যাচ্ছি না), shows the member's own current answer.
- `firestore.rules` — `events/{id}` follows the same visible-flag pattern as memos; `events/{id}/rsvps/{uid}` restricts writes to the RSVP's own owner.

### ID cards
- Added `qrcode` as a dependency (nothing suitable already in the project) to generate a verification QR code client-side — no external network call needed to render it.
- `profiles/{uid}.memberId` — new optional admin-editable field (blank falls back to a short code derived from the uid) via `AdminEditForm.jsx`.
- `app/id-card/[id]/page.jsx` — printable ID card: compact `Letterhead`, photo, name, department/session, member ID, blood group, issue date, and a QR code linking back to the card. A member can only print their own card; admins can print anyone's — enforced client-side (Firestore's existing `profiles` read rule already permits any signed-in read, same as the Directory tab already relies on).
- Entry points: "আইডি কার্ড" button on the member's own My Profile tab, and "View / Print ID card" in the admin member-edit form.

### Donation certificates
- `app/certificate/[id]/page.jsx` — printable certificate: letterhead, the member's name + total **approved** contribution amount (pulled live from `fundContributions`, so it's always in sync with the ledger — nothing new stored), and two signature lines (সাধারণ সম্পাদক / সভাপতি). Shows a friendly "no confirmed donations yet" message instead of a hollow certificate if the total is ৳0.
- Entry points: "আমার অনুদান সনদ" button on the member's own Donate tab (only shown once they have a confirmed contribution), and "Donation certificate" in the admin member-edit form.

### Public info page (no login required)
- `app/info/page.jsx` — standalone page (same layout family as the landing page) showing the committee list (name, role, photo — deliberately **not** phone/email, even though the underlying rule would technically allow it) and every **published** memo, each linking straight to its printable `/memo/[id]` page.
- `firestore.rules` changes to support this safely and narrowly:
  - `profiles/{uid}`: added `|| resource.data.committeeRoleId != null` to the read rule — an anonymous visitor can only ever read a profile that's on the committee; every other member's profile still requires sign-in, unchanged.
  - `config/{docId}`: added `|| docId == "committeeSettings"` — only the committee role-title list is public; directory settings and fund account numbers stay sign-in-gated.
  - `memos/{id}`: dropped the `isSignedIn()` requirement for `visible == true` memos — published memos are public notices by design now, both for the `/info` page and for direct `/memo/[id]` links shared outside the app.
  - New `lib/committee.js` export `usePublicCommitteeMembers()` — uses a `where("committeeRoleId", "!=", null)` query that exactly mirrors the rule condition (the same "where-clause matches rule" pattern already used by `useVisibleMemos()`/`useExpenses()`), which is what makes the query work for anonymous readers instead of the existing unfiltered `useCommitteeMembers()` (kept as-is, still used by the signed-in dashboard Committee tab).
  - Changed how "not on the committee" is stored — `null` instead of `""` — so the `!= null` rule/query pair behaves correctly. Existing role assignments made in earlier phases are unaffected; this only changes the "unassigned" sentinel going forward.
- `components/RouteGuard.jsx` — refactored to distinguish two things that used to be conflated as one "isPublic" flag: (a) the auth-gateway pages (`/`, `/login`, `/register`, `/forgot-password`), which still force a logged-in user to `/dashboard`, and (b) newly-"open" pages (`/info`, `/memo/[id]`) that anonymous visitors can reach *without* forcing a logged-in user away from them. This was necessary because the existing `/memo/[id]` print page (built in an earlier phase) needs to keep working normally for already-logged-in admins/members exactly as before, while also now being reachable by someone who followed a public link from `/info` without an account.
