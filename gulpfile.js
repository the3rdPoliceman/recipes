'use strict';

const {
  src,
  dest,
  parallel,
  series,
  watch
} = require('gulp');

const sass = require('gulp-sass'),
  browserSync = require('browser-sync'),
  del = require('del'),
  imagemin = require('gulp-imagemin'),
  uglify = require('gulp-uglify'),
  usemin = require('gulp-usemin'),
  rev = require('gulp-rev'),
  cleanCss = require('gulp-clean-css'),
  flatmap = require('gulp-flatmap'),
  htmlmin = require('gulp-htmlmin'),
  doT = require('dot'),
  fs = require('fs'),
  fs_extra = require('fs-extra'),
  path = require("path"),
  recipesToJson = require('./recipe-to-json/dist');

function compileMarkdownRecipesToJSON() {
   return src('./RecipeScratchpad/**/*.recipe')
     .pipe(recipesToJson())
     .pipe(dest('./json/Recipes'));
}

function watchMarkdownRecipes(){
  let filesToWatch = ['./RecipeScratchpad/**/*.recipe'];

  return watch(filesToWatch, compileMarkdownRecipesToJSON  );
}

function compileScss() {
  return src('./scss/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(dest('./target/css'));
}

function getAllJsonFiles(dir, files) {
  fs.readdirSync(dir).forEach(file => {
    const current_file = path.join(dir, file);
    if (fs.statSync(current_file).isDirectory())
      return getAllJsonFiles(current_file, files);
    else if (current_file.endsWith('.json'))
      return files.push(current_file);
  });
}

function generateRecipesFromJson(callback) {
  let template_as_string = fs.readFileSync('doT/recipe-template.jst', 'utf8');
  let templateFunction = doT.template(template_as_string);

  let files = [];
  getAllJsonFiles("json/Recipes", files);
  for (let index = 0; index < files.length; index++) {
    let recipe_as_string = fs.readFileSync(files[index], 'utf8');
    let recipe_as_json = JSON.parse(recipe_as_string);
    let recipe_as_html = templateFunction(recipe_as_json);

    let generated_recipe_file_path = "gen/" + files[index].substring(5).replace('.json', '.html');
    fs_extra.ensureFileSync(generated_recipe_file_path);
    fs.writeFileSync(generated_recipe_file_path, recipe_as_html);
  }

  callback();
};

function watchAll() {
  let filesToWatch = ['./scss/*.scss',
    './json/**/*.json',
    './images/**/*.*',
    './js/*.*',
    './doT/**/*.jst',
    './Guides/**/*.html',
    './Resources/**/*.html',
    './*.html',
    './*.txt'
  ];

  return watch(filesToWatch, buildTarget);
}

function syncBrowser() {
  var files = [
    './target/*.html',
    './target/Recipes/**/*.html',
    './target/css/*.css',
    './target/images/**/*.{png,jpg,gif,xml,json}',
    './target/js/*.js'
  ];

  browserSync.init(files, {
    server: {
      baseDir: "./target"
    }
  });
};

function cleanTarget() {
  return del(['target', 'gen']);
}

function copyNecessaryLocalNodeModules() {
  return src(['./node_modules/bootstrap/**/*.*', './node_modules/jquery/**/*.*', './node_modules/popper.js/**/*.*'], {
      base: './node_modules/'
    })
    .pipe(dest('./target/node_modules'));
}

function copyCssToTarget() {
  return src('./scss/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(dest('./target/css'));
}

function copyImagesToTarget() {
  return src('./images/**/*.{png,jpg,gif,svg,xml,json}').pipe(dest('./target/images'));
}

function copyJavascriptToTarget() {
  return src('./js/*.js').pipe(dest('./target/js'));
}

function copyRecipesToTarget() {
  return src('./gen/Recipes/**/*.html').pipe(dest('./target/Recipes'));
}

function copyGuidesToTarget() {
  return src('./Guides/**/*.html').pipe(dest('./target/Guides'));
}

function copyResourcesToTarget() {
  return src('./Resources/**/*.html').pipe(dest('./target/Resources'));
}

function copyRootFilesToTarget() {
  return src(['./*.html', './*.txt', './*.ico']).pipe(dest('./target'));
}

// Clean
function clean() {
  return del(['dist', 'gen', 'css']);
}

function copyFonts() {
  return src('./node_modules/font-awesome/fonts/**/*.{ttf,woff,eof,svg}*')
    .pipe(dest('./dist/fonts'));
}

function generateCss() {
  return src('./scss/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(dest('./css'));
}

// // Images
function minifyImages() {
  return src('images/**/*.{png,jpg,gif,svg}')
    .pipe(imagemin({
      optimizationLevel: 3,
      progressive: true,
      interlaced: true
    }))
    .pipe(dest('dist/images'));
}

function copyImageDescriptorsToDist() {
  return src('images/**/*.{json,xml}').pipe(dest('dist/images'));
};

function minifyGuides() {
  return src('./Guides/**/*.html')
    .pipe(flatmap(function(stream, file) {
      return stream
        .pipe(usemin({
          css: [rev()],
          html: [function() {
            return htmlmin({
              collapseWhitespace: true
            })
          }],
          js: [uglify(), rev()],
          inlinejs: [uglify()],
          inlinecss: [cleanCss(), 'concat']
        }))
    }))
    .pipe(dest('dist/Guides/'));
}

function minifyResources() {
  return src('./Resources/**/*.html')
    .pipe(flatmap(function(stream, file) {
      return stream
        .pipe(usemin({
          css: [rev()],
          html: [function() {
            return htmlmin({
              collapseWhitespace: true
            })
          }],
          js: [uglify(), rev()],
          inlinejs: [uglify()],
          inlinecss: [cleanCss(), 'concat']
        }))
    }))
    .pipe(dest('dist/Resources/'));
}

function minifyRootHtml() {
  return src('./*.html')
    .pipe(flatmap(function(stream, file) {
      return stream
        .pipe(usemin({
          css: [rev()],
          html: [function() {
            return htmlmin({
              collapseWhitespace: true
            })
          }],
          js: [uglify(), rev()],
          inlinejs: [uglify()],
          inlinecss: [cleanCss(), 'concat']
        }))
    }))
    .pipe(dest('dist/'));
}

function minifyRecipes() {
  return src('./gen/Recipes/**/*.html')
    .pipe(flatmap(function(stream, file) {
      return stream
        .pipe(usemin({
          css: [rev()],
          html: [function() {
            return htmlmin({
              collapseWhitespace: true
            })
          }],
          js: [uglify(), rev()],
          inlinejs: [uglify()],
          inlinecss: [cleanCss(), 'concat']
        }))
    }))
    .pipe(dest('dist/Recipes/'));
}


function copyRootResourceFilesToDist() {
  return src(['./*.txt', './*.ico']).pipe(dest('dist/'));
};

function runDist() {
  var files = [];

  browserSync.init(files, {
    server: {
      baseDir: "./dist"
    }
  });
};

// TASKS
const buildTarget = series(generateRecipesFromJson, 
                            parallel( copyNecessaryLocalNodeModules, 
                                      copyCssToTarget, 
                                      copyImagesToTarget, 
                                      copyJavascriptToTarget, 
                                      copyRecipesToTarget, 
                                      copyGuidesToTarget, 
                                      copyResourcesToTarget, 
                                      copyRootFilesToTarget));
                            
const build = series( clean, 
                      generateRecipesFromJson, 
                      generateCss, 
                      copyFonts, 
                      parallel( minifyImages, 
                                copyImageDescriptorsToDist,
                                minifyRecipes, 
                                minifyGuides, 
                                minifyResources, 
                                minifyRootHtml, 
                                copyRootResourceFilesToDist));

// Default task
const runTarget = series( cleanTarget, 
                          buildTarget,
                          parallel( syncBrowser, 
                                    watchAll));

exports.build = build;
exports.runDist = runDist;
exports.default = runTarget;
exports.watchMarkdownRecipes = watchMarkdownRecipes;