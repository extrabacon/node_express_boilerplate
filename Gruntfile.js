module.exports = function (grunt) {
    var env;

    // Project configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        shell: {
            npm_install: { command: 'npm install' },
            bower_install: { command: 'bower install' },
            start_inspector: { command: 'node-inspector &' },
            start_debugger: { command: 'open http://127.0.0.1:8080/debug?port=5858' },
            options: { stdout: true, stderr: true, failOnError: true }
        },
        nodemon: {
            dev: {
                script: 'app.js',
                options: {
                    args: [],
                    env: env,
                    ignore: ['test/**', 'public/**', 'node_modules/**']
                }
            },
            debug: {
                script: 'app.js',
                options: {
                    args: [],
                    env: env,
                    nodeArgs: ['--debug'],
                    ignore: ['test/**', 'public/**', 'node_modules/**']
                }
            }
        },
        'node-inspector': {
            dev: {}
        },
        concurrent: {
            dev: {
                tasks: ['nodemon:dev', 'watch'],
                options: {
                    logConcurrentOutput: true
                }
            },
            debug: {
                tasks: ['nodemon:debug', 'node-inspector', 'shell:start_debugger', 'watch'],
                options: {
                    logConcurrentOutput: true
                }
            }
        },
        bowercopy: {
            jquery: {
                files: {
                    'scripts/jquery.min.js': 'jquery/dist/jquery.min.js',
                    'scripts/jquery.min.map': 'jquery/dist/jquery.min.map',
                }
            },
            bootstrap: {
                files: {
                    'stylesheets/less/bootstrap': 'bootstrap/less',
                    'scripts/source/bootstrap': 'bootstrap/js',
                    'scripts/bootstrap.min.js': 'bootstrap/dist/js/bootstrap.min.js',
                    'fonts': 'bootstrap/fonts'
                }
            },
            font_awesome: {
                files: {
                    'stylesheets/less/font-awesome': 'font-awesome/less',
                    'fonts': 'font-awesome/fonts'
                }
            },
            options: {
                destPrefix: 'public'
            }
        },
        /*browserify: {

        },
        uglify: {

        },
        less: {

        },
        cssmin: {

        },*/
        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: 'public/images',
                    src: '{,*/}*.{png,jpg,jpeg}',
                    dest: 'public/images'
                }],
                options: {
                    optimizationLevel: 7
                }
            }
        },
        watch: {
            scripts: {
                files: ['public/scripts/source/**/*.js'],
                tasks: ['uglify']
            },
            less: {
                files: ['public/stylesheets/less/**/*.less'],
                tasks: ['less']
            },
            views: {
                files: ['views/**/*.jade'],
                tasks: []
            },
            options: {
                livereload: true
            }
        },
        release: {
            options: {
                npm: false,
                commitMessage: 'Release <%= version %>'
            }
        }
    });

    require('load-grunt-tasks')(grunt);

    grunt.registerTask('default', 'Run the default build', [
        //'browserify',
        //'uglify',
        //'less',
        //'cssmin'
    ]);

    grunt.registerTask('install', 'Install dependencies (npm and bower)', [
        'shell:npm_install',
        'shell:bower_install',
        'bowercopy'
    ]);

    grunt.registerTask('dev', 'Start the application in development mode', ['default', 'concurrent:dev']);
    grunt.registerTask('debug', 'Run the application in debugging mode', ['default', 'concurrent:debug']);

    function loadEnv(path) {
        path = path || 'local';
        if (!/json$/.test(path)) path = './env.' + path + '.json';
        var env = require(path);
        for (var key in env) {
            process.env[key] = env[key];
        }
        return env;
    }
    grunt.registerTask('env', 'Load environment variables', loadEnv);
    env = loadEnv();

    grunt.registerTask('test', 'Run tests with Mocha', function (reporter) {
        reporter = reporter || 'spec';
        var args = ['-R', reporter];
        grunt.util.toArray(arguments).slice(1).forEach(function (arg) {
            args.push(arg);
        });
        grunt.util.spawn({
            cmd: 'mocha',
            args: args,
            opts: { env: env, stdio: 'inherit' }
        }, this.async());
    });

    grunt.registerTask('heroku_config', 'Apply configuration settings for an Heroku application', function () {
        var args = Object.keys(env).map(function (key) {
            return key + '=' + env[key];
        });
        args.unshift('config:set');
        grunt.util.spawn({
            cmd: 'heroku',
            args: args,
            opts: { stdio: 'inherit' }
        }, this.async());
    });

    grunt.registerTask('heroku_push', 'Deploy the application to the Heroku remote', function () {
        grunt.util.spawn({
            cmd: 'git',
            args: ['push', 'heroku', 'master'],
            opts: { stdio: 'inherit' }
        }, this.async());
    });

    grunt.registerTask('heroku_open', 'Open the Heroku application in the browser', function () {
        grunt.util.spawn({
            cmd: 'heroku',
            args: ['open'],
            opts: { stdio: 'inherit' }
        }, this.async());
    });
};
