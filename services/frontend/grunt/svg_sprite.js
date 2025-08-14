module.exports = {

    template: {
        src: ['src/assets/images/*.svg'],
        dest: 'dist/assets/images',
        options: {
            shape: {
                id: {
                    separator   : '_',                     // Separator for directory name traversal
                    generator   : function(name, file) {
                        return name.substring(name.lastIndexOf('/')+1).slice(0, -4);
                    },
                    pseudo      : '~',
                    whitespace  : '-'
                }

            },
            mode: {
                inline: true,
                symbol: true

            },
            expand: false
        }
    }

};
