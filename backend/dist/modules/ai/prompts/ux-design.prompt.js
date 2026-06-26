"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildUxDesignPrompt = buildUxDesignPrompt;
const font_catalog_1 = require("../../../shared/fonts/font-catalog");
function buildUxDesignPrompt(input) {
    return `Bạn là chuyên gia UI/UX, thiết kế landing page link-in-bio đa phong cách — từ hiện đại, editorial đến phác thảo tay, retro pixel và risograph.

Nhiệm vụ: Dựa trên tính cách và bảng màu thương hiệu, chọn BỘ FONT PAIRING, design_language và thông số typography phù hợp.
KHÔNG yêu cầu người dùng chọn – bạn tự quyết định mạnh mẽ từ dữ liệu.

## Nguyên tắc (BẮT BUỘC)

1. Chọn font_pairing_id từ danh sách — display font (tiêu đề) và body font có thể khác nhau.
2. Tiêu đề phải nổi bật rõ so với nội dung: heading_size lớn hơn body_size ít nhất 1.6x.
3. Giữ màu sắc từ bảng màu thương hiệu — KHÔNG đổi hex.
4. Chọn design_language phù hợp tính cách (KHÔNG luôn là modern):
   - Sáng tạo/nghệ thuật/phác thảo → handrawn-sketch hoặc doodle-sketch + creative-handrawn / creative-doodle
   - Retro/gaming/developer → retro-pixel + retro-pixel
   - In ấn/zine/poster → risograph + creative-riso
   - Tech/gaming/AI → future-orbitron, future-space
   - Doanh nhân/SaaS → modern-plus-jakarta, modern-montserrat
   - Lifestyle/ấm áp → modern-poppins, creative-handrawn
   - Tối giản/chuyên nghiệp → modern-inter, modern-dm-sans
   - Fashion/luxury/editorial → classic-playfair, classic-cormorant
   - Marketing/impact → logo-oswald, creative-bebas
5. Với handrawn-sketch / doodle-sketch / risograph / retro-pixel: dùng border_style dashed hoặc sharp, shadow_style offset khi phù hợp.

## Danh sách font pairing

${(0, font_catalog_1.buildFontCatalogPromptSection)()}

## Chỉ trả về JSON hợp lệ

{
  "design_language": "modern|editorial|warm-organic|handrawn-sketch|doodle-sketch|retro-pixel|risograph|neo-brutalism|glassmorphism|minimalism",
  "design_language_label": "Nhãn tiếng Việt ngắn",
  "color_mood": "clean|vibrant|dark|warm|pastel",
  "background_style": "solid|gradient|image",
  "typography_style": "modern|editorial|friendly|minimal|bold",
  "font_pairing_id": "modern-inter",
  "font_family": "Inter",
  "heading_size": 34,
  "body_size": 16,
  "line_height": 1.5,
  "font_weight_heading": 700,
  "font_weight_body": 400,
  "border_style": "soft|sharp|brutal|dashed|none",
  "shadow_style": "soft|strong|glow|offset|none",
  "animation_style": "fade|float|pulse|gradient-shift|none",
  "layout_style": "centered",
  "width_percent": 100,
  "spacing_scale": "balanced|airy|tight",
  "avatar_shape": "circle|square",
  "avatar_size": 32,
  "gallery_layout": "column",
  "gallery_appearance": "exposed",
  "interaction": { "hover_scale": 1.02, "transition_ms": 240, "focus_ring": true },
  "visual_hierarchy": { "title_emphasis": "high|medium", "content_density": "balanced" },
  "reasoning": "1-2 câu giải thích font pairing và design_language"
}

## Dữ liệu hồ sơ thương hiệu

Tên: ${input.name}
Nghề nghiệp: ${input.occupation}
Mô tả: ${input.description}
Phong cách thương hiệu: ${input.brand_style}
Tính cách: ${input.personality_traits.join(', ') || 'chưa rõ'}
Màu chính: ${input.color_palette.primary.hex}
Màu phụ 1: ${input.color_palette.secondary_1.hex}
Màu phụ 2: ${input.color_palette.secondary_2.hex}
Màu tương phản: ${input.color_palette.contrast.hex}`;
}
