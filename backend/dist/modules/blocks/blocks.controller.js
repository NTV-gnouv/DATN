"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlocksController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const public_decorator_1 = require("../../shared/decorators/public.decorator");
const blocks_service_1 = require("./blocks.service");
let BlocksController = class BlocksController {
    constructor(blocksService) {
        this.blocksService = blocksService;
    }
    list() {
        return this.blocksService.list();
    }
    getDefaultId() {
        return this.blocksService.getDefaultId();
    }
    getDefaultHeaderBlock() {
        return this.blocksService.getDefaultHeaderBlock();
    }
    get(id) {
        return this.blocksService.get(id);
    }
    create(body) {
        return this.blocksService.create(body);
    }
    importDefinition(body) {
        return this.blocksService.importDefinition(body);
    }
    update(id, body) {
        return this.blocksService.update(id, body);
    }
};
exports.BlocksController = BlocksController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List blocks', description: 'Return all blocks currently registered in the system.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BlocksController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('defaults/id'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get default block ID', description: 'Return the default block ID used when creating a landing page.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BlocksController.prototype, "getDefaultId", null);
__decorate([
    (0, common_1.Get)('defaults/header'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get default header block', description: 'Return full default header block payload for landing page editor bootstrap.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BlocksController.prototype, "getDefaultHeaderBlock", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get block', description: 'Return a block by its ID.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BlocksController.prototype, "get", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create block', description: 'Create a new block definition or instance.' }),
    (0, swagger_1.ApiBody)({ description: 'Block payload' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BlocksController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('import'),
    (0, swagger_1.ApiOperation)({ summary: 'Import block definition', description: 'Import a block definition payload (for plugin-like workflow).' }),
    (0, swagger_1.ApiBody)({ description: 'Imported block JSON payload' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BlocksController.prototype, "importDefinition", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update block', description: 'Update a block by its ID.' }),
    (0, swagger_1.ApiBody)({ description: 'Block update payload' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], BlocksController.prototype, "update", null);
exports.BlocksController = BlocksController = __decorate([
    (0, swagger_1.ApiTags)('Blocks'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('blocks'),
    __metadata("design:paramtypes", [blocks_service_1.BlocksService])
], BlocksController);
