(function (ng) {

    'use strict';

    var Module = ng.module('LexTracking');

    Module.factory('UserServices', ['RestClient', '$window', function(RestClient, $window){
	  	
	  	var model = "user";
	  
	  	var factory = {

		    find: function(page, q, cb) {

				var user = window.localStorage;
				var role = user.userRole == 'admin' || user.userRole == 'pm' ? true : false;

				var path = role == true ? '/all-admin' : '/all';

		      	RestClient.get(model + path, function(err, result) {
		        	cb(err, result);
		      	})
		    },

				currentUser: function(cb) {
					RestClient.get(model + "/current", function(err, result) {
							cb(err, result);
						})
				},

		    findById: function(id, cb) {
				console.log(id);
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
		        	RestClient.put(model + "/update/" + obj.id , obj, function(err, result) {
		          		cb(err, result);
		        	})
		      	} else {
		        	RestClient.post(model + "/register", obj, function(err, result) {
		          		cb(err, result);
		        	})
		      	}
		    },

		    remove: function(id, cb) {
		    	RestClient.delete(model + "/" + id, function(err, result) {
		        	cb(err, result);
		      	})
		    },

		    savePerformance: function(obj, id, cb){
		    	RestClient.post(model + "/performance/" + id + "/save", obj, function(err, result){
		    		cb(err, result);
		    	})
		    },

				saveCurrentPerformance: function(obj, cb){
		    	RestClient.post(model + "/performance/current/save", obj, function(err, result){
		    		cb(err, result);
		    	})
		    },

		    getPerformanceById: function(obj, id, cb){
				console.log(obj);
		    	RestClient.post(model + '/' + id + "/performance", obj, function(err, result){
		    		cb(err, result);
		    	})
		    },

				getPerformanceCurrent: function(obj, cb){
		    	RestClient.post(model + "/performance/current", obj, function(err, result){
		    		cb(err, result);
		    	})
		    },

		    allPerformances: function(obj, cb){
		    	RestClient.post(model + "/all-performance", obj, function(err, result){
		    		cb(err, result);
		    	})
		    },

		    //persistence: function(obj, cb) {
		    persistence: function(cb) {
		    	RestClient.get("user/current", function(err, result) {
		        	cb(err, result);
		        })
		    },
	  	};

	  	return factory;
	
	}]);

}(angular));