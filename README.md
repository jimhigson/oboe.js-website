This is the website for Oboe.js

This site was originally created circa 2015, and has been kept using the 'retro' tech as far as possible.
I haven't done a migration to modern tech because it works, and I currently don't have plans to maintain this project beyond keeping the lights on.

Interested what I've been working on since? Check out [my github](https://github.com/jimhigson) and
maybe 🕹️[play my retro-game](https://blockstack.ing)

Building the site
==========

The site predates widespread use of easy static site generators in node, so it used node to directly serve the content.
Originally it required node to serve it, but today it is a static site that I scrape and serve using Github Pages.

Getting old Node
----------------

The node-hosted site was built on an old version of node (v0.10). 
Such an old version is hard to run on newer systems. I've updated most of the dependencies, but v24 is too new. Version 20 seems to be the right compromise.

```sh
## on MacOS ##
brew install fnm
# add this to your shell config:
# fnm env --use-on-cd | source 
source ~/.config/fish/config.fish (or wherever)

# if fnm installed correctly, cd'ing into the repo should offer to install node20, or do:

fnm install 20 # if not already got it

# now can do this:
node --version
# should be v20.x.y
npm --version
# should be 10.8.x

npm i # expect many deprecation warnings - this is ok, the node site never serves the internet
```

Wget
----
The scraper needs wget - install on your system if not already got it:
```sh
brew install wget # macos
apt-get install wget # debian/ubuntu etc
```

Running the site in Node:
------------------------

Start the node site:

```sh
# build minified css, js etc:
npm run predeploy

# start the express site:
node index.js --env=prod

# check localhost:8888 to see if the site looks ok
```

Scrape to static:

```sh
# if the site is running, kill it, the scraper will start it
./scrape.sh
```

Check that is scraped correctly:

```sh
npx http-server -p 8123 ./docs
# and open http://localhost:8123 in a browser to check
```

PRs etc
-------

The scraped site needs to be checked into git on `github_pages` branch to appear on the website on Github pages

Once done, create a branch and raise a pr into `github_pages` branch:

```sh
# if using gh cli client
gh pr create --base github_pages
# should also keep master up to date
gh pr create --base master
```