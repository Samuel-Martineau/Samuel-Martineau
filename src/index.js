const { Octokit } = require('@octokit/rest');
const Handlebars = require('handlebars');
const npmtotal = require('npmtotal');
const prettier = require('prettier');
require('handlebars-helpers')();

const {
  readTemplateFile,
  writeReadme,
  readReadme,
  commitReadme,
  parseGithubActivity,
} = require('./helpers');

const octokit = new Octokit();
const dev = process.env.NODE_ENV === 'development';

Handlebars.registerHelper('toLowerCase', (str) => str.toLowerCase());
Handlebars.registerPartial(
  'devicon',
  '<img alt="{{icon}}" src="https://raw.githubusercontent.com/devicons/devicon/master/icons/{{toLowerCase icon}}/{{toLowerCase icon}}-original.svg" width="50" title="{{icon}}" />',
);

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
  const recentGithubEvents = parseGithubActivity(rawRecentGithubEvents.data);

  const markup = template({ npmPackages, recentGithubEvents });
  const formattedMarkup = prettier.format(markup, { parser: 'markdown' });

  if (formattedMarkup.trim() !== (await readReadme()).trim()) {
    await writeReadme(formattedMarkup);
    if (!dev) await commitReadme(usernames.github);
  }
})();
