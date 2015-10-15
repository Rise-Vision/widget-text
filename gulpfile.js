/* jshint node: true */

(function () {
  "use strict";

  var bump = require("gulp-bump");
  var del = require("del");
  var factory = require("widget-tester").gulpTaskFactory;
  var gulp = require("gulp");
  var jshint = require("gulp-jshint");
  var minifyCSS = require("gulp-minify-css");
  var path = require("path");
  var rename = require("gulp-rename");
  var runSequence = require("run-sequence");
  var sourcemaps = require("gulp-sourcemaps");
  var uglify = require("gulp-uglify");
  var usemin = require("gulp-usemin");

  var htmlFiles = [
      "./src/settings.html",
      "./src/widget.html"
    ],
    jsFiles = [
      "src/**/*.js",
      "!./src/components/**/*"
    ];

  gulp.task("bump", function() {
    return gulp.src(["./package.json", "./bower.json"])
      .pipe(bump({ type:"patch" }))
      .pipe(gulp.dest("./"));
  });

  gulp.task("clean", function (cb) {
    del(["./dist/**"], cb);
  });

  gulp.task("config", function() {
    var env = process.env.NODE_ENV || "prod";

    return gulp.src(["./src/config/" + env + ".js"])
      .pipe(rename("config.js"))
      .pipe(gulp.dest("./src/config"));
  });

  gulp.task("lint", function() {
    return gulp.src(jsFiles)
      .pipe(jshint())
      .pipe(jshint.reporter("jshint-stylish"))
      .pipe(jshint.reporter("fail"));
  });

  gulp.task("source", ["lint"], function () {
    return gulp.src(["./src/*.html"])
      .pipe(usemin({
        css: [sourcemaps.init(), minifyCSS(), sourcemaps.write()],
        js: [sourcemaps.init(), uglify(), sourcemaps.write()]
      }))
      .pipe(gulp.dest("dist/"));
  });

  gulp.task("unminify", function () {
    return gulp.src(htmlFiles)
      .pipe(usemin({
        css: [rename(function (path) {
          path.basename = path.basename.substring(0, path.basename.indexOf(".min"))
        }), gulp.dest("dist")],
        js: [rename(function (path) {
          path.basename = path.basename.substring(0, path.basename.indexOf(".min"))
        }), gulp.dest("dist")]
      }))
  });

  gulp.task("source-dev", ["lint"], function () {
    return gulp.src(["./src/*.html"])
      .pipe(usemin())
      .pipe(gulp.dest("dist/"));
  });

  gulp.task("fonts", function() {
    return gulp.src("src/components/common-style/dist/fonts/**/*")
      .pipe(gulp.dest("dist/fonts"));
  });

  gulp.task("images", function() {
    return gulp.src("src/components/rv-bootstrap-formhelpers/img/bootstrap-formhelpers-googlefonts.png")
      .pipe(gulp.dest("dist/img"));
  });

  gulp.task("i18n", function(cb) {
    return gulp.src(["src/components/rv-common-i18n/dist/locales/**/*"])
      .pipe(gulp.dest("dist/locales"));
  });

  gulp.task("build", function (cb) {
    runSequence(["clean", "config"], ["source", "fonts", "images", "i18n"], ["unminify"], cb);
  });

  gulp.task("build-dev", function (cb) {
    runSequence(["clean", "config"], ["source-dev", "fonts", "images", "i18n"], cb);
  });

  gulp.task("webdriver_update", factory.webdriveUpdate());
  gulp.task("html:e2e", factory.htmlE2E());
  gulp.task("e2e:server", ["config", "html:e2e"], factory.testServer());
  gulp.task("e2e:server-close", factory.testServerClose());
  gulp.task("test:e2e:settings", ["webdriver_update", "html:e2e", "e2e:server"], factory.testE2EAngular());

  gulp.task("test", function(cb) {
    runSequence("test:e2e:settings", "e2e:server-close", cb);
  });

  gulp.task("watch", function() {
    gulp.watch("./src/**/*", ["build"]);
  });

  gulp.task("default", function(cb) {
    runSequence("test", "build", cb);
  });
})();
