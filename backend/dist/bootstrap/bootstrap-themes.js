"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootstrapThemes = bootstrapThemes;
const common_1 = require("@nestjs/common");
const themes_service_1 = require("../modules/themes/themes.service");
const logger = new common_1.Logger('ThemeBootstrap');
async function bootstrapThemes(app) {
    const themeService = app.get(themes_service_1.ThemesService);
    const loaded = await themeService.rescan(process.cwd());
    logger.log(`Theme runtime bootstrap initialized (${loaded.length} loaded)`);
}
