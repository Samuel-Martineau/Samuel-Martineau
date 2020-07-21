const { Octokit } = require('@octokit/rest');
const Handlebars = require('handlebars');
const npmtotal = require('npmtotal');
const prettier = require('prettier');
const {
  readTemplateFile,
  writeReadme,
  readReadme,
  commitReadme,
} = require('./helpers');
require('handlebars-helpers')();

const octokit = new Octokit();
const dev = process.env.NODE_ENV === 'development';

const usernames = {
  github: 'Samuel-Martineau',
  npm: 'samuel_martineau',
};

(async function () {
  const template = Handlebars.compile(await readTemplateFile());

  const [npmPackages, rawRecentGithubEvents] = await Promise.all([
    await npmtotal(usernames.npm),
    await octokit.activity.listPublicEventsForUser({
      username: usernames.github,
    }),
  ]);

  const recentGithubEvents = rawRecentGithubEvents.data
    .map(({ type, repo, payload }) => {
      const displayRepo = (name) => `[**${name}**](https://github.com/${name})`;
      const displayIssue = (repoName, issue) =>
        `[**${issue.title}**](https://github.com/${repoName}/issues/${issue.number})`;
      const displayPullRequest = (repoName, pullRequest) =>
        `[**${pullRequest.title}**](https://github.com/${repoName}/pull/${pullRequest.number})`;
      switch (type) {
        case 'PushEvent':
          const nbOfCommits = payload.commits.length;
          return `⚡ J'ai publié **${nbOfCommits}** commit${
            nbOfCommits > 1 ? 's' : ''
          } sur le repo ${displayRepo(repo.name)}`;
        case 'ForkEvent':
          return `🌈 J'ai créé un fork du repo ${displayRepo(repo.name)}`;
        case 'IssueCommentEvent':
          const isPull = !!payload.issue.pull_request;
          return `💬 J'ai commenté sur ${
            isPull ? 'la *pull request*' : "l'*issue*"
          } ${displayIssue(repo.name, payload.issue)} du repo ${displayRepo(
            repo.name,
          )}`;
        case 'IssuesEvent':
          switch (payload.action) {
            case 'opened':
            case 'reopened':
              return `✅ J'ai ouvert l'*issue* ${displayIssue(
                repo.name,
                payload.issue,
              )} sur le repo ${displayRepo(repo.name)}`;
              break;
            case 'closed':
              return `❌ J'ai fermé l'*issue* ${displayIssue(
                repo.name,
                payload.issue,
              )} du repo ${displayRepo(repo.name)}`;
            default:
              return;
          }
        case 'PullRequestEvent':
          switch (payload.action) {
            case 'opened':
            case 'reopened':
              return `🔥 J'ai ouvert la *pull request* ${displayPullRequest(
                repo.name,
                payload.pull_request,
              )} sur le repo ${displayRepo(repo.name)}`;
              break;
            case 'closed':
              return `🚫 J'ai fermé la *pull request* ${displayPullRequest(
                repo.name,
                payload.pull_request,
              )} du repo ${displayRepo(repo.name)}`;
            default:
              return;
          }
        case 'ReleaseEvent':
          return `☀️ J'ai publié la version **${
            payload.release.tag_name
          }** de ${displayRepo(repo.name)}`;
        case 'CreateEvent':
          if (payload.ref !== 'master') return;
          return `🚀 J'ai créé le *repo* ${displayRepo(repo.name)}`;
      }
    })
    .filter((v) => v)
    .slice(0, 10);

  const markup = template({ npmPackages, recentGithubEvents });
  const formattedMarkup = prettier.format(markup, { parser: 'markdown' });

  if (formattedMarkup.trim() !== (await readReadme()).trim()) {
    await writeReadme(formattedMarkup);
    if (!dev) await commitReadme();
  }
})();
