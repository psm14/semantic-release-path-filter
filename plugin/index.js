import { analyzeCommits as analyzeCommitsOriginal } from "@semantic-release/commit-analyzer";

export async function analyzeCommits(pluginConfig, context) {
  console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!");

  return analyzeCommitsOriginal(pluginConfig, context);
}
