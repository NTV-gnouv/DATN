# CSS Architecture

## 📦 Overview

CSS đã được tách từ file `global.css` monolithic (7,275 dòng) thành **21 module CSS nhỏ hơn** để dễ quản lý, bảo trì và mở rộng.

## 📁 Cấu trúc thư mục

```
styles/
├── global.css          # (deprecated - phục vụ backup)
└── modules/
    ├── index.css       # ← Import tất cả modules (entry point)
    ├── variables.css
    ├── typography.css
    ├── forms.css
    ├── buttons.css
    ├── layout.css
    ├── auth.css
    ├── dashboard-rail.css
    ├── dashboard.css
    ├── blocks.css
    ├── editor.css
    ├── editor-avatar.css
    ├── editor-background.css
    ├── editor-colors.css
    ├── modals.css
    ├── ai-chat.css
    ├── social.css
    ├── domain.css
    ├── preview.css
    ├── toasts.css
    ├── public.css
    └── utilities.css
```

## 📋 Mô tả các module

### **variables.css** (3 rules)

CSS variables, color schemes, root styles và resets

- `:root` - biến CSS toàn cục (màu, spacing, shadows, radius)
- `*` - box-sizing reset
- `html, body, #root` - base styles

### **typography.css** (14 rules)

Typography, text utilities, font styles

- `.eyebrow` - eyebrow text style
- `.muted-copy` - muted text color
- `.brand-lockup` - brand logo + text layout
- `.brand-logo` - logo image styling

### **forms.css** (21 rules)

Form inputs, fields, và form-related styles

- `.input` - input elements styling
- `.field` - field container
- `.field-label` - label styling
- `.field-hint`, `.field-error` - helper text
- Input states (focus, color picker, etc.)

### **buttons.css** (14 rules)

Button styles và variants

- `.btn` - base button styles
- `.btn-primary`, `.btn-secondary`, `.btn-ghost` - variants
- `.btn-full` - full-width buttons
- Button states (hover, disabled, etc.)

### **layout.css** (4 rules)

Main layout shells (auth, dashboard, site)

- `.auth-shell` - auth page grid layout
- `.dashboard-shell` - dashboard grid layout
- `.site-shell` - public site shell

### **auth.css** (11 rules)

Authentication page styles

- `.auth-shell-aside` - left aside panel with background image
- `.auth-shell-panel` - right panel with form
- `.auth-card` - auth form card
- `.auth-form` - form styling
- `.auth-links` - auth action links

### **dashboard-rail.css** (34 rules)

Dashboard navigation rail

- `.dashboard-rail` - vertical navigation bar
- `.rail-link` - navigation links
- `.rail-menu` - menu items
- `.rail-group` - group containers
- Rail states (active, hover, etc.)

### **dashboard.css** (45 rules)

Dashboard components và layout

- `.dashboard-stage` - main content area
- `.dashboard-hero` - header section
- `.dashboard-list-header` - list headers
- `.page-row` - page list items
- `.slug-status` - status indicators
- Dashboard modals, grids, etc.

### **blocks.css** (23 rules)

Block card components

- `.block-card` - card styling
- `.block-grid` - card grid layout
- `.dashboard-add-block` - add block button
- Block drag/drop states

### **editor.css** (37 rules)

Editor layout và components

- `.editor-layout` - two-column editor layout
- `.editor-left-pane`, `.editor-right-pane` - pane styling
- `.editor-stack` - content stacking
- `.editor-section-divider` - section separators
- `.editor-modal` - modal styling
- Domain/slug controls

### **editor-avatar.css** (44 rules)

Avatar editor và profile styles

- `.editor-avatar-*` - avatar component styles
- `.editor-avatar-preview` - preview display
- `.editor-avatar-shape-*` - shape picker
- `.editor-avatar-style-*` - style selector
- `.editor-avatar-size-*` - size controls
- Profile panel styles

### **editor-background.css** (15 rules)

Background editor styles

- `.editor-background-panel` - background editor panel
- `.background-mode-*` - mode picker styles
- `.ai-background-*` - AI background generation
- Background upload button

### **editor-colors.css** (15 rules)

Color editor styles

- `.editor-color-*` - color editing controls
- `.editor-color-grid` - color picker grid
- `.editor-color-row` - color row styling
- Color input styling

### **modals.css** (14 rules)

Modal dialogs

- `.dashboard-modal` - modal container
- `.dashboard-modal-backdrop` - modal overlay
- `.dashboard-modal-header`, `.dashboard-modal-body` - modal sections
- `.editor-modal` - editor modal styling

### **ai-chat.css** (74 rules)

AI chatbot component styles

- `.ai-chatbot-shell` - main chatbot container
- `.ai-chat-thread` - chat message thread
- `.ai-chat-bubble` - message bubble styling
- `.ai-chat-compose` - message input area
- `.ai-chat-quick-chip` - quick action chips
- Loading animations và states

### **social.css** (10 rules)

Social links editor

- `.social-links-*` - social links container
- `.social-link-row` - individual link row
- `.social-platform-select` - platform selector
- Social link input styling

### **domain.css** (8 rules)

Domain/slug editor

- `.editor-domain-*` - domain input styling
- `.editor-slug-*` - slug input styling
- Domain control styling

### **preview.css** (12 rules)

Preview và phone frame styles

- `.phone-preview` - phone frame container
- `.phone-preview-screen` - phone screen area
- `.editor-preview-*` - preview action buttons
- Phone frame scrollbar styling

### **toasts.css** (11 rules)

Toast notification styles

- `.editor-toast` - toast container
- `.editor-toast.is-success`, `.editor-toast.is-error` - variants
- `.editor-toast-icon` - icon styling
- Toast animations (toast-up)

### **public.css** (48 rules)

Public page styles

- `.site-hero` - hero section
- `.public-hero` - public page hero
- `.public-link-card` - link card styling
- Public page layout

### **utilities.css** (545 rules)

Animations, utilities, responsive styles

- `@keyframes` - all CSS animations
- `@media` - responsive breakpoints
- General utility classes
- Special utility states

## 🔄 Import Order

`index.css` imports modules theo thứ tự sau (vì lý do dependency):

1. **variables.css** - CSS variables (phụ thuộc không)
2. **typography.css** - Font styles
3. **forms.css** - Form controls
4. **buttons.css** - Button styles
5. **layout.css** - Main layouts
6. **auth.css** - Auth page
7. **public.css** - Public pages
8. **dashboard-rail.css** - Navigation
9. **dashboard.css** - Dashboard content
10. **blocks.css** - Block components
11. **editor.css** - Editor layout
12. **editor-avatar.css** - Avatar editor
13. **editor-background.css** - Background editor
14. **editor-colors.css** - Color editor
15. **modals.css** - Modals
16. **domain.css** - Domain editor
17. **preview.css** - Preview
18. **toasts.css** - Notifications
19. **ai-chat.css** - AI Chat
20. **social.css** - Social links
21. **utilities.css** - Animations & responsive

## 🚀 Cách sử dụng

### Thêm CSS mới

1. **Xác định loại style** - Nó thuộc về component nào?
2. **Chọn module phù hợp** - Hoặc tạo module mới nếu cần
3. **Thêm CSS** - Vào file module tương ứng
4. **Import nếu cần** - Nếu tạo module mới, thêm import trong `index.css`

### Sửa CSS hiện tại

1. **Tìm class CSS** - Sử dụng tên class để xác định module
2. **Mở file module** - Ví dụ: `.btn-primary` → `buttons.css`
3. **Chỉnh sửa** - Thêm, sửa, hoặc xóa rules
4. **Test** - Kiểm tra styling trong browser

### Refactoring styles

1. **Di chuyển CSS** - Giữa các modules nếu cần
2. **Sơn lại** - Đặt tên lại classes nếu cần rõ ràng hơn
3. **Xóa duplicate** - Nếu có CSS trùng lặp giữa modules
4. **Update imports** - Nếu thay đổi cấu trúc module

## 💡 Best Practices

✅ **Do's:**

- Giữ CSS được tổ chức bằng modules
- Sử dụng CSS variables từ `variables.css`
- Đặt tên class theo BEM hoặc component naming
- Thêm comment cho complex styles
- Group media queries ở cuối mỗi module

❌ **Don'ts:**

- Không thêm CSS trực tiếp vào `global.css`
- Không tạo inline styles
- Không import `global.css` - sử dụng `modules/index.css`
- Không để CSS orphaned (không sử dụng)

## 🔍 Finding Styles

### Bằng class name

- `.btn-primary` → `buttons.css`
- `.editor-layout` → `editor.css`
- `.ai-chatbot-shell` → `ai-chat.css`

### Bằng component

- Auth page → `auth.css`
- Dashboard → `dashboard.css` hoặc `dashboard-rail.css`
- Editor → `editor*.css` modules

### Bằng tính năng

- Animations → `utilities.css`
- Responsive → `utilities.css`
- Forms → `forms.css`
- Modals → `modals.css`

## 📊 Statistics

| Metric                | Value                       |
| --------------------- | --------------------------- |
| Original `global.css` | 7,275 lines                 |
| CSS Rules Total       | 1,002 rules                 |
| Modules               | 21 files                    |
| Largest module        | `utilities.css` (545 rules) |
| Smallest module       | `layout.css` (4 rules)      |
| Average rules/module  | 47.7 rules                  |

## 🔄 Migration từ global.css

Nếu bạn có custom CSS từ `global.css`:

1. Tìm class tương ứng trong files
2. Thêm CSS mới vào module phù hợp
3. Nếu không có module phù hợp, thêm vào `utilities.css`
4. Update import nếu cần

## ❓ FAQ

**Q: Tại sao có 545 rules trong utilities.css?**
A: Vì `utilities.css` chứa tất cả `@keyframes` animations và `@media` responsive rules, phục vụ nhiều modules.

**Q: Tôi có thể thêm module mới không?**
A: Có! Tạo file `.css` mới trong thư mục `modules/`, sau đó thêm `@import` vào `index.css`.

**Q: Có ảnh hưởng đến performance không?**
A: Không. CSS được flatten bởi build process thành file single `.css`.

**Q: Tôi nên organize thế nào nếu CSS quá lớn?**
A: Tách thành sub-modules hoặc dùng CSS-in-JS/component-scoped CSS.

---

**Cuối cùng cập nhật**: 2026-06-23
