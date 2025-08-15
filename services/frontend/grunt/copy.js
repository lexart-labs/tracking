module.exports = {	
  
  conf: {
    files: [
      {
        expand: true,
        cwd: 'src/',
        src: 'env.js',
        dest: 'dist/'
      }
    ]
  },

  partials: {
    files: [
      {
        expand: true,
        flatten: false,
        cwd: 'src/js/',
        src: ['**/*.html'],
        dest: 'dist/'
      }
    ]
  },

  fonts: {
    files: [
      {
        expand: true,
        flatten: false,
        cwd: 'src/less/fonts/',
        src: ['**/*.eot', '**/*.ttf', '**/*.woff'],
        dest: 'dist/styles/'
      }
    ]
  },

  images: {
    files: [
      {
        expand: true,
        flatten: false,
        cwd: 'src/assets/',
        src: ['**/*.svg', '**/*.png', '**/*.gif', '**/*.jpg', '**/*.ico'],
        dest: 'dist/assets/'
      }
    ]
  },

  languages: {
    files: [
      {
        expand: true,
        flatten: false,
        cwd: 'src/assets/',
        src: ['**/*.json'],
        dest: 'dist/assets/'
      }
    ]
  },

  deps: {
    files: [
      {
        expand: true,
        src: ['bower_components/**/*'],
        dest: 'dist/'
      },
      {
        expand: true,
        src: ['lib/**/*'],
        dest: 'dist/'
      }
    ]
  },

  dev_js: {
    files: [
      {
        expand: true,
        flatten: false,
        cwd: 'src/js/',
        src: ['**/*.js'],
        dest: 'dist/'
      }
    ]
  }

};