# Tailwind CSS in This Project

## Current Setup (Tailwind v4 + Vite)

- **Tailwind:** v4 (with `tailwindcss` and `@tailwindcss/vite` as dev dependencies)
- **Build:** Vite processes Tailwind via the `@tailwindcss/vite` plugin (no PostCSS or `tailwind.config.js`).
- **Entry:** `src/index.css` imports Tailwind and project styles; `main.tsx` imports `./index.css`.

### Config Files

| File | Purpose |
|------|--------|
| `vite.config.ts` | Uses `tailwindcss()` from `@tailwindcss/vite` so Tailwind is compiled at build/dev time. |
| `src/index.css` | Imports `tailwindcss` and `./styles/globals.css`, plus custom `.scroller` class. |
| `src/styles/globals.css` | Theme (`@theme inline`), dark variant, base styles (`@layer base`), and shared CSS variables. |

### How We Use Tailwind

1. **Utility classes in JSX**  
   Components use Tailwind utility classes on elements via `className`, e.g.:
   - Layout: `flex`, `grid`, `space-y-6`, `gap-4`, `p-4`, `rounded-xl`
   - Typography: `text-3xl`, `text-sm`, `font-medium`
   - Colors: `bg-white`, `text-gray-666`, or inline `style={{ color: '#666' }}` where design tokens are used
   - Borders/shadows: `border`, `border-gray-200`, `shadow-sm`, `rounded-2xl`
   - Responsive: `md:grid-cols-5`, `lg:col-span-2`

2. **`cn()` helper for conditional classes**  
   Many components use the `cn()` helper from `src/components/ui/utils.ts`, which combines `clsx` and `tailwind-merge` to merge and deduplicate class names (e.g. for variants and overrides):
   ```ts
   import { cn } from '@/components/ui/utils';
   <div className={cn('base-class', isActive && 'active-class', className)} />
   ```

3. **Theme and design tokens**  
   `globals.css` defines:
   - CSS variables for colors, radius, sidebar, etc. (`:root` and `.dark`)
   - `@theme inline` so Tailwind utilities can use tokens like `bg-background`, `text-foreground`, `border-border`, `rounded-lg` (from `--radius`)

4. **Base styles**  
   In `globals.css`, `@layer base` applies:
   - Default border/outline and `bg-background` / `text-foreground` on `body`
   - Typography for `h1`–`h4`, `label`, `button`, `input` (font size, weight, line-height)

5. **Custom utilities**  
   - `.scroller` in `index.css`: horizontal scroll and smooth behavior.
   - Any project-specific utilities can be added in `globals.css` or `index.css`.

### Adding or Changing Tailwind Customization

- **New theme values (colors, spacing, etc.):** Add or edit them in `src/styles/globals.css` inside `@theme inline { ... }` and/or `:root` / `.dark`.
- **New global base styles:** Add them in `@layer base` in `globals.css`.
- **New utilities:** Add custom classes in `globals.css` or `index.css`; for Tailwind-like utilities you can use `@utility` in Tailwind v4 (see [Tailwind v4 docs](https://tailwindcss.com/docs)).

### Quick Reference

- **Docs:** [Tailwind CSS v4](https://tailwindcss.com/docs)
- **Content:** Tailwind v4 with the Vite plugin scans your source automatically; no `content` array is required in a config file.
- **Class merging:** Use `cn()` from `@/components/ui/utils` when combining conditional or override classes.
