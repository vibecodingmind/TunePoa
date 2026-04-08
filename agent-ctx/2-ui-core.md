# Task 2-ui-core: CORE UI Rebuild

## Summary
Complete rewrite of all 7 core UI files for the TunePoa platform with professional quality, consistent emerald design system, and proper component architecture.

## Files Modified/Created (7 total)

| File | Status | Lines | Description |
|------|--------|-------|-------------|
| `src/lib/store.ts` | Rewritten | ~200 | Enhanced Zustand store with token expiry, role helpers, default view routing |
| `src/components/tunepoa/landing-page.tsx` | Rewritten | 904 | Full professional landing page with all 9 sections |
| `src/components/tunepoa/login-form.tsx` | Rewritten | ~190 | Login with icons, eye toggle, demo accounts, loading state |
| `src/components/tunepoa/register-form.tsx` | Rewritten | ~270 | Full registration with strength bar, category dropdown, auto-login |
| `src/components/tunepoa/sidebar.tsx` | Rewritten | ~220 | w-64 sidebar with sections, Sheet mobile overlay, emerald active border |
| `src/components/tunepoa/topbar.tsx` | NEW | ~130 | Topbar with title, search, notifications, user dropdown |
| `src/app/page.tsx` | Rewritten | ~75 | Clean auth routing with ViewRouter and AppLayout |

## Design System Applied
- **Primary**: emerald-600 (buttons, active states, accents)
- **Accent**: amber (step numbers, badges, stars)
- **Neutrals**: slate (text, borders, backgrounds)
- **No indigo/blue** anywhere
- **Lucide icons** only, no emoji
- **shadcn/ui** components throughout
- **Mobile-first** responsive design

## Backward Compatibility
- `useAppStore()` preserved with aliases: `currentUser`, `isLoggedIn`, `login`
- All existing tunepoa components continue to work unchanged
- Store interface unchanged (setAuth, logout, navigate, toggleSidebar, etc.)

## Verification
- ESLint: 0 errors
- Dev server: compiles and renders successfully
- All auth flows (login/register/logout) functional
