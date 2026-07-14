# Figma design token exports

These JSON files are **Figma exports for reference only**. They are not imported by the application build.

Runtime design tokens live in:

- `frontend/src/themes/` — colors, spacing, fonts, radius (applied via CSS variables)
- `frontend/src/styles/index.css` — global styles and theme-specific overrides

When updating the design system, sync changes into `frontend/src/themes/` rather than expecting these files to be picked up automatically.
