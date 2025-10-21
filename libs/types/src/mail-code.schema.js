"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendCodeSchema = exports.MailActionEnum = void 0;
const zod_1 = require("zod");
exports.MailActionEnum = zod_1.z.enum(["register", "login", "reset-password"]);
exports.SendCodeSchema = zod_1.z.object({
    email: zod_1.z.email({ message: "邮箱格式不正确" }).describe("邮箱"),
    action: exports.MailActionEnum.describe("操作类型"),
});
//# sourceMappingURL=mail-code.schema.js.map