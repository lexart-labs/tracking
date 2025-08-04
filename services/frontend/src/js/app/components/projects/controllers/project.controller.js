(function(ng) {

  'use strict';

  var Module = ng.module('LexTracking');

  Module.controller('ProjectCtrl', ['$scope','$rootScope', '$state', '$stateParams', '$filter','$http', 'ProjectsServices', 'ClientServices', 'UserServices', 'ngDialog', 'TasksServices', function($scope,$rootScope, $state, $stateParams, $filter,$http, ProjectsServices, ClientServices, UserServices, ngDialog, TasksServices) {

    $scope.project      = {
      active: {name:'Active', value: 1}
    };
    $scope.task         = {};
    $scope.duration     = {};
    $scope.tasks        = [];
    $scope.clients      = [];
    $scope.users        = [];
    $scope.comments     = [];
    $scope.comment      = {};
    $scope.usersAux     = {};
    $scope.review       = {};
    $scope.sendingData  = false;
    var idProject       = $stateParams.id;
    $scope.allStatus    = ["To-do","Done","In-Progress","In-Review"];
    $scope.state        = "";


    //Función formatea obj Moment

    var convertTime = function(value){
      var h = moment.duration(value).hours();
      var m = moment.duration(value).minutes();
      var s = moment.duration(value).seconds();
      var d = moment.duration(value).days();

      if(d > 0) {
        d = d * 24;
        console.log("DIAS A HORAS", d);
      }
      if (h <= 9){
          h = '0' + h;
      }
      if (m <= 9){
          m = '0' + m;
      }
      if (s <= 9){
          s = '0' + s;
      }
      if (d > 0){
          h = Number(d) + Number(h);
      }
      var finalTracked = h + ":" + m + ":" + s;
      console.log("finaltracked", finalTracked);
      return finalTracked;
    }


    ClientServices.find(0, '', function(err, clients){
      if (!err) {
        console.log('clients:', clients);
        $scope.clients = clients;
      }
    });

    if (idProject) {
      ProjectsServices.findById(idProject, function(err, project) {
        if (!err) {
          console.log('project:', project);
          $scope.project = project;
          if($scope.project.active === '1'){
            $scope.project.active = {name:'Active', value: 1}
          }else{
            $scope.project.active = {name:'Inactive', value: 0}
          }
          //Separar formato date
          if ($scope.project.duration) {
            var newDate = $scope.project.duration.split(":",3);
            $scope.duration["hours"] = parseInt(newDate[0], 10);
            $scope.duration["minutes"] = parseInt(newDate[1], 10);
            $scope.duration["seconds"] = parseInt(newDate[2], 10);
            console.log("duracion proyecto",$scope.duration);
          }
          //Project tasks
          ProjectsServices.getProjectTasks(idProject, function(err, tasks) {
            if (!err) {
              console.log('tasks:', tasks);
              $scope.tasks = tasks;
            }
          })
        }
      });
    }

    UserServices.find(0, '', function(err, users) {
      if (!err) {
        console.log('users', users);
        $scope.users = users;
      }
    });

    $scope.addTask = function () {

      $scope.task = {};
      $scope.comments= [];
      $scope.state="";
      $scope.usersAux={};

      $scope.task.hour = 0;
      $scope.task.mins = 0;
      $scope.task.secs = 0;
      $scope.task.startDate = moment();
      $scope.task.endDate = moment().add(1,"month");
      console.log("addtask",$scope.task);
      ngDialog.open({
        template: '/app/components/projects/views/project.task.modal.html',
        showClose: true,
        scope: $scope,
        disableAnimation: true,
        data: {
          confirm: function() {
            console.log('undefined task',$scope.task);
            // if ($scope.task.hour == null || $scope.task.mins == null || $scope.task.secs == null || $scope.task.name == null && $scope.task.hour == undefined || $scope.task.mins == undefined || $scope.task.secs == undefined || $scope.task.name == undefined) {
            //   if ($scope.task.hour == null || $scope.task.mins == null || $scope.task.secs == null || $scope.task.name == null && $scope.task.hour == undefined || $scope.task.mins == undefined || $scope.task.secs == undefined) {
            //     var msg = "El campo Duración no puede estar vacio."
            //   } else if ($scope.task.name === undefined) {
            //     var msg = "El campo Nombre no puede estar vacio."
            //   }
              if ($scope.task.name === undefined) {
                var msg = "El campo Nombre no puede estar vacio."

                ngDialog.open({
                  template: '/app/shared/views/alert.modal.html',
                  showClose: true,
                  scope: $scope,
                  disableAnimation: true,
                  data: {
                    msg: msg,
                    titleRequired: "Alerta",
                  }
                });
              } else {

              console.log('push task');
              if (idProject) {
                $scope.task.idProject = idProject;
                $scope.task.comments =JSON.stringify($scope.comments);
                if ($scope.task.startDate) {
                var arrStart= $scope.task.startDate.split("/");
                $scope.task.startDate=new Date(arrStart[2],arrStart[1]-1,arrStart[0]);
                }
                if ($scope.task.endDate) {
                  var arrStart= $scope.task.endDate.split("/");
                  $scope.task.endDate=new Date(arrStart[2],arrStart[1]-1,arrStart[0]);
                }
                if (!$scope.task.status) {
                  $scope.task.status=$scope.allStatus[0];

                }
              $scope.task.users = [];
              console.log( $scope.usersAux);
              for (var user in $scope.usersAux) {
                console.log(user);
                if ($scope.usersAux[user]) {
                  $scope.task.users.push({idUser: user});
                }
              }

              if ($scope.task.hour == undefined || $scope.task.hour == null) {
                $scope.task.hour = "00";
              }
              if ($scope.task.mins == undefined || $scope.task.mins == null) {
                $scope.task.mins = "00";
              }
              if ($scope.task.secs == undefined || $scope.task.secs == null) {
                $scope.task.secs = "00";
              }

              $scope.emailUsers = angular.copy(  $scope.task.users );
              $scope.task.users = JSON.stringify($scope.task.users);
              $scope.task.duration = ($scope.task.hour < 10 ? "0"+$scope.task.hour : $scope.task.hour) + ":" + ($scope.task.mins < 10 ? "0"+$scope.task.mins : $scope.task.mins)+ ":" + ($scope.task.secs < 10 ? "0"+$scope.task.secs : $scope.task.secs);
              console.log('Tarea guardada', $scope.task);
              ProjectsServices.saveProjectTask($scope.task, function (err, result) {
                if (!err) {
                  ProjectsServices.getProjectTasks(idProject, function(err, tasks) {
                    if (!err) {
                      console.log('tasks:', tasks);
                      $scope.tasks = tasks;
                    }
                  })
                }
              });

              } else {
                console.log("else");
                $scope.task.users = [];
                console.log( $scope.usersAux);
                for (var user in $scope.usersAux) {
                  console.log(user);
                  if ($scope.usersAux[user]) {
                    $scope.task.users.push({idUser: user});
                  }
                }
                if ($scope.task.hour == undefined || $scope.task.hour == null) {
                  $scope.task.hour = "00";
                }
                if ($scope.task.mins == undefined || $scope.task.mins == null) {
                  $scope.task.mins = "00";
                }
                if ($scope.task.secs == undefined || $scope.task.secs == null) {
                  $scope.task.secs = "00";
                }
                $scope.emailUsers = angular.copy(  $scope.task.users );
                $scope.task.users = JSON.stringify($scope.task.users);
                $scope.task.duration = $scope.task.hour + ":" + $scope.task.mins + ":" + $scope.task.secs;
                $scope.tasks.push($scope.task);
                $scope.task = {};
              }
              ngDialog.close();
            }
          },
            cancel: function() {
              ngDialog.close();
            }
          }
        });
        $scope.error = "";
      };

    $scope.editTask = function (index,task) {
      $scope.task = angular.copy(task);
      console.log("start date find", $scope.task);
      var arrDuracion = $scope.task.duration.split(":");
      console.log("Array duracion", arrDuracion);
      $scope.task.hour = parseInt(arrDuracion[0]);
      $scope.task.mins = parseInt(arrDuracion[1]);
      $scope.task.secs = parseInt(arrDuracion[2]);

      if ($scope.task.startDate) {
        $scope.task.startDate=moment($scope.task.startDate).format("DD/MM/YYYY");
      }
      if ($scope.task.endDate) {
        $scope.task.endDate= moment($scope.task.endDate).format("DD/MM/YYYY");
      }
      $scope.state = $scope.task.status;
      if ($scope.task.comments) {
        var arr =$scope.task.comments.split('"comment":');
        var arr =($scope.task.comments) ? $scope.task.comments.split('"comment":') : Array();
        if (arr[0]=="[{") {
          $scope.comments=JSON.parse($scope.task.comments);
        }else {
        $scope.comments=[];
        }
      }
      console.log('$scope.task', $scope.task);
      if ($scope.task.users) {
          $scope.task.users = JSON.parse($scope.task.users);

        _.each($scope.task.users, function (user){
          $scope.usersAux[user.idUser] = true;
        });
      } else {
        $scope.task.users = [];
      }
      ngDialog.open({
        template: '/app/components/projects/views/project.task.modal.html',
        showClose: true,
        scope: $scope,
        disableAnimation: true,
        data: {
          confirm: function() {
            // if ($scope.task.hour == null || $scope.task.mins == null || $scope.task.secs == null || $scope.task.name == null && $scope.task.hour == undefined || $scope.task.mins == undefined || $scope.task.secs == undefined || $scope.task.name == undefined) {
            //   if ($scope.task.hour == null || $scope.task.mins == null || $scope.task.secs == null || $scope.task.name == null && $scope.task.hour == undefined || $scope.task.mins == undefined || $scope.task.secs == undefined) {
            //     var msg = "El campo Duración no puede estar vacio."
            //   } else

              if ($scope.task.name === undefined) {
                var msg = "El campo Nombre no puede estar vacio."

              ngDialog.open({
                template: '/app/shared/views/alert.modal.html',
                showClose: true,
                scope: $scope,
                disableAnimation: true,
                data: {
                  msg: msg,
                  titleRequired: "Alerta",
                }
              });
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
            $scope.task.duration = ($scope.task.hour < 10 ? "0"+$scope.task.hour : $scope.task.hour) + ":" + ($scope.task.mins < 10 ? "0"+$scope.task.mins : $scope.task.mins)+ ":" + ($scope.task.secs < 10 ? "0"+$scope.task.secs : $scope.task.secs);
            console.log('push task');
            //Parse users
            $scope.task.users = [];
            console.log( $scope.usersAux);
            for (var user in $scope.usersAux) {
              console.log(user);
              if ($scope.usersAux[user]) {
                $scope.task.users.push({idUser: user});
              }
            }
            $scope.emailUsers = angular.copy(  $scope.task.users );
            $scope.task.users = JSON.stringify($scope.task.users);

            $scope.task.comments =JSON.stringify($scope.comments);
            if ($scope.task.id) {
              if ($scope.task.startDate) {
              var arrStart= $scope.task.startDate.split("/");
              $scope.task.startDate=new Date(arrStart[2],arrStart[1]-1,arrStart[0]);
              // $scope.task.startDate = convertTime($scope.task.startDate);
              // console.log("TASK TO UPDATE",$scope.task.startDate);
              }
              if ($scope.task.endDate) {
                var arrStart= $scope.task.endDate.split("/");
                $scope.task.endDate=new Date(arrStart[2],arrStart[1]-1,arrStart[0]);
                // $scope.task.endDate = convertTime($scope.task.endDate);
                // console.log("TASK TO UPDATE",$scope.task.endDate);
              }
              console.log(  $scope.emailUsers);
              console.log("TASK TO UPDATE",$scope.task);

              ProjectsServices.saveProjectTask($scope.task, function (err, result) {
                console.log("result:: ", result);
                if (!err) {
                  $scope.tasks[index]=angular.copy($scope.task);
                  $scope.task = {};
                }
              });
            } else {
              if ($scope.task.idProject) {
                if ($scope.task.startDate) {
                var arrStart= $scope.task.startDate.split("/");
                $scope.task.startDate=new Date(arrStart[2],arrStart[1]-1,arrStart[0]);
                }
                if ($scope.task.endDate) {
                  var arrStart= $scope.task.endDate.split("/");
                  $scope.task.endDate=new Date(arrStart[2],arrStart[1]-1,arrStart[0]);
                }
                console.log("TASK TO UPDATE else",$scope.task);
                ProjectsServices.saveProjectTask($scope.task, function (err, result) {
                  console.log("result:: ", result);
                  if (!err) {
                    $scope.tasks[index]=angular.copy($scope.task);
                    $scope.task = {};
                  }
                });
              } else {
                if ($scope.task.startDate) {
                  var arrStart= $scope.task.startDate.split("/");
                  $scope.task.startDate=new Date(arrStart[2],arrStart[1]-1,arrStart[0]);
                }
                if ($scope.task.endDate) {
                  var arrStart= $scope.task.endDate.split("/");
                  $scope.task.endDate=new Date(arrStart[2],arrStart[1]-1,arrStart[0]);
                }
                console.log("TASK TO UPDATE else",$scope.task);
                ProjectsServices.saveProjectTask($scope.task, function (err, result) {
                  console.log("result:: ", result);
                  if (!err) {
                    $scope.tasks[index]=angular.copy($scope.task);
                    $scope.task = {};
                  }
                });
              }
            }
            ngDialog.close();
            }
          },
          cancel: function() {
            $scope.task = {};

            ngDialog.close();
          }
        }
      });
      $scope.error = "";
    };



    $scope.changeStatus=function () {
      console.log($scope.task.status,$scope.state);
      if ($scope.state=="In-Progress" && $scope.task.status=="In-Review") {
        console.log("OPEN MODAL");

        ngDialog.open({
          template: '/app/components/projects/views/project.task-review.modal.html',
          showClose: true,
          scope: $scope,
          disableAnimation: true,
          data: {
            confirm: function() {
              console.log($scope.review);
              var windowIDs = ngDialog.getOpenDialogs();

              sendEmail($scope.task,$scope.review.user)





              ngDialog.close(windowIDs[1]);
            },
            cancel: function() {
              var windowIDs = ngDialog.getOpenDialogs();

              ngDialog.close(windowIDs[1]);
            }
          }
        });

      }
      $scope.state=$scope.task.status;

    }


    $scope.agregarComentario= function () {
      if ($scope.comment.comment) {
        $scope.comment.userName=$rootScope.userName;
        console.log($scope.comment);

        $scope.comments.push($scope.comment);
        $scope.comment={};

      }

    }



    $scope.editComments =function (index,comment) {
      $scope.oldComment =angular.copy(comment);

      $scope.comment.comment=angular.copy(comment.comment);

      $scope.comments.splice(index,1);
      ngDialog.open({
        template: '/app/components/projects/views/project.task-comment.modal.html',
        showClose: true,
        scope: $scope,
        disableAnimation: true,
        data: {
          confirm: function() {
            console.log($scope.review);
            var windowIDs = ngDialog.getOpenDialogs();
            $scope.agregarComentario();

            ngDialog.close(windowIDs[1]);
          },
          cancel: function() {
            $scope.comments.splice(index, 0, $scope.oldComment);

            var windowIDs = ngDialog.getOpenDialogs();

            ngDialog.close(windowIDs[1]);
          }
        }
      });


    }

    $scope.openModalComentario= function () {
      $scope.comment ={};

      ngDialog.open({
        template: '/app/components/projects/views/project.task-comment.modal.html',
        showClose: true,
        scope: $scope,
        disableAnimation: true,
        data: {
          confirm: function() {
            console.log($scope.review);
            var windowIDs = ngDialog.getOpenDialogs();
            $scope.agregarComentario();

            ngDialog.close(windowIDs[1]);
          },
          cancel: function() {
            var windowIDs = ngDialog.getOpenDialogs();

            ngDialog.close(windowIDs[1]);
          }
        }
      });

    }

    $scope.save = function () {
      $scope.error = '';
      console.log('project to save', $scope.project);
      if ($scope.project.name === undefined || $scope.project.idClient === undefined || $scope.project.presupuesto === undefined || $scope.project.description === undefined) {
        if ($scope.project.name === undefined) {
          var msg = "El campo Nombre no puede estar vacio."
        } else if ($scope.project.idClient === undefined) {
          var msg = "El campo Cliente no puede estar vacio."
        } else if ($scope.project.presupuesto === undefined) {
          var msg = "El campo Budget no puede estar vacio."
        } else if ($scope.project.description === undefined) {
          var msg = "El campo Description no puede estar vacio."
        }

        $rootScope.showToaster(msg, 'error');
    } else {

      if ($scope.duration.hours == undefined || $scope.duration.hours == null) {
        $scope.duration.hours = parseInt("00");
      }
      if ($scope.duration.minutes == undefined || $scope.duration.minutes == null) {
        $scope.duration.minutes = parseInt("00");
      }
      if ($scope.duration.seconds == undefined || $scope.duration.seconds == null) {
        $scope.duration.seconds = parseInt("00");
      }

    $scope.project.duration = $scope.duration.hours + ":" + $scope.duration.minutes + ":" + $scope.duration.seconds;
    console.log('project to save', $scope.project);

  $scope.sendingData = true;
  if(typeof $scope.project.active !== 'number') {
    $scope.project.active = $scope.project.active.value;
  }

  if (idProject) {
    ProjectsServices.save($scope.project, function (err, result) {
      if (err) {
        console.log("error", err);
        $scope.sendingData = false;
      } else {
        console.log("TASKs",$scope.tasks);
        angular.forEach($scope.tasks,function (task,index) {
          if (task.users) {
            var usersEmail = JSON.parse(task.users);
          }
          task.comments =JSON.stringify(task.comments);
          angular.forEach(usersEmail,function (userEmail) {
            console.log(userEmail);
            task.projectName = $scope.project.name;
            angular.forEach($scope.users,function (user) {
              if (userEmail.idUser== user.id) {
                console.log("MANDAR MAIL",task);
                sendEmail (task,user);
              }
            })
          })
        })
        $state.go('app.projects');
      }
    });
  } else {
    ProjectsServices.save($scope.project, function (err, result) {
      if (err) {
        console.log("error", err);
        $sendingData = false;
      } else {



        var waiting = $scope.tasks.length;
        var idProject = result.id;

        _.each($scope.tasks, function(task){


          if (task.users) {
            var usersEmail = JSON.parse(task.users);
            angular.forEach(usersEmail,function (userEmail) {
              console.log(usersEmail);

              angular.forEach($scope.users,function (user) {
                if (userEmail.idUser== user.id) {
                  console.log("MANDAR MAIL",userEmail,user);
                  sendEmail (task,user);
                }
              })
            })
          }

          task.idProject = idProject;
          console.log("TASK",task);

          ProjectsServices.saveProjectTask(task, function (err, result) {
            if (!err) {
              finish();
            }
          });
        });

        function finish(){
          waiting--;
          if (waiting == 0) {
            $state.go('app.projects');
          }
        }
      }
      $state.go('app.projects');
    });
  }
  }
    }

    $scope.deleteTask = function (index,id) {
      console.log("id delete task", id, index);
      ngDialog.open({
          template: '/app/shared/views/delete.modal.html',
          showClose: true,
          scope: $scope,
          disableAnimation: true,
          data: {
            msg: "Esta seguro que desea eliminar la tarea?",
            confirm: function() {
              TasksServices.remove(id, function(err, result){
                console.log("Tarea eliminada::", err, result);
                $scope.tasks = $scope.tasks.slice(0, index).concat($scope.tasks.slice(index + 1));
                console.log('Tasks delete',$scope.tasks);
              })
            },
            cancel: function() {
              ngDialog.close(windowIDs[1]);
            }
          }
      });
    }

    function sendEmail (task,user) {
      console.log("task email", task);
      var html = "<style>.container {width: 100%;display: flex;flex-direction: column;text-align: left;}.container ul .email_list {list-style: none;font-size: 14px;font-weight: bold;padding-bottom: 8px;}.container .message{padding-left: 40px;}.email_link{font-size: 14px;color: #42acc5;font-weight: bold;text-decoration: none;}</style>";
      html += "<div class='container'>";
      html += "<div>";
      html += "<h4>"+task.name+"-"+task.projectName+"</h4>";

      html += "<ul>";
      html += "<li class='email_list' >Proyecto: "+task.projectName+"</li>";
      html += "<li class='email_list'>Tarea: "+task.name+"</li>";
      html += "<li class='email_list'>Descripcion: "+ (task.description) ? task.description:"Sin descripción" + "</li>";
      html += "</ul>";
      html += "</div>";
      html += "<div class='message'>";
      // html += "<div><h2>Mensaje</h2></div>";
      // html += "<p>"+""+"</p>";
      html += "</div></div>";

      var current_host = window.location.origin + "/#/app/tasks";

      var mailSend = {
        "site_title": "Lexartlabs",
        "topic": task.projectName + " - " + task.name,
        "to_email": user.email,
        "headers": {
          "from_email": "lextracking@lexartlabs.com",
          "bcc_emails": "facundo.torterola@lexartlabs.com"
        },
        "body": {
          "big_logo": "https://lextracking.lexartlabs.com/assets/images/lextracking-logo.svg",
          "little_logo": "https://lextracking.lexartlabs.com/assets/images/lextracking-logo.svg",
          "html_body": html,
          "footer_color": "#F9F9F9;color:#F95C33 !important;font-size: 10px",
          "footer_one": "Lexartlabs",
          "footer_two": "<a class='email_link' href='"+current_host+"'>Ir a Lextracking<a/>"
        }
      }
      console.log('TO AQUI');
      console.log("MAIL TO SEND",mailSend);
      $http({
        method: 'POST',

        url: "https://mail-api.lexartlabs.com/mail/smtp/new",
        data:mailSend,
        contentType: "application/json;charset=utf-8",
      }).then(function (response) {


        if(response.data.response == "email_sent_correct"){
          console.log("Sent");

        }

    });
  }

}]);

}(angular));
