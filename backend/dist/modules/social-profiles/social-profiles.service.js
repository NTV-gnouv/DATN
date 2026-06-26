"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var SocialProfilesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialProfilesService = void 0;
const common_1 = require("@nestjs/common");
const node_child_process_1 = require("node:child_process");
const node_util_1 = require("node:util");
const execFileAsync = (0, node_util_1.promisify)(node_child_process_1.execFile);
const BROWSER_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const INSTAGRAM_CRAWLER_USER_AGENT = 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)';
const INSTAGRAM_APP_ID = '936619743392459';
const INSTAGRAM_API_USER_AGENTS = ['Mozilla/5.0', BROWSER_USER_AGENT];
const INSTAGRAM_HTML_USER_AGENTS = [
    INSTAGRAM_CRAWLER_USER_AGENT,
    'Mozilla/5.0',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
];
const INSTAGRAM_CACHE_TTL_MS = 5 * 60 * 1000;
const INSTAGRAM_NOT_FOUND_CACHE_TTL_MS = 60 * 1000;
let SocialProfilesService = SocialProfilesService_1 = class SocialProfilesService {
    constructor() {
        this.logger = new common_1.Logger(SocialProfilesService_1.name);
        this.instagramCache = new Map();
    }
    normalizeUsername(raw) {
        return String(raw ?? '')
            .trim()
            .replace(/^@+/, '')
            .replace(/\/+$/, '');
    }
    buildProfileUrl(platform, username) {
        switch (platform) {
            case 'instagram':
                return `https://www.instagram.com/${username}/`;
            case 'tiktok':
                return `https://www.tiktok.com/@${username}`;
            case 'youtube':
                return `https://www.youtube.com/@${username}`;
            case 'x':
                return `https://x.com/${username}`;
            default:
                throw new common_1.BadRequestException('Nền tảng không được hỗ trợ.');
        }
    }
    async lookup(platform, rawUsername) {
        const username = this.normalizeUsername(rawUsername);
        if (!username) {
            throw new common_1.BadRequestException('username là bắt buộc.');
        }
        const profileUrl = this.buildProfileUrl(platform, username);
        switch (platform) {
            case 'youtube':
                return this.lookupYouTube(username, profileUrl);
            case 'instagram':
                return this.lookupInstagram(username, profileUrl);
            case 'x':
                return this.lookupX(username, profileUrl);
            case 'tiktok':
                return this.lookupTikTok(username, profileUrl);
            default:
                throw new common_1.BadRequestException('Nền tảng không được hỗ trợ.');
        }
    }
    async lookupBatch(items) {
        const results = await Promise.all(items.map((item) => this.lookup(item.platform, item.username)));
        return { results };
    }
    async fetchPostImages(platform, rawUsername, limit = 2) {
        const username = this.normalizeUsername(rawUsername);
        if (!username || limit <= 0) {
            return [];
        }
        const profileUrl = this.buildProfileUrl(platform, username);
        switch (platform) {
            case 'instagram':
                return this.fetchInstagramPostImages(username, profileUrl, limit);
            case 'youtube':
                return this.fetchYouTubePostImages(username, profileUrl, limit);
            case 'tiktok':
                return this.fetchTikTokPostImages(username, profileUrl, limit);
            case 'x':
                return this.fetchXPostImages(username, profileUrl, limit);
            default:
                return [];
        }
    }
    isValidPostImageUrl(url) {
        const normalized = String(url ?? '').trim();
        if (!normalized.startsWith('https://')) {
            return false;
        }
        const lower = normalized.toLowerCase();
        if (lower.includes('/static/images') ||
            lower.includes('profile_pic') ||
            lower.includes('profile-pic') ||
            lower.includes('avatar') ||
            lower.includes('emoji') ||
            lower.includes('1x1') ||
            lower.includes('sprite')) {
            return false;
        }
        return /\.(jpg|jpeg|png|webp)(\?|$)/i.test(lower) || lower.includes('cdninstagram') || lower.includes('tiktokcdn') || lower.includes('ytimg.com') || lower.includes('twimg.com/media');
    }
    collectUniqueImageUrls(candidates, limit) {
        const seen = new Set();
        const collected = [];
        for (const candidate of candidates) {
            const decoded = this.decodeJsonString(String(candidate ?? '').trim());
            if (!this.isValidPostImageUrl(decoded) || seen.has(decoded)) {
                continue;
            }
            seen.add(decoded);
            collected.push(decoded);
            if (collected.length >= limit) {
                break;
            }
        }
        return collected;
    }
    extractJsonFieldUrls(html, fieldNames, limit) {
        const candidates = [];
        for (const field of fieldNames) {
            const patterns = [
                new RegExp(`"${field}":"(https:[^"\\\\]+(?:\\\\u0026[^"\\\\]*)*)"`, 'gi'),
                new RegExp(`"${field}":"(https:[^"]+)"`, 'gi'),
            ];
            for (const pattern of patterns) {
                for (const match of html.matchAll(pattern)) {
                    if (match[1]) {
                        candidates.push(match[1]);
                    }
                }
            }
        }
        return this.collectUniqueImageUrls(candidates, limit);
    }
    extractInstagramPostImagesFromApi(body, limit) {
        try {
            const payload = JSON.parse(body);
            const edges = payload.data?.user?.edge_owner_to_timeline_media?.edges ?? [];
            const candidates = [];
            for (const edge of edges) {
                const node = edge?.node;
                if (node?.display_url) {
                    candidates.push(node.display_url);
                }
                if (node?.thumbnail_src) {
                    candidates.push(node.thumbnail_src);
                }
                const resources = node?.thumbnail_resources ?? [];
                const largest = resources[resources.length - 1]?.src;
                if (largest) {
                    candidates.push(largest);
                }
            }
            return this.collectUniqueImageUrls(candidates, limit);
        }
        catch {
            return [];
        }
    }
    async fetchInstagramPostImages(username, profileUrl, limit) {
        const endpoint = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`;
        try {
            for (const userAgent of INSTAGRAM_API_USER_AGENTS) {
                const { status, body } = await this.curlRequest(endpoint, {
                    'User-Agent': userAgent,
                    'X-IG-App-ID': INSTAGRAM_APP_ID,
                    Accept: 'application/json',
                    'Accept-Language': 'en-US,en;q=0.9',
                });
                if (status === 200) {
                    const fromApi = this.extractInstagramPostImagesFromApi(body, limit);
                    if (fromApi.length > 0) {
                        return fromApi;
                    }
                }
            }
        }
        catch (error) {
            this.logger.warn(`Instagram post image lookup failed for @${username}: ${String(error)}`);
        }
        try {
            for (const userAgent of INSTAGRAM_HTML_USER_AGENTS) {
                const { status, body } = await this.curlRequest(profileUrl, {
                    'User-Agent': userAgent,
                    'Accept-Language': 'en-US,en;q=0.9',
                });
                if (this.isInstagramNotFoundHtml(body, status)) {
                    return [];
                }
                const fromHtml = this.extractJsonFieldUrls(body, ['display_url', 'thumbnail_src', 'display_src'], limit);
                if (fromHtml.length > 0) {
                    return fromHtml;
                }
            }
        }
        catch (error) {
            this.logger.warn(`Instagram HTML post image lookup failed for @${username}: ${String(error)}`);
        }
        return [];
    }
    extractYouTubePostImages(html, limit) {
        const candidates = [];
        const patterns = [
            /"url":"(https:\\\/\\\/i\.ytimg\.com\\\/vi\\\/[^"\\]+\\\/hqdefault\.jpg[^"]*)"/gi,
            /"url":"(https:\\\/\\\/i\.ytimg\.com\\\/vi\\\/[^"\\]+\\\/maxresdefault\.jpg[^"]*)"/gi,
            /"url":"(https:\/\/i\.ytimg\.com\/vi\/[^"]+\/hqdefault\.jpg[^"]*)"/gi,
            /"url":"(https:\/\/i\.ytimg\.com\/vi\/[^"]+\/maxresdefault\.jpg[^"]*)"/gi,
        ];
        for (const pattern of patterns) {
            for (const match of html.matchAll(pattern)) {
                if (match[1]) {
                    candidates.push(match[1].replace(/\\\//g, '/'));
                }
            }
        }
        return this.collectUniqueImageUrls(candidates, limit);
    }
    async fetchYouTubePostImages(_username, profileUrl, limit) {
        try {
            const { response, html } = await this.fetchHtml(profileUrl);
            if (response.status === 404) {
                return [];
            }
            return this.extractYouTubePostImages(html, limit);
        }
        catch (error) {
            this.logger.warn(`YouTube post image lookup failed for ${profileUrl}: ${String(error)}`);
            return [];
        }
    }
    extractTikTokPostImages(html, limit) {
        return this.extractJsonFieldUrls(html, ['originCover', 'cover', 'dynamicCover', 'zoomCover', 'imageURL', 'urlList'], limit);
    }
    async fetchTikTokPostImages(_username, profileUrl, limit) {
        try {
            const { response, html } = await this.fetchHtml(profileUrl, {
                headers: {
                    'User-Agent': BROWSER_USER_AGENT,
                    Referer: 'https://www.tiktok.com/',
                },
            });
            if (response.status === 404) {
                return [];
            }
            return this.extractTikTokPostImages(html, limit);
        }
        catch (error) {
            this.logger.warn(`TikTok post image lookup failed for ${profileUrl}: ${String(error)}`);
            return [];
        }
    }
    extractXPostImages(html, limit) {
        return this.extractJsonFieldUrls(html, ['media_url_https', 'media_url'], limit);
    }
    async fetchXPostImages(_username, profileUrl, limit) {
        try {
            const { html } = await this.fetchHtml(profileUrl);
            return this.extractXPostImages(html, limit);
        }
        catch (error) {
            this.logger.warn(`X post image lookup failed for ${profileUrl}: ${String(error)}`);
            return [];
        }
    }
    decodeJsonString(value) {
        return value
            .replace(/\\u0026/g, '&')
            .replace(/\\u003d/g, '=')
            .replace(/\\u003f/g, '?')
            .replace(/\\\//g, '/')
            .replace(/\\"/g, '"')
            .trim();
    }
    extractInstagramJsonField(html, field) {
        const patterns = [
            new RegExp(`"${field}":"(https:[^"\\\\]+(?:\\\\u0026[^"\\\\]*)*)"`, 'i'),
            new RegExp(`"${field}":"(https:[^"]+)"`, 'i'),
        ];
        for (const pattern of patterns) {
            const match = html.match(pattern);
            if (match?.[1]) {
                const decoded = this.decodeJsonString(match[1]);
                if (decoded.startsWith('https://') && !decoded.includes('/static/images')) {
                    return decoded;
                }
            }
        }
        return '';
    }
    extractInstagramProfileFromHtml(html) {
        const avatarUrl = this.extractMeta(html, 'og:image') ||
            this.extractInstagramJsonField(html, 'profile_pic_url_hd') ||
            this.extractInstagramJsonField(html, 'profile_pic_url');
        if (!avatarUrl || avatarUrl.includes('/static/images')) {
            return null;
        }
        const rawTitle = this.extractMeta(html, 'og:title') || this.extractMeta(html, 'twitter:title');
        const displayName = rawTitle
            .replace(/\(@[^)]+\)/g, '')
            .replace(/\s*on Instagram.*$/i, '')
            .replace(/\s*•\s*Instagram photos and videos.*$/i, '')
            .trim();
        return {
            avatarUrl,
            displayName: displayName || '',
        };
    }
    isInstagramNotFoundHtml(html, status) {
        return status === 404 || /Page Not Found|isn't available|isn&#39;t available|Sorry, this page/i.test(html);
    }
    getCachedInstagram(username) {
        const cached = this.instagramCache.get(username.toLowerCase());
        if (!cached) {
            return null;
        }
        if (cached.expiresAt <= Date.now()) {
            this.instagramCache.delete(username.toLowerCase());
            return null;
        }
        return cached.result;
    }
    setCachedInstagram(username, result) {
        const ttl = result.exists ? INSTAGRAM_CACHE_TTL_MS : INSTAGRAM_NOT_FOUND_CACHE_TTL_MS;
        this.instagramCache.set(username.toLowerCase(), {
            expiresAt: Date.now() + ttl,
            result,
        });
    }
    async sleep(ms) {
        await new Promise((resolve) => setTimeout(resolve, ms));
    }
    decodeHtml(value) {
        return value
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&#064;/g, '@')
            .replace(/&#x2022;/g, '•')
            .trim();
    }
    extractMeta(html, key) {
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
    async curlRequest(url, headers = {}, method = 'GET') {
        const args = ['-sL', '-X', method, '-w', '\n__HTTP_STATUS__:%{http_code}', url];
        for (const [key, value] of Object.entries(headers)) {
            args.push('-H', `${key}: ${value}`);
        }
        const { stdout } = await execFileAsync('curl', args, {
            timeout: 12000,
            maxBuffer: 8 * 1024 * 1024,
        });
        const marker = stdout.lastIndexOf('\n__HTTP_STATUS__:');
        if (marker === -1) {
            return { status: 0, body: stdout };
        }
        const body = stdout.slice(0, marker);
        const status = Number.parseInt(stdout.slice(marker + '\n__HTTP_STATUS__:'.length), 10);
        return { status: Number.isFinite(status) ? status : 0, body };
    }
    async fetchHtml(url, init) {
        const response = await fetch(url, {
            ...init,
            headers: {
                'User-Agent': BROWSER_USER_AGENT,
                'Accept-Language': 'en-US,en;q=0.9',
                Accept: 'text/html,application/xhtml+xml',
                ...(init?.headers ?? {}),
            },
            redirect: 'follow',
            signal: AbortSignal.timeout(12000),
        });
        const html = await response.text();
        return { response, html };
    }
    notFound(platform, username, profileUrl) {
        return {
            platform,
            username,
            exists: false,
            profileUrl,
        };
    }
    found(platform, username, profileUrl, avatarUrl, displayName) {
        return {
            platform,
            username,
            exists: true,
            profileUrl,
            avatarUrl,
            displayName: displayName?.trim() || undefined,
        };
    }
    async lookupYouTube(username, profileUrl) {
        const { response, html } = await this.fetchHtml(profileUrl);
        if (response.status === 404) {
            return this.notFound('youtube', username, profileUrl);
        }
        const avatarUrl = this.extractMeta(html, 'og:image');
        const displayName = this.extractMeta(html, 'og:title');
        if (!avatarUrl || !displayName) {
            return this.notFound('youtube', username, profileUrl);
        }
        return this.found('youtube', username, profileUrl, avatarUrl, displayName);
    }
    parseInstagramApiPayload(body, username, profileUrl) {
        try {
            const payload = JSON.parse(body);
            const user = payload.data?.user;
            const avatarUrl = user?.profile_pic_url_hd || user?.profile_pic_url || '';
            if (payload.status !== 'ok' || !avatarUrl) {
                return null;
            }
            return this.found('instagram', username, profileUrl, avatarUrl, user?.full_name || user?.username);
        }
        catch {
            return null;
        }
    }
    async lookupInstagram(username, profileUrl) {
        const cached = this.getCachedInstagram(username);
        if (cached) {
            return cached;
        }
        const apiResult = await this.lookupInstagramViaApi(username, profileUrl);
        if (apiResult) {
            this.setCachedInstagram(username, apiResult);
            return apiResult;
        }
        const htmlResult = await this.lookupInstagramViaHtml(username, profileUrl);
        if (htmlResult) {
            this.setCachedInstagram(username, htmlResult);
            return htmlResult;
        }
        const notFoundResult = this.notFound('instagram', username, profileUrl);
        this.setCachedInstagram(username, notFoundResult);
        return notFoundResult;
    }
    async lookupInstagramViaApi(username, profileUrl) {
        const endpoint = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`;
        try {
            for (const userAgent of INSTAGRAM_API_USER_AGENTS) {
                for (let attempt = 0; attempt < 2; attempt += 1) {
                    const { status, body } = await this.curlRequest(endpoint, {
                        'User-Agent': userAgent,
                        'X-IG-App-ID': INSTAGRAM_APP_ID,
                        Accept: 'application/json',
                        'Accept-Language': 'en-US,en;q=0.9',
                    });
                    if (status === 404) {
                        return this.notFound('instagram', username, profileUrl);
                    }
                    if (status === 429 || status === 503) {
                        if (attempt === 0) {
                            await this.sleep(900);
                            continue;
                        }
                        break;
                    }
                    if (status !== 200) {
                        break;
                    }
                    const parsed = this.parseInstagramApiPayload(body, username, profileUrl);
                    if (parsed) {
                        return parsed;
                    }
                    break;
                }
            }
        }
        catch (error) {
            this.logger.warn(`Instagram API lookup failed for @${username}: ${String(error)}`);
        }
        return null;
    }
    async lookupInstagramViaHtml(username, profileUrl) {
        try {
            for (const userAgent of INSTAGRAM_HTML_USER_AGENTS) {
                const { status, body } = await this.curlRequest(profileUrl, {
                    'User-Agent': userAgent,
                    'Accept-Language': 'en-US,en;q=0.9',
                });
                if (this.isInstagramNotFoundHtml(body, status)) {
                    return this.notFound('instagram', username, profileUrl);
                }
                const profile = this.extractInstagramProfileFromHtml(body);
                if (profile) {
                    return this.found('instagram', username, profileUrl, profile.avatarUrl, profile.displayName || username);
                }
            }
        }
        catch (error) {
            this.logger.warn(`Instagram HTML lookup failed for @${username}: ${String(error)}`);
        }
        return null;
    }
    async lookupX(username, profileUrl) {
        const { html } = await this.fetchHtml(profileUrl);
        const avatarUrl = this.extractMeta(html, 'og:image');
        const displayName = this.extractMeta(html, 'og:title');
        if (!avatarUrl || !displayName || !avatarUrl.includes('profile_images')) {
            return this.notFound('x', username, profileUrl);
        }
        return this.found('x', username, profileUrl, avatarUrl, displayName);
    }
    async lookupTikTok(username, profileUrl) {
        const avatarEndpoint = `https://unavatar.io/tiktok/${encodeURIComponent(username)}`;
        try {
            const headResponse = await fetch(avatarEndpoint, {
                method: 'HEAD',
                redirect: 'follow',
                signal: AbortSignal.timeout(10000),
            });
            if (!headResponse.ok) {
                return this.notFound('tiktok', username, profileUrl);
            }
            const contentType = headResponse.headers.get('content-type') ?? '';
            if (!contentType.startsWith('image/')) {
                return this.notFound('tiktok', username, profileUrl);
            }
        }
        catch (error) {
            this.logger.warn(`TikTok avatar lookup failed for @${username}: ${String(error)}`);
            return this.notFound('tiktok', username, profileUrl);
        }
        let displayName = username;
        try {
            const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(profileUrl)}`;
            const oembedResponse = await fetch(oembedUrl, { signal: AbortSignal.timeout(10000) });
            if (oembedResponse.ok) {
                const data = (await oembedResponse.json());
                if (data.author_name?.trim()) {
                    displayName = data.author_name.trim();
                }
            }
        }
        catch {
        }
        return this.found('tiktok', username, profileUrl, avatarEndpoint, displayName);
    }
};
exports.SocialProfilesService = SocialProfilesService;
exports.SocialProfilesService = SocialProfilesService = SocialProfilesService_1 = __decorate([
    (0, common_1.Injectable)()
], SocialProfilesService);
