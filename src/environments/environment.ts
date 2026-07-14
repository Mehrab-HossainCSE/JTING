// Fallback values only. The real apiUrl is loaded at startup from assets/.env
// (see src/main.ts) so it can be changed after a build with no rebuild needed.
export const environment = {
  production: true,
  apiUrl: 'http://192.168.0.132:8082/api'
};
