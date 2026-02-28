# Architecture Overview

## Navigation Model

Game Mate uses a **flat string-key state machine** (not a router library) for navigation. This mirrors how React Native's `NavigationContainer` / `createNativeStackNavigator` works under the hood, making a future port straightforward.

```tsx
// App.tsx — simplified
const [currentScreen, setCurrentScreen] = useState<string>('welcome');

const handleNavigate = (screen: string, data?: any) => {
  setPreviousScreen(currentScreen);
  setCurrentScreen(screen);
  setScreenData(data);            // optional data payload (e.g. group object)
};

const handleBack = () => {
  const backMap: Record<string, string> = {
    'group-detail':   'groups',
    'chat':           'social',
    'settings':       'profile',
    'blocked-users':  'privacy-settings',
    // ... etc
  };
  setCurrentScreen(backMap[currentScreen] ?? 'news');
};
```

### Why a flat state machine vs. React Router?

- **Single-file clarity** — All navigation rules live in one place (`App.tsx`), matching how a mobile navigator works.
- **React Native parity** — `currentScreen` maps 1:1 with screen names in `createNativeStackNavigator`.
- **Data passing** — `screenData` is equivalent to React Navigation's `route.params`.
- **AnimatePresence** — Wrapping `renderScreen()` in `AnimatePresence` gives enter/exit transitions that correspond to `cardStyleInterpolator` in React Native.

---

## Component Architecture

Each screen is a **self-contained component** following this pattern:

```tsx
/**
 * @component ScreenName
 * Receives navigation callbacks; owns its own UI state.
 * No global store — state is lifted to App.tsx only for screen routing.
 */
export function ScreenName({ onBack, onNavigate }: Props) {
  // 1. Local UI state
  const [localState, setLocalState] = useState(...);

  // 2. Derived values / computed
  const derived = useMemo(...);

  // 3. Event handlers (prefixed handle*)
  const handleAction = () => { ... };

  // 4. JSX — motion.div wrappers for enter/exit animation
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      ...
    </motion.div>
  );
}
```

### State ownership rules

| State type          | Owned by      | Notes                              |
|---------------------|---------------|------------------------------------|
| Current screen      | `App.tsx`     | Single source of truth             |
| Previous screen     | `App.tsx`     | Used for dynamic back targets      |
| Screen data/params  | `App.tsx`     | Cleared on back navigation         |
| Onboarding complete | `App.tsx`     | Gates tab-bar visibility           |
| UI / form state     | Each screen   | Not lifted — local to the screen   |

---

## Animation Patterns

All animations use **motion/react** (formerly Framer Motion).

### Screen entrance

```tsx
// Full-screen slide from right (stack push)
<motion.div
  initial={{ x: '100%' }}
  animate={{ x: 0 }}
  exit={{ x: '100%' }}
  transition={{ type: 'spring', damping: 30, stiffness: 300 }}
/>

// Fade (overlay / modal)
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
/>
```

### Micro-interactions

```tsx
// Tap scale feedback (all interactive elements)
<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} />

// Spring pop-in (cards, list items)
<motion.div
  initial={{ scale: 0, rotate: -180 }}
  animate={{ scale: 1, rotate: 0 }}
  transition={{ type: 'spring', damping: 15 }}
/>
```

### Staggered lists

```tsx
{items.map((item, index) => (
  <motion.div
    key={item.id}
    initial={{ x: -20, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    transition={{ delay: index * 0.05 }}
  />
))}
```

---

## Theming System

Theme tokens live in `/src/styles/theme.css`. The app is **dark-first** — all main screens use `bg-[#1A1A1A]` surfaces. Onboarding screens flip to `bg-[#F5F5F5]` (light) to create a distinct first-run feel.

### Toggle switch pattern (reused across settings screens)

```tsx
const ToggleSwitch = ({ enabled, onToggle }) => (
  <motion.button
    whileTap={{ scale: 0.9 }}
    onClick={onToggle}
    className={`relative w-14 h-8 rounded-full transition-colors ${
      enabled ? 'bg-[#66FF9F]' : 'bg-[#3A3A3A]'
    }`}
  >
    <motion.div
      animate={{ x: enabled ? 24 : 2 }}
      className="absolute top-1 w-6 h-6 bg-[#F5F5F5] rounded-full"
    />
  </motion.button>
);
```

---

## Icon System

Two icon libraries are used deliberately:

| Library                | Usage                                                        |
|------------------------|--------------------------------------------------------------|
| `lucide-react`         | General UI (back arrows, search, mail, lock, bell, etc.)     |
| `@phosphor-icons/react`| Gaming-specific & branded icons (Discord, Twitter, Trophy)   |

**No emoji** characters are used anywhere in the UI. All decorative and informational indicators use icon components.

---

## Toast Notifications

Centralised in `/src/app/utils/toasts.tsx`. Each function wraps `sonner`'s `toast` with a consistent icon and duration.

```tsx
// Usage
import { showSuccessToast, showErrorToast } from '../utils/toasts';

showSuccessToast('Profile saved', 'Your changes are live');
showErrorToast('Failed to connect', 'Check your internet connection');
```

Toaster is mounted once in `App.tsx` with a dark theme:

```tsx
<Toaster
  position="top-center"
  toastOptions={{
    style: { background: '#2A2A2A', color: '#F5F5F5', border: '1px solid #3A3A3A' }
  }}
/>
```

---

## Data Layer

The app currently uses **static mock data** embedded in each component. There is no API layer or global store.

### Adding a real backend

1. Create `/src/app/services/` directory.
2. Add `api.ts` (Axios/fetch wrapper) and service files per domain (`groups.ts`, `users.ts`, etc.).
3. Use React Query or SWR for server state management.
4. Replace mock arrays in each screen with hook calls (`useGroups()`, `useProfile()`, etc.).
5. Connect to Supabase for auth, realtime chat, and database persistence.
