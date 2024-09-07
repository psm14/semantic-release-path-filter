import { execSync } from "child_process";

function filterCommits(commits, path) {
  return commits.filter((commit) => {
    const changedFiles = getChangedFiles(commit.hash);
    return changedFiles.some((file) => file.startsWith(path));
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
    console.error(
      `Error getting changed files for commit ${commitHash}:`,
      error
    );
    return [];
  }
}

function makePlugin(name) {
  return async function (pluginConfig, context) {
    const { path, originalPlugin, ...remainingConfig } = pluginConfig;

    const originalPluginName =
      typeof originalPlugin === "string" ? originalPlugin : originalPlugin[0];
    const originalPluginConfig = Array.isArray(originalPlugin)
      ? { ...remainingConfig, ...originalPlugin[1] }
      : remainingConfig;

    const plugin = await import(originalPluginName);
    if (!name in plugin) {
      return;
    }

    const filteredContext = {
      ...context,
      commits: filterCommits(context.commits, path),
    };
    return plugin[name](originalPluginConfig, filteredContext);
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
