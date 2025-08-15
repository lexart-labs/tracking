module.exports = {
    icons: {
        src: 'src/assets/images/icons/*.svg',
        dest: 'src/less/fonts',
        options: {
            fontFilename: 'imm-iconfont',
            syntax: 'bem',
            relativeFontPath: '/styles/',
            stylesheet: 'less',
            templateOptions: {
                stylesheets: 'less',
                baseClass: 'imm-icon',
                classPrefix: 'imm-icon--'
            }
        }
    }
};