const gulp = require('gulp');

// Common
const gulpif = require('gulp-if');
const rename = require('gulp-rename');
const concat = require('gulp-concat');


// js
const uglify = require('gulp-uglify');


const CONSENTIO = {
	js: {
		src: ['src/js/*.js'],
		dest: 'docs/js/'
	}
}

async function buildJs() {
	return gulp.src(CONSENTIO.js.src)
		.pipe(concat('consentio.js'))
		.pipe(gulp.dest(CONSENTIO.js.dest))
		.pipe(rename({ suffix: '.min' }))
		.pipe(uglify())
		.pipe(gulp.dest(CONSENTIO.js.dest));

}

gulp.task("build", buildJs);
gulp.task("watch", async function () {
	gulp.watch(CONSENTIO.js.src, buildJs);
})	
