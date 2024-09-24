This is the website for Oboe.js

This site was originally created circa 2015, and has been kept using the 'retro' tech as far as possible.
I haven't done a migration to modern tech because it works, and I currently don't have plans to maintain this project beyond keeping the lights on.

Building the site
==========

Originally it required node to run, but today it is a static site that I scrape and serve using Github Pages (the hosting is simpler)

To scrape to static:

```sh
./scrape.sh
```

Check that is scraped correctly:

```sh
npx http-server -p 8123 ./docs
# and open http://localhost:8123 in a browser to check
```

The scraped site need to be checked into git on master branch to appear on the website on Github pages