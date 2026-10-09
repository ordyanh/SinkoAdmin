// ================================================================
// Admin Token Management for Transparent Access
// ================================================================

// Default long-lived valid token signed with HorecaAuth key: F62FB33D-D05B-47DB-8D66-D9CA4113E9FB!
// Claims: Role=3 (Owner), EmployeeRole=SuperAdmin, Sub=admin-owner-001, Email=admin@synco.am
export const DEFAULT_ADMIN_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6ImFkbWluLW93bmVyLTAwMSIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL2VtYWlsYWRkcmVzcyI6ImFkbWluQHN5bmNvLmFtIiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy9yb2xlIjoiMyIsInN1YiI6ImFkbWluLW93bmVyLTAwMSIsImVtYWlsIjoiYWRtaW5Ac3luY28uYW0iLCJFbXBsb3llZUlkIjoiZW1wLWFkbWluLTAwMSIsIkVtcGxveWVlUm9sZSI6IlN1cGVyQWRtaW4iLCJVc2VyUm9sZSI6IjMiLCJSb2xlIjoiMyIsImlzcyI6IkhvcmVjYUF1dGgiLCJhdWQiOiJIb3JlY2FBdXRoIiwibmJmIjoxNzkxNTQ0NDYxLCJpYXQiOjE3OTE1NDQ0NjEsImV4cCI6MjEwNjkwNDUyMX0.PIus5ZjA7GV6qNvx4UkHWbbDManX3ohMA4ssxLmyTSw";

const TOKEN_KEY = "sinko_admin_jwt";

export function getAdminToken(): string {
  try {
    const saved = localStorage.getItem(TOKEN_KEY);
    if (saved && saved.trim().length > 10) return saved.trim();
  } catch {
    // localStorage might not be available
  }
  return DEFAULT_ADMIN_TOKEN;
}

export function setAdminToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // ignore
  }
}
