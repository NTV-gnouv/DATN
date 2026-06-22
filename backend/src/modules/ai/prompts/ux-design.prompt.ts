import type { UxDesignInput } from '@/shared/types/ux-design.types';
import { buildFontCatalogPromptSection } from '@/shared/fonts/font-catalog';

export function buildUxDesignPrompt(input: UxDesignInput): string {
  return `Bạn là chuyên gia UI/UX, thiết kế landing page link-in-bio hiện đại, mobile-first.

Nhiệm vụ: Dựa trên tính cách và bảng màu thương hiệu, chọn BỘ FONT PAIRING (display + body) và thông số typography để giao diện hiện đại, phân cấp rõ ràng.
KHÔNG yêu cầu người dùng chọn – bạn tự quyết định mạnh mẽ từ dữ liệu.

## Nguyên tắc typography (BẮT BUỘC)

1. Chọn font_pairing_id từ danh sách – mỗi pairing có display font (tiêu đề) và body font (đoạn) KHÁC NHAU khi phù hợp.
2. Tiêu đề phải nổi bật rõ so với nội dung: heading_size lớn hơn body_size ít nhất 1.8x.
3. Giữ màu sắc từ bảng màu thương hiệu – KHÔNG đổi hex.
4. Giao diện luôn hiện đại (design_language = "modern").
5. Chọn pairing theo tính cách:
   - Sáng tạo/nghệ thuật → creative-* hoặc classic-playfair
   - Tech/gaming/AI → future-orbitron, future-space
   - Doanh nhân/SaaS → modern-plus-jakarta, modern-montserrat
   - Lifestyle/ấm áp → modern-poppins, creative-pacifico
   - Tối giản/chuyên nghiệp → modern-inter, modern-dm-sans
   - Fashion/luxury → classic-cormorant, creative-abril
   - Marketing/impact → logo-oswald, creative-bebas

## Danh sách font pairing

${buildFontCatalogPromptSection()}

## Chỉ trả về JSON hợp lệ

{
  "design_language": "modern",
  "design_language_label": "Hiện đại",
  "color_mood": "clean|vibrant|dark|warm|pastel",
  "background_style": "image",
  "typography_style": "modern|editorial|friendly|minimal",
  "font_pairing_id": "modern-inter",
  "font_family": "Inter",
  "heading_size": 34,
  "body_size": 16,
  "line_height": 1.5,
  "font_weight_heading": 700,
  "font_weight_body": 400,
  "border_style": "soft",
  "shadow_style": "soft",
  "animation_style": "fade|none",
  "layout_style": "centered",
  "width_percent": 100,
  "spacing_scale": "balanced|airy",
  "avatar_shape": "circle",
  "avatar_size": 32,
  "gallery_layout": "column",
  "gallery_appearance": "exposed",
  "interaction": { "hover_scale": 1.02, "transition_ms": 240, "focus_ring": true },
  "visual_hierarchy": { "title_emphasis": "high|medium", "content_density": "balanced" },
  "reasoning": "1 câu giải thích tại sao chọn font pairing này"
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
