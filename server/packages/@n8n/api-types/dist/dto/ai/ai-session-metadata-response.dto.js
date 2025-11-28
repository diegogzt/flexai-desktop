"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiSessionMetadataResponseDto = void 0;
const zod_1 = require("zod");
const zod_class_1 = require("zod-class");
class AiSessionMetadataResponseDto extends zod_class_1.Z.class({
    hasMessages: zod_1.z.boolean(),
}) {
}
exports.AiSessionMetadataResponseDto = AiSessionMetadataResponseDto;
//# sourceMappingURL=ai-session-metadata-response.dto.js.map