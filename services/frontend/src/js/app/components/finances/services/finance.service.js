(function (ng) {

    'use strict';

    var Module = ng.module('LexTracking');

    Module.factory('FinanceServices', ['RestClient', function(RestClient){

	  	var model = "finance";

	  	var factory = {

		    find: function(page, q, cb) {
		      	RestClient.get( "finances/all", function(err, result, countItems) {
		        	cb(err, result, countItems);
		      	})
		    },

		    findByMonth: function(page, q, cb) {
		      	RestClient.get( "finances/all/date/" + q, function(err, result, countItems) {
		        	cb(err, result, countItems);
		      	})
		    },

		    findById: function(id, cb) {
		    	RestClient.get(model + "/" + id, function(err, result) {
		    		cb(err, result);
		    	})
		    },

        allStatus: function(cb) {
		      	RestClient.get( "finances/status/all", function(err, result) {
		        	cb(err, result);
		      	})

        },
        allTypes: function(cb) {
		      	RestClient.get( "finances/types/all", function(err, result) {
		        	cb(err, result);
		      	})

        },
        allConcepts: function(cb) {
		      	RestClient.get( "finances/concepts/all", function(err, result) {
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
