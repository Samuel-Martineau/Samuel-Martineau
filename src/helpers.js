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

module.exports = {
  readTemplateFile,
  writeReadme,
  readReadme,
  commitReadme,
};
