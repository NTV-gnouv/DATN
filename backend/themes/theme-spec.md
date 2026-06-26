Theme specification (theme-spec.md)

Purpose
- Define a canonical JSON format every theme must provide so the editor and backend can automatically discover theme metadata, default CSS values, and the list of configurable fields (with types).

Location
- Place per-theme package at `themes/{themeId}/theme.json`.

Minimal `theme.json` structure

{
  "id": "minimal",
  "name": "Minimal Theme",
  "preview": "preview.png",
  "version": "1.0.0",
  "description": "Simple minimal theme used as the default.",
  "cssDefaults": {
    "colors": {
      "headerTextAndIcon": "#111111",
      "socialBlockBackground": "#ffffff",
      "socialBlockText": "#111111",
      "contentBlockBackground": "#ffffff",
      "contentBlockText": "#111111",
      "contentBlockButton": "#111111"
    },
    "divLayout": {
      "widthPercent": 92,
      "border": { "width": 1, "style": "solid", "color": "#e6e6e6", "radius": 8 },
      "boxShadow": { "enabled": true, "x": 0, "y": 6, "blur": 18, "spread": 0, "color": "rgba(16,24,40,0.06)" }
    },
    "typography": { "fontFamily": "Inter" }
  },
  "fields": [
    { "key": "typography.fontFamily", "type": "font-select", "label": "Font chữ", "options": ["Inter","Roboto","Poppins","Montserrat","Lora","Playfair Display","Noto Sans","System"] },
    { "key": "divLayout.widthPercent", "type": "number", "label": "Chiều ngang (%)" },
    { "key": "divLayout.border.width", "type": "number", "label": "Chiều rộng border (px)" },
    { "key": "divLayout.border.color", "type": "color", "label": "Màu border" },
    { "key": "divLayout.border.radius", "type": "number", "label": "Border radius" },
    { "key": "divLayout.boxShadow.enabled", "type": "boolean", "label": "Shadow mặc định theo theme" },
    { "key": "colors.headerTextAndIcon", "type": "color", "label": "Tiêu đề & biểu tượng" },
    { "key": "colors.socialBlockBackground", "type": "color", "label": "Nền khối social" },
    { "key": "colors.socialBlockText", "type": "color", "label": "Chữ khối social" }
  ]
}

Notes for implementers
- `cssDefaults` contains values the editor should apply as initial values for the theme. When a field exists here the editor should show the relevant control (see `fields`) and allow the user to override.
- `fields` is a flat list declaring which UI controls the editor should render and where to store the value in the page/header block state. Use dotted `key` paths for nested fields.
- Supported `type` values: `color`, `number`, `select`, `font-select`, `box-shadow`, `border`, `boolean`, `text`, `url`.
