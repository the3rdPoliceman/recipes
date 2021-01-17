'use strict';

const {
  src,
  dest,
  parallel,
  series,
  watch
} = require('gulp');

var sass = require('gulp-sass'),
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
  path = require("path"),
  fs_extra = require('fs-extra');


function compileScss() {
  src('./scss/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(dest('./css'));
}

function watchScss() {
  watch('./css/*.scss', compileScss);
}

function syncBrowser() {
  var files = [
    './*.html',
    './Recipes/**/*.html',
    './css/*.css',
    './images/*.{png,jpg,gif}',
    './js/*.js'
  ];

  browserSync.init(files, {
    server: {
      baseDir: "./dist"
    }
  });
};

// Default task
const defaultTasks = parallel(syncBrowser, watchScss);


// Clean
function clean() {
  return del(['dist', 'gen']);
}


function copyFonts() {
  return src('./node_modules/font-awesome/fonts/**/*.{ttf,woff,eof,svg}*')
    .pipe(dest('./dist/fonts'));
}

// // Images
function minifyImages() {
  return src('images/*.{png,jpg,gif,svg}')
    .pipe(imagemin({
      optimizationLevel: 3,
      progressive: true,
      interlaced: true
    }))
    .pipe(dest('dist/images'));
}

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

// // Minify code
function copyTextFilesToDist() {
  return src('./*.txt').pipe(dest('dist/'));
};

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

// Build
const build = series(clean, generateRecipesFromJson, copyFonts, parallel(minifyImages, minifyRecipes, minifyGuides, minifyResources, minifyRootHtml, copyTextFilesToDist));

exports.build = build;
exports.default = defaultTasks;
exports.clean = clean;
exports.copyFonts = copyFonts;
exports.minifyImages = minifyImages;
exports.minifyRecipes = minifyRecipes;
exports.minifyGuides = minifyGuides;
exports.minifyResources = minifyResources;
exports.minifyRootHtml = minifyRootHtml;
exports.copyTextFilesToDist = copyTextFilesToDist;
exports.generateRecipesFromJson = generateRecipesFromJson;