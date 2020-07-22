const fs = require('fs').promises;
const execa = require('execa');
const path = require('path');

const readTemplateFile = async () =>
  (await fs.readFile(path.join(__dirname, 'template.md'))).toString();

const readReadme = async () =>
  (
    await fs.readFile(path.join(__dirname, '..', 'README.md')).catch(() => '')
  ).toString();

const writeReadme = (content) =>
  fs.writeFile(path.join(__dirname, '..', 'README.md'), content);

const commitReadme = async (ghUsername) => {
  console.log(process.env.GITHUB_TOKEN);
  await execa('git', ['config', '--global', 'user.name', 'profile-readme-bot']);
  await execa('git', [
    'config',
    '--global',
    'user.email',
    'samumartineau@gmail.com',
  ]);
  await execa('git', ['add', 'README.md']);
  console.log((await execa('git', ['status'])).stdout.toString());
  await execa('git', ['commit', '-m', 'Mise à jour des données du README']);
  console.log((await execa('git', ['status'])).stdout.toString());
  console.log((await execa('git', ['show-ref'])).stdout.toString());
  await execa('git', [
    'remote',
    'set-url',
    'origin',
    `https://${ghUsername}:${process.env.GITHUB_TOKEN}@github.com/${ghUsername}/${ghUsername}.git`,
  ]);
  await execa('git', ['push', '-u', 'origin', 'HEAD:master']);
};

const parseGithubActivity = (ghActivity) => {
  return ghActivity
    .map((e, index, array) => {
      if (e.type !== 'PushEvent') return e;
      let indexFirstConsecutive = index;
      while (
        indexFirstConsecutive > 0 &&
        ((array[indexFirstConsecutive - 1].type === 'PushEvent' &&
          array[indexFirstConsecutive - 1].repo.name === e.repo.name) ||
          array[indexFirstConsecutive - 1] === null)
      ) {
        indexFirstConsecutive--;
      }
      const firstConsecutive = array[indexFirstConsecutive];
      const isFirst = indexFirstConsecutive === index;
      if (isFirst) {
        e.payload.nbOfCommits = e.payload.commits.length;
        return e;
      } else {
        firstConsecutive.payload.nbOfCommits =
          firstConsecutive.payload.nbOfCommits + e.payload.commits.length;
        return null;
      }
    })
    .filter((v) => v)
    .map(({ type, repo, payload }) => {
      const displayRepo = (name) => `[**${name}**](https://github.com/${name})`;
      const displayIssue = (repoName, issue) =>
        `[**${issue.title}**](https://github.com/${repoName}/issues/${issue.number})`;
      const displayPullRequest = (repoName, pullRequest) =>
        `[**${pullRequest.title}**](https://github.com/${repoName}/pull/${pullRequest.number})`;
      switch (type) {
        case 'PushEvent':
          const nbOfCommits = payload.nbOfCommits;
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
};

module.exports = {
  readTemplateFile,
  writeReadme,
  readReadme,
  commitReadme,
  parseGithubActivity,
};
