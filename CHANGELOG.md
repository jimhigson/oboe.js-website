0.1.0
=====

At this point the site is very old (I first released it 11 years ago) but I decided that I spend too much time on the animations for it to be lost forever.

September 2024

* Archive site with banner explaining status of project
* Scraped node.js site into a static version
* Move to Github Pages hosting
* Minimal update of dependencies to get the site running on modern environments (`npx npm-check-updates -u`)
    * fixed where this broke stuff
* Add a short page on the site itself

What I haven't done:
--------------------

* This site's implementation remains a time capsule. It isn't intended to be built long-term. It still is:
    * still task managed using Grunt (not package.json)
    * no Vite etc
    * served by express (not fastify etc) - although it's static now so that doesn't matter as much
    * jQuery-rendered (not React etc)
    * using sass (not tailwind, emotion etc)
    * no eslint
    * no devcontainers
    * no es6/esnext/etc (still using commonjs and `var`!)
        * or even removed [self-built OOP](https://github.com/jimhigson/oboe.js-website/blob/master/statics/js/demo/oop.js)!
    * update the node version in `package.json` from `0.1.0`! - hey, it's retro (but it works with v18 just fine)
    * `npm` (not pnpm/yarn)
        * it still uses [bower](https://bower.io/) for client-side dependencies? Remember that?!
    * `typescript` (not `.js`)
    * ...and much more that's changed in the last 11 years!
    
Basically, if you've been out of js dev for the last decade, you'll feel right at home    
    
0.0.0-xxx
=========

(Jan 2013)

Initial release of site

