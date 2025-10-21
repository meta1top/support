import { createZodDto } from "nestjs-zod";

import { SendCodeSchema } from "@meta-1/types";

export class SendCodeDto extends createZodDto(SendCodeSchema) {}
