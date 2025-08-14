module.exports = {

    options: {
        process: true,
        data: {
            deps: "<%= meta.deps %>",
            angular_modules: "<%= meta.angular_modules %>",
        }
    },

    dev: {

        options: {
            data: {
                stage: "local",
                angular_modules: "<%= meta.angular_modules %>",
            }
        },

        files: {
            'dist/index.html': 'src/index.html'
        }

    },

    prod: {

        options: {
            data: {
                stage: "prod",
                angular_modules: "<%= meta.angular_modules %>",
            }
        },

        files: {
            'dist/index.html': 'src/index.html'
        }

    }

};
