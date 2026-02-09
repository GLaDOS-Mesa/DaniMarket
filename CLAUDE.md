# DaniMarket Development Guidelines

This file contains the development rules and conventions for the DaniMarket project. Claude Code will follow these guidelines when writing or modifying code.

## Language

- **All code must be in English**: variable names, function names, comments, commit messages (except for user-facing text in Italian)
- User-facing text (UI labels, messages, placeholders) should be in Italian
- Documentation files can be in Italian or English

## Tech Stack

- **Framework**: Nuxt 3 with TypeScript
- **Styling**: Tailwind CSS
- **Database**: Prisma ORM with PostgreSQL (Neon)
- **Image Upload**: Cloudinary
- **Deployment**: Vercel

## Code Conventions

### TypeScript
- Use strict TypeScript
- Define interfaces/types for all props, API responses, and complex objects
- Prefer `type` over `interface` for simple types
- Use `Record<K, V>` for object maps

### Vue Components
- Use `<script setup lang="ts">` syntax (Composition API)
- Component files in PascalCase: `ListingCard.vue`
- Page files in kebab-case: `new.vue`, `[id].vue`
- Define props with `defineProps<T>()`
- Use `computed()` for derived state
- Use `ref()` for reactive state

### Tailwind CSS
- Mobile-first approach: base styles for mobile, then `sm:`, `md:`, `lg:`, `xl:`
- Use the custom `primary` color palette defined in `tailwind.config.ts`
- Prefer utility classes over custom CSS
- Group related classes logically (layout, spacing, colors, effects)

## Accessibility (WCAG 2.2)

Every page and component MUST include:

### Navigation & Structure
- Skip link to main content
- Semantic HTML elements (`header`, `nav`, `main`, `section`, `article`)
- Proper heading hierarchy (h1 → h2 → h3)
- `aria-label` on navigation elements

### Interactive Elements
- `aria-label` on buttons with only icons
- `aria-expanded` and `aria-controls` on expandable menus
- `aria-pressed` on toggle buttons
- Visible focus ring on all interactive elements: `focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`

### Images & Icons
- `alt` text on all informative images
- `aria-hidden="true"` on decorative icons/images
- `role="img"` with `aria-label` on icon containers that convey meaning

### Dynamic Content
- `role="status"` and `aria-live="polite"` for dynamic content updates
- `sr-only` class for screen-reader-only text

### Forms
- Associate labels with inputs using `for`/`id` or wrapping
- Use `aria-describedby` for error messages and hints
- Mark required fields with `aria-required="true"`

## Git Conventions

### Commits
- Use [Conventional Commits](https://www.conventionalcommits.org/)
- Format: `type(scope): description`
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- Always include: `Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>`

### Examples
```
feat(ui): add listing creation form
fix(api): handle empty image array
docs: update README with setup instructions
chore: add .claude to gitignore
```

### Workflow
- **NEVER commit or push automatically** - only when explicitly requested by the user
- Make atomic commits (one feature/fix per commit)
- Keep commits small and focused

## UI/UX Guidelines

### Design Principles
- Clean, simple, uncluttered interface
- Mobile-first responsive design
- Designed for non-technical users
- Clear visual feedback on interactions

### Components
- Use consistent spacing (Tailwind's spacing scale)
- Cards with `rounded-xl shadow-sm hover:shadow-md`
- Buttons with clear hover and focus states
- Form inputs with visible borders and focus states

### Colors
- Primary actions: `bg-primary-600 hover:bg-primary-700`
- Text: `text-gray-900` (headings), `text-gray-600` (body), `text-gray-500` (muted)
- Backgrounds: `bg-gray-50` (page), `bg-white` (cards)
- Status colors: green (active), gray (draft), blue (sold), yellow (archived)

## File Structure

```
DaniMarket/
├── app.vue                 # Root component
├── nuxt.config.ts          # Nuxt configuration
├── tailwind.config.ts      # Tailwind configuration
├── prisma/
│   └── schema.prisma       # Database schema
├── assets/
│   └── css/
│       └── tailwind.css    # Tailwind entry point
├── components/             # Reusable Vue components
├── composables/            # Vue composables (shared logic)
├── layouts/                # Page layouts
├── pages/                  # File-based routing
├── server/
│   ├── api/                # API endpoints
│   └── utils/              # Server utilities (prisma, cloudinary)
├── public/                 # Static assets
│   └── logos/              # Platform logos
└── types/                  # TypeScript type definitions
```

## API Design

- RESTful endpoints in `server/api/`
- Use proper HTTP methods (GET, POST, PUT, DELETE)
- Return consistent JSON responses
- Handle errors with appropriate status codes
- Validate input data before processing
