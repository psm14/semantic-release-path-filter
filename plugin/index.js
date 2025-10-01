import { execSync } from "child_process";
import { relative, resolve } from "path";

function filterCommits({ commits, logger }, path) {
  const absoluteFilterPath = resolve(path);
  logger.debug(`Filter path resolved to: ${absoluteFilterPath}`);
  
  return commits.filter((commit) => {
    const changedFiles = getChangedFiles(commit.hash);
    const isRelevant = changedFiles.some((file) => {
      const absoluteFilePath = resolve(file);
      const relativePath = relative(absoluteFilterPath, absoluteFilePath);
      
      logger.debug(`Checking file: ${file} -> ${absoluteFilePath} -> relativePath: ${relativePath}`);
      
      return !relativePath.startsWith('..');
    });
    if (!isRelevant) {
      logger.info(
        `Filtered out commit ${commit.hash.slice(
          0,
          7
        )} as it doesn't affect '${path}'`
      );
    }
    return isRelevant;
  });
}

const CHANGED_FILES_MEMO = new Map();

function getChangedFiles(commitHash) {
  if (CHANGED_FILES_MEMO.has(commitHash)) {
    return CHANGED_FILES_MEMO.get(commitHash);
  }

  try {
    const result = execSync(
      `git diff-tree --no-commit-id --name-only -r ${commitHash}`,
      { encoding: "utf-8" }
    );
    const changedFiles = result.trim().split("\n");
    CHANGED_FILES_MEMO.set(commitHash, changedFiles);
    return changedFiles;
  } catch (error) {
    logger.error(
      `Error getting changed files for commit ${commitHash}:`,
      error
    );
    return [];
  }
}

function makePlugin(name) {
  return async function (pluginConfig, context) {
    const { path, plugin, ...remainingConfig } = pluginConfig;

    const originalPluginName = typeof plugin === "string" ? plugin : plugin[0];
    const originalPluginConfig = Array.isArray(plugin)
      ? { ...remainingConfig, ...plugin[1] }
      : remainingConfig;

    const pluginModule = await import(originalPluginName);
    if (!(name in pluginModule)) {
      return;
    }

    const scopedLogger = context.logger.scope(
      ...context.logger.scopeName,
      originalPluginName
    );
    const filteredContext =
      "commits" in context
        ? {
            ...context,
            commits: filterCommits(context, path),
            logger: scopedLogger,
          }
        : {
            ...context,
            logger: scopedLogger,
          };

    return pluginModule[name](originalPluginConfig, filteredContext);
  };
}

export const verifyConditions = makePlugin("verifyConditions");
export const analyzeCommits = makePlugin("analyzeCommits");
export const generateNotes = makePlugin("generateNotes");
export const verifyRelease = makePlugin("verifyRelease");
export const prepare = makePlugin("prepare");
export const publish = makePlugin("publish");
export const addChannel = makePlugin("addChannel");
export const success = makePlugin("success");
export const fail = makePlugin("fail");
