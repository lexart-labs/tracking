(function (ng) {

    'use strict';

    var Module = ng.module('Imm');

    Module.factory('ClientServices', ['RestClient', function(RestClient){
	  	
	  	var model = "clients";
	  
	  	var factory = {

		    find: function(page, q, cb) {

				const user = window.localStorage;
				const role = user.userRole;

				let path = role == "developer" ? "current" : "all";

		      	RestClient.get(model + "/" + path, function(err, result, countItems) {
		        	cb(err, result, countItems);
		      	})
		    },

		    findById: function(id, cb) {
		    	RestClient.get(model + "/" + id, function(err, result) {
		    		cb(err, result);
		    	})
		    },

		   	findAll: function(page, q,  cb) {
				RestClient.get(model + "?sort[name]=1" + q, function(err, result) {
					cb(err, result);
				})
			},

		    save: function(obj, cb) {
		    	if (obj.id) {
		        	RestClient.post(model + "/update", obj, function(err, result) {
		          		cb(err, result);
		        	})
		      	} else {
		        	RestClient.post(model + "/new", obj, function(err, result) {
		          		cb(err, result);
		        	})
		      	}
		    },

		    remove: function(id, cb) {
		    	RestClient.delete(model + "/" + id, function(err, result) {
		        	cb(err, result);
		      	})
		    }
	  	};

	  	return factory;
	
	}]);

}(angular));