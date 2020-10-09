(function (ng) {

    'use strict';

    var Module = ng.module('Imm');

    Module.factory('UserServices', ['RestClient', function(RestClient){
	  	
	  	var model = "user";
	  
	  	var factory = {

		    find: function(page, q, cb) {
		      	RestClient.get(model + "/all", function(err, result) {
		        	cb(err, result);
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
		    	console.log(obj);
		    	if (obj.id) {
		        	RestClient.post(model + "/update" , obj, function(err, result) {
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

		    savePerformance: function(obj, cb){
		    	RestClient.post(model + "/save-performance", obj, function(err, result){
		    		cb(err, result);
		    	})
		    },

		    getPerformanceById: function(obj, cb){
		    	RestClient.post(model + "/performance-id", obj, function(err, result){
		    		cb(err, result);
		    	})
		    },

		    allPerformances: function(obj, cb){
		    	RestClient.post(model + "/all-performance", obj, function(err, result){
		    		cb(err, result);
		    	})
		    }
	  	};

	  	return factory;
	
	}]);

}(angular));