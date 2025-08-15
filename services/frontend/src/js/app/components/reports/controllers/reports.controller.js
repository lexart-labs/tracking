(function (ng) {
  "use strict";

  var Module = ng.module("LexTracking");

  Module.controller("ReportsCtrl", [
    "$scope",
    "$interval",
    "$state",
    "$rootScope",
    "$filter",
    "$timeout",
    "UserServices",
    "ClientServices",
    "ProjectsServices",
    "TracksServices",
    "ngDialog",
    "WeeklyHourServices",
    "TasksServices",
    "SaleServices",
    function (
      $scope,
      $interval,
      $state,
      $rootScope,
      $filter,
      $timeout,
      UserServices,
      ClientServices,
      ProjectsServices,
      TracksServices,
      ngDialog,
      WeeklyHourServices,
      TasksServices,
      SaleServices
    ) {
      $scope.users = [];
      $scope.clients = [];
      $scope.client = {};
      $scope.duration = {};
      $scope.projects = [];
      $scope.tracks = [];
      $scope.total = 0;
      $scope.subtotals = {};
      $scope.filter = {};
      $scope.filtername = {};
      $scope.userName = [];
      $scope.clientName = [];
      $scope.userDuration = [];
      $scope.clientDuration = [];
      $scope.totalHours = [];
      $scope.totalHours2 = [];
      $scope.totalHoursTrello = [];
      $scope.excelName = undefined;
      $scope.totalcost = 0;
      $scope.totalcost2 = 0;
      $scope.totalcost3 = 0;
      $scope.totalcost4 = 0;
      $scope.sumAll = 0;
      $scope.finalHour = "00:00:00";
      $scope.finalTotal = 0;
      var cost = [];
      var res = [];
      $scope.sumHours = [];
      $scope.sumHoursAuto = [];
      $scope.sumHoursTrelo = [];
      $scope.allProjectsTab = [];
      $scope.arrSubtotal = [];
      $scope.subTotalCost = [];
      $scope.costSubtotal = {};
      $scope.hoursArr = [];
      $scope.mssArr = [];
      $scope.verifyMss = [];
      $scope.arrCost = [];
      $scope.filter.idTask = 0;
      $scope.totalCostTrelloPesos = 0;
      $scope.totalCostTrelloReales = 0;
      $scope.totalCostTrelloDolares = 0;
      $scope.totalCostManualPesos = 0;
      $scope.totalCostManualReales = 0;
      $scope.totalCostManualDolares = 0;
      $scope.totalCostPesos = 0;
      $scope.totalCostReales = 0;
      $scope.totalCostDolares = 0;
      $scope.totalDuration = 0;
      $scope.CurrTotalCost = '';

      // Estados para guardar los costos totales de desarollo y comparar con los budgets
      $scope.clientTotalDev = {};
      $scope.clientTotals = {};

      var userId = $rootScope.userId;
      var userRole = $rootScope.userRole;

      function createExcel() {
        var date = moment().format();
        var newDate = date.split("T");
        var day = newDate[0];
        var splitDate = newDate[1].split("-");
        var time = splitDate[0];
        var name = $rootScope.userName;
        var end = name + "_" + day + "_" + time;
        return end;
      }

      $scope.excelName = createExcel();

      function checkTime(i) {
        i = i < 1 ? 0 : i;
        if (i < 10) i = "0" + i;
        return i;
      }

      $scope.cleanTotals = function(){
        $scope.totalCostTrelloPesos = 0;
        $scope.totalCostTrelloReales = 0;
        $scope.totalCostTrelloDolares = 0;
        $scope.totalCostManualPesos = 0;
        $scope.totalCostManualReales = 0;
        $scope.totalCostManualDolares = 0;
        $scope.totalCostPesos = 0;
        $scope.totalCostReales = 0;
        $scope.totalCostDolares = 0;
        $scope.totalDuration =0;
      }

      $scope.getTotalHours = function(){
        setTimeout(function(){
          $scope.totalDuration =convertTime(moment.duration($scope.total).add($scope.total3))
        },1500)
      }

      //Función formatea obj Moment

      var convertTime = function (value) {
        var h = moment.duration(value).hours();
        var m = moment.duration(value).minutes();
        var s = moment.duration(value).seconds();
        var d = moment.duration(value).days();

        if (d > 0) {
          d = d * 24;
        }
        if (h <= 9) {
          h = "0" + h;
        }
        if (m <= 9) {
          m = "0" + m;
        }
        if (s <= 9) {
          s = "0" + s;
        }
        if (d > 0) {
          h = Number(d) + Number(h);
        }
        var finalTracked = h + ":" + m + ":" + s;
        return finalTracked;
      };

      //funciones getHours(3) esperan que esten los 3 resultados de horas trackeadas para sumarse.
      function getHours(value) {
        if (userRole != "client") {
          $scope.finalHour = convertTime(
            moment.duration($scope.finalHour).add(value)
          );
        } else {
          ProjectsServices.getProjectsByUser(userId, function (err, res) {
            $scope.userCost = Object.entries(res);
            $scope.finalHour = $scope.userCost[0][1]["tracked"];
          });
        }
      }

      function getTotalCost(ms) {
        if (userRole == "admin" || userRole == "pm") {
          var idHourCost = $rootScope.trackId;
        } else {
          var idHourCost = $rootScope.userId;
        }
        // WeeklyHourServices.find(
        //   $scope.currentPage,
        //   $scope.query,
        //   function (err, weeklyHours, countItems) {
        //     if (!err) {
        //       angular.forEach(weeklyHours, function (value, key) {
        //         if (value.idUser == idHourCost) {
        //           //$scope.CurrTotalCost = value.currency;
        //           var costo = value.costHour;
        //           var result = (ms / 3600 / 1000) * costo;

        //           $scope.arrSubtotal.push(result);
        //           // $scope.totalcost = result;
        //           var cost = { value: result };
        //           if (cost.value != undefined) {
        //             $scope.finalTotal = cost.value;
        //           } else {
        //           }
        //         }
        //       });
        //       //getTotal($scope.finalTotal);
        //     }
        //   }
        // );
      }

      //Calcular hora y costo de automaticas y Trello.

      function getSubTotalCost(mss) {
        $scope.mssArr.push(mss.mss);
        // WeeklyHourServices.find(
        //   $scope.currentPage,
        //   $scope.query,
        //   function (err, weeklyHours, countItems) {
        //     if (!err) {
        //       //for (var i = 0; i < $scope.mssArr.length; i++) {
        //       angular.forEach(weeklyHours, function (value, key) {
        //         if (value.idUser == mss.idUser) {
        //           var costo = (value.costHour);
        //           var result = (mss.mss / 3600 / 1000) * costo;
        //           $scope.subTotalCost.push(result);
        //           //proyectSubTotal($scope.subTotalCost);
        //         }
        //       });
        //       //}
        //     }
        //   }
        // );
      }

      function getTotalTime(ms, cost) {
        var h = checkTime(Math.floor(ms / 3600));
        ms = Math.floor(ms % 3600);
        var m = checkTime(Math.floor(ms / 60));
        ms = Math.floor(ms % 60);
        var s = checkTime(Math.floor(ms));
        return h + ":" + m + ":" + s;
      }

      function getTotalAutoCost(msc) {
        if (userRole == "admin" || userRole == "pm") {
          var idHourCost = $rootScope.trackId;
        } else {
          var idHourCost = $rootScope.userId;
        }
        // WeeklyHourServices.find(
        //   $scope.currentPage,
        //   $scope.query,
        //   function (err, weeklyHours, countItems) {
        //     if (!err) {
        //       angular.forEach(weeklyHours, function (value, key) {
        //         if (value.idUser == idHourCost) {
        //           var costo = parseInt(value.costHour);
        //           var result2 = (msc / 3600 / 1000) * costo;
        //           result2 = Math.ceil(result2);
        //           var cost = { value: result2 };
        //           if (cost.value != undefined) {
        //             $scope.finalTotal = cost.value;
        //           } else {
        //           }
        //         }
        //       });
        //       //getTotalAuto($scope.finalTotal);
        //     }
        //   }
        // );
      }

      function getTotalTimeAuto(msc, cost) {
        var h = checkTime(Math.floor(msc / 3600));
        msc = Math.floor(msc % 3600);
        var m = checkTime(Math.floor(msc / 60));
        msc = Math.floor(msc % 60);
        var s = checkTime(Math.floor(msc));
        return h + ":" + m + ":" + s;
      }

      function getTotalTrelloCost(mst) {
        if (userRole == "admin" || userRole == "pm") {
          var idHourCost = $rootScope.trackId;
        } else {
          var idHourCost = $rootScope.userId;
        }
        // WeeklyHourServices.find(
        //   $scope.currentPage,
        //   $scope.query,
        //   function (err, weeklyHours, countItems) {
        //     if (!err) {
        //       angular.forEach(weeklyHours, function (value, key) {
        //         if (value.idUser == idHourCost) {
        //           var costo = parseInt(value.costHour);
        //           var result3 = (mst / 3600 / 1000) * costo;
        //           result3 = Math.ceil(result3);
        //           var cost = { value: result3 };
        //           if (cost.value != undefined) {
        //             $scope.finalTotal = cost.value;
        //           } else {
        //           }
        //         }
        //       });
        //       //getTotal($scope.finalTotal);
        //       //getTotalTrello($scope.finalTotal);
        //     }
        //   }
        // );
      }

      function getTotalTimeTrello(mst, cost) {
        var h = checkTime(Math.floor(mst / 3600));
        mst = Math.floor(mst % 3600);
        var m = checkTime(Math.floor(mst / 60));
        mst = Math.floor(mst % 60);
        var s = checkTime(Math.floor(mst));
        return h + ":" + m + ":" + s;
      }

      function parseDate(date) {
        if (date) {
          var arrDate = String(date).split("/");
          return arrDate[2] + "-" + arrDate[1] + "-" + arrDate[0];
        } else {
          return "";
        }
      }

      $scope.filter = {
        startTime: moment().startOf("day"),
        endTime: moment().endOf("day"),
      };

      var timeout;
      $timeout.cancel(timeout);
      timeout = $timeout(function () {
        $scope.search();
      }, 250);

      if ($rootScope.isClient == "false") {
        ClientServices.find(0, "", function (err, clients) {
          if (!err) {
            clients.unshift({
              id: 0,
              name: $filter("translate")("reports.all"),
            });
            $scope.clients = clients;
            $scope.filter.idClient = 0;
            $scope.getProjects();
          }
        });
      } else {
        ClientServices.findById(
          $rootScope.userIdClient,
          function (err, clients) {
            if (!err) {
              $scope.client = angular.copy(clients);
              $scope.filter.idClient = clients.id;
              $scope.getProjects($scope.filter.idClient);
            }
          }
        );
      }

      if (userRole == "admin" || userRole == "pm") {
        UserServices.find(0, "", function (err, users) {
          if (!err) {
            users.unshift({ id: 0, name: $filter("translate")("reports.all") });
            $scope.users = users;
            $scope.filter.idUser = 0;
          }
        });
      } else if (userRole == "client") {
        $scope.filter.idUser = 0;
      } else {
        $scope.filter.idUser = userId;
      }

      $scope.getProjects = function (idClient) {
        if (idClient) {
          ProjectsServices.getProjectsByClient(
            idClient,
            function (err, projects) {
              if (!err) {
                projects.unshift({
                  id: 0,
                  name: $filter("translate")("reports.all"),
                });
                $scope.projects = projects;
                $scope.filter.idProject = 0;
              }
            }
          );
        } else {
          ProjectsServices.find(0, "", function (err, projects) {
            if (!err) {
              projects.unshift({
                id: 0,
                name: $filter("translate")("reports.all"),
              });
              $scope.projects = projects;
            }
          });
        }
      };

      //Mostrar Proyectos en el Tab Reportes Proyectos.

      ProjectsServices.find(0, "", function (err, projects) {
        if (!err) {
          $scope.allProjectsTab = projects;
          $scope.projectsTab = projects.slice(0, PAGE_SIZE - 1);
          $scope.totalTab = projects.length;
        }
      });

      var startTime = $scope.filter.startTime;

      // DATE FILTER
      $scope.filter.startDate = {};
      $scope.filter.endDate = {};
      $scope.$watch("filter.startTime", function (newValue, oldValue) {
        $scope.filter.startDate.maxDate = moment();
        if (
          moment($scope.filter.startTime, "DD/MM/YYYY").diff(
            moment(),
            "month"
          ) == 0
        ) {
          $scope.filter.endDate.maxDate = moment().add(0, "days");
        } else {
          $scope.filter.endDate.maxDate = moment(newValue, "DD/MM/YYYY").add(
            1,
            "month"
          );
        }
      });

      function deshabilitar_btnBuscar() {
        setTimeout(function () {
          document.getElementById("buscar").disabled = false;
        }, 3000);
        document.getElementById("buscar").disabled = true;
      };

      function groupBudgetsByClient(budgets, currency) {
        angular.forEach(budgets, function(v, k) {
          if (!$scope.clientTotals[v.Client]) {
            $scope.clientTotals[v.Client]= {};
          }

          $scope.clientTotals[v.Client]['total' + currency] = v.total;
        });
      };

      $scope.search = function () {
        deshabilitar_btnBuscar();
        var filters = {
          startTime: parseDate($scope.filter.startTime) + " 00:00:00",
          endTime: parseDate($scope.filter.endTime) + " 23:59:59",
        };

        if ($scope.filter.idUser) {
          filters.idUser = $scope.filter.idUser;
        }

        if ($scope.filter.idClient) {
          filters.idClient = $scope.filter.idClient;
        }

        if ($scope.filter.idProject) {
          filters.idProject = $scope.filter.idProject;
        }
        // ADD FEATURE
        if ($scope.filter.idTask) {
          filters.idTask = $scope.filter.idTask;
        }

        $scope.total = 0;
        $scope.total2 = 0;
        $scope.total3 = 0;
        $scope.total4 = 0;
        $scope.subtotals = {};
        $scope.subtotals2 = {};
        $scope.subtotals3 = {};
        $scope.subtotals4 = {};
        $scope.tableTrack = [];
        $scope.tableTrackTrello = [];
        $scope.tableTrackAuto = [];
        $scope.tableTrackJira = [];
        $scope.finalHour = "00:00:00";
        $scope.clientTotalDev = {};
        $scope.clientTotals = {};

        $scope.cleanTotals();

        if(userRole == "admin") {
          // SaleServices.getAllClientBudgets(
          //   moment(filters.startTime).format('YYYY-MM-DD') +  '/' + moment(filters.endTime).format('YYYY-MM-DD'),
          //   function(err, res) {
          //     if(!err) {
          //       angular.forEach(res, function(v, k) {
          //         groupBudgetsByClient(v, k);
          //       });
          //     }
          //   }
          // );
        }

        var calculeTotalHrDesarollo = function (array, clientKeyName) {
          // Creo a los seletores y valores default
          var totalName = {
            'R$': 'totalReales',
            '$': 'totalPesos',
            'USD': 'totalDolares'
          };

          // Itero sobre los tracks y modifico el result conforme el cliente y la moneda
          angular.forEach(array, function (el, key) {
            if(!$scope.clientTotalDev[el[clientKeyName]]) {
              $scope.clientTotalDev[el[clientKeyName]] = { totalReales: 0, totalPesos: 0, totalDolares: 0 };
            }

            $scope.clientTotalDev
              [el[clientKeyName]]
              [totalName[el.currency]] += el.trackCost;
          });
        };

        TracksServices.getTracks(filters, function (err, tracks) {
          if (!err && tracks) {
            $scope.tracks = tracks;
            calculeTotalHrDesarollo(tracks, 'clientName');

            var tempTotal = 0;
            tracks.forEach(function (track) {
              if(!track.currency){
                track.currency = '$'
              }
              tempTotal += (track.trackCost ? track.trackCost : 0);
              $scope.totalcost = tempTotal;
              //$scope.sumAll += parseInt(tempTotal) ? tempTotal : 0;
              sumTotalcost(tempTotal);
              if (userRole == "admin" || userRole == "pm") {
                if ($scope.tableTrack.length < 1) {
                  // WeeklyHourServices.find(
                  //   $scope.currentPage,
                  //   $scope.query,
                  //   function (err, weeklyHours, countItems) {
                  //     if (!err) {
                  //       var object = weeklyHours.find(function (value) {
                  //         if(value.currency == null || value.currency == ''){
                  //           track.currency = '$'
                  //         }

                  //         return track.idUser == value.idUser;
                  //       });
                  //       // track.currency = object.currency;
                  //       if (typeof index !== 'undefined') {
                  //         // $scope.tableTrack[index].currency = object.currency;
                  //       }
                  //     }
                  //   }
                  // );
                  $scope.tableTrack.push({
                    idUser: track.idUser,
                    duration: track.duration,
                    subTotalCost: (
                      track.trackCost ? track.trackCost : 0
                    ),
                    currency: track.currency,
                    tracks: [track],
                    // currency: track.currency,
                  });
                } else {
                  // WeeklyHourServices.find(
                  //   $scope.currentPage,
                  //   $scope.query,
                  //   function (err, weeklyHours, countItems) {
                  //     if (!err) {
                  //       var object = weeklyHours.find(function (value) {
                  //         return track.idUser == value.idUser;
                  //       });
                  //       // track.currency = object.currency;
                  //       if (typeof index !== 'undefined') {
                  //         // $scope.tableTrack[index].currency = object.currency;
                  //         // console.log(track);
                  //       }
                  //     }
                  //   }
                  // );
                  var exist = false;
                  $scope.tableTrack.forEach(function (element, index) {
                    if (element.idUser == track.idUser && exist == false) {
                      exist = true;
                      element.subTotalCost += (
                        track.trackCost ? track.trackCost : 0
                      );

                      // WeeklyHourServices.find(
                      //   $scope.currentPage,
                      //   $scope.query,
                      //   function (err, weeklyHours, countItems) {
                      //     if (!err) {
                      //       var object = weeklyHours.find(function (value) {
                      //         return track.idUser == value.idUser;
                      //       });
                      //       // track.currency = object.currency;
                      //       // element.currency = object.currency;
                      //       // console.log(track);
                      //     }
                      //   }
                      // );
                      element.tracks.push(track);
                      element.duration = convertTime(
                        moment.duration(element.duration).add(track.duration)
                      );
                    }
                  });
                  if (exist === false) {
                    $scope.tableTrack.push({
                      idUser: track.idUser,
                      duration: track.duration,
                      subTotalCost: (
                        track.trackCost ? track.trackCost : 0
                      ),
                      tracks: [track],
                    });
                  }
                }
              } else {
                if ($scope.tableTrack.length < 1) {
                  // WeeklyHourServices.find(
                  //   $scope.currentPage,
                  //   $scope.query,
                  //   function (err, weeklyHours, countItems) {
                  //     if (!err) {
                  //       var object = weeklyHours.find(function (value) {
                  //         return track.idUser == value.idUser;
                  //       });
                  //       // track.currency = object.currency;
                  //       // $scope.tableTrack[index].currency = object.currency;
                  //       // console.log(track);
                  //     }
                  //   }
                  // );
                  $scope.tableTrack.push({
                    idProyecto: track.idProyecto,
                    duration: track.duration,
                    subTotalCost: (
                      track.trackCost ? track.trackCost : 0
                    ),
                    tracks: [track],
                  });
                } else {
                  var exist = false;
                  $scope.tableTrack.forEach(function (element) {
                    if (
                      element.idProyecto == track.idProyecto &&
                      exist == false
                    ) {
                      exist = true;
                      element.subTotalCost += (
                        track.trackCost ? track.trackCost : 0
                      );
                      // WeeklyHourServices.find(
                      //   $scope.currentPage,
                      //   $scope.query,
                      //   function (err, weeklyHours, countItems) {
                      //     if (!err) {
                      //       var object = weeklyHours.find(function (value) {
                      //         return track.idUser == value.idUser;
                      //       });
                      //       // track.currency = object.currency;
                      //       // element.currency = object.currency;
                      //       // console.log(track);
                      //     }
                      //   }
                      // );
                      element.tracks.push(track);
                      element.duration = convertTime(
                        moment.duration(element.duration).add(track.duration)
                      );
                    }
                  });
                  if (exist === false) {
                    $scope.tableTrack.push({
                      idProyecto: track.idProyecto,
                      duration: track.duration,
                      subTotalCost: (
                        track.trackCost ? track.trackCost : 0
                      ),
                      tracks: [track],
                    });
                  }
                }
              }
              if(track.currency == null || track.currency == ''){
                track.currency = '$'
              }
              if(track.currency == '$'){
                $scope.totalCostManualPesos += track.trackCost
                $scope.totalCostPesos += track.trackCost
              }
              if(track.currency == 'R$'){
                $scope.totalCostManualReales += track.trackCost
                $scope.totalCostReales += track.trackCost
              }
              if(track.currency == 'USD'){
                $scope.totalCostManualDolares += track.trackCost
                $scope.totalCostDolares += track.trackCost
              }
            });
            // Subtotal by Project
            $scope.tableTrack.forEach(function (el) {
              el.byProject = []; //aca vamos a ir pusheando cada track
              el.byTask = [];
              el.tracks.forEach(function (track, index) {
                // recorremos los tracks
                if (el.byProject.length < 1) {
                  // WeeklyHourServices.find(
                  //   $scope.currentPage,
                  //   $scope.query,
                  //   function (err, weeklyHours, countItems) {
                  //     if (!err) {
                  //       var object = weeklyHours.find(function (value) {
                  //         return track.idUser == value.idUser;
                  //       });
                  //       // el.byProject = object.currency;
                  //     }
                  //   }
                  // );
                  el.byProject.push({
                    idProyecto: track.idProyecto,
                    projectName: track.projectName,
                    duration: track.duration,
                    subTotalCost: (
                      track.trackCost ? track.trackCost : 0
                    ),
                    tracks: [track],
                  });
                } else {
                  var exist = false;
                  el.byProject.forEach(function (element) {
                    if (
                      element.idProyecto == track.idProyecto &&
                      exist == false
                    ) {
                      exist = true;
                      element.subTotalCost += (
                        track.trackCost ? track.trackCost : 0
                      );
                      element.tracks.push(track);
                      element.duration = convertTime(
                        moment.duration(element.duration).add(track.duration)
                      );
                    }
                  });
                  if (exist === false) {
                    el.byProject.push({
                      idProyecto: track.idProyecto,
                      projectName: track.projectName,
                      duration: track.duration,
                      subTotalCost: (
                        track.trackCost ? track.trackCost : 0
                      ),
                      tracks: [track],
                    });
                  }
                }
                // ADD FEATURE BY TASK
                if (el.byTask.length < 1) {
                  el.byTask.push({
                    idTask: track.idTask,
                    taskName: track.taskName,
                    duration: track.duration,
                    idProyecto: track.idProyecto,
                    subTotalCost: (
                      track.trackCost ? track.trackCost : 0
                    ),
                    tracks: [track],
                  });
                } else {
                  var exist2 = false;
                  el.byTask.forEach(function (element) {
                    if (element.idTask == track.idTask && exist2 == false) {
                      exist2 = true;
                      element.subTotalCost += (
                        track.trackCost ? track.trackCost : 0
                      );
                      element.tracks.push(track);
                      element.duration = convertTime(
                        moment.duration(element.duration).add(track.duration)
                      );
                    }
                  });
                  if (exist2 === false) {
                    el.byTask.push({
                      idTask: track.idTask,
                      taskName: track.taskName,
                      duration: track.duration,
                      idProyecto: track.idProyecto,
                      subTotalCost: (
                        track.trackCost ? track.trackCost : 0
                      ),
                      tracks: [track],
                    });
                  }
                }
              });
            });
            //Llamada a graficas de barras
            bargraphUsers();
            bargraphClients();
            var ms = 0;
            var now = new Date().getTime();
            _.each(tracks, function (track) {
              $rootScope.trackId = track.idUser;
              if (userRole == "admin" || userRole == "pm") {
                if (!$scope.subtotals[track.idUser]) {
                  $scope.subtotals[track.idUser] = 0;
                }
                track.startTime = new Date(track.startTime).getTime();
                track.endTime = new Date(track.endTime).getTime();
                if (track.duration.indexOf("-") !== -1) {
                  track.duration = getTotalTime((now - track.startTime) / 1000);
                  ms += now - track.startTime;
                  $scope.subtotals[track.idUser] += now - track.startTime;
                } else {
                  ms += track.endTime - track.startTime;
                  $scope.subtotals[track.idUser] +=
                    track.endTime - track.startTime;
                }
                $scope.arrSubtotal.push(track.trackCost);
              } else {
                if (!$scope.subtotals[track.idProject]) {
                  $scope.subtotals[track.idProject] = 0;
                }
                track.startTime = new Date(track.startTime).getTime();
                track.endTime = new Date(track.endTime).getTime();
                if (track.duration.indexOf("-") !== -1) {
                  track.duration = getTotalTime((now - track.startTime) / 1000);
                  ms += now - track.startTime;
                  $scope.subtotals[track.idProject] += now - track.startTime;
                } else {
                  ms += track.endTime - track.startTime;
                  $scope.subtotals[track.idProject] +=
                    track.endTime - track.startTime;
                }
                $scope.arrSubtotal.push(track.trackCost);
              }
            });

            //Subotales de horas po proyecto
            for (var k in $scope.subtotals) {
              if ($scope.subtotals.hasOwnProperty(k)) {
                $scope.subtotals[k] = getTotalTime($scope.subtotals[k] / 1000);
                $scope.sumHours.push({
                  idUser: k,
                  duration: $scope.subtotals[k],
                });
              }
            }

            var mss = 0;
            for (var i = 0; i < $scope.sumHours.length; i++) {
              var th = moment.duration(th).add($scope.sumHours[i].duration);
              var subcost = moment.duration($scope.sumHours[i].duration);
              mss = {
                idUser: $scope.sumHours[i].idUser,
                mss: subcost._milliseconds,
              };
              getSubTotalCost(mss);
            }
            $scope.total = convertTime(th);

            $scope.sumHours = [];

            //Total general
            getTotalCost(ms);

            getHours($scope.total);

            //llamada a graficas de tortas
            roundgraphUser();
            roundgraphClient();
          }
        });

        // TracksServices.getAutoTracks(filters, function (err, tracks) {
        //   if (!err && tracks) {
        //     $scope.autoTracks = tracks;
        //     calculeTotalHrDesarollo(tracks, 'clientName');
        //     var tempTotal = 0;
        //     tracks.forEach(function (track) {
        //       tempTotal += parseInt(track.trackCost ? track.trackCost : 0);
        //       $scope.totalcost2 = tempTotal;
        //       sumTotalcost(tempTotal);
        //       if (userRole == "admin" || userRole == "pm") {
        //         if ($scope.tableTrackAuto.length < 1) {
        //           WeeklyHourServices.find(
        //             $scope.currentPage,
        //             $scope.query,
        //             function (err, weeklyHours, countItems) {
        //               if (!err) {
        //                 var object = weeklyHours.find(function (value) {
        //                   return track.idUser == value.idUser;
        //                 });
        //                 track.currency = object.currency;
        //                 $scope.tableTrack[index].currency = object.currency;
        //               }
        //             }
        //           );
        //           $scope.tableTrackAuto.push({
        //             idUser: track.idUser,
        //             idProyecto: track.idProyecto,
        //             duration: track.durations,
        //             currency : track.currency,
        //             subTotalCost: parseInt(
        //               track.trackCost ? track.trackCost : 0
        //             ),
        //             currency: track.currency,
        //             tracks: [track],
        //           });

        //         } else {
        //           var exist = false;
        //           $scope.tableTrackAuto.forEach(function (element) {
        //             if (element.idUser == track.idUser && exist == false) {
        //               exist = true;
        //               element.subTotalCost += parseInt(
        //                 track.trackCost ? track.trackCost : 0
        //               );
        //               WeeklyHourServices.find(
        //                 $scope.currentPage,
        //                 $scope.query,
        //                 function (err, weeklyHours, countItems) {
        //                   if (!err) {
        //                     var object = weeklyHours.find(function (value) {
        //                       return track.idUser == value.idUser;
        //                     });
        //                     // track.currency = object.currency;
        //                     element.currency = object.currency;
        //                   }
        //                 }
        //               );
        //               element.tracks.push(track);
        //               element.duration = convertTime(
        //                 moment.duration(element.duration).add(track.durations)
        //               );
        //             }
        //           });
        //           if (exist === false) {
        //             $scope.tableTrackAuto.push({
        //               idUser: track.idUser,
        //               idProyecto: track.idProyecto,
        //               duration: track.durations,
        //               currency : track.currency,
        //               subTotalCost: parseInt(
        //                 track.trackCost ? track.trackCost : 0
        //               ),
        //               tracks: [track],
        //             });
        //           }
        //         }
        //       } else {
        //         if ($scope.tableTrackAuto.length < 1) {
        //           $scope.tableTrackAuto.push({
        //             idUser: track.idUser,
        //             idProyecto: track.idProyecto,
        //             duration: track.durations,
        //             currency : track.currency,
        //             subTotalCost: parseInt(
        //               track.trackCost ? track.trackCost : 0
        //             ),
        //             tracks: [track],
        //           });
        //         } else {
        //           var exist = false;
        //           $scope.tableTrackAuto.forEach(function (element) {
        //             if (
        //               element.idProyecto == track.idProyecto &&
        //               exist == false
        //             ) {
        //               exist = true;
        //               element.subTotalCost += parseInt(
        //                 track.trackCost ? track.trackCost : 0
        //               );
        //               element.tracks.push(track);
        //               element.duration = convertTime(
        //                 moment.duration(element.duration).add(track.durations)
        //               );
        //             }
        //           });
        //           if (exist === false) {
        //             $scope.tableTrackAuto.push({
        //               idProyecto: track.idProyecto,
        //               duration: track.durations,
        //               currency : track.currency,
        //               subTotalCost: parseInt(
        //                 track.trackCost ? track.trackCost : 0
        //               ),
        //               tracks: [track],
        //             });
        //           }
        //         }
        //       }
        //     });
        //     $scope.tableTrackAuto.forEach(function (el) {
        //       el.byProject = []; //aca vamos a ir pusheando cada track
        //       el.tracks.forEach(function (track, index) {
        //         // recorremos los tracks
        //         if (el.byProject.length < 1) {
        //           el.byProject.push({
        //             idProyecto: track.idProyecto,
        //             projectName: track.projectName,
        //             duration: track.durations,
        //             currency : track.currency,
        //             subTotalCost: parseInt(
        //               track.trackCost ? track.trackCost : 0
        //             ),
        //             tracks: [track],
        //           });
        //         } else {
        //           var exist = false;
        //           el.byProject.forEach(function (element) {
        //             if (
        //               element.idProyecto == track.idProyecto &&
        //               exist == false
        //             ) {
        //               exist = true;
        //               element.subTotalCost += parseInt(
        //                 track.trackCost ? track.trackCost : 0
        //               );
        //               element.tracks.push(track);
        //               element.duration = convertTime(
        //                 moment.duration(element.duration).add(track.durations)
        //               );
        //             }
        //           });
        //           if (exist === false) {
        //             el.byProject.push({
        //               idProyecto: track.idProyecto,
        //               projectName: track.projectName,
        //               duration: track.durations,
        //               currency : track.currency,
        //               subTotalCost: parseInt(
        //                 track.trackCost ? track.trackCost : 0
        //               ),
        //               tracks: [track],
        //             });
        //           }
        //         }
        //       });
        //     });
        //     //Llamada a graficas de barras
        //     bargraphUsers();
        //     bargraphClients();
        //     var msc = 0;
        //     var now = new Date().getTime();
        //     _.each(tracks, function (track) {
        //       if (!$scope.subtotals2[track.projectError]) {
        //         $scope.subtotals2[track.projectError] = 0;
        //       }
        //       track.startTime = new Date(track.startTime).getTime();
        //       track.endTime = new Date(track.endTime).getTime();
        //       if (track.durations.indexOf("-") !== -1) {
        //         track.durations = getTotalTimeAuto(
        //           (now - track.startTime) / 1000
        //         );
        //         msc += now - track.startTime;
        //         $scope.subtotals2[track.projectError] += now - track.startTime;
        //       } else {
        //         msc += track.endTime - track.startTime;
        //         $scope.subtotals2[track.projectError] +=
        //           track.endTime - track.startTime;
        //       }
        //     });

        //     //Subotales de horas po proyecto
        //     for (var k in $scope.subtotals2) {
        //       if ($scope.subtotals2.hasOwnProperty(k)) {
        //         $scope.subtotals2[k] = getTotalTimeAuto(
        //           $scope.subtotals2[k] / 1000
        //         );
        //         $scope.sumHoursAuto.push($scope.subtotals2[k]);
        //       }
        //     }

        //     for (var i = 0; i < $scope.sumHoursAuto.length; i++) {
        //       var th = moment.duration(th).add($scope.sumHoursAuto[i]);
        //     }
        //     $scope.total2 = convertTime(th);

        //     $scope.sumHoursAuto = [];

        //     //Total tareas automaticas
        //     getTotalAutoCost(msc);

        //     getHours($scope.total2);

        //     //llamada a graficas de tortas
        //     roundgraphUser();
        //     roundgraphClient();
        //   }
        // });
        TracksServices.getTrelloTrack(filters, function (err, tracks) {
          if (!err && tracks) {
            $scope.trelloTracks = tracks;
            calculeTotalHrDesarollo(tracks, 'client');

            /* NUEVA FUNCION */
            var tempTotal = 0;
            tracks.forEach(function (track) {
              tempTotal += parseInt(track.trackCost ? track.trackCost : 0);
              // console.log('COSTO UNITARIO', track.trackCost, 'COSTO TOTAL TRELLO', tempTotal)
              $scope.totalcost3 = tempTotal;
              sumTotalcost(tempTotal);
              if (userRole == "admin" || userRole == "pm") {
                if ($scope.tableTrackTrello.length < 1) {
                  $scope.tableTrackTrello.push({
                    idUser: track.idUser,
                    idProyecto: track.idProyecto,
                    clientName: track.client,
                    duration: track.durations,
                    currency : track.currency,
                    subTotalCost: parseInt(
                      track.trackCost ? track.trackCost : 0
                    ),
                    tracks: [track],
                  });
                } else {
                  var exist = false;
                  $scope.tableTrackTrello.forEach(function (element) {
                    if (element.idUser == track.idUser && exist == false) {
                      exist = true;
                      element.subTotalCost += parseInt(
                        track.trackCost ? track.trackCost : 0
                      );
                      element.tracks.push(track);
                      element.duration = convertTime(
                        moment.duration(element.duration).add(track.durations)
                      );
                    }
                  });
                  if (exist === false) {
                    $scope.tableTrackTrello.push({
                      idUser: track.idUser,
                      idProyecto: track.idProyecto,
                      clientName: track.client,
                      duration: track.durations,
                      currency : track.currency,
                      subTotalCost: parseInt(
                        track.trackCost ? track.trackCost : 0
                      ),
                      tracks: [track],
                    });
                  }
                }
              } else {
                if ($scope.tableTrackTrello.length < 1) {
                  $scope.tableTrackTrello.push({
                    idUser: track.idUser,
                    idProyecto: track.idProyecto,
                    clientName: track.client,
                    duration: track.duration,
                    currency : track.currency,
                    subTotalCost: parseInt(
                      track.trackCost ? track.trackCost : 0
                    ),
                    tracks: [track],
                  });
                } else {
                  var exist = false;
                  $scope.tableTrackTrello.forEach(function (element) {
                    if (
                      element.idProyecto == track.idProyecto &&
                      exist == false
                    ) {
                      exist = true;
                      element.subTotalCost += parseInt(
                        track.trackCost ? track.trackCost : 0
                      );
                      element.tracks.push(track);
                      element.duration = convertTime(
                        moment.duration(element.duration).add(track.duration)
                      );
                    }
                  });
                  if (exist === false) {
                    $scope.tableTrackTrello.push({
                      idProyecto: track.idProyecto,
                      clientName: track.client,
                      duration: track.durations,
                      currency : track.currency,
                      subTotalCost: parseInt(
                        track.trackCost ? track.trackCost : 0
                      ),
                      tracks: [track],
                    });
                  }
                }
              }

            });
            $scope.tableTrackTrello.forEach(function (el) {
              el.byProject = []; //aca vamos a ir pusheando cada track
              el.tracks.forEach(function (track, index) {
                // recorremos los tracks
                if (el.byProject.length < 1) {
                  el.byProject.push({
                    idProyecto: track.idProyecto,
                    projectName: track.projectName,
                    duration: track.durations,
                    currency : track.currency,
                    client: track.client,
                    subTotalCost: parseInt(
                      track.trackCost ? track.trackCost : 0
                    ),
                    tracks: [track],
                  });
                } else {
                  var exist = false;
                  el.byProject.forEach(function (element) {
                    if (
                      element.idProyecto == track.idProyecto &&
                      exist == false
                    ) {
                      exist = true;
                      element.subTotalCost += parseInt(
                        track.trackCost ? track.trackCost : 0
                      );
                      element.tracks.push(track);
                      element.duration = convertTime(
                        moment.duration(element.duration).add(track.durations)
                      );
                    }
                  });
                  if (exist === false) {
                    el.byProject.push({
                      idProyecto: track.idProyecto,
                      projectName: track.projectName,
                      duration: track.durations,
                      currency : track.currency,
                      client: track.client,
                      subTotalCost: parseInt(
                        track.trackCost ? track.trackCost : 0
                      ),
                      tracks: [track],
                    });
                  }
                }
                if(track.currency == '$'){
                  $scope.totalCostTrelloPesos += track.trackCost
                  $scope.totalCostPesos += track.trackCost
                }
                if(track.currency == 'R$'){
                  $scope.totalCostTrelloReales += track.trackCost
                  $scope.totalCostReales += track.trackCost
                }
                if(track.currency == 'USD'){
                  $scope.totalCostTrelloDolares += track.trackCost
                  $scope.totalCostDolares += track.trackCost
                }
              });
            });
            /* FIN NUEVA FUNCION */

            //Llamada a graficas de barras
            bargraphUsers();
            bargraphClients();
            var mst = 0;
            var now = new Date().getTime();
            _.each(tracks, function (track) {
              if (!$scope.subtotals3[track.projectName]) {
                $scope.subtotals3[track.projectName] = 0;
              }
              track.startTime = new Date(track.startTime).getTime();
              track.endTime = new Date(track.endTime).getTime();
              if (track.durations.indexOf("-") !== -1) {
                track.durations = getTotalTimeTrello(
                  (now - track.startTime) / 1000
                );
                mst += now - track.startTime;
                $scope.subtotals3[track.projectName] += now - track.startTime;
              } else {
                mst += track.endTime - track.startTime;
                $scope.subtotals3[track.projectName] +=
                  track.endTime - track.startTime;
              }
            });

            //Subotales de horas po proyecto
            for (var k in $scope.subtotals3) {
              if ($scope.subtotals3.hasOwnProperty(k)) {
                $scope.subtotals3[k] = getTotalTimeTrello(
                  $scope.subtotals3[k] / 1000
                );
                $scope.sumHoursTrelo.push($scope.subtotals3[k]);
              }
            }

            for (var i = 0; i < $scope.sumHoursTrelo.length; i++) {
              var th = moment.duration(th).add($scope.sumHoursTrelo[i]);
              // console.log(moment.duration(th))
            }

            $scope.total3 = convertTime(th);

            $scope.sumHoursTrelo = [];

            //Total tareas trello
            getTotalTrelloCost(mst);

            getHours($scope.total3);

            //llamada a graficas de tortas
            roundgraphUser();
            roundgraphClient();
          }
          $scope.getTotalHours()
        });

        // TracksServices.getJiraTrack(filters, function (err, tracks) {
        //   console.log("Tareas Jira", tracks, err);
        //   if (!err) {
        //     $scope.jiraTracks = tracks;

        //     /* NUEVA FUNCION */
        //     var tempTotal = 0;
        //     tracks.forEach(function (track) {
        //       tempTotal += parseInt(track.trackCost ? track.trackCost : 0);
        //       $scope.totalcost4 = tempTotal;
        //       if (userRole == "admin" || userRole == "pm") {
        //         if ($scope.tableTrackJira.length < 1) {
        //           $scope.tableTrackJira.push({
        //             idUser: track.idUser,
        //             idProyecto: track.idProyecto,
        //             clientName: track.client,
        //             duration: track.durations,
        //             subTotalCost: parseInt(
        //               track.trackCost ? track.trackCost : 0
        //             ),
        //             tracks: [track],
        //           });
        //         } else {
        //           var exist = false;
        //           $scope.tableTrackJira.forEach(function (element) {
        //             if (element.idUser == track.idUser && exist == false) {
        //               exist = true;
        //               element.subTotalCost += parseInt(
        //                 track.trackCost ? track.trackCost : 0
        //               );
        //               element.tracks.push(track);
        //               element.duration = convertTime(
        //                 moment.duration(element.duration).add(track.durations)
        //               );
        //             }
        //           });
        //           if (exist === false) {
        //             $scope.tableTrackJira.push({
        //               idUser: track.idUser,
        //               idProyecto: track.idProyecto,
        //               clientName: track.client,
        //               duration: track.durations,
        //               subTotalCost: parseInt(
        //                 track.trackCost ? track.trackCost : 0
        //               ),
        //               tracks: [track],
        //             });
        //           }
        //         }
        //       } else {
        //         if ($scope.tableTrackJira.length < 1) {
        //           $scope.tableTrackJira.push({
        //             idProyecto: track.idUser,
        //             idProyecto: track.idProyecto,
        //             clientName: track.client,
        //             duration: track.duration,
        //             subTotalCost: parseInt(
        //               track.trackCost ? track.trackCost : 0
        //             ),
        //             tracks: [track],
        //           });
        //         } else {
        //           var exist = false;
        //           $scope.tableTrackJira.forEach(function (element) {
        //             if (
        //               element.idProyecto == track.idProyecto &&
        //               exist == false
        //             ) {
        //               exist = true;
        //               element.subTotalCost += parseInt(
        //                 track.trackCost ? track.trackCost : 0
        //               );
        //               element.tracks.push(track);
        //               element.duration = convertTime(
        //                 moment.duration(element.duration).add(track.duration)
        //               );
        //             }
        //           });
        //           if (exist === false) {
        //             $scope.tableTrackJira.push({
        //               idProyecto: track.idProyecto,
        //               clientName: track.client,
        //               duration: track.durations,
        //               subTotalCost: parseInt(
        //                 track.trackCost ? track.trackCost : 0
        //               ),
        //               tracks: [track],
        //             });
        //           }
        //         }
        //       }
        //     });
        //     $scope.tableTrackJira.forEach(function (el) {
        //       el.byProject = []; //aca vamos a ir pusheando cada track
        //       el.tracks.forEach(function (track, index) {
        //         // recorremos los tracks
        //         if (el.byProject.length < 1) {
        //           el.byProject.push({
        //             idProyecto: track.idProyecto,
        //             projectName: track.projectName,
        //             duration: track.durations,
        //             subTotalCost: parseInt(
        //               track.trackCost ? track.trackCost : 0
        //             ),
        //             tracks: [track],
        //           });
        //         } else {
        //           var exist = false;
        //           el.byProject.forEach(function (element) {
        //             if (
        //               element.idProyecto == track.idProyecto &&
        //               exist == false
        //             ) {
        //               exist = true;
        //               element.subTotalCost += parseInt(
        //                 track.trackCost ? track.trackCost : 0
        //               );
        //               element.tracks.push(track);
        //               element.duration = convertTime(
        //                 moment.duration(element.duration).add(track.durations)
        //               );
        //             }
        //           });
        //           if (exist === false) {
        //             el.byProject.push({
        //               idProyecto: track.idProyecto,
        //               projectName: track.projectName,
        //               duration: track.durations,
        //               subTotalCost: parseInt(
        //                 track.trackCost ? track.trackCost : 0
        //               ),
        //               tracks: [track],
        //             });
        //           }
        //         }
        //       });
        //     });
        //     console.log("RESULT Jira::", $scope.tableTrackJira);
        //     /* FIN NUEVA FUNCION */

        //     //Llamada a graficas de barras
        //     bargraphUsers();
        //     bargraphClients();
        //     var mst = 0;
        //     var now = new Date().getTime();
        //     _.each(tracks, function (track) {
        //       if (!$scope.subtotals4[track.projectName]) {
        //         $scope.subtotals4[track.projectName] = 0;
        //       }
        //       track.startTime = new Date(track.startTime).getTime();
        //       track.endTime = new Date(track.endTime).getTime();
        //       if (track.durations.indexOf("-") !== -1) {
        //         track.durations = getTotalTimeTrello(
        //           (now - track.startTime) / 1000
        //         );
        //         mst += now - track.startTime;
        //         $scope.subtotals4[track.projectName] += now - track.startTime;
        //       } else {
        //         mst += track.endTime - track.startTime;
        //         $scope.subtotals4[track.projectName] +=
        //           track.endTime - track.startTime;
        //       }
        //     });

        //     //Subotales de horas po proyecto
        //     for (var k in $scope.subtotals4) {
        //       if ($scope.subtotals4.hasOwnProperty(k)) {
        //         $scope.subtotals4[k] = getTotalTimeTrello(
        //           $scope.subtotals4[k] / 1000
        //         );
        //         $scope.sumHoursTrelo.push($scope.subtotals4[k]);
        //       }
        //     }

        //     for (var i = 0; i < $scope.sumHoursTrelo.length; i++) {
        //       var th = moment.duration(th).add($scope.sumHoursTrelo[i]);
        //     }

        //     $scope.total4 = convertTime(th);

        //     $scope.sumHoursTrelo = [];

        //     //Total tareas trello
        //     getTotalTrelloCost(mst);

        //     getHours($scope.total4);

        //     //llamada a graficas de tortas
        //     roundgraphUser();
        //     roundgraphClient();
        //   }
        // });
      };

      var sumTotalcost = function (value) {
        $scope.arrCost += value;
      };

      function parseTrackTime(date) {
        var arrDate = date.split(" ");
        var date = parseDate(arrDate[0]);
        var hour = arrDate[1] + ":00";
        return date + " " + hour;
      }

      $scope.updateTrackDuration = function (track) {
        if (
          typeof track.startTime === "string" &&
          typeof track.endTime === "string"
        ) {
          var startTime = parseTrackTime(track.startTime);
          startTime = new Date(startTime).getTime();

          var endTime = parseTrackTime(track.endTime);
          endTime = new Date(endTime).getTime();
          track.trackDuration = getTotalTime((endTime - startTime) / 1000);
        }
      };

      $scope.updateAutoTrackDuration = function (autoTrack) {
        if (
          typeof autoTrack.startTime === "string" &&
          typeof autoTrack.endTime === "string"
        ) {
          var startTime = parseTrackTime(autoTrack.startTime);
          startTime = new Date(startTime).getTime();

          var endTime = parseTrackTime(autoTrack.endTime);
          endTime = new Date(endTime).getTime();
          autoTrack.durations = getTotalTimeAuto((endTime - startTime) / 1000);
        }
      };

      var timeoutb;
      $scope.$watch(
        "filtername",
        function () {
          $timeout.cancel(timeoutb);
          timeoutb = $timeout(function () {
            $scope.filterProjects();
          }, 250);
        },
        true
      );

      $scope.filterProjects = function () {
        $scope.currentPage = 0;
        $scope.projectsTab = $filter("filter")(
          $scope.allProjectsTab,
          $scope.filtername
        );
        if ($scope.projectsTab) {
          $scope.totalTab = $scope.projectsTab.length;
          $scope.projectsTab = $scope.projectsTab.slice(0, PAGE_SIZE - 1);
        }
      };

      $scope.pager = function (page) {
        var offset = PAGE_SIZE * (page - 1);
        $scope.projectsTab = $scope.allProjectsTab.slice(
          offset,
          offset + PAGE_SIZE - 1
        );
      };

      //Edit track
      $scope.editTrack = function (track) {
        $scope.error = "";
        $scope.track = angular.copy(track);
        $scope.track.startTime = moment($scope.track.startTime);
        $scope.track.endTime = moment($scope.track.endTime);
        $scope.track.trackDuration = $scope.track.duration;

        ngDialog.open({
          template: "/app/components/reports/views/report.task.modal.html",
          showClose: true,
          scope: $scope,
          disableAnimation: true,
          data: {
            confirm: function () {
              var objTrack = angular.copy($scope.track);

              objTrack.duracion = objTrack.duration;
              objTrack.endTime = parseTrackTime(objTrack.endTime);
              objTrack.startTime = parseTrackTime(objTrack.startTime);
              var newDuration = moment.duration($scope.track.trackDuration);
              var msc = newDuration._milliseconds;
              getNewTotalCost(msc);
              function getNewTotalCost(msc) {
                if (userRole == "admin" || userRole == "pm") {
                  var idHourCost = $rootScope.trackId;
                } else {
                  var idHourCost = $rootScope.userId;
                }
                WeeklyHourServices.find(
                  $scope.currentPage,
                  $scope.query,
                  function (err, weeklyHours, countItems) {
                    if (!err) {
                      if (weeklyHours.length > 0) {
                        var exist = false;
                        angular.forEach(weeklyHours, function (value, key) {
                          if (value.idUser == idHourCost) {
                            exist = true;
                            var costo = parseInt(value.costHour);
                            var result2 = (msc / 3600 / 1000) * costo;
                            result2 = Math.ceil(result2);
                            newCostTracked(result2);
                          }
                        });
                        if (exist === false) {
                          TracksServices.update(
                            objTrack,
                            function (err, result) {
                              if (!err) {
                                $scope.search();
                                ngDialog.close();
                              } else {
                                $scope.error = err;
                              }
                            }
                          );
                        }
                      } else {
                        TracksServices.update(objTrack, function (err, result) {
                          if (!err) {
                            $scope.search();
                            ngDialog.close();
                          } else {
                            $scope.error = err;
                          }
                        });
                      }
                    }
                  }
                );
              }
              var newCostTracked = function (value) {
                // console.log(value)
                objTrack.trackCost = value;
                ProjectsServices.findById(
                  objTrack.idProyecto,
                  function (err, result) {
                    // console.log(objTrack.idProyecto)
                    // console.log(result)
                    var project = result;
                    var oldTime = moment.duration(objTrack.duration);
                    var newTime = moment.duration(objTrack.trackDuration);
                    objTrack.duracion = objTrack.trackDuration;
                    if (oldTime < newTime) {
                      var totalTime = moment
                        .duration(newTime)
                        .subtract(oldTime);
                      var a = moment.duration(totalTime);
                      var b = moment.duration(project.tracked);
                      objTrack.totalTrack = moment.duration(a).add(b);
                      objTrack.totalTrack = convertTime(objTrack.totalTrack);
                      objTrack.projCost =
                        Number(objTrack.trackCost) -
                        Number($scope.track.trackCost);
                      objTrack.projCost += Number(project.totalCost);
                    } else if (oldTime > newTime) {
                      var totalTime = moment
                        .duration(oldTime)
                        .subtract(newTime);
                      var a = moment.duration(totalTime);
                      var b = moment.duration(project.tracked);
                      objTrack.totalTrack = moment.duration(b).subtract(a);
                      objTrack.totalTrack = convertTime(objTrack.totalTrack);
                      objTrack.projCost =
                        Number(project.totalCost) -
                        Number($scope.track.trackCost);
                      objTrack.projCost += Number(objTrack.trackCost);
                    }
                    TracksServices.update(objTrack, function (err, result) {
                      if (!err) {
                        //$state.reload();
                        ngDialog.close();
                        $scope.search();
                      } else {
                        $scope.error = err;
                      }
                    });
                  }
                );
              };
            },
            cancel: function () {
              //$scope.search();
              ngDialog.close();
            },
          },
        });
      };
      $scope.editAutoTrack = function (autoTrack) {
        $scope.error = "";
        $scope.autoTrack = angular.copy(autoTrack);

        $scope.autoTrack.startTime = moment($scope.autoTrack.startTime);
        $scope.autoTrack.endTime = moment($scope.autoTrack.endTime);
        $scope.autoTrack.trackDuration = $scope.autoTrack.durations;

        ngDialog.open({
          template: "/app/components/reports/views/report.auto-task.modal.html",
          showClose: true,
          scope: $scope,
          disableAnimation: true,
          data: {
            confirm: function () {
              var objTrack = angular.copy($scope.autoTrack);
              objTrack.startTime = parseTrackTime(objTrack.startTime);
              objTrack.endTime = parseTrackTime(objTrack.endTime);
              TracksServices.update(objTrack, function (err, result) {
                if (!err) {
                  $scope.search();
                  ngDialog.close();
                } else {
                  $scope.error = err;
                }
              });
            },
            cancel: function () {
              ngDialog.close();
            },
          },
        });
      };

      $scope.editTrelloTrack = function (trelloTrack) {
        $scope.error = "";
        $scope.trelloTrack = angular.copy(trelloTrack);
        $scope.trelloTrack.startTime = moment($scope.trelloTrack.startTime);
        $scope.trelloTrack.endTime = moment($scope.trelloTrack.endTime);
        $scope.trelloTrack.trackDuration = $scope.trelloTrack.durations;

        ngDialog.open({
          template:
            "/app/components/reports/views/report.trello-task.modal.html",
          showClose: true,
          scope: $scope,
          disableAnimation: true,
          data: {
            confirm: function () {
              var objTrack = angular.copy($scope.trelloTrack);
              objTrack.startTime = parseTrackTime(objTrack.startTime);
              objTrack.endTime = parseTrackTime(objTrack.endTime);
              TracksServices.update(objTrack, function (err, result) {
                if (!err) {
                  $scope.search();
                  ngDialog.close();
                } else {
                  $scope.error = err;
                }
              });
            },
            cancel: function () {
              ngDialog.close();
            },
          },
        });
      };

      $scope.editJiraTrack = function (jira) {
        $scope.error = "";
        $scope.jiraTrack = angular.copy(jira);
        $scope.jiraTrack.startTime = moment($scope.jiraTrack.startTime);
        $scope.jiraTrack.endTime = moment($scope.jiraTrack.endTime);
        $scope.jiraTrack.trackDuration = $scope.jiraTrack.durations;

        ngDialog.open({
          template: "/app/components/reports/views/report.jira-task.modal.html",
          showClose: true,
          scope: $scope,
          disableAnimation: true,
          data: {
            confirm: function () {
              var objTrack = angular.copy($scope.jiraTrack);
              objTrack.startTime = parseTrackTime(objTrack.startTime);
              objTrack.endTime = parseTrackTime(objTrack.endTime);
              TracksServices.update(objTrack, function (err, result) {
                if (!err) {
                  $scope.search();
                  ngDialog.close();
                } else {
                  $scope.error = err;
                }
              });
            },
            cancel: function () {
              ngDialog.close();
            },
          },
        });
      };

      $scope.updateTrelloTrackDuration = function (trelloTrack) {
        if (
          typeof trelloTrack.startTime === "string" &&
          typeof trelloTrack.endTime === "string"
        ) {
          var startTime = parseTrackTime(trelloTrack.startTime);
          startTime = new Date(startTime).getTime();

          var endTime = parseTrackTime(trelloTrack.endTime);
          endTime = new Date(endTime).getTime();
          trelloTrack.durations = getTotalTimeAuto(
            (endTime - startTime) / 1000
          );
        }
      };

      //Bar Graph User Controller
      function bargraphUsers() {
        var graphUser = [];
        var durationUser = [];
        var nameUser = [];

        for (var i in $scope.tracks) {
          var durations = $scope.tracks[i]["duration"].split(":");
          var hour, min, sec;
          hour = parseFloat(durations[0]);
          min = parseFloat(durations[1] / 60);
          sec = parseFloat(durations[2] / 3600);
          var durationParse = parseFloat(hour + min + sec);
          var newDuration = parseFloat(Number(durationParse).toFixed(2));
          var name = $scope.tracks[i]["userName"];
          if (!graphUser[name] && newDuration > -1) {
            graphUser[name] = newDuration;
          } else if (newDuration > -1) {
            graphUser[name] += newDuration;
          }
        }

        for (var i in graphUser) {
          nameUser.push(i);
          durationUser.push(graphUser[i]);
          $scope.userName.push(i);
          $scope.userDuration.push(graphUser[i]);
        }

        $scope.labelsBarUsers = nameUser;
        $scope.dataBarUsers = durationUser;
        $scope.typeBarUser = "bar";

        // var reloadGraphBarUser = $interval(function(){
        //   $scope.typeBarUser = $scope.typeBarUser === 'bar' ? 'polarArea' : 'bar';
        // }, 15000);
      }

      //Bar Graph Clients Controller
      function bargraphClients() {
        var graphClient = [];
        var nameClient = [];
        var durationClient = [];

        for (var i in $scope.tracks) {
          var durations = $scope.tracks[i]["duration"].split(":");
          var durationParse = parseFloat(durations[0] + "." + durations[1]);
          var hour, min, sec;
          hour = parseFloat(durations[0]);
          min = parseFloat(durations[1] / 60);
          sec = parseFloat(durations[2] / 3600);
          var durationParse = parseFloat(hour + min + sec);
          var newDuration = parseFloat(Number(durationParse).toFixed(2));
          var name = $scope.tracks[i].clientName;
          if (!graphClient[name] && newDuration > 0.0) {
            graphClient[name] = newDuration;
          } else if (newDuration > 0.0) {
            graphClient[name] += newDuration;
          }
        }

        for (var i in graphClient) {
          nameClient.push(i);
          durationClient.push(graphClient[i]);
          $scope.clientName.push(i);
          $scope.clientDuration.push(graphClient[i]);
        }

        $scope.labelsBarClients = nameClient;
        $scope.dataBarClients = durationClient;
        $scope.typeBarClient = "bar";

        // var reloadGraphBarClient = $interval(function(){
        //   $scope.typeBarClient = $scope.typeBarClient === 'bar' ? 'polarArea' : 'bar';
        // }, 15000);
      }

      // Round Graph User Controller
      function roundgraphUser() {
        try {
          var hourSplit = $scope.finalHour[0].split(":");
          var hourParse = parseFloat(hourSplit[0] + "." + hourSplit[0]);
          var newHour = [];
          for (var i = 0; i < $scope.userDuration.length; i++) {
            var duration = $scope.userDuration[i];
            var totalHour = duration;
            var newDuration = parseFloat(Number(totalHour).toFixed(2));
            newHour.push(parseFloat(newDuration));
          }

          $scope.labelsRoundUsers = $scope.userName;
          $scope.dataRoundUsers = newHour;
          $scope.typeUser = "pie";

          // var reloadGraphRoundUser = $interval(function(){
          //   $scope.typeUser = $scope.typeUser === 'pie' ?
          //   'radar' : 'pie';

          // },15000);
        } catch (error) {
        }
      }

      // Round Graph Client Controller
      function roundgraphClient() {
        try {
          var hourSplit = $scope.finalHour[0].split(":");
          var hourParse = parseFloat(hourSplit[0] + "." + hourSplit[0]);
          var newHour = [];
          for (var i = 0; i < $scope.clientDuration.length; i++) {
            var duration = $scope.clientDuration[i];
            var totalHour = duration;
            var newDuration = parseFloat(Number(totalHour).toFixed(2));
            newHour.push(parseFloat(newDuration));
          }

          $scope.labelsRoundClients = $scope.clientName;
          $scope.dataRoundClients = newHour;
          $scope.typeClient = "pie";

          // var reloadGraphRoundClient = $interval(function(){
          //   $scope.typeClient = $scope.typeClient === 'pie' ? 'radar' : 'pie';
          // }, 15000);
        } catch (error) { }
      }

      // EXPORT TO CSV
      $scope.exportToCSV = function () {
        function convertToCSV(objArray) {
          // console.log(objArray)
          var array =
            typeof objArray != "object" ? JSON.parse(objArray) : objArray;
          var str = "";
          var header = Object.keys(array[0]);
          var headerLine = "";

          for (var index = 0; index < header.length; index++) {
            if (index == header.length - 1) {
              headerLine += header[index];
            } else {
              headerLine += header[index] + "|";
            }
          }

          str += headerLine + "\r\n";

          for (var index2 = 0; index2 < array.length; index2++) {
            var line = "";
            for (var index3 in array[index2]) {
              if (line != "") line += "|";
              line += array[index2][index3];
            }
            str += line + "\r\n";
          }

          return str;
        }

        var text = convertToCSV($scope.tracks);
        var csvContent = "data:text/csv;charset=utf-8," + text + "\r\n";

        var encodedUri = encodeURI(csvContent);
        // window.open(encodedUri);
        var link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "Report.csv");
        document.body.appendChild(link);

        link.click(); // This will download the data file named "Report.csv".
      };

      // EXPORT TO EXCEL
      $scope.exportToExcel = function (tableId) {
        var uri = "data:application/vnd.ms-excel;base64,";
        var template =
          '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table class="lexart-table">{table}</table></body></html>';
        var base64 = function (s) {
          return btoa(unescape(encodeURIComponent(s)));
        };
        var format = function (s, c) {
          return s.replace(/{(\w+)}/g, function (m, p) {
            return c[p];
          });
        };
        var tableToExcel = function (tableId, worksheetName) {
          var table = $(tableId);
          var control = { worksheet: worksheetName, table: table.html() };
          var href = uri + base64(format(template, control));
          return href;
        };

        var encodedUri = tableToExcel(tableId, "DataSheet");

        var link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "Report.xlsx");
        document.body.appendChild(link);

        link.click();
      };
    },
  ]);
})(angular);
