import { createZodDto } from "nestjs-zod";

import { SendCodeSchema } from "@meta-1/nest-types";

export class SendCodeDto extends createZodDto(SendCodeSchema) {}
