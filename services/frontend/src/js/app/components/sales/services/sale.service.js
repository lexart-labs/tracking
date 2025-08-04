(function (ng) {

    'use strict';

    var Module = ng.module('LexTracking');

    Module.factory('SaleServices', ['RestClient', function(RestClient){

	  	var model = "sales";

	  	var factory = {

		    find: function(page, q, cb) {
		      	RestClient.get( "sales/all", function(err, result, countItems) {
		        	cb(err, result, countItems);
		      	})
		    },

		    findByMonth: function(page, q, cb) {
		      	RestClient.get( "sales/all/by-date/" + q, function(err, result, countItems) {
		        	cb(err, result, countItems);
		      	})
		    },
        findByUserMonth: function(page, q, id, cb) {
		      	RestClient.get( "sales/all/by-date/" + q + "/" + id, function(err, result, countItems) {
		        	cb(err, result, countItems);
		      	})
		    },

		    findById: function(id, cb) {
		    	RestClient.get(model + "/" + id, function(err, result) {
		    		cb(err, result);
		    	})
		    },


        allTypes: function(cb) {
		      	RestClient.get( "sales/types", function(err, result) {
		        	cb(err, result);
		      	})

        },
        allConcepts: function(cb) {
		      	RestClient.get( "sales/concepts", function(err, result) {
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
		        	RestClient.put(model + "/update", obj, function(err, result) {
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
		    },

				getAllClientBudgets: function(q, cb) {
					RestClient.get( "sales/budgets/by-date/" + q, function(err, result) {
						cb(err, result);
					})
				},
        
	  	};

	  	return factory;

	}]);

}(angular));
