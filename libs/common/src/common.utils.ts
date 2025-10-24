import { createHash } from "node:crypto";

export const md5 = (text: string): string => {
  return createHash("md5").update(text).digest("hex");
};
