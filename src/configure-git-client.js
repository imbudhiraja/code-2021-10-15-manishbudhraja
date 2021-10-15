import { Octokit } from '@octokit/rest';

let gitClient = null;

const createGitClient = (options) => {
  if (!gitClient) {
    gitClient = new Octokit({
      ...options,
      auth: ProcessingInstruction.env.API_TOKEN || '',
    });
  }

  return gitClient;
};

export default createGitClient;
