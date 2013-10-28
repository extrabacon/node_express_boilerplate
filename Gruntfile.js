module.exports = function (grunt) {

    var shellWithOutput = { stdout: true, stderr: true, failOnError: true };

    // Project configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        env_name: 'local',
        shell: {
            npm_install: { command: 'npm install', options: shellWithOutput },
            npm_update: { command: 'npm update', options: shellWithOutput },
            bower_install: { command: 'bower install', options: shellWithOutput },
            bower_update: { command: 'bower update', options: shellWithOutput },
            start: {
                command: 'nodemon app.js',
                options: shellWithOutput
            },
            start_debug: {
                command: 'node --debug app.js',
                options: shellWithOutput
            },
            start_inspector: { command: 'node-inspector &', options: shellWithOutput },
            start_debugger: { command: 'open http://127.0.0.1:8080/debug?port=5858' }
        },
        concurrent: {
            development: {
                tasks: ['shell:start', 'watch'],
                options: {
                    logConcurrentOutput: true
                }
            },
            debugging: {
                tasks: ['shell:start_debug', 'shell:start_inspector', 'shell:start_debugger'],
                options: {
                    logConcurrentOutput: true
                }
            }
        },
        copy: {
            bower_components: {
                files: [
                    // jQuery
                    {
                        src: 'bower_components/jquery/jquery.min.js',
                        dest: 'public/js/jquery.min.js'
                    },
                    {
                        src: 'bower_components/jquery/jquery.min.map',
                        dest: 'public/js/jquery.min.map'
                    },
                    // Twitter Bootstrap
                    {
                        expand: true,
                        cwd: 'bower_components/bootstrap/less/',
                        src: '*.less',
                        dest: 'stylesheets/bootstrap/'
                    },
                    {
                        src: 'bower_components/bootstrap/dist/js/bootstrap.min.js',
                        dest: 'public/js/bootstrap.min.js'
                    },
                    {
                        src: 'bower_components/bootstrap/assets/js/html5shiv.js',
                        dest: 'public/js/html5shiv.js'
                    },
                    {
                        src: 'bower_components/bootstrap/assets/js/respond.min.js',
                        dest: 'public/js/respond.min.js'
                    }
                ]
            }
        },
        uglify: {},
        less: {},
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
                files: ['views/*.jade'],
                tasks: []
            },
            options: {
                livereload: true
            }
        },
        bumpup: 'package.json',
        tagrelease: 'package.json'
    });

    grunt.loadNpmTasks('grunt-contrib');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-bumpup');
    grunt.loadNpmTasks('grunt-tagrelease');

    grunt.registerTask('default', 'Runs the default build', [
        'shell:npm_install',
        'uglify',
        'less'
    ]);

    grunt.registerTask('install', 'Install package dependencies (npm and bower)', [
        'shell:npm_install',
        'shell:bower_install',
        'copy:bower_components'
    ]);

    grunt.registerTask('update', 'Update package dependencies (npm and bower)', [
        'shell:npm_update',
        'shell:bower_update',
        'copy:bower_components'
    ]);

    grunt.registerTask('start', 'Start the application in development mode', ['default', 'concurrent:development']);
    grunt.registerTask('debug', 'Run the application in debugging mode', ['default', 'concurrent:debugging']);

};
