/** App identity + GitHub release source for update checks */
export const APP_CONFIG = {
  displayName: 'Farm Planner',
  github: {
    owner: 'GoblinThug',
    repo: 'Farm-Planner',
  },
};

export function githubReleasesApiUrl() {
  const { owner, repo } = APP_CONFIG.github;
  return `https://api.github.com/repos/${owner}/${repo}/releases/latest`;
}

export function githubReleasesPageUrl() {
  const { owner, repo } = APP_CONFIG.github;
  return `https://github.com/${owner}/${repo}/releases/latest`;
}
