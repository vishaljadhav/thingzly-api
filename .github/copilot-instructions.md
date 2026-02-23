# Elevate React CMS - AI Coding Instructions

## Architecture Overview

This is a **frontend-only React CMS** for workforce management (staffing agencies, workers, shifts). **No backend server** - removed Drizzle/DB code in favor of third-party API integration. Key structural decisions:

- **Single-page app** with `wouter` routing (not React Router)
- **Password gate**: `ArcadePasswordScreen` component with hardcoded password `"Optime2025!!"` blocks access until unlocked
- **Admin-focused UI**: Main workflow is `/admin` landing → specific management pages
- **Theme system**: Custom `ThemeProvider` with localStorage persistence (`"elevate-theme"`)
- **Component library**: Shadcn/ui components in `client/src/components/ui/`

## Technology Stack Requirements

- **React**: Latest React.js with TypeScript
- **Build Tool**: Vite for fast development and bundling
- **State Management**: Redux Toolkit with Redux Saga for async operations
- **API Calls**: Axios for HTTP requests
- **UI Framework**: Material UI for component library
- **Design Pattern**: Atomic Design principles
- **API Layer**: All API calls handled through Redux Saga
- **Backend (if needed)**: Fastify with AWS Lambda
- **Testing**: Cypress for E2E testing
- **Code Style**: Airbnb JavaScript Style Guide
- **Linting/Formatting**: ESLint + Prettier
- **Version Control**: Git with GitHub


## Key Development Patterns

### File Organization (Atomic Design + Feature-Based Structure)

```
src/
├── assets/             # Static resources
│   ├── css/scss/      # SCSS styles
│   ├── icons/         # Icon assets
│   └── images/        # Images
├── components/         # Reusable components (Atomic Design)
│   ├── atoms/         # Basic UI elements (Button, Input, Icon)
│   ├── molecules/     # Composite components (SearchBar, Card)
│   ├── organisms/     # Complex components (Header, Sidebar)
│   ├── containers/    # Higher-order components
│   └── hooks/         # Custom React hooks
├── config/            # Configuration files
├── interfaces/        # TypeScript type definitions
├── locals/           # Internationalization
├── navigator/        # Route management
├── store/            # Global Redux configuration
├── utils/            # Utility functions
└── views/            # Feature modules
    ├── auth/         # Authentication
    ├── homepage/     # Homepage
    ├── dashboard/    # Dashboard
    └── community-assets/ # Community assets
```

### Feature Module Structure (Modular Architecture)

Each feature should follow this structure:

```
src/views/[feature-name]/
├── index.tsx           # Main component
├── components/         # Feature-specific components
├── store/             # Redux store, actions, reducers, sagas (use slice)
└── types/             # TypeScript interfaces
```

### Critical Workflows

- **Dev**: `npm run dev` (Vite dev server)
- **Build**: `npm run build` (outputs to `client/dist/`)
- **Type check**: `npm run check`

### Import Patterns

- Use path aliases: `@/` for `client/src/`, `@shared/` for shared types
- Import types from `@shared/types` (not old `@shared/schema`)
- UI components: `@/components/ui/button`, `@/components/ui/card`, etc.

### State & Data Management (Redux Architecture)

- **Redux Toolkit**: Modern Redux with createSlice
- **Redux Saga**: Handle all API calls and side effects
- **State Structure**: Each API slice must follow this initial state pattern:

```typescript
{
  data: null,
  isFetching: false,
  isSuccess: false,
  isError: false,
  error: null,
}
```

### Redux Slice Pattern


- Each API endpoint should have its own slice file
- Each slice should include the following action creators and reducers:

- `[apiName]Request` - Initiate API call
- `[apiName]Success` - Handle successful response
- `[apiName]Failure` - Handle error response
- `[apiName]Reset` - Reset state to initial values

Example:

```typescript
// userSlice.ts
const userSlice = createSlice({
  name: "user",
  initialState: {
    data: null,
    isFetching: false,
    isSuccess: false,
    isError: false,
    error: null,
  },
  reducers: {
    getUserRequest: (state) => {
      state.isFetching = true;
    },
    getUserSuccess: (state, action) => {
      state.data = action.payload;
      state.isFetching = false;
      state.isSuccess = true;
    },
    getUserFailure: (state, action) => {
      state.error = action.payload;
      state.isFetching = false;
      state.isError = true;
    },
    resetUser: () => initialState,
  },
});
```

### UI/UX Conventions

- **Card-based layouts** with shadcn Card component
- **Modal patterns**: Dialog components for create/edit forms
- **Toast notifications**: `useToast()` hook for user feedback
- **Responsive design**: Tailwind classes, mobile-first approach
- **Accessibility**: ARIA labels, keyboard navigation, `data-testid` attributes

### Navigation Structure

- **Main navigation**: Horizontal menu in `Navigation` component
- **Protected routes**: All behind password screen
- **Admin section**: `/admin` → `/admin/jobs`, `/admin/workers`, etc.
- **Back navigation**: `BackToAdmin` component for breadcrumbs

### Code Organization Principles

1. **Feature-based folder structure**: Group related files by feature
2. **Separation of concerns**: Keep UI, logic, and state separate
3. **TypeScript**: Use strict typing for type safety
4. **Custom hooks**: Extract reusable logic into custom hooks
5. **Environment variables**: Use env variables instead of hardcoding sensitive data
6. **Atomic Design**: Structure components hierarchically (atoms → molecules → organisms)
7. **Consistent naming conventions**: Clear and descriptive names for files, variables, and functions
8. **Documentation**: Comment complex logic and maintain README files for modules
9. **Testing**: Write E2E tests for critical user flows with Cypress
10. **Performance optimization**: Lazy load components and optimize bundle size
11. **Development workflow**: Create View/Pages first, then build components, then integrate state management and API calls
12. **Development workflow**: Create new files for each feature e.g. Views/Pages → Components → Store (Redux Slice + Saga) → Types

### Form Handling Example

```tsx
const form = useForm<FormData>({
  resolver: zodResolver(schema),  // Zod validation
  defaultValues: { ... }
});

// Submit with Redux Saga API call
const onSubmit = (data) => {
  dispatch(createUserRequest(data));
};
```

### API Integration Pattern

```typescript
// saga.ts
function* createUserSaga(action: PayloadAction<UserData>) {
  try {
    const response: ApiResponse = yield call(
      apiService.createUser,
      action.payload
    );
    yield put(createUserSuccess(response.data));
  } catch (error) {
    yield put(createUserFailure(error.message));
  }
}
```

### Development Workflow Enhancements

#### Code Quality

- **ESLint + Prettier**: Enforce consistent code style
- **Husky + lint-staged**: Pre-commit hooks for quality checks
- **Bundle Analyzer**: Monitor and optimize bundle size

#### Documentation

- **Storybook**: Component documentation and testing
- **API Documentation**: OpenAPI/Swagger integration
- **Architecture Decision Records**: Document technical decisions

#### Performance Monitoring

- **React Developer Tools Profiler**: Identify performance bottlenecks
- **Web Vitals**: Monitor real-user performance metrics
- **Bundle Analysis**: Track bundle size growth

### Theme Integration

```tsx
const { theme, toggleTheme } = useTheme();
// Automatic localStorage persistence
// CSS classes: "light" or "dark" on document root
```

## Common Anti-Patterns to Avoid

- Don't import from `@shared/schema` (removed)
- Don't create backend routes or DB queries
- Don't use React Router (use `wouter` Link and Route)
- Don't hardcode API endpoints (prepare for third-party integration)
- Don't hardcode sensitive data (use environment variables)
- Don't mix UI logic with business logic (use custom hooks)
- Don't ignore TypeScript errors (maintain strict type safety)
- Don't skip pre-commit hooks (maintain code quality standards)

## Key Files for Context

- `client/src/App.tsx` - Main app structure and routing
- `shared/types.ts` - All TypeScript interfaces for domain objects
- `client/src/contexts/ThemeContext.tsx` - Theme management
- `components.json` - Shadcn configuration
- `client/src/components/Navigation.tsx` - Main navigation component
