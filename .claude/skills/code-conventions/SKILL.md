---
name: code-conventions
description: Coding conventions and rules for this project. Covers naming, file structure, components, hooks, TypeScript, styles with Unistyles, and architecture patterns.
version: 1.1.0
license: MIT
---

# Code Conventions

## Naming

### Files and Folders
- Always **kebab-case**: `user-profile.tsx`, `use-auth.ts`, `api-client.ts`
- `.tsx` for files with JSX, `.ts` for everything else

### Variables and Functions
- **camelCase**: `userData`, `fetchUser()`, `isLoading`

### Constants
- **UPPER_SNAKE_CASE** for primitives: `MAX_RETRIES`, `BASE_URL`
- No PascalCase object constants — use UPPER_SNAKE_CASE for all constants

### TypeScript Types and Interfaces
- **`T` prefix + PascalCase** for types: `TUser`, `TApiResponse`, `TAuthState`
- **`I` prefix + PascalCase** for interfaces: `IUserRepository`, `IAuthService`

---

## File Structure Rules

### One responsibility per file

Each file has exactly one job. Split by responsibility, not by size:

| File | Responsibility |
|------|---------------|
| `<name>.tsx` | Component JSX + wiring only |
| `<name>.styles.ts` | All `StyleSheet.create(...)` definitions |
| `<name>.types.ts` | TypeScript types/interfaces (when more than 1–2) |
| `<name>.constants.ts` | Constants local to this component (when more than 1–2) |

### Component folder structure

Every component lives in its own folder. Sub-components go in a nested `components/` subfolder — each with its own files:

```
components/my-component/
├── my-component.tsx
├── my-component.styles.ts
├── my-component.types.ts       # optional, only if types are non-trivial
├── my-component.constants.ts   # optional, only if constants are non-trivial
└── components/
    ├── sub-item.tsx
    ├── sub-item.styles.ts
    └── sub-item.types.ts
```

- **One component per file**, always
- Never put `StyleSheet.create` inside a `.tsx` file
- Never put types or constants shared across sub-components in a sub-component file — put them in the parent's `.types.ts` / `.constants.ts`

### Import order

  1. Third-party libraries
  2. Internal modules (aliases like `@hooks/...`, `@components/...`)
  3. Relative sibling imports (styles, types, constants, sub-components — last)

```tsx
import { useRouter } from 'expo-router'
import { View } from 'react-native'

import { useAppI18n } from '@hooks/use-app-i18n/use-app-i18n'
import { UserAvatar } from '@components/user-avatar/user-avatar'

import { stylesheet } from './user-profile.styles'
import type { TUserProfileProps } from './user-profile.types'
```

---

## Components

- **Route/screen files** (`app/**/*.tsx`) must use **default exports** as required by Expo Router
- All other components use **named exports**

```tsx
// ✅ screen (Expo Router requires default export)
export default function VehicleDetailScreen() { ... }

// ✅ component
export function VehicleCard({ vehicle }: Props) { ... }

// ❌ non-screen component with default export
export default function VehicleCard() { ... }
```

- Props typed with a `T` type, defined in the same file or a `.types.ts` file

```tsx
type TUserProfileProps = {
  userId: string
  onPress: () => void
}
```

- Keep components free of business logic — delegate to custom hooks

---

## Event Handlers — No Inline Functions

**Never** define arrow functions inline in JSX props. Always extract them to named `handleX` functions declared before the `return` statement.

```tsx
// ✅ named handler
function handleBack() {
  router.back();
}

<Pressable onPress={handleBack}>

// ✅ named render function for FlatList
function renderVehicle({ item }: { item: TVehicle }) {
  return <VehicleCard vehicle={item} onPress={handleVehiclePress} />;
}

<FlatList renderItem={renderVehicle} />

// ❌ inline arrow function
<Pressable onPress={() => router.back()}>

// ❌ inline renderItem
<FlatList renderItem={({ item }) => <VehicleCard vehicle={item} />} />
```

---

## Formatting — Prettier + ESLint (enforced on save)

Tooling: `rvest.vs-code-prettier-eslint` runs on every save (`.vscode/settings.json`).  
Config: `.prettierrc` — `singleQuote`, `semi`, `trailingComma: es5`, `printWidth: 100`.

### Always curly braces — `curly: ['error', 'all']`

Every `if`, `for`, `while` block **must** have `{}`, even single-line bodies.

```ts
// ✅
if (!row) {
  return;
}

// ❌
if (!row) return;
```

### Body always on its own line — `nonblock-statement-body-position: ['error', 'below']`

The body of a block is never on the same line as the opening brace.

```ts
// ✅
if (!row) {
  return;
}

// ❌
if (!row) { return; }
```

---

## Hooks

- All custom hooks live in `hooks/` with **kebab-case** filenames prefixed with `use-`
  - `hooks/use-auth.ts`, `hooks/use-user-profile.ts`
- Always prefix the function with `use`: `useAuth`, `useUserProfile`
- Business logic and data fetching go in hooks, not in components

```ts
// hooks/use-user-profile.ts
export const useUserProfile = (userId: string) => {
  // fetch, transform, return state
}
```

### App-prefixed abstractions

Whenever wrapping or extending a third-party hook, component, or utility, **always create an `app`-prefixed abstraction** instead of using the third-party API directly in feature code.

- Hook wrappers: `useApp<Name>` — file: `hooks/use-app-<name>/use-app-<name>.ts`
- Component wrappers: `App<Name>` — file: `components/app-<name>/app-<name>.tsx`
- Utility wrappers: `app<Name>` — file: `utils/app-<name>/app-<name>.ts`

This ensures the project always controls the API surface and makes future migrations trivial.

```ts
// ✅ hooks/use-app-i18n/use-app-i18n.ts — wraps useTranslation
export const useAppI18n = () => {
  const { t, i18n } = useTranslation()
  return { t, i18n }
}

// ❌ Using the third-party hook directly in feature code
import { useTranslation } from 'react-i18next'
```

---

## TypeScript

- **All props, return types, and function signatures must be typed**
- **Never use `any`** — use `unknown` + type narrowing if the type is truly unknown
- Prefer `type` over `interface` unless modeling an extensible contract (then use `I` prefix)

---

## Styles — Unistyles v3

All styles use `react-native-unistyles` via the project wrapper. **Never** import `StyleSheet` from `react-native` or directly from `react-native-unistyles`.

- Styles always live in a separate `<name>.styles.ts` file — never inline in `.tsx`
- Always use theme tokens for colors, spacing, radius — never hardcode values
- Export the stylesheet as `stylesheet` (named export)

```ts
// user-profile.styles.ts
import { StyleSheet } from '@hooks/use-app-style/use-app-style'

export const stylesheet = StyleSheet.create((theme, rt) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingBottom: rt.insets.bottom + theme.spacing.md,
  },
  title: {
    ...theme.typography.headline,
    color: theme.colors.textPrimary,
  },
}))
```

To access theme values in JS (e.g. as props to icons), use `useAppStyle()`:

```tsx
// user-profile.tsx
import { useAppStyle } from '@hooks/use-app-style/use-app-style'
import { stylesheet } from './user-profile.styles'

export const UserProfile = () => {
  const { theme } = useAppStyle()
  return (
    <View style={stylesheet.container}>
      <Icon color={theme.colors.textSecondary} />
    </View>
  )
}
```

---

## Comments

- All comments must be in **English** — no exceptions.
- Only add a comment when the logic is non-obvious. Never describe what the code already says.
- Do not use decorative section banners (`// ─── Header ───`, `// === Section ===`, etc.).

---

## Separators

Never use a dedicated `<View>` component as a visual divider between list items. Apply `borderBottomWidth` / `borderTopWidth` directly on the item's style. A separator component is a sign of missing style encapsulation.

```tsx
// ✅ border lives on the item
option: {
  paddingVertical: 15,
  borderBottomWidth: 1,
  borderBottomColor: theme.colors.surfaceSeparator,
}

// ❌ raw separator View
<View style={{ height: 1, backgroundColor: theme.colors.surfaceSeparator }} />

// ❌ ItemSeparatorComponent with a View inside
ItemSeparatorComponent={() => <View style={stylesheet.separator} />}
```

---

## Architecture Principles

- **DRY**: Never duplicate logic. If something is used more than once, extract it.
- **Modularize**: Small, focused files with a single responsibility.
- **Separate concerns**: UI in components, logic in hooks, API calls in services.
- **Named exports everywhere**: Enables better tree-shaking and explicit imports (exception: Expo Router screen files).
