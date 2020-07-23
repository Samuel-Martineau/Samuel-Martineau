const fs = require('fs').promises;
const execa = require('execa');
const path = require('path');

Array.prototype.mergeSimilar = function (
  isOfCorrectType,
  isSimilar,
  setInitialValue,
  merge,
) {
  const newArray = [];
  this.forEach((elem1, index) => {
    if (!isOfCorrectType(elem1)) newArray.push(elem1);
    else {
      let indexFirstConsecutive = index;
      let nextFirstConsecutive = this[indexFirstConsecutive - 1];
      while (
        indexFirstConsecutive > 0 &&
        (isSimilar(nextFirstConsecutive, elem1) ||
          nextFirstConsecutive === null)
      ) {
        indexFirstConsecutive--;
        nextFirstConsecutive = this[indexFirstConsecutive - 1];
      }
      const firstConsecutive = this[indexFirstConsecutive];
      if (indexFirstConsecutive === index) {
        setInitialValue(firstConsecutive);
        newArray.push(elem1);
      } else {
        merge(firstConsecutive, elem1);
        this[index] === null;
      }
    }
  });
  return newArray;
};

const readTemplateFile = async () =>
  (await fs.readFile(path.join(__dirname, 'template.md'))).toString();

const readReadme = async () =>
  (
    await fs.readFile(path.join(__dirname, '..', 'README.md')).catch(() => '')
  ).toString();

const writeReadme = (content) =>
  fs.writeFile(path.join(__dirname, '..', 'README.md'), content);

const commitReadme = async (ghUsername) => {
  await execa('git', ['config', '--global', 'user.name', 'profile-readme-bot']);
  await execa('git', [
    'config',
    '--global',
    'user.email',
    'samumartineau@gmail.com',
  ]);
  await execa('git', ['add', 'README.md']);
  await execa('git', ['commit', '-m', 'Mise à jour des données du README']);
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
    .filter((event) =>
      [
        'PushEvent',
        'ForkEvent',
        'IssueCommentEvent',
        'IssuesEvent',
        'PullRequestEvent',
        'ReleaseEvent',
        'CreateEvent',
      ].includes(event.type),
    )
    .mergeSimilar(
      (event) => event.type === 'PushEvent',
      (event1, event2) =>
        event1.type === event2.type && event1.repo.name === event2.repo.name,
      (firstConsecutive) =>
        (firstConsecutive.payload.commitCount =
          firstConsecutive.payload.commits.length),
      (toKeep, toDelete) =>
        (toKeep.payload.commitCount =
          toKeep.payload.commitCount + toDelete.payload.commits.length),
    )
    .mergeSimilar(
      (event) => event.type === 'IssueCommentEvent',
      (event1, event2) =>
        event1.type === event2.type && event1.repo.name === event2.repo.name,
      (firstConsecutive) => (firstConsecutive.payload.commentCount = 1),
      (toKeep, toDelete) =>
        (toKeep.payload.commentCount = toKeep.payload.commentCount + 1),
    )
    .map(({ type, repo, payload }) => {
      const displayRepo = (name) => `[**${name}**](https://github.com/${name})`;
      const displayIssue = (repoName, issue) =>
        `[**${issue.title}**](https://github.com/${repoName}/issues/${issue.number})`;
      const displayPullRequest = (repoName, pullRequest) =>
        `[**${pullRequest.title}**](https://github.com/${repoName}/pull/${pullRequest.number})`;

      const pluralize = (nb, str) => str + (nb > 1 ? 's' : '');
      const ifGreaterThanOne = (nb, str) => (nb > 1 ? str : '');

      switch (type) {
        case 'PushEvent':
          return `⚡ J'ai publié **${payload.commitCount}** ${pluralize(
            payload.commitCount,
            'commit',
          )} sur le repo ${displayRepo(repo.name)}`;
        case 'ForkEvent':
          return `🌈 J'ai créé un fork du repo ${displayRepo(repo.name)}`;
        case 'IssueCommentEvent':
          const isPull = !!payload.issue.pull_request;
          return `💬 J'ai commenté${ifGreaterThanOne(
            payload.commentCount,
            ` ${payload.commentCount} fois`,
          )} sur ${isPull ? 'la *pull request*' : "l'*issue*"} ${displayIssue(
            repo.name,
            payload.issue,
          )} du repo ${displayRepo(repo.name)}`;
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
    .slice(0, 10);
};

module.exports = {
  readTemplateFile,
  writeReadme,
  readReadme,
  commitReadme,
  parseGithubActivity,
};
