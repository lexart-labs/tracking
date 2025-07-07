(function (ng) {

  'use strict';

  var Module = ng.module('LexTracking');

  Module.controller('taskManagerEditCtrl', ['$scope', '$rootScope', '$state', '$stateParams', '$filter', 'ProjectsServices', 'UserServices', 'ngDialog', '$timeout', '$http', function ($scope, $rootScope, $state, $stateParams, $filter, ProjectsServices, UserServices, ngDialog, $timeout, $http) {
    var idProject = $stateParams.id;
    console.log(idProject);
    var idUser = angular.copy($rootScope.userId);
    $scope.count;
    console.log(idUser);

    $scope.chart = function () {
      $scope.labels = [];
      $scope.data = [];
      $scope.colours = [];
      angular.forEach($scope.allTasks, function (value, key) {
        $scope.labels[key] = value.name;
        $scope.data[key] = Math.floor(100 / $scope.allTasks.length);
        if (value.status == 'Done') {
          $scope.colours[key] = "#33BB00";
        } else if (value.status == 'In-Review') {
          $scope.colours[key] = "#f08b8b";
        } else if (value.status == 'In-Progress') {
          $scope.colours[key] = "#f2ecb8";
        } else {
          $scope.colours[key] = "#1536A1";
        }
      });
    };
    ProjectsServices.findById(idProject, function (err, project) {
      if (!err) {
        console.log('project:', project);
        $scope.project = project;
        if (project.description == "") {
          $scope.project.description = 'Sin Descripción';
        }

        $scope.duration = [];
        if (project.duration) {
          var newDate = $scope.project.duration.split(":", 3);
          $scope.duration["hours"] = parseInt(newDate[0], 10);
          $scope.duration["minutes"] = parseInt(newDate[1], 10);
          $scope.duration["seconds"] = parseInt(newDate[2], 10);
          console.log($scope.duration, 'duracion');
        }

        if (project.comments == "" || !project.comments) {
          $scope.project.comments = 'Sin Comentarios';
        }

        $scope.filter = {}
        var timeout;
        $scope.allStatus = ["To-do", "Done", "In-Progress", "In-Review"];
        $scope.task = {};
        $scope.sendingData = false;

        function allinfo(tasks) {
          if (!tasks) {
            tasks = '';
          }
          console.log('tasks:', tasks);
          $scope.allTasks = tasks;
          $scope.tasks = tasks.slice(0, PAGE_SIZE - 1);
          $scope.total = tasks.length;
          $scope.chart();

          var timeout;
          $scope.$watch('filter', function () {
            $timeout.cancel(timeout);
            timeout = $timeout(function () {
              $scope.filterTasks();
            }, 250);
          }, true);

          $scope.filterTasks = function () {
            $scope.currentPage = 0;
            $scope.tasks = ($filter('filter')($scope.allTasks, $scope.filter));
            if ($scope.tasks) {
              $scope.total = $scope.tasks.length;
              $scope.tasks = $scope.tasks.slice(0, PAGE_SIZE - 1);
            }
          };

          $scope.pager = function (page) {
            var offset = PAGE_SIZE * (page - 1);
            $scope.tasks = $scope.allTasks.slice(offset, offset + PAGE_SIZE - 1);
            $scope.currentPage = page;
          };

          var counter = 0;
          angular.forEach($scope.allTasks, function (value, key) {
            if (value.status == 'Done') {
              counter = parseInt(counter) + parseInt(1);
            }
          });
          $scope.project.count = counter + '/' + $scope.allTasks.length;
          $scope.checktask = function (index) {
            var task = angular.copy($scope.tasks[index]);
            console.log('Change status', task);
            angular.forEach($scope.allTasks, function (value, key) {
              if (value.status == 'Done') {
                counter = counter + 1;
              }
            });
            $scope.chart();
            if (!task.startDate) {
              delete task.startDate;
            }
            if (!task.endDate) {
              delete task.endDate;
            }
            ProjectsServices.saveProjectTask(task, function (err, result) {
              if (!err) {
                var counter = 0;
                angular.forEach($scope.allTasks, function (value, key) {
                  if (value.status == 'Done') {
                    counter = parseInt(counter) + parseInt(1);
                  }
                });
                var changetasknumber = counter + "/" + $scope.allTasks.length;
                $scope.project.count = changetasknumber;
                var users = task.users;
                users = JSON.parse(users);
                var usuarioresponsable = angular.copy($rootScope.userId);
                var usertonotify;
                var usersemail;
                UserServices.findById(usuarioresponsable, function (err, result) {
                  var responsable = result;
                  angular.forEach(users, function (value, key) {
                    usertonotify = users[key].idUser;
                    UserServices.findById(usertonotify, function (err, result) {
                      usertonotify = result;
                      sendEmail(task, usertonotify, responsable)
                    })
                  });
                })
              }
            });
          }

          $scope.actualizarComentario = function (index) {
            ProjectsServices.save($scope.project, function (err, result) {
              if (!err) {
                alert('Comentario Actualizado');
              }
            });
          }
        }
        //Project tasks
        if ($rootScope.userRole != "developer") {
          ProjectsServices.getProjectTasks(idProject, function (err, tasks) {
            if (!err) {
              allinfo(tasks);
            }
          })
        } else {
          ProjectsServices.getProjectTasksbyUser(idProject, idUser, function (err, tasks) {
            if (!err) {
              allinfo(tasks);
            }
          })
        }
      }
    })

    function sendEmailTask(task, user, userresponsable, update) {
      var colortask = '#a9e892';
      if (task.status == 'Done') {
        colortask = '#a9e892';
      } else if (task.status == 'In-Review') {
        colortask = '#f08b8b';
      } else if (task.status == 'In-Progress') {
        colortask = '#f2ecb8';
      }
      console.log('manda mail');
      var colorproyect = "#F95C33";
      var html = "<style>.container {width: 100%;display: flex;flex-direction: column;text-align: left;}.container ul .email_list {list-style: none;font-size: 14px;font-weight: bold;padding-bottom: 8px;}.container .message{padding-left: 40px;}.email_link{font-size: 14px;color: #42acc5;font-weight: bold;text-decoration: none;}</style>";
      html += "<div class='container'>";
      html += "<div>";

      html += "<h4>" + task.name + "-" + angular.copy($scope.project.name) + "</h4>";

      html += "<ul>";
      html += "<li class='email_list' >El usuario <span style='color:#5692C7'>" + userresponsable.name + "</span><a href = 'mailto: " + userresponsable.email + "'> (" + userresponsable.email + ")</a>";
      if (update) {
        html += " a actualizado "
      } else {
        html += " a creado "
      }
      html += "la tarea <span style='color:" + colorproyect + "'>" + task.name + "</span> del proyecto <span style='color:" + colorproyect + "'>" + angular.copy($scope.project.name) + "</span></li>";
      html += "<li class='email_list' >Responsable: <span style='color:#5692C7'>" + userresponsable.name + "</span></li>";
      html += "<li class='email_list' >Proyecto: " + angular.copy($scope.project.name) + "</li>";
      html += "<li class='email_list'>Tarea: " + task.name + "</li>";
      html += "<li class='email_list'>Descripcion: " + task.description + "</li>";
      html += "<li class='email_list'>Status: <span style='color:" + colortask + "; text-transform: uppercase'>" + task.status + "</span></li>";
      html += "</ul>";
      html += "</div>";
      html += "<div class='message'>";
      // html += "<div><h2>Mensaje</h2></div>";
      // html += "<p>"+""+"</p>";
      html += "</div></div>";
      var current_host = window.location.protocol + "//" + window.location.host + "/";
      if (update) {
        var mailSend = {
          "site_title": "Lexartlabs",
          "topic": "Tarea Actualizada",
          "to_email": user.email,
          "headers": {
            "from_email": "lextracking@lexartlabs.com",
            "bcc_emails": "facundo.torterola@lexartlabs.com"
          },
          "body": {
            "big_logo": "https://lextracking.lexartlabs.com/assets/images/lextracking-logo.svg",
            "little_logo": "https://lextracking.lexartlabs.com/assets/images/lextracking-logo.svg",
            "slogan": current_host,
            "html_body": html,
            "footer_color": "#F9F9F9;color:#F95C33 !important;font-size: 10px",
            "footer_one": "Lexartlabs",
            "footer_two": "<a class='email_link' href='" + current_host + "'>Ir a Lextracking<a/>"
          }
        }
      } else {
        var mailSend = {
          "site_title": "Lexartlabs",
          "topic": "Tarea",
          "to_email": user.email,
          "headers": {
            "from_email": "lextracking@lexartlabs.com",
            "bcc_emails": "facundo.torterola@lexartlabs.com"
          },
          "body": {
            "big_logo": "https://lextracking.lexartlabs.com/assets/images/lextracking-logo.svg",
            "little_logo": "https://lextracking.lexartlabs.com/assets/images/lextracking-logo.svg",
            "slogan": current_host,
            "html_body": html,
            "footer_color": "#F9F9F9;color:#F95C33 !important;font-size: 10px",
            "footer_one": "Lexartlabs",
            "footer_two": "<a class='email_link' href='" + current_host + "'>Ir a Lextracking<a/>"
          }
        }
      }
      console.log("MAIL TO SEND", mailSend);
      $http({
        method: 'POST',

        url: "https://mail-api.lexartlabs.com/mail/smtp/new",
        data: mailSend,
        contentType: "application/json;charset=utf-8",
      }).then(function (response) {


        if (response.data.response == "email_sent_correct") {
          console.log("Sent");

        }

      });



    }
    function sendEmail(task, userdestino, userresponsable) {
      var current_host = window.location.protocol + "//" + window.location.host + "/";
      var url = current_host + "/#/app/taskManager/" + task.idProject;
      var colortask;
      if (task.status == 'Done') {
        colortask = '#a9e892';
      } else if (task.status == 'In-Review') {
        colortask = '#f08b8b';
      } else if (task.status == 'In-Progress') {
        colortask = '#f2ecb8';
      }
      var colorproyect = "#F95C33";
      var html = "<style>.container {width: 100%;display: flex;flex-direction: column;text-align: left;}.container ul .email_list {list-style: none;font-size: 14px;font-weight: bold;padding-bottom: 8px;}.container .message{padding-left: 40px;}.email_link{font-size: 14px;color: #42acc5;font-weight: bold;text-decoration: none;}</style>";
      html += "<div class='container'>";
      html += "<div>";
      html += "<h4>" + task.name + "-" + task.projectName + "</h4>";

      html += "<ul>";
      html += "<li class='email_list' >El usuario <span style='color:#5692C7'>" + userresponsable.name + "</span><a href = 'mailto: " + userresponsable.email + "'> (" + userresponsable.email + ")</a> cambio de estado la tarea <span style='color:" + colorproyect + "'>" + task.name + "</span> del proyecto <span style='color:" + colorproyect + "'>" + task.projectName + "</span> a </span> <span style='color:" + colortask + "; text-transform: uppercase'>" + task.status + "</span></li>";
      html += "<li class='email_list'>Tarea: <span style='color:" + colorproyect + "'>" + task.name + "</span></li>";
      html += "<li class='email_list'>Descripcion: <span style='color:" + colorproyect + "'>" + task.description + "</span></li>";
      html += "</ul>";
      html += "</div>";
      html += "<div class='message'>";
      html += "<div class='lexart-wa__actions'><a href='" + url + "' class='lexart-btn lexart-btn--alt'>Ver Tarea</a></div>";
      // html += "<div><h2>Mensaje</h2></div>";
      // html += "<p>"+""+"</p>";
      html += "</div></div>";
      var mailSend = {
        "site_title": "Lexartlabs",
        "topic": "Cambio de estado en tarea " + task.name + " a " + task.status,
        "to_email": userdestino.email,
        "headers": {
          "from_email": "lextracking@lexartlabs.com",
          "bcc_emails": "facundo.torterola@lexartlabs.com"
        },
        "body": {
          "big_logo": "https://lextracking.lexartlabs.com/assets/images/lextracking-logo.svg",
          "little_logo": "https://lextracking.lexartlabs.com/assets/images/lextracking-logo.svg",
          "slogan": current_host,
          "html_body": html,
          "footer_color": "#F9F9F9;color:" + colorproyect + " !important;font-size: 10px",
          "footer_one": "Lexartlabs",
          "footer_two": "<a class='email_link' href='" + current_host + "'>Ir a Lextracking<a/>"
        }
      }
      console.log("MAIL TO SEND", mailSend);
      $http({
        method: 'POST',

        url: "https://mail-api.lexartlabs.com/mail/smtp/new",
        data: mailSend,
        contentType: "application/json;charset=utf-8",
      }).then(function (response) {


        if (response.data.response == "email_sent_correct") {
          console.log("Sent");

        }

      });
    }

    $scope.addTask = function () {
      UserServices.find(0, '', function (err, users) {
        if (!err) {
          console.log('users', users);
          $scope.users = users;
        }
      });
      $scope.task = {};
      $scope.comments = [];
      $scope.state = "";
      $scope.usersAux = {};

      console.log("addtask", $scope.task);
      ngDialog.open({
        template: '/app/components/projects/views/project.task.modal.html',
        showClose: true,
        scope: $scope,
        disableAnimation: true,
        data: {
          confirm: function () {
            console.log('push task');
            if (!$scope.duration["hours"]) {
              $scope.duration["hours"] = 0;
            }
            if (!$scope.duration["minutes"]) {
              $scope.duration["minutes"] = 0;
            }
            if (!$scope.duration["seconds"]) {
              $scope.duration["seconds"] = 0;
            }
            var fixHour = $scope.duration["hours"] < 10 ? "0" + $scope.duration["hours"] : $scope.duration["hours"];
            var fixMinute = $scope.duration["minutes"] < 10 ? "0" + $scope.duration["minutes"] : $scope.duration["minutes"];
            var fixSecond = $scope.duration["seconds"] < 10 ? "0" + $scope.duration["seconds"] : $scope.duration["seconds"];
            var newTimer = fixHour + ":" + fixMinute + ":" + fixSecond;
            $scope.task.duration = newTimer;
            if (idProject) {
              $scope.task.idProject = idProject;
              $scope.task.comments = JSON.stringify($scope.comments);
              if ($scope.task.startDate) {
                var arrStart = $scope.task.startDate.split("/");
                $scope.task.startDate = new Date(arrStart[2], arrStart[1] - 1, arrStart[0]).toJSON().slice(0, 10);
              }
              if ($scope.task.endDate) {
                var arrStart = $scope.task.endDate.split("/");
                $scope.task.endDate = new Date(arrStart[2], arrStart[1] - 1, arrStart[0]).toJSON().slice(0, 10);
              }
              if (!$scope.task.status) {
                $scope.task.status = $scope.allStatus[0];

              }
              console.log($scope.task, 'task to insert');
              if ($scope.task.users) {
                $scope.task.users = JSON.parse($scope.task.users);

                _.each($scope.task.users, function (user) {
                  $scope.usersAux[user.idUser] = true;
                });
              } else {
                $scope.task.users = [];
              }
              for (var user in $scope.usersAux) {
                console.log(user);
                if ($scope.usersAux[user]) {
                  if (user == angular.copy($rootScope.userId)) {
                    var pushtask = 1;
                  }
                  $scope.task.users.push({ idUser: user });
                }
              }
              var users = angular.copy($scope.task.users);
              $scope.task.users = JSON.stringify($scope.task.users);
              ProjectsServices.saveProjectTask($scope.task, function (err, result) {
                if (!err) {
                  var usertonotify;
                  var usuarioresponsable = angular.copy($rootScope.userId);
                  UserServices.findById(usuarioresponsable, function (err, resultado) {
                    var responsable = resultado;
                    var usertonotify;
                    angular.forEach(users, function (value, key) {
                      usertonotify = users[key].idUser;
                      UserServices.findById(usertonotify, function (err, result) {
                        usertonotify = result;
                        sendEmailTask($scope.task, usertonotify, responsable)
                      })
                    });
                  })
                  if ($rootScope.userRole != 'developer') {
                    ProjectsServices.getProjectTasks(idProject, function (err, tasks) {
                      if (!err) {
                        console.log('tasks:', tasks);
                        $scope.allTasks = tasks;
                        if ($scope.currentPage) {
                          $scope.pager($scope.currentPage);
                        } else {
                          $scope.pager(1);
                        }
                        $scope.chart();
                        var counter = 0;
                        angular.forEach($scope.allTasks, function (value, key) {
                          if (value.status == 'Done') {
                            counter = parseInt(counter) + parseInt(1);
                          }
                        });
                        var changetasknumber = counter + "/" + $scope.allTasks.length;
                        $scope.project.count = changetasknumber;
                      }
                    })
                  } else {
                    ProjectsServices.getProjectTasksbyUser(idProject, idUser, function (err, tasks) {
                      if (!err) {
                        console.log('tasks:', tasks);
                        $scope.allTasks = tasks;
                        if ($scope.currentPage) {
                          $scope.pager($scope.currentPage);
                        } else {
                          $scope.pager(1);
                        }
                        $scope.chart();
                        var counter = 0;
                        angular.forEach($scope.allTasks, function (value, key) {
                          if (value.status == 'Done') {
                            counter = parseInt(counter) + parseInt(1);
                          }
                        });
                        var changetasknumber = counter + "/" + changetasknumber[1];
                        $scope.project.count = changetasknumber;
                      }
                    })
                  }
                }
              });
            } else {
              $scope.tasks.push(angular.copy($scope.task));
              $scope.task = {};
            }
            ngDialog.close();
          },
          cancel: function () {
            ngDialog.close();
          }
        }
      });
      $scope.error = "";
    };

    $scope.agregarComentario = function () {
      if ($scope.comment.comment) {
        $scope.comment.userName = $rootScope.userName;
        console.log($scope.comment);

        $scope.comments.push($scope.comment);
        $scope.comment = {};

      }

    }



    $scope.editComments = function (index, comment) {
      $scope.oldComment = angular.copy(comment);

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

    $scope.openModalComentario = function () {
      $scope.comment = {};

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

    $scope.editTask = function (index, task) {
      UserServices.find(0, '', function (err, users) {
        if (!err) {
          console.log('users', users);
          $scope.users = users;
        }
      });
      $scope.task = angular.copy(task);
      $scope.usersAux = [];
      if (task.duration) {
        var newDate = $scope.task.duration.split(":", 3);
        $scope.duration["hours"] = parseInt(newDate[0], 10);
        $scope.duration["minutes"] = parseInt(newDate[1], 10);
        $scope.duration["seconds"] = parseInt(newDate[2], 10);
        console.log($scope.duration, 'duracion');
      }
      if ($scope.task.startDate) {
        $scope.task.startDate = moment($scope.task.startDate).format("DD/MM/YYYY");
      }
      if ($scope.task.endDate) {
        $scope.task.endDate = moment($scope.task.endDate).format("DD/MM/YYYY");
      }
      $scope.state = $scope.task.status;
      if (!$scope.task.comments) {
        $scope.task.comments = '"comment":';
      }
      var arr = $scope.task.comments.split('"comment":');
      var arr = ($scope.task.comments) ? $scope.task.comments.split('"comment":') : Array();

      if (arr[0] == "[{") {
        $scope.comments = JSON.parse($scope.task.comments);


      } else {
        $scope.comments = [];
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
      ngDialog.open({
        template: '/app/components/projects/views/project.task.modal.html',
        showClose: true,
        scope: $scope,
        disableAnimation: true,
        data: {
          confirm: function () {
            console.log('push task');
            //Parse users
            if ($scope.duration) {
              var fixHour = $scope.duration["hours"] < 10 ? "0" + $scope.duration["hours"] : $scope.duration["hours"];
              var fixMinute = $scope.duration["minutes"] < 10 ? "0" + $scope.duration["minutes"] : $scope.duration["minutes"];
              var fixSecond = $scope.duration["seconds"] < 10 ? "0" + $scope.duration["seconds"] : $scope.duration["seconds"];

              var newTimer = fixHour + ":" + fixMinute + ":" + fixSecond;
              $scope.task.duration = newTimer;
            } else {
              $scope.task.duration = null;
            }
            $scope.task.users = [];
            console.log($scope.usersAux);
            for (var user in $scope.usersAux) {
              console.log(user);
              if ($scope.usersAux[user]) {
                $scope.task.users.push({ idUser: user });
              }
            }
            var users = angular.copy($scope.task.users);
            $scope.emailUsers = angular.copy($scope.task.users);
            $scope.task.users = JSON.stringify($scope.task.users);

            $scope.task.comments = JSON.stringify($scope.comments);
            if ($scope.task.id) {
              if ($scope.task.startDate) {
                var arrStart = $scope.task.startDate.split("/");
                $scope.task.startDate = new Date(arrStart[2], arrStart[1] - 1, arrStart[0]).toJSON().slice(0, 10);
              } else {
                delete $scope.task.startDate;
              }
              if ($scope.task.endDate) {
                console.log('Yes', $scope.task.endDate);
                var arrStart = $scope.task.endDate.split("/");
                $scope.task.endDate = new Date(arrStart[2], arrStart[1] - 1, arrStart[0]).toJSON().slice(0, 10);
              } else {
                delete $scope.task.endDate;
                console.log('No', $scope.task.endDate);
              }
              console.log($scope.emailUsers);


              console.log("TASK TO UPDATE", $scope.task);

              ProjectsServices.saveProjectTask($scope.task, function (err, result) {
                var usertonotify;
                if (!err) {
                  var usuarioresponsable = angular.copy($rootScope.userId);
                  UserServices.findById(usuarioresponsable, function (err, resultado) {
                    var responsable = resultado;
                    var usertonotify;
                    angular.forEach(users, function (value, key) {
                      usertonotify = users[key].idUser;
                      UserServices.findById(usertonotify, function (err, result) {
                        usertonotify = result;
                        sendEmailTask($scope.task, usertonotify, responsable, 'update')
                      })
                    });
                  })
                  if ($rootScope.userRole != 'developer') {
                    ProjectsServices.getProjectTasks(idProject, function (err, tasks) {
                      if (!err) {
                        console.log('tasks:', tasks);
                        $scope.allTasks = tasks;
                        if ($scope.currentPage) {
                          $scope.pager($scope.currentPage);
                        } else {
                          $scope.pager(1);
                        }
                        $scope.chart();
                        var counter = 0;
                        angular.forEach($scope.allTasks, function (value, key) {
                          if (value.status == 'Done') {
                            counter = parseInt(counter) + parseInt(1);
                          }
                        });
                        var changetasknumber = counter + "/" + $scope.allTasks.length;
                        $scope.project.count = changetasknumber;
                      }
                    })
                  } else {
                    ProjectsServices.getProjectTasksbyUser(idProject, idUser, function (err, tasks) {
                      if (!err) {
                        console.log('tasks:', tasks);
                        $scope.allTasks = tasks;
                        if ($scope.currentPage) {
                          $scope.pager($scope.currentPage);
                        } else {
                          $scope.pager(1);
                        }
                        $scope.chart();
                        var counter = 0;
                        angular.forEach($scope.allTasks, function (value, key) {
                          if (value.status == 'Done') {
                            counter = parseInt(counter) + parseInt(1);
                          }
                        });
                        var changetasknumber = counter + "/" + $scope.allTasks.length;
                        $scope.project.count = changetasknumber;
                      }
                    })
                  }
                }
              });
            }
            ngDialog.close();
          },
          cancel: function () {
            $scope.task = {};

            ngDialog.close();
          }
        }
      });
      $scope.error = "";
    };


  }]);

}(angular));
