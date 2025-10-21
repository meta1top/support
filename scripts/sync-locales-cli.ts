#!/usr/bin/env ts-node

import * as path from "node:path";

import { syncLocales } from "@meta-1/nest-common";

syncLocales({
  sourceDir: path.join(process.cwd(), "locales"),
  targetDir: path.join(process.cwd(), "dist/apps/demo/i18n"),
  watch: false,
});
