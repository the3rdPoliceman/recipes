## Recipes Website
The full recipes website is available via GitHub Pages at [https://the3rdpoliceman.github.io/recipes/index.html](https://the3rdpoliceman.github.io/recipes/index.html)

## Build Tools
Gulp is used for running and building, and is configured in `gulpfile.js` in the root of the repo. The following commands are used:
* `gulp` will create a target folder and build there, fire up a browser window, and watch for any changes and keep the browser up to date
* `gulp build` will create a dist folder and build a full distribution there. The dist folder should be pushed to GitHub in order to keep the online version of the recipes website up to date. 

TODO: The dist folder should probably be built on GitHub using a commit action, but currently it's a manual process.

## GitHub Actions
There is currently a single GitHub action, which is triggered every time a commit is pushed to `master`. The action copies the dist folder from the `master` branch to the `gh-pages` branch, so the website can be viewed. 
