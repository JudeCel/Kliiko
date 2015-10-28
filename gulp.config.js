module.exports = function () {
    var client = './src/client/';
    var clientApp = './public/';
    var temp = './.tmp/';
    var server = './bin/';
    var views = './views/';

    var config = {

        config: 'config/**/*.*',
        migrations: 'migrations/**/*.*',
        models: "models/**/*.*",
        repositories: 'repositories/**/*.*',
        routes: 'routes/**/*.*',
        views: 'views/**/*.*',
        temp: temp,
        alljs: ['*.js', './**/*.js'],
        client: client,
        build: './build/',
        fonts: './bower_components/font-awesome/fonts/**',
        images: client + 'images/**/*.*',
        htmlTemplates: clientApp + '**/*.html',
        index: views + 'layout.ejs' ,
        clientApp: clientApp + 'scss/**/*.scss',
        layout: views,
        js: [
            server + '**/*.*/',
            clientApp + '**/*.js',
            clientApp + '**/*.js',
            '!' + clientApp + '**/*.spec.js'
        ],
        sass: clientApp + 'scss/main.scss',
        bootstrap: clientApp + 'scss/**/bootstrap.scss',
        server: server,
       // temp: clientApp + './css/*.css',
        templateCache: {
            file: 'templates.js',
            options: {
                module: 'app.core',
                standAlone: false,
                root: 'app/'
            }
        },
        browserReloadDelay: 0,
        css: clientApp + 'css/',
        bower: {
            json: require('./bower.json'),
            directory: './bower_components/',
            ignorePath: '../..'
        },
        defaultPort: 7203,
        nodeServer: './bin/www'
    };

    config.getWiredepDefaultOptions = function () {
        var options = {
            bowerJson: config.bower.json,
            directory: config.bower.directory,
            ignorepath: config.bower.ignorePath
        };
        return options;


    };

    return config;
};

