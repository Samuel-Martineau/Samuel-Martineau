const fs = require('fs').promises;
const execa = require('execa');
const path = require('path');

const readTemplateFile = async () =>
  (await fs.readFile(path.join(__dirname, 'template.md'))).toString();

const readReadme = async () =>
  (await fs.readFile(path.join(__dirname, '..', 'README.md'))).toString();

const writeReadme = async (content) =>
  await fs.writeFile(path.join(__dirname, '..', 'README.md'), content);

const commitReadme = async () => {
  await execa('git', ['config', '--global', 'user.name', 'profile-readme-bot']);
  await execa('git', [
    'config',
    '--global',
    'user.email',
    'samumartineau@gmail.com',
  ]);
  await execa('git', ['add', 'README.md']);
  await execa('git', ['commit', '-m', 'Mise à jour des données du README']);
  await execa('git', ['push']);
};

module.exports = {
  readTemplateFile,
  writeReadme,
  readReadme,
  commitReadme,
};
