# 🎨 CSS Refactoring - Summary & Guide

## ✅ Công việc đã hoàn thành

### 📊 Kết quả

| Aspect              | Before                | After                             |
| ------------------- | --------------------- | --------------------------------- |
| **File count**      | 1 file (`global.css`) | 22 files (21 modules + index.css) |
| **Lines of code**   | 7,275 lines           | Tách thành 21 modules             |
| **Total rules**     | 1 monolithic file     | 1,002 CSS rules organized         |
| **Organization**    | Chỉ có 1 file lớn     | 21 modules chuyên biệt            |
| **Maintainability** | Khó tìm kiếm          | Dễ dàng, theo component           |

### 📁 Cấu trúc mới

```
src/styles/
├── global.css              # ⚠️ Deprecated (backup for reference)
├── README.md               # 📚 Complete documentation
└── modules/
    ├── index.css           # ← Entry point (import tất cả)
    ├── variables.css       # CSS variables & root
    ├── typography.css      # Typography & text
    ├── forms.css           # Form inputs & fields
    ├── buttons.css         # Button styles
    ├── layout.css          # Main layout shells
    ├── auth.css            # Auth page
    ├── dashboard-rail.css  # Navigation rail
    ├── dashboard.css       # Dashboard content
    ├── blocks.css          # Block components
    ├── editor.css          # Editor layout
    ├── editor-avatar.css   # Avatar editor
    ├── editor-background.css # Background editor
    ├── editor-colors.css   # Color editor
    ├── modals.css          # Modal dialogs
    ├── ai-chat.css         # AI chatbot
    ├── social.css          # Social links
    ├── domain.css          # Domain/slug
    ├── preview.css         # Preview & phone
    ├── toasts.css          # Toast notifications
    ├── public.css          # Public pages
    └── utilities.css       # Animations & responsive
```

### ✨ Lợi ích

✅ **Quản lý dễ dàng**

- Mỗi module chứa một khía cạnh cụ thể
- Dễ tìm kiếm CSS cho một component
- Dễ thêm/sửa/xóa styles

✅ **Bảo trì tốt hơn**

- Ít xung đột CSS hơn
- Dễ phát hiện duplicate styles
- Dễ tái sử dụng styles

✅ **Mở rộng hiệu quả**

- Thêm module mới khi cần
- Organize code theo logic
- Clean separation of concerns

✅ **Performance không ảnh hưởng**

- Vite/build tool sẽ flatten tất cả CSS
- Single `.css` file khi production
- Zero runtime overhead

## 🚀 Cách bắt đầu sử dụng

### 1️⃣ Bắt đầu Dev Server

```bash
cd front-end
npm install  # nếu cần
npm run dev
```

Styles sẽ load từ `modules/index.css` - tất cả đều tự động!

### 2️⃣ Tìm kiếm CSS

**Muốn sửa button?** → Mở `buttons.css`
**Muốn sửa form?** → Mở `forms.css`
**Muốn sửa editor?** → Mở `editor*.css`

Xem bảng mapping dưới đây ⬇️

### 3️⃣ Thêm CSS mới

Thêm vào module phù hợp. Ví dụ:

```css
/* Trong modules/buttons.css */
.btn-new-variant {
	background: var(--green);
	color: #fff;
}
```

Không cần update imports - tất cả đã sẵn sàng!

### 4️⃣ Tạo Module mới (nếu cần)

```bash
# Tạo file mới
touch src/styles/modules/my-component.css
```

Thêm import trong `modules/index.css`:

```css
@import './my-component.css';
```

## 🗺️ Quick Reference - Tìm CSS

### By Component Type

| Component            | File                    |
| -------------------- | ----------------------- |
| 🔘 Buttons           | `buttons.css`           |
| 📝 Forms & Inputs    | `forms.css`             |
| 📱 Mobile Preview    | `preview.css`           |
| 🎨 Avatar Editor     | `editor-avatar.css`     |
| 🌈 Color Picker      | `editor-colors.css`     |
| 🖼️ Background Editor | `editor-background.css` |
| 💬 AI Chat           | `ai-chat.css`           |
| 🔗 Social Links      | `social.css`            |
| 🌐 Public Pages      | `public.css`            |
| 📢 Toast Messages    | `toasts.css`            |
| 🚪 Modals            | `modals.css`            |
| 🧭 Navigation Rail   | `dashboard-rail.css`    |
| 📊 Dashboard         | `dashboard.css`         |
| 🔐 Auth Page         | `auth.css`              |
| ✏️ Editor            | `editor.css`            |
| 🎬 Animations        | `utilities.css`         |

### By Class Pattern

| Pattern                               | File                 |
| ------------------------------------- | -------------------- |
| `.btn-*`                              | `buttons.css`        |
| `.input`, `.field-*`                  | `forms.css`          |
| `.editor-avatar-*`                    | `editor-avatar.css`  |
| `.editor-color-*`                     | `editor-colors.css`  |
| `.ai-chat*`, `.ai-chatbot-*`          | `ai-chat.css`        |
| `.dashboard-*`                        | `dashboard.css`      |
| `.rail-*`                             | `dashboard-rail.css` |
| `.social-link*`                       | `social.css`         |
| `.phone-preview*`                     | `preview.css`        |
| `.editor-toast*`                      | `toasts.css`         |
| `.editor-modal*`, `.dashboard-modal*` | `modals.css`         |
| `.site-hero*`, `.public-*`            | `public.css`         |
| `@keyframes`, `@media`                | `utilities.css`      |

## 📋 Module Details

### Phân bố Rules

```
utilities.css           545 rules (animations, @media, shared)
ai-chat.css             74 rules (largest component module)
editor-avatar.css       44 rules
dashboard.css           45 rules
public.css              48 rules
dashboard-rail.css      34 rules
editor.css              37 rules
blocks.css              23 rules
forms.css               21 rules
editor-background.css   15 rules
editor-colors.css       15 rules
modals.css              14 rules
buttons.css             14 rules
typography.css          14 rules
auth.css                11 rules
toasts.css              11 rules
social.css              10 rules
domain.css               8 rules
preview.css             12 rules
layout.css               4 rules
variables.css            3 rules
────────────────────────────
TOTAL                 1,002 rules
```

## 🔄 Import Order (tại sao đặt hàng này?)

1. **variables.css** - CSS variables (phải first vì được sử dụng ở mọi nơi)
2. **typography.css** - Text styles
3. **forms.css** - Form controls
4. **buttons.css** - Buttons (sử dụng typography)
5. **layout.css** - Main layouts
6. **auth.css** - Auth page (sử dụng layout)
7. **public.css** - Public pages
8. **dashboard-rail.css** - Navigation
9. **dashboard.css** - Dashboard content
10. **blocks.css** - Block components
11. **editor.css** - Editor layout
    12-21. **Specialized editors** - Avatar, background, colors
12. **utilities.css** - Animations & responsive (cuối cùng để override nếu cần)

## 💡 Best Practices

### ✅ Do's

```css
/* ✅ GOOD: Use CSS variables */
.my-button {
	background: var(--green);
	border-radius: var(--radius);
}

/* ✅ GOOD: Organize in right module */
.avatar-picker {
	/* → editor-avatar.css */
}
.dashboard-list {
	/* → dashboard.css */
}

/* ✅ GOOD: Add comments for complex styles */
/* Prevent overflow on phone preview */
.phone-screen {
	overflow-y: auto;
}
```

### ❌ Don'ts

```css
/* ❌ WRONG: Don't hardcode colors */
.my-button {
	background: #d4a800;
}

/* ❌ WRONG: Don't mix concerns */
.button {
	display: flex;
}
.button-modal {
	/* Should be in modals.css */
}

/* ❌ WRONG: Don't add to global.css */
/* global.css is deprecated */
```

## 🔍 Finding & Editing

### Scenario 1: "Button colors are wrong"

1. Open `src/styles/modules/buttons.css`
2. Find `.btn-primary` or `.btn-secondary`
3. Edit the colors or use CSS variables
4. Save - browser auto-refreshes ✨

### Scenario 2: "Add styling to form inputs"

1. Open `src/styles/modules/forms.css`
2. Add new rule or modify `.input`
3. Test in browser
4. Done!

### Scenario 3: "Edit avatar editor colors"

1. Open `src/styles/modules/editor-avatar.css`
2. Find `.editor-avatar-preview` or relevant class
3. Make changes
4. Live preview in editor ✨

## 🧪 Testing

### Basic Test Checklist

- [ ] Dev server starts with `npm run dev`
- [ ] No CSS errors in browser console
- [ ] Auth page loads correctly
- [ ] Dashboard renders properly
- [ ] Editor works as expected
- [ ] Mobile preview shows correctly
- [ ] AI Chat displays properly
- [ ] No flash of unstyled content (FOUC)

### Test Different Pages

1. **Auth pages** → `/login`, `/register`, `/forgot-password`
2. **Dashboard** → `/dashboard`
3. **Editor** → `/editor` or username profile
4. **Public page** → Visit your profile link

## 📚 Documentation

Full documentation available in **`src/styles/README.md`**

Topics covered:

- Complete module descriptions
- Best practices
- Finding styles guide
- FAQ
- Statistics

## 🤔 FAQ

**Q: Will this slow down my site?**
A: No! The build process combines all modules into one file. Zero performance impact.

**Q: Can I still use global styles?**
A: Yes, but avoid adding to `global.css`. Use appropriate modules instead.

**Q: How do I add a new style category?**
A: Create new `.css` file in `modules/` and add `@import` to `index.css`.

**Q: Should I delete global.css?**
A: Keep it as backup for now. You can safely delete after confirming everything works.

**Q: Can I reorganize modules?**
A: Yes! Just ensure `@import` order in `index.css` reflects dependencies.

## 🎯 Next Steps

1. ✅ Start dev server and test everything works
2. ✅ Bookmark `src/styles/README.md` for reference
3. ✅ Use this module structure for new features
4. ✅ Gradually move more CSS to appropriate modules
5. ✅ Delete `global.css` once confident with new structure

## 📞 Need Help?

- **Can't find a style?** → Check `README.md` or use Ctrl+F to search
- **Style not applying?** → Check import order in `index.css`
- **Module too big?** → Split into smaller modules
- **Duplicate CSS?** → Find duplicates and consolidate

---

**Created**: 2026-06-23
**Total modules**: 21
**Total CSS rules**: 1,002
**Status**: ✅ Ready to use
