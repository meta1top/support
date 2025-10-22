import * as fs from "node:fs";
import * as path from "node:path";
import * as chokidar from "chokidar";

/**
 * Locales 文件同步和转换工具
 * 功能：
 * 1. 监听 locales/ 目录下的 JSON 文件变化
 * 2. 转换文件结构：locales/en.json -> dist/apps/server/i18n/en/common.json
 * 3. 支持初始化同步和实时监听
 */

export interface SyncLocalesOptions {
  /** 源翻译文件目录 */
  sourceDir: string;
  /** 目标 i18n 目录 */
  targetDir: string;
  /** 是否启用文件监听 */
  watch?: boolean;
}

/**
 * 从文件名提取语言代码
 * 例如：en.json -> en, zh-CN.json -> zh-CN
 */
function extractLanguageCode(filename: string): string | null {
  const match = filename.match(/^(.+)\.json$/);
  return match ? match[1] : null;
}

/**
 * 转换并同步单个文件
 * locales/en.json -> dist/apps/server/i18n/en/common.json
 */
function syncFile(sourceFilePath: string, targetBaseDir: string): void {
  const filename = path.basename(sourceFilePath);
  const langCode = extractLanguageCode(filename);

  if (!langCode) {
    console.warn(`[Locales Sync] Skip non-JSON file: ${filename}`);
    return;
  }

  try {
    // 读取源文件
    const content = fs.readFileSync(sourceFilePath, "utf-8");

    // 验证 JSON 格式
    JSON.parse(content);

    // 创建目标目录：targetBaseDir/{langCode}/
    const targetDir = path.join(targetBaseDir, langCode);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // 写入目标文件：common.json
    const targetFilePath = path.join(targetDir, "common.json");
    fs.writeFileSync(targetFilePath, content, "utf-8");

    console.log(`[Locales Sync] ✅ ${filename} -> i18n/${langCode}/common.json`);
  } catch (error) {
    console.error(`[Locales Sync] ❌ Sync failed ${filename}:`, error);
  }
}

/**
 * 删除对应的翻译文件
 */
function deleteFile(sourceFilePath: string, targetBaseDir: string): void {
  const filename = path.basename(sourceFilePath);
  const langCode = extractLanguageCode(filename);

  if (!langCode) return;

  try {
    const targetFilePath = path.join(targetBaseDir, langCode, "common.json");

    if (fs.existsSync(targetFilePath)) {
      fs.unlinkSync(targetFilePath);
      console.log(`[Locales Sync] 🗑️  Deleted i18n/${langCode}/common.json`);
    }

    // 如果目录为空，删除目录
    const targetDir = path.join(targetBaseDir, langCode);
    if (fs.existsSync(targetDir) && fs.readdirSync(targetDir).length === 0) {
      fs.rmdirSync(targetDir);
      console.log(`[Locales Sync] 🗑️  Deleted empty directory i18n/${langCode}/`);
    }
  } catch (error) {
    console.error(`[Locales Sync] ❌ Delete failed ${filename}:`, error);
  }
}

/**
 * 初始化同步：同步所有现有文件
 */
function initialSync(sourceDir: string, targetDir: string): void {
  console.log("[Locales Sync] 🚀 Starting sync...");

  if (!fs.existsSync(sourceDir)) {
    console.warn(`[Locales Sync] ⚠️  Source directory does not exist: ${sourceDir}`);
    return;
  }

  // 确保目标目录存在
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // 读取所有 JSON 文件
  const files = fs.readdirSync(sourceDir).filter((file) => file.endsWith(".json"));

  if (files.length === 0) {
    console.warn("[Locales Sync] ⚠️  No JSON files found");
    return;
  }

  // 同步所有文件
  files.forEach((file) => {
    const filePath = path.join(sourceDir, file);
    syncFile(filePath, targetDir);
  });

  console.log(`[Locales Sync] ✅ Synced ${files.length} file(s)`);
}

/**
 * 启动文件监听
 */
function startWatching(sourceDir: string, targetDir: string): chokidar.FSWatcher | null {
  if (!fs.existsSync(sourceDir)) {
    console.warn("[Locales Sync] ⚠️  Cannot start watching: source directory does not exist");
    return null;
  }

  console.log("[Locales Sync] 👀 Starting to watch file changes...");
  console.log(`[Locales Sync] 📂 Watching directory: ${sourceDir}`);

  const watcher = chokidar.watch(`${sourceDir}/*.json`, {
    persistent: true,
    ignoreInitial: true, // 忽略初始扫描（已在 initialSync 中处理）
    awaitWriteFinish: {
      stabilityThreshold: 200, // 文件稳定 200ms 后触发
      pollInterval: 100,
    },
    // 使用轮询模式以支持所有编辑器（包括那些使用原子写入的编辑器）
    usePolling: false,
    // 监听原子写入（重命名）操作
    atomic: true,
  });

  // 监听就绪
  watcher.on("ready", () => {
    console.log("[Locales Sync] ✅ Watcher ready");
  });

  // 监听所有事件（调试用）
  watcher.on("all", (event, filePath) => {
    console.log(`[Locales Sync] 🔔 Event: ${event} - ${path.basename(filePath)}`);
  });

  // 监听文件添加
  watcher.on("add", (filePath) => {
    console.log(`[Locales Sync] 📄 New file detected: ${path.basename(filePath)}`);
    syncFile(filePath, targetDir);
  });

  // 监听文件修改
  watcher.on("change", (filePath) => {
    console.log(`[Locales Sync] 📝 File change detected: ${path.basename(filePath)}`);
    syncFile(filePath, targetDir);
  });

  // 监听文件删除
  watcher.on("unlink", (filePath) => {
    console.log(`[Locales Sync] 🗑️  File deletion detected: ${path.basename(filePath)}`);
    deleteFile(filePath, targetDir);
  });

  // 监听错误
  watcher.on("error", (error) => {
    console.error("[Locales Sync] ❌ Watcher error:", error);
  });

  return watcher;
}

/**
 * 主函数
 */
export function syncLocales(options: SyncLocalesOptions): chokidar.FSWatcher | null {
  const { sourceDir, targetDir, watch = false } = options;

  // 执行初始同步
  initialSync(sourceDir, targetDir);

  // 如果启用监听模式
  if (watch) {
    return startWatching(sourceDir, targetDir);
  }

  return null;
}
