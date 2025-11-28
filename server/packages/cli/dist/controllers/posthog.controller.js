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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostHogController = void 0;
const config_1 = require("@n8n/config");
const decorators_1 = require("@n8n/decorators");
const http_proxy_middleware_1 = require("http-proxy-middleware");
let PostHogController = class PostHogController {
    constructor(globalConfig) {
        this.globalConfig = globalConfig;
        const targetUrl = this.globalConfig.diagnostics.posthogConfig.apiHost;
        this.proxy = (0, http_proxy_middleware_1.createProxyMiddleware)({
            target: targetUrl,
            changeOrigin: true,
            pathRewrite: {
                '^/posthog/': '/',
            },
            on: {
                proxyReq: (proxyReq, req) => {
                    proxyReq.removeHeader('cookie');
                    if (req.method === 'POST') {
                        (0, http_proxy_middleware_1.fixRequestBody)(proxyReq, req);
                    }
                },
            },
        });
    }
    async capture(req, res, next) {
        return await this.proxy(req, res, next);
    }
    async decide(req, res, next) {
        return await this.proxy(req, res, next);
    }
    async sessionRecording(req, res, next) {
        return await this.proxy(req, res, next);
    }
    async sessionEvents(req, res, next) {
        return await this.proxy(req, res, next);
    }
    async engage(req, res, next) {
        return await this.proxy(req, res, next);
    }
    async batch(req, res, next) {
        return await this.proxy(req, res, next);
    }
    async flags(req, res, next) {
        return await this.proxy(req, res, next);
    }
    staticArrayJs(req, res, next) {
        void this.proxy(req, res, next);
    }
    staticLazyRecorderJs(req, res, next) {
        void this.proxy(req, res, next);
    }
    arrayConfig(req, res, next) {
        void this.proxy(req, res, next);
    }
};
exports.PostHogController = PostHogController;
__decorate([
    (0, decorators_1.Post)('/capture/', { skipAuth: true, rateLimit: { limit: 200, windowMs: 60_000 } }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Function]),
    __metadata("design:returntype", Promise)
], PostHogController.prototype, "capture", null);
__decorate([
    (0, decorators_1.Post)('/decide/', { skipAuth: true, rateLimit: { limit: 100, windowMs: 60_000 } }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Function]),
    __metadata("design:returntype", Promise)
], PostHogController.prototype, "decide", null);
__decorate([
    (0, decorators_1.Post)('/s/', { skipAuth: true, rateLimit: { limit: 50, windowMs: 60_000 } }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Function]),
    __metadata("design:returntype", Promise)
], PostHogController.prototype, "sessionRecording", null);
__decorate([
    (0, decorators_1.Post)('/e/', { skipAuth: true, rateLimit: { limit: 50, windowMs: 60_000 } }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Function]),
    __metadata("design:returntype", Promise)
], PostHogController.prototype, "sessionEvents", null);
__decorate([
    (0, decorators_1.Post)('/engage/', { skipAuth: true, rateLimit: { limit: 50, windowMs: 60_000 } }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Function]),
    __metadata("design:returntype", Promise)
], PostHogController.prototype, "engage", null);
__decorate([
    (0, decorators_1.Post)('/batch/', { skipAuth: true, rateLimit: { limit: 100, windowMs: 60_000 } }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Function]),
    __metadata("design:returntype", Promise)
], PostHogController.prototype, "batch", null);
__decorate([
    (0, decorators_1.Post)('/flags/', { skipAuth: true, rateLimit: { limit: 100, windowMs: 60_000 } }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Function]),
    __metadata("design:returntype", Promise)
], PostHogController.prototype, "flags", null);
__decorate([
    (0, decorators_1.Get)('/static/array.js', {
        skipAuth: true,
        usesTemplates: true,
        rateLimit: { limit: 50, windowMs: 60_000 },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Function]),
    __metadata("design:returntype", void 0)
], PostHogController.prototype, "staticArrayJs", null);
__decorate([
    (0, decorators_1.Get)('/static/lazy-recorder.js', {
        skipAuth: true,
        usesTemplates: true,
        rateLimit: { limit: 50, windowMs: 60_000 },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Function]),
    __metadata("design:returntype", void 0)
], PostHogController.prototype, "staticLazyRecorderJs", null);
__decorate([
    (0, decorators_1.Get)('/array/:apiKey/config.js', {
        skipAuth: true,
        rateLimit: { limit: 20, windowMs: 60_000 },
        usesTemplates: true,
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Function]),
    __metadata("design:returntype", void 0)
], PostHogController.prototype, "arrayConfig", null);
exports.PostHogController = PostHogController = __decorate([
    (0, decorators_1.RestController)('/posthog'),
    __metadata("design:paramtypes", [config_1.GlobalConfig])
], PostHogController);
//# sourceMappingURL=posthog.controller.js.map