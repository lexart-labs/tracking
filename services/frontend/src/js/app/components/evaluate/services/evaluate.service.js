(function (ng) {

    'use strict';

    var Module = ng.module('LexTracking');

    Module.factory('EvaluateServices', ['RestClient', function(RestClient){

	  	var model = "evaluate";

	  	var factory = {
		    save: function(obj, cb) {
		    	if (obj.id) {
		    		RestClient.post(model + "/update", obj, function(err, result){
		    			cb(err, result);
		    		})
		    	} else {
		        	RestClient.post(model + "/new", obj, function(err, result) {
		          		cb(err, result);
		        	})
		    	}
		    },

		    find: function(id, cb) {
		    	RestClient.get(model + '/user/' + id, function(err, result){
		    		cb(err, result);
		    	})
		    }
	  	};

	  	return factory;

	}]);

}(angular));
