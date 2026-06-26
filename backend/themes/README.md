# Themes directory

This folder contains theme packages used by the landing page editor.

Structure:

- `themes/{themeId}/` — each theme in its own folder
  - `theme.json` — metadata and CSS defaults for the theme (required)
  - `preview.png` or `preview.svg` — thumbnail used in the editor (optional)
  - `README.md` — developer instructions specific to this theme (recommended)
  - other assets (icons, fonts, images)

Theme format rules and guidance are in `themes/theme-spec.md`.

When a theme is selected in the editor the UI should:
- Load the theme's `theme.json` and apply CSS defaults where fields are present.
- For fields defined in `theme.json.fields` the editor UI should render the appropriate input type (color, select, boxShadow editor, numeric input, etc.).
- If a theme provides a default for a property (e.g. `boxShadow`), that value is used unless the user overrides it via the editor.

Developers: follow `themes/theme-spec.md` when creating new themes so the editor and API can detect and render configuration inputs automatically.
