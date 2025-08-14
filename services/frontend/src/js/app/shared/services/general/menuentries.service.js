(function (ng) {

    'use strict';

    var Module = ng.module('LexTracking');

    Module.factory('MenuEntriesServices', ['RestClient', function(RestClient){
	  
		var model = "menuEntries";

		var factory = {
			findAll: function(cb) {
		  		RestClient.get(model + "/all?sort[id]=1", function(err, result) {
		    		cb(err, result);
		  		})
			},

			findByProfile: function(id, cb) {
				RestClient.get(model + "/query?profileId=" + id, function(err, result) {
		    		cb(err, result);
		  		})
			}
		};

	  return factory;

	}]);

}(angular));