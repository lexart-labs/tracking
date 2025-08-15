(function (ng) {

  'use strict';

  var Module = ng.module('LexTracking');

  Module.controller('task_trelloCtrl', ['$scope', '$rootScope', '$state', '$stateParams', '$filter', 'tasks_trelloServices', 'ngDialog', 'ProjectsServices', 'ClientServices', function ($scope, $rootScope, $state, $stateParams, $filter, tasks_trelloServices, ngDialog, ProjectsServices, ClientServices) {

    $scope.isLoaded = false;
    $scope.sendingData = false;
    var idTask_trello = $stateParams.id;
    $scope.board = {};
    $scope.tasks = [];
    $scope.task_trello = {};
    $scope.boardLabels = [];
    $scope.membersBoard = [];
    $scope.membersCard = [];
    $scope.isEditing = false;
    $scope.isCardMembers = true;
    $scope.isBoardMembers = false;
    $scope.tareas = [];
    $scope.lists = [];
    $scope.selectedList = {};
    $scope.listas = [];
    $scope.labels = {};
    $scope.userList = [];
    

    var key = Trello_Key;
    var token = Trello_Token;
    var projectId;

    try {
      if(idTask_trello){
      //TRAER TAREAS TRELLO DESDE TABLERO SELECCIONADO
        tasks_trelloServices.findById(idTask_trello, function(err, tasks_trello, countItems) {
          
          $scope.board = angular.copy(tasks_trello[0]);
          console.log('BOARD', $scope.board);
          tasks_trelloServices.getLists($scope.board.tablero_id, function (resp, err) {
            $scope.lists.push.apply($scope.lists, resp);
            $scope.listas = angular.copy(resp);
            console.log('listas', $scope.listas);
            angular.forEach($scope.lists, function (list) {
              if (list.name.toLowerCase() == 'in-progress' || list.name.toLowerCase() == 'tasks') {
                $scope.userList.push(list);
                console.log('USER LIST', $scope.userList);
                tasks_trelloServices.getCardByLists(list.id, function (resp, err) {
                  if (resp) {
                    $scope.tareas.push.apply($scope.tareas, resp);
                    //console.log('LISTAS',resp);
                    console.log('TAREAS', $scope.tareas);
                    angular.forEach($scope.tareas, function (tarea, index) {
                      if ($scope.tareas.length == index + 1) {
                        $scope.isLoaded = true;
                        console.log('TASKS', $scope.tasks)
                      }

                      var fixedTarea = angular.copy(tarea);

                      tarea.idboard = $scope.board.tablero_id;
                      tarea.idProyecto = $scope.board.proyecto_id;
                      tarea.id_project = $scope.board.proyecto_id;
                      tarea.idTask = tarea.id;
                      tarea.card_id = tarea.id;
                      tarea.project = $scope.board.projectName;
                      tarea.longIdCard = tarea.id;


                      tasks_trelloServices.saveTaskTrello(tarea, function (err, result) {
                        tasks_trelloServices.getLabelsByCard(tarea.id, function (resp, err) {
                          if (resp) {
                            var objAux = { id: "", idBoard: $scope.board.tablero_id, name: "All", color: "" };
                            resp.unshift(objAux);
                            $scope.labels.selected=angular.copy(objAux.name);
                            tarea.selectStatus = resp;
                            tarea.status = '';
                            angular.forEach(resp, function (status) {
                              if (resp.length > 1 && tarea.status != '' && tarea.status!= 'All') {
                                tarea.status += " | ";
                              }
                              tarea.statusAll += status.name;
                              tarea.status += status.name =='All' ? '' :status.name;
                            });
                            tasks_trelloServices.findByIdCard(tarea.id, tarea.id, function (err, idCard) {
                              if (!err) {
                                angular.forEach(idCard, function (element) {
                                  if (tarea.id == element.card_id) {
                                    tarea.id = element.id;
                                    tarea.isPlayable = true;
                                  }
                                })
                              }
                            })
                          }
                        });
                        tasks_trelloServices.getListByCard(tarea.id, function (resp, err) {
                          if (resp) {
                            tarea.listaId = angular.copy(resp.id);
                            tarea.listaName = angular.copy(resp.name);
                            console.log(resp);

                          }
                        })
                      });
                    });
                    setTimeout(function () { $scope.tasks = $scope.tareas }, 500);
                    $scope.tasks = $scope.tareas;
                  }
                })
              }
              
            })
          })
          //AGREGAR LISTA 'All' TO userList
          var objAux = {id: "", name: "All"};
          $scope.userList.unshift(objAux);
          $scope.selectedList.selected=angular.copy(objAux);

          tasks_trelloServices.getLabels($scope.board.tablero_id, function (resp, err) {
            if (resp) {
              var objAux = { id: "", idBoard: $scope.board.tablero_id, name: "All", color: "" };
              resp.unshift(objAux);
              $scope.boardLabels = angular.copy(resp);
            }
            console.log('BOARD LABELS', $scope.boardLabels);
          });

          tasks_trelloServices.getMembers($scope.board.tablero_id, function (res, err) {
            var idMembers = angular.copy(res);
            
            angular.forEach(idMembers, function (member) {
              tasks_trelloServices.getMemberById(member.id, function (res, err) {
                if (res) {
                  $scope.membersBoard.push(res);
                }
              });
            });
          });
        })

        $scope.mostrarLabels = false;

        $scope.desplegarLabels = function () {
          $scope.mostrarLabels = !$scope.mostrarLabels;
        }

        $scope.editTrello = function (item) {
          angular.forEach($scope.membersBoard, function (memberBoard) {
            if (memberBoard.isAsigned) {
              delete memberBoard.isAsigned;
            }
          })
          $scope.task_trello = item;
          $scope.isCardMembers = true;
          $scope.isBoardMembers = false;
          tasks_trelloServices.getCardMembers($scope.task_trello.card_id, function (res, err) {
            $scope.membersCard = res;
            if (res) {
              tasks_trelloServices.getChecklistCard($scope.task_trello.card_id, function (res, err) {
                if (res) {
                  if (res[0] && res[0].checkItems) {
                    var checklist = res[0].checkItems;
                    angular.forEach(checklist, function (item) {
                      if (item.state == 'complete') {
                        item.complete = true;
                      } else {
                        item.complete = false;
                      }
                    });
                    $scope.checklist = checklist;
                  }
                  ngDialog.open({
                    template: '/app/components/tasks/taskTrello/views/taskTrello.modal.html',
                    showClose: true,
                    scope: $scope,
                    disableAnimation: true,
                    data: {
                      confirm: function () {
                        if (item.name != '') {
                          tasks_trelloServices.updateCard(item, function (res, err) {
                            if (item.description) {
                              tasks_trelloServices.addComment(item, function (res, err) {

                              })
                            }
                          });
                          ngDialog.close();
                        }
                      },
                      cancel: function () {
                        ngDialog.close();
                      }
                    }
                  })
                }
              })
            }
          })
        }
        //MOSTRAR Y OCULTAR UI-SELECT
        $scope.mostrarLabel = false;
        $scope.makeActive = function (getLabel) {
          $scope.selectedType = getLabel;
          if (getLabel == 'label') {
            $scope.mostrarLabel = !$scope.mostrarLabel;
          }
        }

        $scope.showAllMembers = function () {
          $scope.isCardMembers = false;
          $scope.isBoardMembers = true;
          angular.forEach($scope.membersBoard, function (memberBoard) {
            if ($scope.membersCard) {
              angular.forEach($scope.membersCard, function (memberCard) {
                if (memberCard.id == memberBoard.id) {
                  memberBoard.isAsigned = true;
                  return;
                }
              })
            }
          })
        }

        $scope.showCardMembers = function () {
          $scope.isCardMembers = true;
          $scope.isBoardMembers = false;
        }

        $scope.assingMember = function (member) {
          var obj = { idMember: member.id, idCard: $scope.task_trello.card_id };
          if (!member.isAsigned) {
            tasks_trelloServices.unassignMember(obj, function (res, err) {
              if (res) {
                delete member.isAsigned;
                $scope.membersCard = res;
              }
            })
          } else {
            tasks_trelloServices.assignMember(obj, function (res, err) {
              if (res) {
                $scope.membersCard = JSON.parse(res);
              }
            })
          }

        }

        $scope.editStatus = function (status) {
          $scope.originalStatus = angular.copy(status);
          $scope.isEditing = true;
          status.isEdited = true;
        }

        $scope.confirmStatus = function (status) {
          $scope.isEditing = false;
          delete status.isEdited;
          if (status.id != $scope.originalStatus.id) {
            angular.forEach($scope.boardLabels, function (label) {
              if (status.id == label.id) {
                status.name = label.name;
                status.color = label.color;
                status.idBoard = label.idBoard;
              }
            });
            tasks_trelloServices.desactiveLabel($scope.task_trello.card_id, $scope.originalStatus.id, function (res, err) {
              tasks_trelloServices.updateLabelTask($scope.task_trello.card_id, status.id, function (res, err) {
              })
            })
          }
        }

        $scope.cancelEditStatus = function (status) {
          status.id = $scope.originalStatus.id
          status.name = $scope.originalStatus.name;
          status.color = $scope.originalStatus.color;
          status.idBoard = $scope.originalStatus.idBoard;
          $scope.isEditing = false;
          delete status.isEdited;
        }

        $scope.updateChecklist = function (item) {
          console.log(item);
          item.card_id = $scope.task_trello.card_id;
          if (item.complete == true) {
            item.state = 'complete';
          } else {
            item.state = 'incomplete';
          }
          tasks_trelloServices.updateChecklistCard(item, function (res, err) {

          })
        }

        // TUTORIAL WIZARD
        $scope.tutorial = function () {
          var vm = this;
          //Model
          vm.currentStep = 1;
          vm.steps = [
            {
              step: 1,
              name: "First step",
              template: "step1.html",
            },
            {
              step: 2,
              name: "Second step",
              template: "step2.html"
            },
            {
              step: 3,
              name: "Third step",
              template: "step3.html"
            },
          ];
          vm.user = {};

          //Functions
          vm.gotoStep = function (newStep) {
            vm.currentStep = newStep;
          }

          vm.getStepTemplate = function () {
            for (var i = 0; i < vm.steps.length; i++) {
              if (vm.currentStep == vm.steps[i].step) {
                return vm.steps[i].template;
              }
            }
          }


          ngDialog.open({
            template: '/app/components/tasks/taskTrello/views/tutorial.modal.html',
            showClose: true,
            scope: $scope,
            disableAnimation: true,
            data: {
              confirm: function () {
                ngDialog.close();
              },
              cancel: function () {
                ngDialog.close();
              }
            }
          });
          $scope.error = "";
        };


        // TUTORIAL WIZARD
        $scope.tutorialBot = function () {
          var vm = this;
          //Model
          vm.currentStep = 1;
          vm.steps = [
            {
              step: 1,
              name: "First step",
              template: "step1.html",
            },
            {
              step: 2,
              name: "Second step",
              template: "step2.html"
            },
            {
              step: 3,
              name: "Third step",
              template: "step3.html"
            },
            {
              step: 4,
              name: "Fourth step",
              template: "step4.html"
            },
          ];
          vm.user = {};

          //Functions
          vm.gotoStep = function (newStep) {
            vm.currentStep = newStep;
          }

          vm.getStepTemplate = function () {
            for (var i = 0; i < vm.steps.length; i++) {
              if (vm.currentStep == vm.steps[i].step) {
                return vm.steps[i].template;
              }
            }
          }


          ngDialog.open({
            template: '/app/components/tasks/taskTrello/views/tutorialBot.modal.html',
            showClose: true,
            scope: $scope,
            disableAnimation: true,
            data: {
              confirm: function () {
                ngDialog.close();
              },
              cancel: function () {
                ngDialog.close();
              }
            }
          });
          $scope.error = "";
        };
      }
    } catch (error) {
      console.log("NO EXISTEN LISTS EN EL BOARD");
    }

  }]);

}(angular));
