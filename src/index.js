const autoprefixer = require('autoprefixer');
const Handlebars = require('handlebars');
const inlineCSS = require('inline-css');
const postcss = require('postcss');
const path = require('path');
const fs = require('fs');

const getTemplatePath = (file) => path.join(__dirname, 'template', file);

(async function () {
  const template = Handlebars.compile(
    fs.readFileSync(getTemplatePath('README.md')).toString(),
  );

  const markup = template({});

  fs.writeFileSync(path.join(__dirname, '..', 'README.md'), markup);
})();
