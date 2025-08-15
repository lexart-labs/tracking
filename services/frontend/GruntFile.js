module.exports = function(grunt) {

   'use strict';

   var deps = [
       "<%= meta.path.deps %>/jquery/dist/jquery.min.js",
       "<%= meta.path.deps %>/angular/angular.js",
       "<%= meta.path.deps %>/angular-route/angular-route.js",
       "<%= meta.path.deps %>/angular-messages/angular-messages.js",
       "<%= meta.path.deps %>/angular-ui-router/release/angular-ui-router.js",
       "<%= meta.path.deps %>/angular-sanitize/angular-sanitize.js",
       "<%= meta.path.deps %>/angular-ui-select/dist/select.min.js",
       "<%= meta.path.deps %>/angular-ckeditor/angular-ckeditor.min.js",
       "<%= meta.path.deps %>/lodash/dist/lodash.min.js",
       "<%= meta.path.deps %>/ngprogress/build/ngprogress.min.js",
       // "<%= meta.path.deps %>/highcharts/highcharts.js",
       "<%= meta.path.deps %>/ng-dialog/js/ngDialog.min.js",
       "<%= meta.path.deps %>/ng-notify/dist/ng-notify.min.js",
       "<%= meta.path.deps %>/ng-notify/dist/ng-notify.min.css",
       "<%= meta.path.deps %>/angular-i18n/angular-locale_es-uy.js",
       "<%= meta.path.deps %>/angular-wizard/angular-wizard.min.js"
   ], angular_modules = [

       /* App  */
       "src/js/**/*.module.js",
       "src/js/**/*.service.js",
       "src/js/**/*.filter.js",
       "src/js/**/*.directive.js",
       "src/js/**/*.controller.js",
       "src/js/app/*.js",

       /* Routing */
       "src/js/routing.js"
   ];
    grunt.option('force', true);
    angular_modules = grunt.config.process(angular_modules);

    angular_modules = grunt.file.expandMapping(angular_modules, 'src', {rename: function (dest, matchedSrcPath, options) {
        return matchedSrcPath.split('src/js/').pop();
    }});

    require('load-grunt-config')(grunt, {

        jitGrunt: true,

        data: {
            meta: {
                path: {
                    deps: '/bower_components',
                    angular_modules: 'src/js'
                },
                deps: deps,
                angular_modules: angular_modules
            }
        },

    });

    grunt.loadNpmTasks('grunt-contrib-uglify-es');
};