(function (ng) {

    'use strict';

    var Module = ng.module('LexTracking');

    Module.factory('TasksServices', ['RestClient', function(RestClient){

	  	var model = "projects/tasks";

	  	var factory = {

		    find: function(page, q, cb) {
		      	RestClient.get(model + "/all", function(err, result, countItems) {
		        	cb(err, result, countItems);
		      	})
		    },

		    findByFilter: function(obj, cb){
		      	RestClient.post(model + "/all", obj, function(err, result) {
		      		console.log("result", result, err);
		      		var countItems = result.count; 
		        	cb(err, result.task, countItems);
		      	})
        	},

		    findById: function(id, cb) {
		    	RestClient.get(model + "/" + id, function(err, result) {
		    		cb(err, result);
		    	})
		    },


	        findByIdClient: function(id, cb) {
	         RestClient.get(model + "/id-client/" + id, function(err, result) {
	           cb(err, result);
	         })
	       	},

	        findByIdUser: function(id, obj, cb) {
	        	RestClient.post(model + "/user/current", obj, function(err, result) {
	      		var countItems = result.count; 
	        	cb(err, result.task, countItems);
	         })
	       	},

	       	findByUserEval:function(id, cb){
				RestClient.get(model + "/user-eval/" + id, function(err, result) {
					cb(err, result);
				})
	       	},

		   	findAll: function(page, q,  cb) {
				RestClient.get(model + "?sort[name]=1" + q, function(err, result) {
					cb(err, result);
				})
			},

		    save: function(obj, cb) {
				console.log('Update Status::', obj);
		    	if (obj.id) {
  		  			console.log('Update Status::', obj);
		        	RestClient.post(model + "/" + obj.id, obj, function(err, result) {
            	    console.log('Update Status::',err, result);
	          		cb(err, result);
		        	})
		      	} else {
		        	RestClient.post(model, obj, function(err, result) {
		          		cb(err, result);
		        	})
		      	}
		    },

		    remove: function(id, cb) {
		    	RestClient.get(model + "/delete/" + id, function(err, result) {
		        	cb(err, result);
		      	})
		    }
	  	};

	  	return factory;

	}]);
}(angular));
