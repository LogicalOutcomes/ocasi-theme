// For development => gulp
// For production  => gulp -p

// Call Plugins
var env            = require('minimist')(process.argv.slice(2)),
    gulp           = require('gulp'),
    uglify         = require('gulp-uglify'),
    compass        = require('gulp-compass'),
    concat         = require('gulp-concat'),
    cssmin         = require('gulp-cssmin'),
    gulpif         = require('gulp-if'),
    connect        = require('gulp-connect'),
    modRewrite     = require('connect-modrewrite'),
    imagemin       = require('gulp-imagemin');
    nunjucksRender = require('gulp-nunjucks-render');

// Collect fonts
gulp.task('fonts', function(){
    return gulp.src('src/fonts/**/*')
        .pipe(gulp.dest('docs/fonts/'))
        .pipe(connect.reload());
});

// Call nunjucks for templates
gulp.task('nunjucks', function() {
  // Gets .html and .nunjucks files in pages
  return gulp.src('src/templates/pages/**/*.+(html|nunjucks)')
  // Renders template with nunjucks
  .pipe(nunjucksRender({
      path: ['src/templates']
    }))
  // output files in app folder
  .pipe(gulp.dest('docs/'))
});

// Call Uglify and Concat JS
gulp.task('js', function(){
    return gulp.src(['src/js/bootstrap/tooltip.js', 'src/js/**/*.js'])
        .pipe(concat('main.js'))
        .pipe(gulpif(env.p, uglify()))
        .pipe(gulp.dest('docs/js/'))
        .pipe(connect.reload());
});

// Call Sass
gulp.task('compass', function(){
    return gulp.src('src/sass/main.scss')
        .pipe(compass({
            css: 'src/css',
            sass: 'src/sass',
            image: 'src/img'

        }))
        .pipe(gulpif(env.p, cssmin()))
        .pipe(gulp.dest('docs/css/'))
        .pipe(connect.reload());
});

// Call Imagemin
gulp.task('imagemin', function() {
  return gulp.src('src/img/**/*')
// FIXME: fix the use of imagemin
//    .pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
    .pipe(gulp.dest('docs/img'));
});

// Call Watch
gulp.task('watch', function(){
    gulp.watch('src/templates/**/*.{html,nunjucks}', ['nunjucks']);
    gulp.watch('src/sass/**/*.scss', ['compass']);
    gulp.watch('src/js/**/*.js', ['js']);
    gulp.watch('src/img/**/*.{jpg,png,gif}', ['imagemin']);
});

// Connect (Livereload)
gulp.task('connect', function() {
    connect.server({
        root: ['docs/'],
        livereload: true,
        middleware: function(){
            return [
                modRewrite([
                    '^/$ /index.html',
                    '^([^\\.]+)$ $1.html'
                ])
            ];
        }
    });
});

// Default task
gulp.task('default', ['js', 'nunjucks', 'fonts', 'compass', 'imagemin', 'watch', 'connect']);
