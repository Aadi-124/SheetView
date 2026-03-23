export function getAuthToken(): string | null {
  return localStorage.getItem('token'); // adapt to your auth
}
export function isLoggedIn(): boolean {
  return !!getAuthToken();
}
``