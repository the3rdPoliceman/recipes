## Recipes Website
The full recipes website is available via GitHub Pages (from the gh-pages branch) at [https://the3rdpoliceman.github.io/recipes/index.html](https://the3rdpoliceman.github.io/recipes/index.html)

## Repo Structure
There are 3 branches which should remain permanently in place
* `development` - where pretty much all work is carried out
* `master` - work from the development branch can be pushed here, triggering a build that pushes the latest website to the gh-pages branch
* `gh-pages` - a subtree branch of the repo containing only the content of the dist directory. No touching, human


## Running and Building
Gulp is used for running and building, and is configured in `gulpfile.js` in the root of the repo. The following commands are used:
* `gulp` will create a target directory and build there, fire up a browser window, and watch for any changes and keep the browser up to date
* `gulp build` will create a dist directory and build a full distribution there. This is currently done by the GitHub action described below and should not need to be done manually

## GitHub Actions
There is currently a single GitHub action, which is triggered every time a commit is pushed to `master`. The action does a complete `gulp build` to the dist directory, then pushes the build from the `master` branch to the `gh-pages` branch, so the website can be viewed
