# JTING - Project Instructions

## Overview
JTING is a modern warehouse/inventory management application built with **Angular 21** and a **.NET Backend**. This project emphasizes high performance through zoneless change detection and reactive state management using Angular Signals.

## Core Mandates

### Technical Stack
- **Frontend:** Angular 21 (Standalone Components, Signals, Zoneless)
- **State Management:** Angular Signals (`signal`, `computed`, `effect`)
- **Backend:** .NET REST API (External)
- **Styling:** SCSS, Bootstrap 5, Bootstrap Icons
- **Testing:** Vitest, Angular TestBed
- **Utilities:** `ngx-toastr`, `sweetalert2`, `xlsx`

### Architectural Patterns

#### 1. Angular Standalone & Zoneless
- All components must be `standalone: true`.
- Change detection is **Zoneless** (`provideZonelessChangeDetection()`).
- Avoid `NgModules`. Use `appConfig` for global providers.

#### 2. Dependency Injection
- Prefer the `inject()` function over constructor injection for services, routers, and other dependencies.
  ```typescript
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  ```

#### 3. Reactive State (Signals)
- Use `signal()` for component-level state and service-level shared state.
- Expose read-only versions of signals to components: `readonly isLoggedIn = this._isLoggedIn.asReadonly();`.
- Use `computed()` for derived state.

#### 4. Service Layer & API Communication
- Services should reside in `src/app/core/services/` (global) or `src/app/features/[feature]/services/` (scoped).
- All API calls must use `HttpClient`.
- API responses must follow the `ApiResponse<T>` interface:
  ```typescript
  export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    errors: string[] | null;
    errorCode: string | null;
    traceId: string | null;
  }
  ```

#### 5. Directory Structure
- `src/app/core/`: Application-wide singletons (Guards, Interceptors, Models, Services).
- `src/app/features/`: Feature-based organization (Components, Routes, Scoped Services).
- `src/app/shared/`: Reusable UI components and utilities.
- `src/app/layout/`: Global layout components (Header, Sidebar, Main Layout).
- `src/styles/`: Global SCSS, abstracts (mixins, variables), and component-specific overrides.

### Coding Standards

#### Naming Conventions
- **Files:** `kebab-case.type.ts` (e.g., `user-profile.component.ts`, `auth.service.ts`).
- **Classes/Interfaces:** `PascalCase`.
- **Variables/Methods:** `camelCase`.
- **Constants:** `UPPER_SNAKE_CASE`.

#### Styling
- Use SCSS.
- Import abstracts from `src/styles/abstracts/` for consistent variables and mixins.
- Prefer Bootstrap utility classes for layout and spacing.

#### Testing
- Use **Vitest** for all unit tests.
- Mock external dependencies (services, HttpClient) using standard testing patterns.
- Follow the existing `.spec.ts` pattern:
  ```typescript
  describe('ServiceName', () => {
    let service: ServiceName;
    beforeEach(() => {
      TestBed.configureTestingModule({});
      service = TestBed.inject(ServiceName);
    });
    // ... tests
  });
  ```

## Development Workflow
- **Serve:** `ng serve` (Port 4200)
- **Test:** `ng test` (Vitest)
- **Build:** `ng build`

## Project Specifics
- **Auth:** Token-based authentication (JWT) stored in `localStorage` via `StorageService`.
- **Navigation:** Dynamic sidebar based on user roles and permissions fetched from the backend.
- **Notifications:** Use `ToastrService` for success/error feedback.
