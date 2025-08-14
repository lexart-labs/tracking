var modRewrite = require('connect-modrewrite');

module.exports = {

	server: {
		options: {
			port: 8000,
			hostname: '*',
			base: './dist/',
			open: true,
			livereload: true,
			middleware: function(connect, options, middlewares) {
				// 1. mod-rewrite behavior
				var rules = [
					'!\\.html|\\.js|\\.css|\\.svg|\\.jp(e?)g|\\.png|\\.gif|\\.eot|\\.ttf|\\.woff$ /index.html'
				];
				middlewares.unshift(modRewrite(rules));
				return middlewares;
			}
		}
	}

};