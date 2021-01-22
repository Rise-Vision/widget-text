/* jshint node: true */

(function () {
  "use strict";

  var bower = require("gulp-bower");
  var bump = require("gulp-bump");
  var del = require("del");
  var env = process.env.NODE_ENV || "prod";
  var factory = require("widget-tester").gulpTaskFactory;
  var file = require("gulp-file");
  var gulp = require("gulp");
  var gulpif = require("gulp-if");
  var gutil = require("gulp-util");
  var jshint = require("gulp-jshint");
  var minifyCSS = require("gulp-minify-css");
  var path = require("path");
  var rename = require("gulp-rename");
  var runSequence = require("run-sequence");
  var sourcemaps = require("gulp-sourcemaps");
  var uglify = require("gulp-uglify");
  var usemin = require("gulp-usemin");
  var wct = require("web-component-tester").gulp.init(gulp);

  var htmlFiles = [
      "./src/settings.html",
      "./src/widget.html"
    ],
    jsFiles = [
      "src/**/*.js",
      "!./src/components/**/*"
    ],
    vendorFiles = [
      "./src/components/jquery/dist/jquery.min.js",
      "./src/components/gsap/src/minified/TweenLite.min.js",
      "./src/components/gsap/src/minified/plugins/CSSPlugin.min.js",
      "./src/components/gsap/src/minified/utils/Draggable.min.js",
      "./src/components/gsap/src/minified/plugins/ScrollToPlugin.min.js",
      "./src/components/tinymce/plugins/**/*",
      "./src/components/tinymce/skins/**/*",
      "./src/components/tinymce/themes/**/*",
      "./src/components/tinymce/tinymce*.js",
      "./src/components/angular/angular*.js",
      "./src/components/angular/*.gzip",
      "./src/components/angular/*.map",
      "./src/components/angular/*.css"
    ],
    vendorNodeFiles = [
      "./node_modules/webfontloader/webfontloader.js"
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
    var configFile = (env === "dev" ? "dev.js" : "prod.js");

    gutil.log("Environment is", env);

    return gulp.src(["./src/config/" + configFile])
      .pipe(rename("config.js"))
      .pipe(gulp.dest("./src/config"));
  });

  gulp.task("lint", function() {
    return gulp.src(jsFiles)
      .pipe(jshint())
      .pipe(jshint.reporter("jshint-stylish"))
      .pipe(jshint.reporter("fail"));
  });

  gulp.task("version", function () {
    var pkg = require("./package.json"),
      str = '/* exported version */\n' +
        'var version = "' + pkg.version + '";';

    return file("version.js", str, {src: true})
      .pipe(gulp.dest("./src/config/"));
  });

  gulp.task("source-settings", ["lint"], function () {
    var isProd = (env === "prod");

    return gulp.src("./src/settings.html")
      .pipe(gulpif(isProd,
        // Minify for production.
        usemin({
          css: [sourcemaps.init(), minifyCSS(), sourcemaps.write()],
          js: [uglify()]
        }),
        // Don't minify for staging.
        usemin({})
      ))
      .pipe(gulp.dest("dist/"));
  });

  gulp.task("source-widget", ["lint"], function () {
    var isProd = (env === "prod");

    return gulp.src("./src/widget.html")
      .pipe(gulpif(isProd,
        // Minify for production.
        usemin({
          css: [sourcemaps.init(), minifyCSS(), sourcemaps.write()],
          js: [sourcemaps.init(), uglify(), sourcemaps.write()]
        }),
        // Don't minify for staging.
        usemin({})
      ))
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

  gulp.task("fonts", function() {
    return gulp.src("src/components/common-header/dist/fonts/**/*")
      .pipe(gulp.dest("dist/fonts"));
  });

  gulp.task("i18n", function(cb) {
    return gulp.src(["src/components/common-header/dist/locales/**/*"])
      .pipe(gulp.dest("dist/locales"));
  });

  gulp.task("vendor_node", function(cb) {
    return gulp.src(vendorNodeFiles, {base: "./node_modules"})
      .pipe(gulp.dest("dist/js/vendor"));
  });

  gulp.task("vendor", ["vendor_node"], function(cb) {
    return gulp.src(vendorFiles, {base: "./src/components"})
      .pipe(gulp.dest("dist/js/vendor"));
  });

  gulp.task("bower-update", function (cb) {
    return bower({ cmd: "update"}).on("error", function(err) {
      console.log(err);
      cb();
    });
  });

  gulp.task("build", function (cb) {
    runSequence(["clean", "config", "bower-update", "version"], ["source-settings", "source-widget", "fonts", "i18n", "vendor"], ["unminify"], cb);
  });

  gulp.task("webdriver_update", factory.webdriveUpdate());

  // ***** e2e Testing ***** //
  gulp.task("html:e2e:settings", factory.htmlE2E({
    files: "./src/settings.html",
    e2eFontLoader: "../node_modules/widget-tester/mocks/web-font-loader-mock.js"
  }));

  gulp.task("e2e:server:settings", ["config", "html:e2e:settings"], factory.testServer());

  gulp.task("test:e2e:settings:run", ["webdriver_update"], factory.testE2EAngular({
    testFiles: "test/e2e/settings.js"}
  ));

  gulp.task("test:e2e:settings", function(cb) {
    runSequence(["e2e:server:settings"], "test:e2e:settings:run", "e2e:server-close", cb);
  });

  gulp.task("e2e:server-close", factory.testServerClose());

  gulp.task("test:e2e", function(cb) {
    runSequence("test:e2e:settings", cb);
  });

  // ***** Integration Testing ***** //
  gulp.task("test:integration", function(cb) {
    runSequence("test:local", cb);
  });

  gulp.task("test", function(cb) {
    runSequence("version", "test:e2e", "test:integration", cb);
  });

  gulp.task("default", function(cb) {
    runSequence("build", cb);
  });
})();
