module.exports = {

  options: {
    livereload: true,
    nospawn: true
  },

  images: {
    files: ['src/**/*.svg', 'src/**/*.jpg', 'src/**/*.png', 'src/**/*.gif'],
    tasks: ['copy:images']
  },
  json: {
    files: ['src/**/*.json'],
    tasks: ['copy:languages']
  },
  views: {
    files: ['src/**/*.html'],
    tasks: ['processhtml:dev', 'copy:partials']
  },
  styles: {
    files: ['src/**/*.less'],
    tasks: ['less:dev']
  },
  js: {
    files: ['src/**/*.js'],
    tasks: ['copy:dev_js']
  }
  
}