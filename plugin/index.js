import { analyzeCommits as analyzeCommitsOriginal } from "@semantic-release/commit-analyzer";

export async function analyzeCommits(pluginConfig, context) {
  const { path } = pluginConfig;

  // Filter commits based on the specified path
  const filteredCommits = context.commits.filter((commit) => {
    return commit.files.some((file) => file.startsWith(path));
  });

  // Create a new context with filtered commits
  const filteredContext = {
    ...context,
    commits: filteredCommits,
  };

  return analyzeCommitsOriginal(pluginConfig, filteredContext);
}
