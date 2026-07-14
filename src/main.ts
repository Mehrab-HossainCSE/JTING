import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app.component';
import { environment } from './environments/environment';

fetch('assets/.env', { cache: 'no-store' })
  .then((res) => {
    if (!res.ok) {
      console.warn(`[runtime-config] assets/.env returned HTTP ${res.status}; using fallback apiUrl`);
      return '';
    }
    return res.text();
  })
  .then((text) => {
    const match = text.match(/^API_URL\s*=\s*(.+)$/m);
    if (match) {
      environment.apiUrl = match[1].trim();
    } else if (text) {
      console.warn('[runtime-config] assets/.env has no API_URL line; using fallback apiUrl');
    }
  })
  .catch((err) => {
    console.warn('[runtime-config] failed to load assets/.env; using fallback apiUrl', err);
  })
  .finally(() => {
    bootstrapApplication(App, appConfig).catch((err) => console.error(err));
  });
