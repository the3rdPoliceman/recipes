'use strict';

var gulp = require('gulp'),
  sass = require('gulp-sass'),
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


gulp.task('sass', function() {
  return gulp.src('./scss/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./css'));
});

gulp.task('sass:watch', function() {
  gulp.watch('./css/*.scss', ['sass']);
});

gulp.task('browser-sync', function() {
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

});

// Default task
gulp.task('default', ['browser-sync'], function() {
  gulp.start('sass:watch');
});

// Clean
gulp.task('clean', function() {
  return del(['dist', 'gen']);
});

gulp.task('copyfonts', function() {
  gulp.src('./node_modules/font-awesome/fonts/**/*.{ttf,woff,eof,svg}*')
    .pipe(gulp.dest('./dist/fonts'));
});

// Images
gulp.task('imagemin', function() {
  return gulp.src('images/*.{png,jpg,gif,svg}')
    .pipe(imagemin({
      optimizationLevel: 3,
      progressive: true,
      interlaced: true
    }))
    .pipe(gulp.dest('dist/images'));
});

// Minify code
gulp.task('usemin', function() {
  gulp.src('./gen/Recipes/**/*.html')
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
    .pipe(gulp.dest('dist/Recipes/'));

  gulp.src('./Guides/**/*.html')
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
    .pipe(gulp.dest('dist/Guides/'));

  gulp.src('./Resources/**/*.html')
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
    .pipe(gulp.dest('dist/Resources/'));

    gulp.src('./*.html')
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
    .pipe(gulp.dest('dist/'));

  return gulp.src('./*.txt').pipe(gulp.dest('dist/'));
});

function getAllJsonFiles(dir, files) {
  fs.readdirSync(dir).forEach(file => {
    const current_file = path.join(dir, file);
    if (fs.statSync(current_file).isDirectory()) 
      return getAllJsonFiles(current_file, files);
    else if (current_file.endsWith('.json'))
      return files.push(current_file);
  });
}

gulp.task('generate-recipes-from-json', function() {
  fs.readFile('doT/recipe-template.jst', 'utf8', (err, template_as_string) => {
    if(err) {
        throw err;
    }

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
  });
});

// Build
gulp.task('build', ['clean'], function() {
  gulp.start('generate-recipes-from-json', 'copyfonts', 'imagemin', 'usemin');
});