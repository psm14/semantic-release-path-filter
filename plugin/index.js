import { execSync } from "child_process";

function filterCommits({ commits, logger }, path) {
  return commits.filter((commit) => {
    const changedFiles = getChangedFiles(commit.hash);
    const isRelevant = changedFiles.some((file) => file.startsWith(path));
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

function getChangedFiles(commitHash) {
  try {
    const result = execSync(
      `git diff-tree --no-commit-id --name-only -r ${commitHash}`,
      { encoding: "utf-8" }
    );
    return result.trim().split("\n");
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
