(function (ng) {

	'use strict';

	var Module = ng.module('LexTracking');

	Module.controller('TaskFormCtrl', ['$scope', '$state', '$stateParams', '$filter', 'TasksServices', 'ngDialog', 'UserServices', 'ProjectsServices', '$rootScope', 'PreviousState', function ($scope, $state, $stateParams, $filter, TaskServices, ngDialog, UserServices, ProjectsServices, $rootScope, PreviousState) {

		var idTask = $stateParams.id;
		$scope.duration = [];
		$scope.allStatus = ["To-do", "Done", "In-Progress", "In-Review"];
		$scope.usersAux = {};
		$scope.comments = [];
		$scope.task = {};
		$scope.comment = {};
		console.log(idTask);

		UserServices.find(0, '', function (err, users) {
			if (!err) {
				$scope.users = users;
			}
		});

		console.log(PreviousState, $stateParams);

		if (PreviousState.Params.id == $stateParams.id) {
			$scope.task.idProject = $stateParams.id;
			console.log('Agregar tarea');
			ProjectsServices.findById($scope.task.idProject, function (err, res) {
				console.log('by project', err, res);
				$scope.task.projectName = res.name;
			})
			$scope.comments = [];
			$scope.state = "";
			$scope.usersAux = {};

			$scope.task.hour = 0;
			$scope.task.mins = 0;
			$scope.task.secs = 0;
			$scope.task.startDate = moment();
			$scope.task.endDate = moment().add(1, "month");
			console.log("addtask", $scope.task);
			// if ($scope.task.hour == null || $scope.task.mins == null || $scope.task.secs == null || $scope.task.name == null && $scope.task.hour == undefined || $scope.task.mins == undefined || $scope.task.secs == undefined || $scope.task.name == undefined) {
			//   if ($scope.task.hour == null || $scope.task.mins == null || $scope.task.secs == null || $scope.task.name == null && $scope.task.hour == undefined || $scope.task.mins == undefined || $scope.task.secs == undefined) {
			//     var msg = "El campo Duración no puede estar vacio."
			//   } else if ($scope.task.name === undefined) {
			//     var msg = "El campo Nombre no puede estar vacio."
			//   }
		} else {
			TaskServices.findById(idTask, function (err, res) {
				$scope.task = res;
				console.log("start date find", $scope.task);
				var arrDuracion = $scope.task.duration.split(":");
				console.log("Array duracion", arrDuracion);
				$scope.task.hour = parseInt(arrDuracion[0]);
				$scope.task.mins = parseInt(arrDuracion[1]);
				$scope.task.secs = parseInt(arrDuracion[2]);

				if ($scope.task.startDate) {
					$scope.task.startDate = moment($scope.task.startDate).format("DD/MM/YYYY");
				}
				if ($scope.task.endDate) {
					$scope.task.endDate = moment($scope.task.endDate).format("DD/MM/YYYY");
				}
				$scope.state = $scope.task.status;
				if ($scope.task.comments) {
					var arr = $scope.task.comments.split('"comment":');
					var arr = ($scope.task.comments) ? $scope.task.comments.split('"comment":') : Array();
					if (arr[0] == "[{") {
						console.log(JSON.parse($scope.task.comments));
						$scope.comments = JSON.parse($scope.task.comments);
					} else {
						$scope.comments = [];
					}
				}
				console.log('$scope.task', $scope.task);
				if ($scope.task.users) {
					$scope.task.users = JSON.parse($scope.task.users);

					_.each($scope.task.users, function (user) {
						$scope.usersAux[user.idUser] = true;
					});
				} else {
					$scope.task.users = [];
				}

			})
		}


		$scope.save = function () {
			if ($scope.task.description === undefined) {
				var msg = "El campo Descripción no puede estar vacio."
				return $rootScope.showToaster(msg, 'error');
			}

			if ($scope.task.name === undefined) {
				var msg = "El campo Nombre no puede estar vacio."
				$rootScope.showToaster(msg, 'error');
			} else {
				if ($scope.task.hour == undefined || $scope.task.hour == null) {
					$scope.task.hour = "00";
				}
				if ($scope.task.mins == undefined || $scope.task.mins == null) {
					$scope.task.mins = "00";
				}
				if ($scope.task.secs == undefined || $scope.task.secs == null) {
					$scope.task.secs = "00";
				}
				$scope.task.duration = ($scope.task.hour < 10 ? "0" + $scope.task.hour : $scope.task.hour) + ":" + ($scope.task.mins < 10 ? "0" + $scope.task.mins : $scope.task.mins) + ":" + ($scope.task.secs < 10 ? "0" + $scope.task.secs : $scope.task.secs);
				console.log('push task');
				//Parse users
				$scope.task.users = [];
				console.log($scope.usersAux);
				for (var user in $scope.usersAux) {
					console.log(user);
					if ($scope.usersAux[user]) {
						$scope.task.users.push({ idUser: user });
					}
				}
				$scope.emailUsers = angular.copy($scope.task.users);
				$scope.task.users = JSON.stringify($scope.task.users);

				$scope.task.comments = JSON.stringify($scope.comments);
				console.log('new task id', $scope.task.id);
				if ($scope.task.id) {
					if ($scope.task.startDate) {
						var arrStart = $scope.task.startDate.split("/");

						$scope.task.startDate = arrStart[2] + '/' + arrStart[1] + '/' + arrStart[0];
						// $scope.task.startDate = convertTime($scope.task.startDate);
						// console.log("TASK TO UPDATE",$scope.task.startDate);
					}
					if ($scope.task.endDate) {

						var arrStart = $scope.task.endDate.split("/");

						$scope.task.endDate = arrStart[2] + '/' + arrStart[1] + '/' + arrStart[0];
						// $scope.task.endDate = convertTime($scope.task.endDate);
						// console.log("TASK TO UPDATE",$scope.task.endDate);
					}
					console.log($scope.emailUsers);
					console.log("TASK TO UPDATE", $scope.task);

					ProjectsServices.saveProjectTask($scope.task, function (err, result) {
						console.log("result:: ", result);
						if (!err) {
							//$scope.tasks[index] = angular.copy($scope.task);
							$scope.task = {};
							$state.go('app.projectEdit', {id: result.idProject});
						}
					});
				} else {
					if ($scope.task.idProject) {
						if ($scope.task.startDate) {
							var arrStart = $scope.task.startDate.split("/");
							$scope.task.startDate = new Date(arrStart[2], arrStart[1] - 1, arrStart[0]);
						}
						if ($scope.task.endDate) {
							var arrStart = $scope.task.endDate.split("/");
							$scope.task.endDate = new Date(arrStart[2], arrStart[1] - 1, arrStart[0]);
						}
						console.log('entrei aqui');
						$scope.task.users = JSON.parse($scope.task.users)
						console.log("TASK TO UPDATE else", $scope.task);

						ProjectsServices.saveProjectTask($scope.task, function (err, result) {
							console.log("result:: ", result);
							if (!err) {
								//$scope.tasks[index] = angular.copy($scope.task);
								$scope.task = {};
								$state.go('app.projectEdit', {id: result.idProject});
							}
						});
					} else {
						if ($scope.task.startDate) {
							var arrStart = $scope.task.startDate.split("/");
							console.log(arrStart);
							$scope.task.startDate = new Date(arrStart[2], arrStart[1] - 1, arrStart[0]);
						}
						if ($scope.task.endDate) {
							var arrStart = $scope.task.endDate.split("/");
							console.log(arrStart);

							$scope.task.endDate = new Date(arrStart[2], arrStart[1] - 1, arrStart[0]);
						}
						console.log("TASK TO UPDATE else", $scope.task);
						ProjectsServices.saveProjectTask($scope.task, function (err, result) {
							console.log("result:: ", result);
							if (!err) {
								//$scope.tasks[index] = angular.copy($scope.task);
								$scope.task = {};
								$state.go('app.projectEdit', {id: result.idProject});
							}
						});
					}
				}
				var prevPag = window.location.origin + "/" + PreviousState.URL;
				jQuery(".closeForm").attr('href', prevPag);
			}
		}


		

		$scope.agregarComentario = function () {
			if ($scope.comment.comment) {
				$scope.comment.userName = $rootScope.userName;
				console.log($scope.comment);

				$scope.comments.push($scope.comment);
				$scope.comment = {};
			}
		}

		$scope.openModalComentario = function () {

			ngDialog.open({
				template: '/app/components/projects/views/project.task-comment.modal.html',
				showClose: true,
				scope: $scope,
				disableAnimation: true,
				data: {
					confirm: function () {
						console.log($scope.review);
						var windowIDs = ngDialog.getOpenDialogs();
						$scope.agregarComentario();

						ngDialog.close(windowIDs[1]);
					},
					cancel: function () {
						var windowIDs = ngDialog.getOpenDialogs();

						ngDialog.close(windowIDs[1]);
					}
				}
			});
		}

		$scope.editComments = function (index, comment) {
			$scope.oldComment = angular.copy(comment);
			console.log($scope.comment);

			$scope.comment.comment = angular.copy(comment.comment);

			$scope.comments.splice(index, 1);
			ngDialog.open({
				template: '/app/components/projects/views/project.task-comment.modal.html',
				showClose: true,
				scope: $scope,
				disableAnimation: true,
				data: {
					confirm: function () {
						console.log($scope.review);
						var windowIDs = ngDialog.getOpenDialogs();
						$scope.agregarComentario();

						ngDialog.close(windowIDs[1]);
					},
					cancel: function () {
						$scope.comments.splice(index, 0, $scope.oldComment);

						var windowIDs = ngDialog.getOpenDialogs();

						ngDialog.close(windowIDs[1]);
					}
				}
			});
		}

		$scope.deleteComment = function (index) {
			console.log(index);
			$scope.comments.splice(index, 1);
			console.log($scope.comments);
		}

	}]);

}(angular));