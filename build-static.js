const R = require('ramda');
const cheerio = require('cheerio');
const rp = require('request-promise');
const Handlebars = require('handlebars');
const Metalsmith = require('metalsmith');
const markdown = require('./metalsmith-plugins/supermarked');
const concat = require('metalsmith-concat');
const permalinks = require('metalsmith-permalinks');
const registerHelpers = require('metalsmith-register-helpers');
const inPlace = require('metalsmith-in-place');
const layouts = require('metalsmith-layouts');
const sass = require('metalsmith-sass');

const ROOT = '//www.oboejs.com';
const ANALYTICS_ID = 'UA-47871814-1';
const RAW_REPO_LOCATION = 'https://raw.github.com/jimhigson/oboe.js';
const REPO_LOCATION = 'https://github.com/jimhigson/oboe.js';
const GITHUB_TAGS_URL = 'https://api.github.com/repos/jimhigson/oboe.js/tags';
const USER_AGENT = 'http://github.com/jimhigson/oboe.js-website';

/* find latest version */
const getLatestTag = function() {
  const options = {
    url: GITHUB_TAGS_URL,
    headers: {
      'User-Agent': USER_AGENT
    },
    json: true
  };

  return rp(options)
    .then(function(json) {
      return json[0].name;
    });
};

/* Sass processing functions */
const isScss = R.contains('.scss');
const isAll = R.contains('all.scss');

const fileIsNotScss = function(contents, name) {
  return isAll(name) || !isScss(name);
};

const excludeScss = function(files) {
  return R.pickBy(fileIsNotScss, files);
};

const removeSassExceptAll = function(files) {
  const filesToKeep = excludeScss(files);
  const filesToRemove = R.omit(R.keys(filesToKeep), files);
  const removeFile = function(name) {
    delete files[name];
  };
  R.forEach(removeFile, R.keys(filesToRemove));
};

/* navbar functions */
const addPropertyToFile = R.curry(function(property, root, files, name) {
  files[name][property] = root;
});

const addProperty = R.curry(function(property, root, files) {
  const names = R.keys(files);
  R.forEach(addPropertyToFile(property, root, files), names);
});

const addPages = function(files) {
  const json = files['listing.json'].contents.toString();
  const listing = JSON.parse(json);
  delete files['listing.json'];
  const names = R.keys(files);
  R.forEach(addPropertyToFile('pages', listing, files), names);
};

/* sidebar functions */
const addHeading = function(files) {
  R.mapObjIndexed(function(file, name) {
    // only process html files
    if(!R.contains('.html', name)) {
      return;
    };
    $ = cheerio.load(file.contents);
    const headingEle = $('h1').first();
    const heading = {
      text: headingEle.text(),
      id:   headingEle.attr('id')
    };

    headingEle.remove();

    file.heading = heading;
    file.contents = new Buffer($.html().toString('binary'), 'binary');
  }, files);
};

const addSections = function(files) {
  R.mapObjIndexed(function(file, name) {
    // only process html files
    if(!R.contains('.html', name)) {
      return;
    };
    $ = cheerio.load(file.contents);
    const $headings = $('h2');
    const sections = $headings.map(function(i, heading) {
      return {
        text: $(heading).text(),
        id:   $(heading).attr('id')
      };
    });

    file.sections = sections;
    file.multipleSections = sections.length > 1;

  }, files);
};

function runBuild() {
  Metalsmith(__dirname)
    .source('./src')
    .use(registerHelpers({
      directory: './helpers'
    }))
    .use(inPlace({
      engine: 'handlebars',
      partials: './partials'
    }))
    .use(markdown())
    .use(concat({
      files: require('./sourceList.js'),
      output: 'js/app.js'
    }))
    .use(addProperty('root', ROOT))
    .use(addProperty('analyticsId', ANALYTICS_ID))
    .use(addProperty('repo', REPO_LOCATION))
    .use(addProperty('rawRepo', RAW_REPO_LOCATION))
    .use(addPages)
    .use(addHeading)
    .use(addSections)
    .use(layouts({
      engine: 'handlebars'
    }))
    .use(removeSassExceptAll)
    .use(sass({
      outputDir: 'css/'
    }))
    .destination('./gh-pages')
    .use(permalinks({
      pattern: ':page'
    }))
    .build(function(err) {
      if (err) console.log(err);
    });
}

function addLatestTagHelper(latestTag) {
  return Handlebars.registerHelper('latestTag', function(a1) {
    return latestTag;
  })
}

function main() {
  getLatestTag()
    .then(addLatestTagHelper)
    .then(runBuild)
}

if (require.main === module) {
  main();
}

module.exports = {
  fileIsNotScss: fileIsNotScss,
  excludeScss: excludeScss,
  addProperty: addProperty,
  addHeading: addHeading,
  addSections: addSections
};
