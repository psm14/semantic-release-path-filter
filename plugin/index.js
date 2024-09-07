import { analyzeCommits as analyzeCommitsOriginal } from "@semantic-release/commit-analyzer";
import { execSync } from "child_process";

export async function analyzeCommits(pluginConfig, context) {
  const { path } = pluginConfig;

  // Filter commits based on the specified path
  const filteredCommits = context.commits.filter((commit) => {
    const changedFiles = getChangedFiles(commit.hash);
    return changedFiles.some((file) => file.startsWith(path));
  });

  // Create a new context with filtered commits
  const filteredContext = {
    ...context,
    commits: filteredCommits,
  };

  return analyzeCommitsOriginal(pluginConfig, filteredContext);
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
