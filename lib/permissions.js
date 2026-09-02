"use client";

export const ROLES = {
  USER: "user",
  ADMIN: "admin",
  CASHIER: "cashier",
  OFFICE_SECRETARY: "office_secretary",
};

export const ROLE_LABELS = {
  [ROLES.USER]: "Regular user",
  [ROLES.ADMIN]: "Admin",
  [ROLES.CASHIER]: "Cashier",
  [ROLES.OFFICE_SECRETARY]: "Office Secretary",
};

export const ROLE_OPTIONS = [
  { value: ROLES.USER, label: "Regular user" },
  { value: ROLES.CASHIER, label: "Cashier" },
  { value: ROLES.OFFICE_SECRETARY, label: "Office Secretary" },
  { value: ROLES.ADMIN, label: "Admin" },
];

// Dashboard tabs are available to every signed-in role. Role-based access is
// limited to admin-panel views.
export const DASHBOARD_TAB_WHITELIST = {
  [ROLES.ADMIN]: null,
  [ROLES.USER]: null,
  [ROLES.CASHIER]: null,
  [ROLES.OFFICE_SECRETARY]: null,
};

// Admin panel view keys accessible per role.
// null  = all views
// array = only the listed views
export const ADMIN_VIEW_WHITELIST = {
  [ROLES.ADMIN]: null,
  [ROLES.USER]: [],
  [ROLES.CASHIER]: ["notifications", "donations"],
  [ROLES.OFFICE_SECRETARY]: ["memos", "events", "notifications"],
};

// Canonical ordering of admin views (used to pick a sensible default)
export const ADMIN_VIEW_ORDER = [
  "members",
  "settings",
  "notifications",
  "donations",
  "committee",
  "memos",
  "events",
  "tabs",
];

export function isAdmin(role) {
  return role === ROLES.ADMIN;
}

export function isOfficeSecretary(role) {
  return role === ROLES.OFFICE_SECRETARY;
}

export function isCashier(role) {
  return role === ROLES.CASHIER;
}

export function hasAdminAccess(role) {
  return role === ROLES.ADMIN || role === ROLES.CASHIER || role === ROLES.OFFICE_SECRETARY;
}

export function canAccessAdminView(role, view) {
  const whitelist = ADMIN_VIEW_WHITELIST[role];
  if (whitelist === null || whitelist === undefined) return true;
  return whitelist.includes(view);
}

export function getVisibleAdminViews(role) {
  const whitelist = ADMIN_VIEW_WHITELIST[role];
  if (whitelist === null || whitelist === undefined) {
    return [...ADMIN_VIEW_ORDER];
  }
  return ADMIN_VIEW_ORDER.filter((v) => whitelist.includes(v));
}

export function getDefaultAdminView(role) {
  const views = getVisibleAdminViews(role);
  return views[0] || "members";
}

export function getVisibleDashboardTabs(tabs, role, hiddenTabs) {
  if (role === ROLES.ADMIN) return tabs;
  const whitelist = DASHBOARD_TAB_WHITELIST[role];
  if (whitelist === null || whitelist === undefined) {
    return tabs.filter((t) => !hiddenTabs.includes(t.key));
  }
  return tabs.filter((t) => whitelist.includes(t.key));
}
