"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsUpdateRequestDto = void 0;
const zod_1 = require("zod");
const zod_class_1 = require("zod-class");
class SettingsUpdateRequestDto extends zod_class_1.Z.class({
    userActivated: zod_1.z.boolean().optional(),
    allowSSOManualLogin: zod_1.z.boolean().optional(),
    easyAIWorkflowOnboarded: zod_1.z.boolean().optional(),
    dismissedCallouts: zod_1.z.record(zod_1.z.string(), zod_1.z.boolean()).optional(),
    aiConfig: zod_1.z
        .object({
        provider: zod_1.z.enum(['openai', 'anthropic']),
        apiKey: zod_1.z.string(),
    })
        .optional(),
}) {
}
exports.SettingsUpdateRequestDto = SettingsUpdateRequestDto;
//# sourceMappingURL=settings-update-request.dto.js.map