# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

JTING is a warehouse/inventory management application built with **Angular 21** and a **.NET REST API** backend. It uses zoneless change detection and Angular Signals for reactive state.

## Commands

```bash
ng serve        # Dev server at http://localhost:4200
ng build        # Production build → dist/
ng test         # Run Vitest unit tests
ng build --watch --configuration development  # Watch mode
```

## Architecture

### Directory Structure

```
src/app/
  core/          # App-wide singletons
    guards/        # auth.guard.ts — protects all non-auth routes
    interceptors/  # auth.interceptor.ts — attaches Bearer token to every request
    models/        # Shared interfaces (ApiResponse, auth models, etc.), plus per-feature
                   # subfolders mirroring domains (models/setups/<entity>/, models/receives/<entity>/,
                   # models/picking/, models/delivery/, models/cancellation/, ...)
    services/      # Global services (AuthService, LoaderService, StorageService, MenuService...),
                   # plus per-feature subfolders named <domain>Services/ (setupServices/,
                   # receiveServices/, pickingServices/, deliveryServices/, cancellationServices/,
                   # roleManageServices/, userManageServices/, navMenusServices/, skuServices/).
                   # New feature work should follow this per-domain subfolder pattern, not add
                   # flat files alongside the older global services/models.
  features/      # Feature modules (lazy-loaded)
    auth/          # Login (public, no layout)
    dashboard/
    picking/       # Tabs: picking, transfer-restore
    receive/       # Tabs: auto-receive, manual-receive, barcode-generation, ...
    delivery/
    master/
    users/
    products/
    Employee/
    report/
    help/
  layout/        # MainLayoutComponent wraps all protected routes
    header/
    sidebar/       # Dynamic menu from backend based on user roles
    main-layout/
  shared/
    components/    # confirm-dialog, loader, tab-placeholder
src/styles/
  abstracts/       # Mixins and variables
  componets/       # Component-level global SCSS overrides (note: intentional typo in dirname)
```

### Routing Pattern

All protected routes are children of `MainLayoutComponent`, guarded by `authGuard`. Feature modules use lazy loading via `loadChildren`. Tabs within features (e.g., `picking`, `transfer-restore`) are nested child routes with their own sub-pages.

### API Communication

All HTTP calls use `HttpClient` through feature/core services. Every response must conform to:

```typescript
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string[] | null;
  errorCode: string | null;
  traceId: string | null;
}
```

The `authInterceptor` automatically appends `Authorization: Bearer <token>` to all outbound requests. The token is read from `localStorage` via `StorageService`.

### Runtime Config (.env)

`apiUrl` is not baked into the build. `public/assets/.env` holds a single `API_URL=<url>` line and is copied into `dist/**/assets/.env` on every `ng build`. Before bootstrap, `src/main.ts` fetches `assets/.env` and, if it parses an `API_URL` line, overwrites `environment.apiUrl` with it. `src/environments/environment.ts` only holds a fallback value used when the fetch fails or the file has no `API_URL` line.

This means the backend URL can be repointed after a build/deploy by editing the deployed `assets/.env` file directly — no rebuild needed. When changing it for local dev, edit `public/assets/.env` (not `environment.ts`).

### State Management

Use Angular Signals exclusively — no NgRx or BehaviorSubject patterns. In services, keep internal state private and expose read-only signals:

```typescript
private readonly _isLoading = signal<boolean>(false);
readonly isLoading = this._isLoading.asReadonly();
```

Use `inject()` for all dependency injection (not constructor injection).

### Loading Overlay

`LoaderService` is a global singleton with debounce/min-duration logic (shows after 250 ms, visible for at least 350 ms). `<app-loader />` is declared once in `AppComponent`. Sub-components must **not** add it to their templates — just inject the service and call `loaderService.show()` / `loaderService.hide()`.

### Styling

- SCSS only; no inline `style="..."` attributes.
- Import the global setup via `@use "/styles/componets/master-setup.scss" as *;` (note: `componets` is the real directory name — do not correct the spelling).
- Bootstrap 5 + Bootstrap Icons are available globally.

## Coding Standards

**File naming:** `kebab-case.type.ts` for most files. Tab-level sub-components in `tabs/` subdirectories use just `kebab-case.ts` (e.g., `transfer-restore.ts`, `picking.ts`). Exception: per-feature service/model subfolder names use camelCase, not kebab-case (e.g., `setupServices/`, `deliveryServices/`, `cancellationServices/`) — this is existing convention, don't "fix" it to kebab-case.

**Accessibility:** Every form input must have a static `for`/`id` pair on its label. Controls without visible labels need `aria-label`.

## Testing (Vitest)

Common pitfalls and their fixes:

- **`ToastrService` injection error** → provide `provideToastr()` or mock `{ provide: ToastrService, useValue: toastrMock }` in `TestBed`.
- **`ActivatedRoute` not found** → add `provideRouter([])` to the test bed.
- **`HttpClient` errors** → use `HttpTestingController` or mock the whole service.

## Auth Flow

JWT stored in `localStorage` by `StorageService`. `AuthService.login()` stores `token`, `userName`, `refreshToken`, and `userInfo`. `AuthService.logout()` clears all keys including `menus` and `scanned_barcodes`.

## VS Code Tip

If HTML templates show false signal-related type errors after refactoring, run **`Angular: Restart Angular Language Service`** from the command palette (then **`Developer: Reload Window`** if errors persist).
