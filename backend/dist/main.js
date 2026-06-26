"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const bootstrap_plugins_1 = require("./bootstrap/bootstrap-plugins");
const bootstrap_themes_1 = require("./bootstrap/bootstrap-themes");
const http_exception_filter_1 = require("./shared/filters/http-exception.filter");
const response_interceptor_1 = require("./shared/interceptors/response.interceptor");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.set('trust proxy', true);
    app.enableCors();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    app.useGlobalInterceptors(new response_interceptor_1.ResponseInterceptor());
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('ShotVN API')
        .setDescription('Internal API for ShotVN platform')
        .setVersion('1.0.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    await (0, bootstrap_plugins_1.bootstrapPlugins)(app);
    await (0, bootstrap_themes_1.bootstrapThemes)(app);
    await app.listen(process.env.PORT ? Number(process.env.PORT) : 3000);
}
void bootstrap();
