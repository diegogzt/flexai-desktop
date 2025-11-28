"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiValidateConfigRequestDto = void 0;
const zod_1 = require("zod");
const zod_class_1 = require("zod-class");
class AiValidateConfigRequestDto extends zod_class_1.Z.class({
    provider: zod_1.z.enum(['openai', 'anthropic']),
    apiKey: zod_1.z.string(),
}) {
}
exports.AiValidateConfigRequestDto = AiValidateConfigRequestDto;
//# sourceMappingURL=ai-validate-config-request.dto.js.map