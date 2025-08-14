(function (ng) {

    'use strict';

    var Module = ng.module('LexTracking');

    Module.factory('JiraServices', ['RestClient', function(RestClient){

	  	var model = "jira";

	  	var factory = {
		    getAllDashboardsCloud: function(obj, cb) {
		      	RestClient.post(model + "/all-dashboards", obj, function(err, result) {
                console.log('result boards',result, err);
		        	cb(err, result);
		      	})
		    },

		    getIssuesByBoardCloud: function(obj, cb){
		    	RestClient.post(model + "/dashboard-issues", obj, function(err, result){
		        	cb(err, result);		    		
		    	})
		    },

		    saveDashboard: function(obj, cb){
		    	RestClient.post(model + "/save-dashboards", obj, function(err, result){
		    		cb(err, result);
		    	})
		    },

		    getIssueById: function(obj, cb){
		    	RestClient.post(model + "/issue", obj, function(err, task, comment){
		    		cb(err, task, comment);
		    	})
		    }, 

		    addComment: function(obj, cb){
		    	RestClient.post(model + "/add-comment", obj, function(err, result){
		    		cb(err, result);
		    	})
				},
				
				save: function(obj, cb){
					if(obj.task.id){
						RestClient.post(model + "/update-issue", obj, function(err, result){
							cb(err, result);
						})	
					} else {
						RestClient.post(model + "/save-issue", obj, function(err, result){
							cb(err, result);
						});
					}
				},

				delete: function(obj, cb){
					RestClient.post(model + "/delete-issues", obj, function(err, result){
						cb(err, result);
					})
				}
        
	  	};

	  	return factory;

	}]);

}(angular));
