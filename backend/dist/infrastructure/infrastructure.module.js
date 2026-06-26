"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InfrastructureModule = void 0;
const common_1 = require("@nestjs/common");
const clickhouse_client_service_1 = require("./clickhouse/clickhouse-client.service");
const elasticsearch_client_service_1 = require("./elasticsearch/elasticsearch-client.service");
const kafka_client_service_1 = require("./kafka/kafka-client.service");
const mysql_client_service_1 = require("./mysql/mysql-client.service");
const prisma_client_service_1 = require("./prisma/prisma-client.service");
const redis_client_service_1 = require("./redis/redis-client.service");
const s3_client_service_1 = require("./s3/s3-client.service");
let InfrastructureModule = class InfrastructureModule {
};
exports.InfrastructureModule = InfrastructureModule;
exports.InfrastructureModule = InfrastructureModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [
            prisma_client_service_1.PrismaClientService,
            mysql_client_service_1.MysqlClientService,
            redis_client_service_1.RedisClientService,
            kafka_client_service_1.KafkaClientService,
            s3_client_service_1.S3ClientService,
            clickhouse_client_service_1.ClickhouseClientService,
            elasticsearch_client_service_1.ElasticsearchClientService,
        ],
        exports: [
            prisma_client_service_1.PrismaClientService,
            mysql_client_service_1.MysqlClientService,
            redis_client_service_1.RedisClientService,
            kafka_client_service_1.KafkaClientService,
            s3_client_service_1.S3ClientService,
            clickhouse_client_service_1.ClickhouseClientService,
            elasticsearch_client_service_1.ElasticsearchClientService,
        ],
    })
], InfrastructureModule);
