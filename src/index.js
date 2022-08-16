const Handlebars = require("handlebars");
const npmtotal = require("npmtotal");
const prettier = require("prettier");
require("handlebars-helpers")();

const {
  readTemplateFile,
  writeReadme,
  readReadme,
  commitReadme,
  getRecentGithubActivity,
} = require("./helpers");

const prod = process.env.NODE_ENV === "production";

Handlebars.registerHelper("toLowerCase", (str) => str.toLowerCase());
Handlebars.registerPartial(
  "devicon",
  '<img alt="{{icon}}" src="https://raw.githubusercontent.com/devicons/devicon/master/icons/{{toLowerCase icon}}/{{toLowerCase icon}}-original.svg" width="50" title="{{icon}}" />'
);

const usernames = {
  github: "Samuel-Martineau",
  npm: "samuel_martineau",
};

(async function () {
  const template = Handlebars.compile(await readTemplateFile());

  const [npmPackages, recentGithubEvents] = await Promise.all([
    npmtotal(usernames.npm),
    getRecentGithubActivity(usernames.github),
  ]);

  npmPackages.stats = npmPackages.stats.sort((a, b) =>
    a.localeCompare(b, "en", { ignorePunctuation: true })
  );

  const markup = template({ npmPackages, recentGithubEvents });
  const formattedMarkup = prettier.format(markup, { parser: "markdown" });

  if (formattedMarkup.trim() !== (await readReadme()).trim()) {
    await writeReadme(formattedMarkup);
    if (prod) await commitReadme(usernames.github);
  }
})();
