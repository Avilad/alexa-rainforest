'use strict';

var gulp = require('gulp-help')(require('gulp')),
    gutil = require('gulp-util'),
    del = require('del'),
    install = require('gulp-install'),
    zip = require('gulp-zip'),
    runSequence = require('run-sequence'),
    awsLambda = require('node-aws-lambda'),
    Config = require('./config/lambda-config');

function stringAsSrc(filename, string) {
    var src = require('stream').Readable({ objectMode: true });
    src._read = function () {
        this.push(new gutil.File({ cwd: '', base: '', path: filename, contents: new Buffer(string) }));
        this.push(null);
    };
    return src;
}

gulp.task('default', ['help']);

gulp.task('build-lambda-code', 'Process source and create dist.zip file to upload to AWS lambda **', function (callback) {
    return runSequence(
        'clean',
        ['js', 'assets', 'config', 'node-mods'],
        ['build-intent-schema', 'build-utterances'],
        'zip',
        callback
    );
}, {
    aliases: ['build']
});

gulp.task('push-lambda-code', 'Process source then upload to AWS lambda **', function (callback) {
    return runSequence(
        'build-lambda-code',
        'upload',
        callback
    );
}, {
    aliases: ['push']
});

gulp.task('quick-push-lambda-code', 'Process source then upload to AWS lambda without updating modules **', function (callback) {
    return runSequence(
        ['js', 'assets', 'config'],
        'zip',
        'upload',
        callback
    );
}, {
    aliases: ['quick', 'quick-push']
});

gulp.task('build-intent-schema', 'Build the intent schema from source **', function () {
    var app = require('./src/index.js'),
        str = app.schema();

    return stringAsSrc('IntentSchema.json', str).pipe(gulp.dest('assets/speech/'));
}, {
    aliases: ['intent', 'intents']
});

gulp.task('build-utterances', 'Build the utterances from source **', function () {
    var app = require('./src/index.js'),
        str = app.utterances();

    return stringAsSrc('SampleUtterances.txt', str).pipe(gulp.dest('assets/speech/'));
}, {
    aliases: ['utterances']
});

gulp.task('clean', 'Clean out the dist folder and remove the compiled zip file', function () {
    return del(['./dist', './dist.zip']);
});

gulp.task('js', 'Compile/move javascript files to dist', function () {
    gulp.src('src/**/*').pipe(gulp.dest('dist/'));
    return gulp.src('lib/helper/*').pipe(gulp.dest('dist/lib/helper'));
});

// TODO: Make this env production/develop config files
gulp.task('config', 'Compile/move config files to dist', function () {
    return gulp.src('config/*').pipe(gulp.dest('dist/config'));
});

gulp.task('assets', 'Compile/move assets files to dist', function () {
    gulp.src('assets/*').pipe(gulp.dest('dist/assets'));
    return gulp.src('images/*').pipe(gulp.dest('dist/images'));
});

gulp.task('node-mods', 'Install npm packages to dist, ignoring devDependencies', function () {
    return gulp.src('./package.json')
        .pipe(gulp.dest('./dist/'))
        .pipe(install({production: true}));
});

gulp.task('zip', 'Zip the dist directory', function () {
    return gulp.src(['dist/**/*', '!package.json'])
        .pipe(zip('dist.zip'))
        .pipe(gulp.dest('./'));
});

gulp.task('upload', 'Upload zip file to lambda', function (callback) {
    return awsLambda.deploy('./dist.zip', Config, callback);
});
