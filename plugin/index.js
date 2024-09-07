import { execSync } from "child_process";

export async function analyzeCommits(pluginConfig, context) {
  const { path, originalPlugin } = pluginConfig;

  const filteredCommits = filterCommits(context.commits, path);

  const filteredContext = {
    ...context,
    commits: filteredCommits,
  };

  const plugin = await import(originalPlugin);
  return plugin.analyzeCommits(pluginConfig, filteredContext);
}

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
