#!/usr/bin/env ts-node

import * as fs from "node:fs";
import * as path from "node:path";

/**
 * Copy compiled files to library's dist directory
 * Usage: ts-node scripts/copy-dist.ts <libName>
 * Example: ts-node scripts/copy-dist.ts nacos
 */

const libName = process.argv[2];

if (!libName) {
  console.error("Error: Please provide library name as argument");
  console.error("Usage: ts-node scripts/copy-dist.ts <libName>");
  console.error("Example: ts-node scripts/copy-dist.ts nacos");
  process.exit(1);
}

const sourceDir = path.join(process.cwd(), "dist/libs", libName);
const targetDir = path.join(process.cwd(), "libs", libName, "dist");

// Check if source directory exists
if (!fs.existsSync(sourceDir)) {
  console.error(`Error: Source directory does not exist: ${sourceDir}`);
  console.error(`Please run build:nest:${libName} first to compile the project`);
  process.exit(1);
}

// Recursively copy directory
function copyRecursiveSync(src: string, dest: string) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats && stats.isDirectory();

  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Remove target directory if exists
if (fs.existsSync(targetDir)) {
  console.log(`Cleaning target directory: ${targetDir}`);
  fs.rmSync(targetDir, { recursive: true, force: true });
}

// Copy files
console.log(`Copying files from ${sourceDir} to ${targetDir}`);
copyRecursiveSync(sourceDir, targetDir);

console.log(`✅ Successfully copied ${libName} build files to libs/${libName}/dist`);
