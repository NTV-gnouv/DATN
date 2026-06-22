import { BadRequestException, Injectable } from '@nestjs/common';

export type LinkPreviewResult = {
  url: string;
  title: string;
  description: string;
  thumbnailUrl: string;
};

@Injectable()
export class LinkPreviewService {
  private decodeHtml(value: string): string {
    return value
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  }

  private extractMeta(html: string, key: string): string {
    const patterns = [
      new RegExp(`<meta[^>]+property=["']${key}["'][^>]+content=["']([^"']+)["']`, 'i'),
      new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${key}["']`, 'i'),
      new RegExp(`<meta[^>]+name=["']${key}["'][^>]+content=["']([^"']+)["']`, 'i'),
      new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${key}["']`, 'i'),
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match?.[1]) {
        return this.decodeHtml(match[1]);
      }
    }

    return '';
  }

  private resolveUrl(baseUrl: string, value: string): string {
    if (!value) {
      return '';
    }
    try {
      return new URL(value, baseUrl).toString();
    } catch {
      return value;
    }
  }

  async preview(rawUrl: string): Promise<LinkPreviewResult> {
    let parsed: URL;
    try {
      parsed = new URL(rawUrl.trim());
    } catch {
      throw new BadRequestException('URL không hợp lệ.');
    }

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new BadRequestException('Chỉ hỗ trợ URL http/https.');
    }

    const response = await fetch(parsed.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ShotVNBot/1.0)',
        Accept: 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new BadRequestException(`Không thể tải URL (${response.status}).`);
    }

    const html = await response.text();
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title =
      this.extractMeta(html, 'og:title') ||
      this.extractMeta(html, 'twitter:title') ||
      (titleMatch?.[1] ? this.decodeHtml(titleMatch[1]) : '');
    const description =
      this.extractMeta(html, 'og:description') ||
      this.extractMeta(html, 'twitter:description') ||
      this.extractMeta(html, 'description');
    const thumbnailUrl = this.resolveUrl(
      parsed.toString(),
      this.extractMeta(html, 'og:image') || this.extractMeta(html, 'twitter:image'),
    );

    return {
      url: parsed.toString(),
      title,
      description,
      thumbnailUrl,
    };
  }
}
