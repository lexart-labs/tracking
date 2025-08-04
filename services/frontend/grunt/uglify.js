module.exports = {

    dev: {
        options: {
            mangle: false,
            compress: false,
            beautify: true
        },
        files: {
            'dist/app.js': [

                // modules
                'src/js/**/*.module.js',
                // services
                'src/js/**/*.service.js',
                // filters
                'src/js/**/*.filter.js',
                // directives
                'src/js/**/*.directive.js',
                // controller
                'src/js/**/*.controller.js',

                'src/js/**/restClient.js',

                // routing
                'src/**/routing.js'

            ]
        }

    },

    prod: {
        options: {
            mangle: false,
            compress: false,
            beautify: true
        },
        files: {
            'dist/app.js': [

                // modules
                'src/js/**/*.module.js',
                // services
                'src/js/**/*.service.js',
                // filters
                'src/js/**/*.filter.js',
                // directives
                'src/js/**/*.directive.js',
                // controller
                'src/js/**/*.controller.js',

                'src/js/**/restClient.js',

                // routing
                'src/**/routing.js'

            ]
        }

    }


};
