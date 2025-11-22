# Theme System

Centralized theme constants for consistent styling across the application.

## Usage

Import theme constants from `@/theme`:

```tsx
import { gradients, shadows, colors, spacing } from '@/theme';
```

## Available Constants

### Gradients

```tsx
import { gradients } from '@/theme';

// Primary gradient (used in buttons, headers)
sx={{ background: gradients.primary }}

// Primary hover state
sx={{ background: gradients.primaryHover }}

// Card gradient
sx={{ background: gradients.card }}

// Other gradients
gradients.pink
gradients.purple
gradients.blue
gradients.amber
```

### Shadows

```tsx
import { shadows } from '@/theme';

sx={{ boxShadow: shadows.primary }}
sx={{ boxShadow: shadows.primaryHover }}
sx={{ boxShadow: shadows.dialog }}
sx={{ boxShadow: shadows.card }}
```

### Colors

```tsx
import { colors } from '@/theme';

// Icon colors for StatCard
const bgColor = colors.iconColors.primary;  // 'primary.light'

// Variant type colors
const chipColor = colors.variantTypes.DOMESTIC;  // 'primary'
```

### Border Radius

```tsx
import { borderRadius } from '@/theme';

sx={{ borderRadius: borderRadius.card }}  // 3
sx={{ borderRadius: borderRadius.button }}  // 2
```

### Spacing

```tsx
import { spacing } from '@/theme';

sx={{ gap: spacing.md }}  // 3
sx={{ padding: spacing.lg }}  // 4
```

### Transitions

```tsx
import { transitions } from '@/theme';

sx={{ transition: `all ${transitions.normal} ease` }}  // '0.2s'
```

### Font Weights

```tsx
import { fontWeights } from '@/theme';

sx={{ fontWeight: fontWeights.semibold }}  // 600
```

## Examples

### Using in Components

```tsx
import { gradients, shadows, spacing } from '@/theme';

function MyButton() {
  return (
    <Button
      sx={{
        background: gradients.primary,
        boxShadow: shadows.primary,
        padding: spacing.md,
        '&:hover': {
          background: gradients.primaryHover,
          boxShadow: shadows.primaryHover,
        },
      }}
    >
      Click Me
    </Button>
  );
}
```

### Already Integrated

The following components already use the theme system:

- **FormDialog**: Uses `gradients.primary`, `gradients.primaryHover`, `shadows.primary`, `shadows.primaryHover`, `shadows.dialog`

## Benefits

✅ **Consistency**: Same gradients and colors across all components
✅ **Maintainability**: Update theme in one place, reflect everywhere
✅ **Type Safety**: TypeScript autocomplete and validation
✅ **Performance**: Constants are defined once and reused
✅ **Documentation**: Self-documenting with clear constant names
