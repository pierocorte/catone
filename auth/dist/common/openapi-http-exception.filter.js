"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenApiHttpExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
let OpenApiHttpExceptionFilter = class OpenApiHttpExceptionFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const res = ctx.getResponse();
        if (exception instanceof common_1.HttpException) {
            const status = exception.getStatus();
            const resp = exception.getResponse();
            const message = typeof resp === "string"
                ? resp
                : typeof resp?.message === "string"
                    ? resp.message
                    : Array.isArray(resp?.message)
                        ? resp.message.join("; ")
                        : exception.message || "Error";
            const errors = typeof resp === "object" ? [resp] : undefined;
            res.status(status).json({ message, errors });
            return;
        }
        res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
    }
};
exports.OpenApiHttpExceptionFilter = OpenApiHttpExceptionFilter;
exports.OpenApiHttpExceptionFilter = OpenApiHttpExceptionFilter = __decorate([
    (0, common_1.Catch)()
], OpenApiHttpExceptionFilter);
//# sourceMappingURL=openapi-http-exception.filter.js.map