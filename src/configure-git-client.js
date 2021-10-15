import { Octokit } from '@octokit/rest';

let gitClient = null;

const createGitClient = (options) => {
  if (!gitClient) {
    gitClient = new Octokit({
      ...options,
      auth: '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',
    });
  }

  return gitClient;
};

export default createGitClient;
