(function (ng) {

    'use strict';

    var Module = ng.module('LexTracking');

    Module.factory('TracksServices', ['RestClient', function(RestClient){

	  	var model = "tracks";

	  	var factory = {

		    find: function(page, q, cb) {
		      	RestClient.get(model + "/all", function(err, result, countItems) {
		        	cb(err, result, countItems);
		      	})
		    },

		    findById: function(id, cb) {
		    	RestClient.get(model + "/" + id, function(err, result) {
		    		cb(err, result);
		    	})
		    },
        	findActives: function( cb) {
		    	RestClient.get(model + "/tracking" , function(err, result) {
		    		cb(err, result);
		    	})
			},
			
			findHistory: function (cb) {
				RestClient.get(model + "/user/history", function (err, result) {
					cb(err, result);
				})
			},

		   	findAll: function(page, q,  cb) {
				RestClient.get(model + "?sort[name]=1" + q, function(err, result) {
					cb(err, result);
				})
			},

			getTracks: function(filters, cb) {
				var role = window.localStorage.userRole;
				var ids = filters.idUser && (role == 'admin' || role == 'pm') ? filters.idUser : '';

				var path = role == 'admin' || role == 'pm' ? ids == '' ? 'all' : ids : 'current';

				RestClient.post(model + "/user/" + path, filters, function(err, result) {
					cb(err, result);
				})
			},

			getAutoTracks: function(filters, cb) {
				RestClient.post("tracks-auto", filters, function(err, result) {
					cb(err, result);
				})
			},

			getTrelloTrack: function(filters, cb) {
				var user = window.localStorage;
				var role = user.userRole;
				var ids = filters.idUser && (role == 'admin' || role == 'pm') ? filters.idUser : '';

				var path = role == 'admin' || role == 'pm' ? ids == '' ? 'trello/all' : "trello/" + ids : 'current/trello';

				RestClient.post(model + "/user/" + path, filters, function(err, result) {
					cb(err, result);
				})
			},

			getJiraTrack: function(filters, cb){
				RestClient.post("tracks-jira", filters, function(err, result) {
					cb(err, result);
				})
			},


			getUserTracks: function(idUser, cb) {
				var user = window.localStorage;
				var role = user.userRole;
				var ids = idUser;

				var path = "";

				path = role == 'admin' || role == 'pm' ? ids == '' ? 'trello/all' : "trello/" + ids : 'current/trello';

				RestClient.get(model + "/user/" + idUser, function(err, result) {
					cb(err, result);
				})
			},

			getLastUserTrack: function(idUser, cb) {
				RestClient.get(model + "/user/" + idUser + "/last", function(err, result) {
					cb(err, result);
				})
			},

			getCurrentUserLastTrack: function(idUser, cb) {
				RestClient.get(model + "/user/current/last", function(err, result) {
					cb(err, result);
				})
			},

			create: function(obj, cb) {
				var track = {
					idTask 	  : obj.idTask,
					idUser 	  : obj.idUser,
					name 	  	: obj.taskName,
					startTime : obj.startTime,
					endTime	  : obj.endTime,
					typeTrack : obj.typeTrack,
					idProyecto: obj.idProyecto,
					currency  : obj.currency
				}
				RestClient.post(model + "/new", track, function(err, result) {
						console.log("result::", result);
						cb(err, result);
				})
			},
			
			createAutoTask: function(obj, cb) {
		    	var track = {
		    		idTask 	  : obj.idTask,
		    		idUser 	  : obj.idUser,
		    		idProyecto: obj.idProyecto,
		    		name 	  : obj.taskName,
		    		startTime : obj.startTime,
					endTime	  : obj.endTime,
					typeTrack : obj.typeTrack
				}
	        	RestClient.post(model + "/auto-new", track, function(err, result) {
					console.log("result2::", err, result);
	          		cb(err, result);
	        	})
		    },

			createTrelloTask: function(obj, cb) {
				console.log(obj);
		    	var track = {
		    		idTask 	   : obj.idTask,
					idUser 	   : obj.idUser,
					idProyecto : obj.idProyecto,
					name 	   : obj.taskName,
		    		startTime  : obj.startTime,
					endTime	   : obj.endTime,
					typeTrack  : obj.typeTrack,
					currency : obj.currency
				}
				RestClient.post(model + "/new", track, function(err, result) {
					console.log("resultTrello::", err, result);
					cb(err, result);
				})
			},
				
			createJiraTask: function(obj, cb){
		    	var track = {
					idTask 	   : obj.idTask,
					idUser 	   : obj.idUser,
					idProyecto : obj.idProyecto,
					name 	     : obj.taskName,
					startTime  : obj.startTime,
					endTime	   : obj.endTime,
					typeTrack  : obj.typeTrack
				}
				console.log(track);
				RestClient.post(model + "/track-jira-new", track, function(err, result) {
					console.log("result Jira Service::", err, result);
					cb(err, result);
				})
			},

		    update: function(obj, cb) {
				console.log("OBJ::",obj);
				var path = window.localStorage.isDeveloper == "true" ? model + "/user/current" : model;


		    	if (obj.typeTrack == "manual") {
		    		var track = {
		    			id 		   : obj.id,
			    		idTask 	   : obj.idTask,
			    		idUser 	   : obj.idUser,
			    		name 	   : obj.taskName + ' - ' + obj.projectName,
			    		startTime  : obj.startTime,
			    		endTime    : obj.endTime,
			    		trackCost  : obj.trackCost,
			    		idProyecto : obj.idProyecto,
			    		duracion   : obj.duracion,
			    		totalTrack : obj.totalTrack,
			    		projCost   : obj.projCost,
						currency   : obj.currency
			    	}
			    	console.log('track to update', track);
		        	RestClient.put(path + "/update", track, function(err, result) {
		          		cb(err, result);
		        	})
				} else if(obj.typeTrack == "trello"){
					console.log("TrelloObj",obj);
					var track = {
						id 		 : obj.id,
			    		idTask 	 : obj.idTask,
			    		idUser 	 : obj.idUser,
			    		trackCost: obj.trackCost,
						name 	 : obj.taskName,
			    		startTime: obj.startTime,
			    		endTime  : obj.endTime,
						currency : obj.currency
					}
					console.log('track trelloTrack to update', track);
		        	RestClient.put(path + "/update", track, function(err, result) {
						console.log("updateTrello:: ", result);
						  cb(err, result);
					})
				  } else {
		    		var track = {
		    			id 		 : obj.id,
			    		idTask 	 : obj.idTask,
			    		idUser 	 : obj.idUser,
			    		trackCost  : obj.trackCost,
						name 	 : obj.taskName,
			    		startTime: obj.startTime,
			    		endTime  : obj.endTime,
						currency : obj.currency
			    	}
			    	console.log('track autoTask to update', track);
		        	RestClient.post(model + "/update-auto", track, function(err, result) {
		          		cb(err, result);
		        	})
				  }
			},
			
		    remove: function(id, cb) {
		    	RestClient.delete(model + "/" + id, function(err, result) {
		        	cb(err, result);
		      	})
			},
			
			projectByHour: function(id,cb){
				console.log("ID PROJECT GET", id);
		    	RestClient.get(model + "/projectByHour/" + id, function(err, result) {
					console.log("PROJECT BY HOUR", result, err);
		    		cb(result, err);
				})	
			},

			findByMonth: function(obj, id,cb) {
				console.log(id)
				RestClient.post(model + '/' + id +"/month", obj, function(err, result){
		    		cb(err, result);
				})
			},

			findCurrentByMonth: function(obj,cb) {
				RestClient.post(model + "/user/current/month", obj, function(err, result){
					console.log(result);
		    		cb(err, result);
				})
			}
		}
	  	return factory;

	}]);

}(angular));
