(function (ng) {

	'use strict';

    var Module = ng.module('LexTracking');

	Module.factory('ProjectsServices', ['RestClient', function (RestClient) {

		var model = "projects";

		var factory = {

			find: function (page, q, cb) {
				RestClient.get(model + "/all", function (err, result, countItems) {
					cb(err, result, countItems);
				})
			},

			findById: function (id, cb) {
				RestClient.get(model + "/" + id, function (err, result) {
					cb(err, result);
				})
			},

			findAll: function (page, q, cb) {
				RestClient.get(model + "?sort[name]=1" + q, function (err, result) {
					cb(err, result);
				})
			},

			getProjectTasks: function (idProject, cb) {
				RestClient.get(model + "/tasks/project/" + idProject, function (err, result) {
					cb(err, result);
				})
			},

			getProjectsByClient: function (idClient, cb) {
				RestClient.get(model + "/client/" + idClient, function (err, result) {
					cb(err, result);
				})
			},

			getProjectsByUser: function (idUser, cb) {
				RestClient.get(model + "/task/dev/" + idUser, function (err, result) {
					cb(err, result);
				})
			},

			getProjectTasksbyUser: function (idProject, idUser, cb) {
				RestClient.get(model + "/task/" + idProject + "/" + idUser, function (err, result) {
					cb(err, result);
				})
			},

			getProjectsByDev: function (idUser, cb) {
				RestClient.get(model + "/task/dev/" + idUser, function (err, result) {
					cb(err, result);
				})
			},


			saveProjectTask: function (obj, cb) {
				obj.idProject = Number(obj.idProject)
				console.log(obj)

				if (obj.users && obj.users.length) {
					if (!obj.users[0].idUser) {
						obj.users = JSON.parse(obj.users);
					}
				}

				obj.status = !obj.status ? "To-do" : obj.status;

				if (obj.id) {
					RestClient.put(model + "/tasks/update", obj, function (err, result) {
						cb(err, result);
					})
				} else {
					RestClient.post(model + "/tasks/new", obj, function (err, result) {
						cb(err, result);
					})
				}
			},

			save: function (obj, cb) {
				if (obj.id) {
					console.log("OBJ SAVE UPDATE", obj);
					RestClient.put(model + "/update", obj, function (err, result) {
						cb(err, result);
					})
				} else {

					RestClient.post(model + "/new", obj, function (err, result) {
						cb(err, result);
					})
				}
			},

			remove: function (id, cb) {
				RestClient.delete(model + "/" + id, function (err, result) {
					cb(err, result);
				})
			},

			deleteTask: function (id, cb) {
				RestClient.delete(model + "/delete-task/" + id, function (err, result) {
					cb(err, result);
				})
			}

		};

		return factory;

	}]);

}(angular));
