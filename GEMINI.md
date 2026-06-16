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
- All components must be designed for standalone usage. (Note: in Angular 19+, `standalone: true` is default, but can be explicitly declared or omitted).
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
- Services reside in `src/app/core/services/` (global) or `src/app/features/[feature]/services/` (scoped).
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
  - *Exception / Variant pattern:* Tab sub-components located in `tabs` subdirectories and some shared components may just use `kebab-case.ts` (e.g., `quarantine.ts`, `sku-search.ts`, `confirm-dialog.ts`) or `kebab-case-component.ts` (e.g., `arch-component.ts`).
- **Classes/Interfaces:** `PascalCase`.
- **Variables/Methods:** `camelCase`.
- **Constants:** `UPPER_SNAKE_CASE`.

#### Styling
- Use SCSS.
- Prefer modern Sass module rules (`@use "/styles/componets/master-setup.scss" as *;`) instead of the deprecated `@import` directive.
- **Typo in Directory Path:** The directory containing component-specific global overrides is named `src/styles/componets` (spelled with `componets`). Use this exact spelling when referencing or updating files in this folder.
- Avoid inline CSS styles (`style="..."` attributes). Move layout/styling rules to scoped SCSS files or use Bootstrap utility classes.

#### Accessibility & Templates
- Every form field/input must have a corresponding `<label>` associated using the static `for="..."` and matching static `id="..."` attributes. Avoid dynamic binding (`[for]`) for this purpose as static analyzers might trigger warnings.
- Checkboxes or table action controls without visible text labels must include an `aria-label="..."` attribute.

#### Testing & Mocking Guidelines
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
- **Resolving Common Test Execution Pitfalls:**
  - **Missing Toastr Config (`InjectionToken ToastConfig`):** For components utilizing `ToastrService` in their specs, provide the service either by mocking it (`{ provide: ToastrService, useValue: toastrMock }`) or including `provideToastr()` in the test bed configuration.
  - **Missing Route Providers (`ActivatedRoute`):** Components that employ routing elements/directives (like `RouterLink` or query params) must have route configurations provided (e.g., `provideRouter([])` or a mock for `ActivatedRoute`).
  - **Invalid `HttpClient` mocking:** Ensure services using `HttpClient` are tested either with `HttpTestingController` or using a fully mock provider for the service itself, to avoid `TypeError: this.http.get is not a function` during test executions.

## Development Workflow
- **Serve:** `ng serve` (Port 4200)
- **Test:** `ng test` (runs Angular Vitest builder)
- **Build:** `ng build`

## Project Specifics
- **Auth:** Token-based authentication (JWT) stored in `localStorage` via `StorageService`.
- **Navigation:** Dynamic sidebar based on user roles and permissions fetched from the backend.
- **Notifications:** Use `ToastrService` for success/error feedback.

## VS Code Integration & Troubleshooting

### Angular Language Service Caching
- **Problem**: When refactoring class properties in TypeScript from standard arrays/objects to reactive **Angular Signals** (`signal`, `computed`), the VS Code Angular Language Service extension can cache stale types, causing false diagnostics in HTML templates (e.g., `This expression is not callable. Type '...' has no call signatures.`).
- **Solutions**:
  1. Open the VS Code command palette (`Ctrl + Shift + P` or `F1`).
  2. Run the **`Angular: Restart Angular Language Service`** command.
  3. If warnings persist, reload the workspace window by running **`Developer: Reload Window`**.

