# ReMind Frontend Design System

## Purpose

This document is the visual and interaction source of truth for the ReMind Expo application on Android and Web. Apply it to new screens and use it when revising existing UI.

ReMind is a mental-health support and expert-discovery product. The interface should feel calm, credible, private, and easy to scan. It should not feel clinical, sterile, playful, or like a marketing landing page.

## Product Experience

### Design character

- Soft and calm, with confident professional structure.
- Quietly premium through spacing, typography, and restrained motion.
- Friendly without childish illustrations or decorative clutter.
- Clear enough for users who may feel stressed, distracted, or uncertain.
- Mobile-first for Android, with an efficient wider layout for Web.

### Adapted taste direction

The local design skills include high-variance web and marketing-page ideas. ReMind uses the compatible parts: polished navigation, strong spacing, visual hierarchy, restrained glass treatment, useful imagery, responsive grids, clear states, and motion with purpose.

Do not apply landing-page-only patterns to the signed-in product. ReMind does not need cinematic hero sections, AIDA sections, large CTA bands, scroll hijacking, or GSAP-driven choreography inside operational screens. The app uses Expo and React Native, so implement with React Native primitives and Expo-compatible libraries.

## Color System

### Primary palette

Use teal as the primary brand color and soft blue as the supporting calm color. The interface must not become a one-note teal surface. Most screen area should remain neutral.

| Token | Value | Usage |
| --- | --- | --- |
| `color.brand.700` | `#176B68` | Primary buttons, active navigation, selected controls |
| `color.brand.600` | `#23817D` | Hover, pressed, focused emphasis |
| `color.brand.100` | `#DDF1EF` | Selected chips, soft highlighted rows |
| `color.brand.050` | `#EFF8F7` | Subtle section tint |
| `color.calmBlue.600` | `#477FA3` | Secondary informational emphasis only |
| `color.calmBlue.100` | `#DFEEF7` | Informational badge background |
| `color.calmBlue.050` | `#F2F8FC` | Optional informational surface |

### Neutral palette

| Token | Value | Usage |
| --- | --- | --- |
| `color.ink.900` | `#172A2A` | Primary text |
| `color.ink.700` | `#365252` | Secondary text |
| `color.ink.500` | `#617878` | Metadata and placeholders |
| `color.canvas` | `#F7FAF9` | Main page background |
| `color.surface` | `#FFFFFF` | Forms, cards, navigation surfaces |
| `color.surfaceMuted` | `#EEF4F3` | Segmented controls, quiet panels |
| `color.border` | `#D6E2E0` | Default borders |
| `color.borderStrong` | `#AFC4C2` | Focused and emphasized borders |

### Semantic palette

| Token | Value | Usage |
| --- | --- | --- |
| `color.success` | `#267A57` | Approved, available, saved |
| `color.successBg` | `#E4F4EB` | Success status background |
| `color.warning` | `#9A6A1E` | Pending, limited availability |
| `color.warningBg` | `#FAF0D9` | Warning status background |
| `color.error` | `#A04747` | Errors, destructive actions |
| `color.errorBg` | `#F9E7E7` | Error status background |
| `color.info` | `#477FA3` | Neutral information |
| `color.infoBg` | `#DFEEF7` | Information background |

### Color rules

- Primary actions use `brand.700` with white text.
- Soft blue supports informational states. It does not compete with teal for primary actions.
- Avoid purple, neon accents, blue-purple glow, and decorative gradients.
- Avoid beige-heavy wellness styling. Use cool, clean neutrals.
- Status colors communicate state, not decoration.
- Do not rely on color alone. Pair status color with a label or icon.
- All text, placeholder, input, and focus states must meet WCAG AA contrast.

## Typography

Use one calm sans-serif family across Android and Web. Start with the Expo system sans-serif stack for performance and consistency. If brand typography is added later, prefer `Inter` or `Geist` with self-hosted assets.

| Style | Size | Weight | Line height | Usage |
| --- | --- | --- | --- | --- |
| `display` | `32` | `700` | `40` | Product name or rare empty-state heading |
| `screenTitle` | `24` | `700` | `32` | Screen title |
| `sectionTitle` | `18` | `700` | `24` | Section heading |
| `cardTitle` | `16` | `700` | `22` | Expert name, forum title |
| `body` | `15` | `400` | `22` | Main readable text |
| `bodyStrong` | `15` | `600` | `22` | Labels and emphasized body text |
| `meta` | `13` | `500` | `18` | Metadata and helper text |
| `caption` | `12` | `600` | `16` | Status and compact labels |

Typography rules:

- Keep letter spacing at `0`.
- Use sentence case. Avoid excessive uppercase text.
- Use uppercase only for short status labels when scanning improves.
- Do not use hero-scale typography inside application panels.
- Do not mix serif and sans-serif styles.
- Body copy should remain readable at stressful moments: short lines, clear labels, and direct wording.

## Spacing And Shape

Use a 4-point spacing base.

| Token | Value |
| --- | --- |
| `space.1` | `4` |
| `space.2` | `8` |
| `space.3` | `12` |
| `space.4` | `16` |
| `space.5` | `20` |
| `space.6` | `24` |
| `space.8` | `32` |
| `space.10` | `40` |

Shape lock:

- Inputs and buttons: `8px` radius.
- Cards and panels: `8px` radius.
- Chips and compact status badges: `8px` radius.
- Avatars: `8px` radius for expert images; circles only when a screen clearly represents a personal account avatar.
- Avoid pill-shaped controls except a compact binary toggle or status capsule where pill geometry improves recognition.
- Avoid nested cards. Use borders, spacing, or a muted surface to separate sections.

## Elevation And Surfaces

- Prefer one-pixel borders and spacing over heavy shadow.
- Use a light shadow only for floating navigation, modals, and menus on Web.
- For a premium Web navigation surface, a subtle frosted-glass approximation is acceptable: translucent white fill, one-pixel border, slight blur, and solid white fallback. Do not use glass effects behind dense text or on Android if readability suffers.
- Keep content cards solid white so mental-health information remains easy to read.

## Iconography

- Use one icon family consistently. For Expo, prefer `@expo/vector-icons` with a single selected family until a dedicated cross-platform icon library is introduced.
- Use familiar icons for search, account, back, filter, close, report, bookmark, and overflow actions.
- Pair unfamiliar icons with accessible labels or tooltips on Web.
- Standardize icon optical size: `18` for compact controls, `20` for common actions, `24` for bottom navigation.
- Do not hand-draw SVG icons.

## Navigation

### Android

Use a bottom navigation bar for major product destinations:

1. `Experts`
2. `Forum`
3. `Notifications`
4. `Account`

Admin screens appear as an account-level entry, not a permanent tab for ordinary users.

### Web

Use a calm top navigation bar with the same major destinations. Keep it on one line and no taller than `72px`. A compact account menu sits on the right.

Navigation rules:

- Active destination uses teal icon/text and a soft teal background or indicator.
- Keep navigation visible and predictable. Avoid floating experimental layouts that reduce clarity.
- Use a back action on detail screens.
- Preserve the user position when moving from a list to a detail view and back.

## Core Components

### Buttons

- Primary: solid `brand.700`, white label, `48px` minimum height.
- Secondary: white surface, `brand.700` label, `borderStrong` border.
- Tertiary: icon or text-only command for low-emphasis actions.
- Destructive: `error` only for confirmed destructive actions.
- Use icons for familiar tool actions where possible.
- Disable buttons during backend writes and show concise progress text or a spinner.

### Inputs

- Label above input.
- Helper text below label when needed.
- Inline validation below the input.
- `48px` minimum touch height.
- Clear focus border and optional soft focus ring.
- Search fields may use a leading search icon and a trailing clear icon.

### Segmented Controls

Use segmented controls for short mode selections such as:

- `Sign in` / `Sign up`
- `Student` / `Expert`
- Search mode where filters cannot fit comfortably in a menu

Do not use segmented controls when a filter menu or chip row is more compact.

### Chips

- Use chips for specialties, languages, consultation methods, and active filters.
- Selected filter chip: `brand.100` background with `brand.700` text and border.
- Unselected chip: white or muted surface with neutral border.
- Avoid rendering too many chips. Show a concise subset in list rows and all values in detail screens.

### Status Badges

- `Available`: success palette.
- `Limited`: warning palette.
- `Unavailable`: neutral palette.
- `Pending approval`: warning palette.
- `Approved`: success palette.
- `Suspended` or `Removed`: error palette.

### Expert List Item

Expert search results should be a dense, calm list rather than oversized decorative cards.

Required information:

- Expert image or neutral fallback.
- Display name.
- Short professional headline.
- Availability status.
- Up to three specialty chips and up to two language chips.
- Clear press state.

On Web, use a list-detail layout at wider widths. On Android, open a full detail screen.

### Empty, Loading, And Error States

- Loading: skeleton rows when practical; spinner only for short isolated waits.
- Empty search: explain that no approved experts match the current filters and provide a clear reset action.
- Error: show contextual inline text with a retry action.
- Never leave a blank screen after failure.

## Screen Patterns

### Expert Search

The expert directory is the first useful guest screen.

Android:

- Screen title and account shortcut.
- Search input.
- Horizontal filter chips or a compact filter sheet.
- Expert list.
- Expert detail opens as a separate screen.

Web:

- Top navigation.
- Search and filter toolbar.
- Two-column layout from `900px`: result list on the left and selected profile detail on the right.
- At narrower widths, collapse to the Android-style single column.

Search rules:

- Show only approved, active, public expert profiles.
- Private onboarding, credentials, license files, notes, account data, and payout details must never appear in this UI.
- Use a visible reset action when filters are active.

### Account And Authentication

- Keep sign-in and sign-up calm and short.
- Request only required fields during registration.
- Put role choice close to sign-up fields.
- Explain expert onboarding only after account creation, not as a large pre-sign-up text block.
- Place errors inline and keep entered values intact.

### Forum

- Favor readable discussion lists over card-heavy layouts.
- Use category chips, concise metadata, and clear author role labels.
- Forum group discussions live inside the forum model, not as a separate chat-style destination.
- Guests can browse public content; posting and joining actions prompt sign-in.

### Admin

- Admin surfaces should be operational and denser than guest screens.
- Use tables or structured lists on Web and stacked review rows on Android.
- Keep approval state, report state, and audit-related actions visible.
- Require confirmation for destructive moderation actions.

## Responsive Rules

- Android-first layout baseline: `360px` width and up.
- Compact Web/mobile collapse: `< 768px`, one content column.
- Medium Web: `768px - 899px`, one content column with wider spacing.
- Wide Web: `>= 900px`, list-detail layouts where useful.
- Constrain primary Web content to approximately `1120px - 1280px`.
- Fixed-format elements such as navigation, avatar rows, filters, and buttons need stable dimensions so loading and hover states do not shift layout.
- Text must wrap cleanly and never overlap adjacent controls.

## Motion

Motion intensity target: restrained `3/10` for product screens.

- Use `120ms - 220ms` transitions for press, focus, tab, sheet, and list-detail changes.
- Use gentle opacity and small translation changes only.
- Expert card hover on Web may use a subtle border/elevation change. Avoid large image scaling in operational lists.
- Respect reduced-motion preferences.
- Avoid scroll hijacking, parallax, decorative background movement, and continuous animation.

## Imagery

- Use real, respectful expert portraits where available.
- Provide a neutral fallback avatar with a teal-tinted surface.
- Avoid dark, blurred, or generic stock wellness images.
- Do not use decorative illustrations as a substitute for actual expert information.
- If later adding an onboarding or empty-state illustration, keep it simple, calm, and secondary to the task.

## Accessibility And Trust

- Minimum touch target: `44px`, prefer `48px` for primary controls.
- Use accessible labels for icon-only controls.
- Support keyboard focus on Web.
- Maintain WCAG AA contrast for content and controls.
- Use direct language. Avoid clinical promises, diagnosis language, and exaggerated reassurance.
- Never expose private expert credential or account data in guest-readable UI or public Firestore documents.

## Expo Implementation Notes

- Implement tokens in a shared TypeScript theme module before restyling screens.
- Prefer reusable React Native components: `Screen`, `AppHeader`, `Button`, `Input`, `Chip`, `StatusBadge`, `ExpertListItem`, `EmptyState`, and `InlineError`.
- Use `Platform.select` only when Android and Web genuinely need different behavior.
- Use responsive width checks or a responsive utility compatible with Expo for list-detail collapse.
- Keep Firebase reads and callable Function writes outside visual components.
- Do not introduce Tailwind, GSAP, or a Web-only component library unless the Expo architecture changes deliberately.

## Review Checklist

Before completing a frontend change, verify:

- The screen feels calm and professional, not decorative or clinical.
- Teal is the single primary action accent; soft blue remains secondary.
- Neutral surfaces prevent a one-note teal UI.
- Card, input, chip, and button radii follow the documented `8px` rule.
- No nested cards or unnecessary card-heavy layout appears.
- Mobile and Web layouts both fit without overlap or horizontal scrolling.
- Loading, empty, error, and disabled states exist.
- Guest-facing expert data contains public fields only.
- Motion is subtle and respects reduced-motion preferences.
- Text contrast and touch targets meet accessibility requirements.
## Forum Landing Layout
- The first screen should feel like a calm forum workspace: top app bar, compact navigation, central question feed, and a right rail for must-read posts and featured links on wide screens.
- On mobile, the same content stacks in this order: navigation/search, feed, support panels.
- Keep the existing teal, soft blue, white, and neutral surface palette. Do not introduce orange, purple, or high-chroma accents from external references.
- Use 8px-radius repeated cards only for forum posts and compact rail panels; avoid decorative nested cards.
## Motion Behavior
- Page changes use a short soft slide-and-fade transition, around 240-280ms, with eased-out motion.
- Buttons and tappable cards use subtle press feedback: small scale-down on press, quick spring back on release, and no dramatic bounce.
- Motion should support calm trust: no shaking, spinning, flashing, high-speed transitions, or attention-grabbing decorative animation.