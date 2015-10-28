// gulp task manager
var gulp = require('gulp'),
	jshint = require('gulp-jshint'),
	jscs = require('gulp-jscs'),
	util = require('gulp-util'),
	gulpPrint = require('gulp-print'),
	gulpif = require('gulp-if'),
	args = require('yargs').argv,
	config = require('./gulp.config')(),
	sass = require('gulp-sass'),
	autoprefixer = require('gulp-autoprefixer'),
	del = require('del'),
	wiredep = require('wiredep'),
	inject = require('gulp-inject'),
	nodemon = require('gulp-nodemon'),
	plumber = require('gulp-plumber'),
	browserSync = require('browser-sync'),
	taskListing = require('gulp-task-listing'),
	newer = require('gulp-newer'),
	templateCache = require('gulp-angular-templatecache'),
	imagemin = require('gulp-imagemin'),
	concat = require('gulp-concat'),
	useref = require('gulp-useref'),
	minifyHtml = require('gulp-minify-html'),
	port = process.env.PORT || config.defaultPort;



gulp.task('help', taskListing);
gulp.task('default', ['help']);

gulp.task('vet', function () {
	log('Analyzing source with JSHINT and JSCS');
	gulp.src(config.alljs)
		.pipe(gulpif(args.verbose, gulpPrint()))
		.pipe(jscs())
		.pipe(jshint())
		.pipe(jshint.reporter('jshint-stylish', {verbose: true}));
	//  .pipe(jshint.reporter('fail'))

});

gulp.task('templatecache', function (){
	log('Creating AngularJS $templateCache');

	return gulp
		.src(config.htmlTemplates)
		.pipe(minifyHtml({empty: true}))
		.pipe(templateCache(config.templateCache.file,
			config.templateCache.options))
		.pipe(gulp.dest(config.temp));

});

gulp.task('optimize', ['inject'], function(){
	log('Optimizing the javascript, css, html');
	var templateCache = config.temp + config.templateCache.file;
	var assets = useref.assets({searchPath: './'});
	return gulp
		.src(config.index)
		.pipe(plumber())
		.pipe(inject(gulp.src(templateCache,{read: false}), {starttag: '<!--inject:templates:js-->'}))
		.pipe(assets)
		.pipe(assets.restore())
		.pipe(useref())
		.pipe(gulp.dest(config.build));
} );

gulp.task('clean-code', function(done){
	var files = [].concat(
		config.temp + '**/*.js',
		config.build + '**/*.html,',
		config.build + 'js/**/*.js'

	);
	clean(files,done);
});

gulp.task('bootstrap', function () {
	log('Compiling Bootstrap SASS --> CSS');
	return gulp
		.src(config.bootstrap)
		.pipe(plumber())

		.pipe(sass())


		//   .on('error', errorLoger)
		.pipe(autoprefixer({browsers: ['last 2 version', '> 5%']}))
		.pipe(gulp.dest(config.css))
});
gulp.task('sass', function () {
	log('Compiling SASS --> CSS');
	return gulp
		.src(config.sass)
		.pipe(plumber())
		.pipe(sass())
		//   .on('error', errorLoger)
		.pipe(autoprefixer({browsers: ['last 2 version', '> 5%']}))
		.pipe(gulp.dest(config.css));
});

	gulp.watch(config.clientApp, ['sass']);

gulp.task('images', function(){
	log('Copying and compressing the images');
	return gulp
		.src(config.images)
		.pipe(newer(config.build + 'images'))
		.pipe(imagemin({optimization: 4}))
		.pipe(gulp.dest(config.build + 'images'))
});
gulp.task('fonts', function(){
	return gulp
		.src(config.fonts)
		.pipe(gulp.dest(config.build + 'fonts'));
});
gulp.task('wiredep', function () {
	log("Wire up the bower css js and our app js and css");
	var options = config.getWiredepDefaultOptions();
	var wiredep = require('wiredep').stream;
	return gulp
		.src(config.index)
		.pipe(wiredep(options))
		.pipe(inject(gulp.src(config.js)))
		.pipe(gulp.dest(config.layout))

});
gulp.task('inject', ['wiredep', 'bootstrap', 'sass', 'templatecache'], function () {
	log('Wire up the app css into html and call wiredep');

	return gulp
		.src(config.index)
		.pipe(inject(gulp.src(config.css)))
		.pipe(gulp.dest(config.layout))

});
gulp.task('serve-dev', ['inject'], function () {
	var isDev = true;
	var nodeOptions = {
		script: config.nodeServer,
		delayTime: 0,
		env: {
			'PORT': port,
			'NOE_ENV': isDev ? 'dev' : 'build'
		},
		watch: [config.server]
	};
	return nodemon(nodeOptions)
		.on('restart', ['vet'], function (ev) {
			log("*** nodemon restarted");
			log('*** files changed on restart:\n' + ev);
			setTimeout(function() {
				browserSync.notify('reloading now ...');
				browserSync.reload({stream: false});
			}, config.browserReloadDelay)
		})

		.on('start', function () {
			log("*** nodemon started");
			startBrowserSync();
		})
		.on('crash', function () {
			log("*** nodemon crashed");
		})
		.on('exit', function () {
			log("*** nodemon exited cleanly");
		});

});

function startBrowserSync() {
	if (browserSync.active) {
		return;
	}

	function changeEvent(event) {
		var srcPattern = new RegExp('/.*(?=/' + config.source + ')/');
		log('File' + event.path.replace(srcPattern, '') + ' ' + event.type);
	}

	log('Starting browser-sync on port' + port);

	gulp.watch([config.sass], ['bootstrap'])
		.on('change', function (event) {
			changeEvent(event);
		});

	var options = {
		proxy: 'localhost:' + port,
		port: 3000,
		files: [config.migrations, config.config, config.clientApp, config.repositories, config.models, config.routes, config.views, '!' + config.sass
		],
		ghostNode: {
			clicks: true,
			location: false,
			forms: true,
			scroll: true
		},
		injectChanges: true,
		logFileChanges: true,
		loglevel: 'debug',
		logPrefix: 'gulp-pattern',
		notify: true,
		reloadDelay: 0
	};
	browserSync(options);
}
gulp.task('clean', function (done) {
	var files = config.temp + '**/*.css';
	clean(files, done)
});

gulp.task('default', ['serve-dev']);


function clean(path, done) {
	log('Cleanening:' + util.colors.blue(path));
	del(path, done);
}

function log(msg) {
	if (typeof (msg) === 'object') {
		for (var item in msg) {
			if (msg.hasOwnProperty(item)) {
				util.log(util.colors.blue(msg[item]));
			}
		}
	}
	else {
		util.log(util.colors.blue(msg));
	}
}
