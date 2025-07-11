(function (ng) {

    'use strict';

    var Module = ng.module('LexTracking');

    Module.run(function ($rootScope, $state, $window) {

        $rootScope.BASEURL = BASE_URL;
        $rootScope.url = window.location.origin;
        $rootScope.TRACKING_REACT = TRACKING_REACT;

        $rootScope.$on('$stateChangeSuccess', function (evt, toState, toParams, fromState, fromParams) {
            evt.preventDefault();

            var token = $window.localStorage[TOKEN_KEY];
            if ($state.current.name != "login" && !token) {
                $state.go('login');
            }
            else {
                $rootScope.userId = $window.localStorage["userId"];
                $rootScope.userName = $window.localStorage["userName"];
                $rootScope.userEmail = $window.localStorage["userEmail"];
                $rootScope.userRole = $window.localStorage["userRole"];
                $rootScope.isAdmin = $window.localStorage["isAdmin"];
            }

            $rootScope.userProfile = $rootScope.url + "/#/app/user/edit/" + $rootScope.userId;
            console.log('$state', $state);
            if ($state.current.name == "app.userEdit" && $rootScope.userRole == 'developer') {
                if ($state.params.id != $rootScope.userId) {
                    console.log('$state if', $state);
                    window.localStorage.clear();
                    $state.go('login');
                }
            }

        });
    });

    Module.controller('MainCtrl', ['$log', '$window', '$rootScope', '$scope', '$state', '$timeout', 'TracksServices', 'ProjectsServices', 'WeeklyHourServices', 'ngDialog', 'tasks_automaticServices', 'TasksServices', function ($log, $window, $rootScope, $scope, $state, $timeout, TracksServices, ProjectsServices, WeeklyHourServices, ngDialog, tasks_automaticServices, TasksServices) {

        $scope.thisHide = false;
        $scope.userToolsActive = false;
        $rootScope.inprogress = false;

        $rootScope.toggleActive = function () {
            $scope.userToolsActive = !$scope.userToolsActive;
            console.log('$scope.userToolsActive', $scope.userToolsActive);
        };

        $scope.hideItems = function () {
            $scope.thisHide = !$scope.thisHide;
            $rootScope.shohSwitchTooltip = false;
            console.log('$scope.thisHide', $scope.thisHide);
        };

        var clock;
        $rootScope.timerRunning = false;
        $rootScope.currentTrack = {};
        $scope.timeStart = 0;
        $scope.timeEnd = 0;
        $scope.mode = "Start";
        $scope.timer = "00:00:00";
        $scope.currency = "";

        function checkTime(i) {
            i = (i < 1) ? 0 : i;
            if (i < 10) i = "0" + i;  // add zero in front of numbers < 10
            return i;
        }

        $scope.toggleSelectUsers = function (event) {
            console.log("event", event.target.innerText);
            if (event.target.innerText == "-") {
                event.target.innerText = "+";
                document.querySelectorAll('.toggleSelectUsers')[0].style.display = 'none';
            } else if (event.target.innerText == "+") {
                event.target.innerText = "-";
                document.querySelectorAll('.toggleSelectUsers')[0].style.display = 'table-row-group';
            }
        }

        function getCurrentDate() {
            var today = new Date(),
                day = today.getDate(),
                month = today.getMonth() + 1,
                year = today.getFullYear(),
                hours = checkTime(today.getHours()),
                minutes = checkTime(today.getMinutes()),
                seconds = checkTime(today.getSeconds());

            return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
        }

        function updatePageTitle() {
            if ($rootScope.timerRunning && $scope.timer) {
                document.title = 'Tracking: ' + $scope.timer;
            } else {
                document.title = 'Tracking';
            }
        }


        $scope.startTimer = function (initTime) {
            // toggle
            $scope.mode = "Stop";

            // compute for the duration,
            // normalize for the user
            var today = new Date();
            $scope.timeEnd = today.getTime() + initTime;
            var ms = Math.floor(($scope.timeEnd - $scope.timeStart) / 1000);
            var h = checkTime(Math.floor(ms / 3600));
            ms = Math.floor(ms % 3600);
            var m = checkTime(Math.floor(ms / 60));
            ms = Math.floor(ms % 60);
            var s = checkTime(Math.floor(ms));
            // normalize time string
            $scope.timer = h + ":" + m + ":" + s;

            updatePageTitle();

            // timer expired, restart timer
            clock = $timeout(function () {
                $scope.startTimer(initTime);
            }, 500);
        };

        $scope.stopTimer = function () {
            // toggle
            $scope.mode = "Start";
            // stop timeout service
            $timeout.cancel(clock);
            //Clear object
            $rootScope.currentTrack = {};
        };

        $scope.toggleTimer = function (initTime) {
            initTime = initTime || 0;
            if ($scope.mode === 'Start') {
                var today = new Date();
                $scope.timeStart = today.getTime();
                $rootScope.timerRunning = true;
                $scope.startTimer(initTime);
            } else {
                $scope.stopTimer();
            }
        };

        $rootScope.startTrack = function (task, fromDashboard) {
            if (!task) return
            return new Promise(resolve => {
                WeeklyHourServices.find($scope.currentPage, $scope.query, function (err, weeklyHours, countItems) {
                    angular.forEach(weeklyHours, function (value, index) {
                        if (value.idUser == $rootScope.userId) {
                            if (value.currency == null || value.currency == '') {
                                value.currency = '$'
                            }
                            $scope.currency = value.currency

                            return
                        }
                    })
                    if (task.status && task.status.toLowerCase() === 'to-do') {
                        task.status = 'In-Progress';
                        ProjectsServices.saveProjectTask(task, function (err, result) {
                            console.log('Update Status::', err, result);
                        })
                    }
                    console.log("TTT::", task);
                    // Already tracking, stop and then start
                    if ($rootScope.currentTrack.id) {
                        $rootScope.currentTrack.endTime = getCurrentDate();
                        TracksServices.update($rootScope.currentTrack, function (err, result) {
                            if (!err) {
                                $scope.toggleTimer();
                            }
                        });
                    } else {
                        $rootScope.currentTrack = {
                            idUser: $rootScope.userId,
                            idTask: fromDashboard ? task.idTask : task.id,
                            taskName: task.name || task.taskName,
                            projectName: task.projectName,
                            startTime: getCurrentDate(),
                            endTime: undefined,
                            idProyecto: task.idProject || task.projectId,
                            typeTrack: task.typeTrack || task.type,
                            currency: $scope.currency

                        };
                        console.log("🚀  --> $rootScope.currentTrack ", $rootScope.currentTrack)
                        TracksServices.create($rootScope.currentTrack, function (err, result) {
                            if (!err) {
                                result = result[0];
                                $rootScope.currentTrack.id = result.id;
                                $scope.toggleTimer();
                                $rootScope.topBar.filterTask = angular.copy($rootScope.currentTrack);
                                $rootScope.topBar.filterTask.name = $rootScope.topBar.filterTask.taskName;
                                $rootScope.topBar.filterTask.id = $rootScope.topBar.filterTask.idTask;
                                if (!$rootScope.topBar.taskscondition || $rootScope.topBar.taskscondition.lenght == 0) {
                                    $rootScope.topBar.taskscondition = [$rootScope.topBar.filterTask];
                                }
                            }
                        });
                    }
                    resolve()
                })
            })
        };

        $scope.startTrackAuto = function (task_automatic) {
            console.log("ID proyecto automatico", task_automatic);
            // Already tracking, stop and then start
            if (task_automatic.idProyecto && task_automatic.idProyecto != null && task_automatic.idProyecto != 0) {
                if ($rootScope.currentTrack.id) {
                    $rootScope.currentTrack.endTime = getCurrentDate();
                    TracksServices.update($rootScope.currentTrack, function (err, result) {
                        if (!err) {
                            console.log('saved auto task', result);
                            $scope.toggleTimer();
                        }
                    });
                } else {
                    $rootScope.currentTrack = {
                        idProyecto: task_automatic.idProyecto,
                        idUser: $rootScope.userId,
                        idTask: task_automatic.id,
                        taskName: task_automatic.error,
                        startTime: getCurrentDate(),
                        endTime: undefined,
                        typeTrack: "automatic"
                    };

                    TracksServices.createAutoTask($rootScope.currentTrack, function (err, result) {
                        console.log("resultx::", result);
                        if (!err) {
                            console.log('saved auto task', result);
                            $rootScope.currentTrack.id = result.id;
                            $scope.toggleTimer();
                        }
                    });
                }
            } else {
                ngDialog.open({
                    template: '/app/shared/views/alert.modal.html',
                    showClose: true,
                    scope: $scope,
                    disableAnimation: true,
                    data: {
                        msg: "La tarea automatica necesita asociarse a un proyecto.",
                        titleRequired: "Seleccione proyecto.",
                        prj: {
                            getProj: ProjectsServices.find($scope.currentPage, $scope.query, function (err, projects, countItems) {
                                if (!err) {
                                    $scope.getProjects = projects;
                                    $scope.selected = { value: $scope.getProjects };
                                    console.log('Projects select::', $scope.getProjects, $scope.selected);
                                }
                            })
                        },
                        confirm: function () {
                            console.log('ID asociar proyecto', $scope.selected.value.id);
                            var obj = {
                                'id': task_automatic.id,
                                'idProyecto': $scope.selected.value.id,
                                'error': task_automatic.error
                            }
                            console.log(obj);
                            if ($scope.selected.value.id != undefined) {
                                tasks_automaticServices.saveTask_Automatic(obj, function (err, result) {
                                    if (!err) {
                                        console.log("Task automatic actualizada:", result);
                                        $rootScope.currentTrack = {
                                            idUser: $rootScope.userId,
                                            idTask: task_automatic.id,
                                            idProyecto: $scope.selected.value.id,
                                            taskName: obj.error,
                                            startTime: getCurrentDate(),
                                            endTime: undefined,
                                            typeTrack: "automatic"
                                        };

                                        TracksServices.createAutoTask($rootScope.currentTrack, function (err, result) {
                                            console.log("resultx::", err, result);
                                            if (!err) {
                                                console.log('saved auto task', result);
                                                $rootScope.currentTrack.id = result.id;
                                                $scope.toggleTimer();
                                                $state.go('app.tasks_automatic');
                                            }
                                        });
                                    }
                                })
                            }
                        },
                        cancel: function () {
                        }
                    }
                });
            }
        };

        $scope.startTrackTrello = function (tasks_trello) {
            WeeklyHourServices.find($scope.currentPage, $scope.query, function (err, weeklyHours, countItems) {
                if (!err) {
                    angular.forEach(weeklyHours, function (value, index) {
                        if (value.idUser == $rootScope.userId) {
                            if (value.currency == null || value.currency == '') {
                                value.currency = '$'
                            }
                            $scope.currency = value.currency

                            return
                        }
                    })
                    // Already tracking, stop and then start
                    $rootScope.inprogress = true;
                    if ($rootScope.currentTrack.id) {
                        $rootScope.currentTrack.endTime = getCurrentDate();
                        TracksServices.update($rootScope.currentTrack, function (err, result) {
                            if (!err) {
                                $scope.toggleTimer();
                            }
                        });
                    } else {
                        $rootScope.currentTrack = {
                            idTask: tasks_trello.id,
                            idUser: $rootScope.userId,
                            idBoard: tasks_trello.idboard,
                            id_project: tasks_trello.id_project,
                            idProyecto: parseInt(tasks_trello.idProyecto),
                            taskName: tasks_trello.name,
                            startTime: getCurrentDate(),
                            endTime: undefined,
                            typeTrack: "trello",
                            currency: $scope.currency,
                            projectName: tasks_trello.project
                        };

                        console.log("TrelloTrack::", $rootScope.currentTrack);
                        TracksServices.createTrelloTask($rootScope.currentTrack, function (err, result) {
                            if (!err) {
                                $rootScope.currentTrack.id = result[0].id;
                                $scope.toggleTimer();
                                $rootScope.inprogress = false;
                                $rootScope.topBar.filterTask = angular.copy($rootScope.currentTrack);
                                $rootScope.topBar.filterTask.name = $rootScope.topBar.filterTask.taskName;
                                $rootScope.topBar.filterTask.id = $rootScope.topBar.filterTask.idTask;
                                if (!$rootScope.topBar.taskscondition || $rootScope.topBar.taskscondition.lenght == 0) {
                                    $rootScope.topBar.taskscondition = [$rootScope.topBar.filterTask];
                                }
                                console.log(result[0]);
                                //$rootScope.topBar.filterTask.projectName = "test"
                            }
                        });
                    }


                }
            })

        };

        $scope.startJiraTrack = function (jira) {
            if ($rootScope.currentTrack.id) {
                $rootScope.currentTrack.endTime = getCurrentDate();
                TracksServices.update($rootScope.currentTrack, function (err, result) {
                    if (!err) {
                        console.log('saved jira task', result);
                        $scope.toggleTimer();
                    }
                });
            } else {
                console.log(jira);
                $rootScope.currentTrack = {
                    idTask: jira.idTask,
                    idUser: $rootScope.userId,
                    idBoard: jira.idBoard,
                    idProyecto: jira.idProyecto,
                    taskName: jira.name,
                    startTime: getCurrentDate(),
                    endTime: undefined,
                    typeTrack: "jira"
                };

                console.log("jiraTrack::", $rootScope.currentTrack);
                TracksServices.createJiraTask($rootScope.currentTrack, function (err, result) {
                    console.log("result jira::", result);
                    if (!err) {
                        $rootScope.currentTrack.id = result[0].id;
                        $scope.toggleTimer();
                        console.log('saved id jiratask', $rootScope.currentTrack.id);
                    }
                });
            }
        }

        $scope.projectsTracked = [];
        $rootScope.currentTrack.trackCost = {};
        $rootScope.currentTrack.tracked = {};

        //Función formatea el obj Moment

        var convertTime = function (value) {
            var h = moment.duration(value).hours();
            var m = moment.duration(value).minutes();
            var s = moment.duration(value).seconds();

            if (h <= 9) {
                h = '0' + h;
            }
            if (m <= 9) {
                m = '0' + m;
            };
            if (s <= 9) {
                s = '0' + s;
            };
            var finalTracked = h + ":" + m + ":" + s;
            console.log("finaltracked", finalTracked);
            return finalTracked;
        }

        var ConvertTimeToDecimal = function (value) {
            var time = value.split(":");
            var horas = parseFloat(time[0]);
            var minutes = parseFloat(time[1]) / 60;
            var seconds = parseFloat(time[2]) / 3600;
            var fraccionaria = minutes + seconds;
            var decimal = parseFloat(horas + fraccionaria);
            console.log("Tiempo en decimal::", decimal);
            return decimal;
        }

        $scope.stopTrack = function () {
            var ms = 0;
            console.log("stopTrack::", $rootScope.currentTrack, $rootScope.currentTrack.id);

            if ($rootScope.currentTrack && $rootScope.currentTrack.id) {
                $rootScope.currentTrack.endTime = getCurrentDate();
                var start = moment(new Date($rootScope.currentTrack.startTime));
                var end = moment(new Date($rootScope.currentTrack.endTime));
                var tracked = moment.duration(end.diff(start));
                $rootScope.currentTrack.duracion = convertTime(tracked);
                var decimalTime = ConvertTimeToDecimal(convertTime(tracked));
                // ms = tracked._milliseconds;
                getTotalCost(decimalTime);
                // console.log("currentTrack duracion::", $rootScope.currentTrack);

                function getTotalCost(decimalTime) {
                    var idHourCost = $rootScope.userId;
                    console.log(idHourCost);
                    WeeklyHourServices.find($scope.currentPage, $scope.query, function (err, weeklyHours, countItems) {
                        if (!err) {
                            console.log(weeklyHours);
                            if (weeklyHours.length > 0) {
                                var exist = false;
                                angular.forEach(weeklyHours, function (value, key) {
                                    if (value.idUser == $rootScope.userId) {
                                        exist = true;
                                        console.log(value.costHour, 'costo hora idUser');
                                        var costo = parseInt(value.costHour);
                                        console.log('costo', costo);
                                        if (value.currency == null || value.currency == '') {
                                            value.currency = '$'
                                        }
                                        $rootScope.currentTrack.currency = value.currency;

                                        console.log(value.currency)
                                        // console.log(ms,'ms');
                                        // var result = (ms/3600/1000) * costo;
                                        var result = decimalTime * costo;
                                        console.log('total cost', result);
                                        //result = Math.ceil(result);
                                        //console.log(result);
                                        getCost(result);
                                        console.log($rootScope.currentTrack)
                                    }
                                });
                                console.log(weeklyHours);
                                if (exist === false) {
                                    TracksServices.update($rootScope.currentTrack, function (err, result) {
                                        console.log($rootScope.currentTrack)
                                        console.log("Track actualizado con exito 1");
                                        $rootScope.timerRunning = false;
                                        $scope.stopTimer();
                                    });
                                }
                            } else {
                                TracksServices.update($rootScope.currentTrack, function (err, result) {
                                    console.log("Track actualizado con exito 2");
                                    console.log($rootScope.currentTrack)
                                    $rootScope.timerRunning = false;
                                    $scope.stopTimer();
                                });
                            }
                        }
                    });
                }
                var getCost = function (value) {
                    $rootScope.currentTrack.trackCost = JSON.stringify(value);
                    if ($rootScope.currentTrack.idProyecto) {
                        ProjectsServices.findById($rootScope.currentTrack.idProyecto, function (err, result) {
                            var proj = result;
                            tracked = moment.duration(proj.tracked);
                            var newTrack = moment.duration($rootScope.currentTrack.duracion);
                            var projUpd = moment.duration(newTrack).add(tracked);
                            $rootScope.currentTrack.totalTrack = convertTime(projUpd);
                            $rootScope.currentTrack.projCost = Number(proj.totalCost) + Number($rootScope.currentTrack.trackCost);
                            console.log("PROJECT BY ID", proj.totalCost, $rootScope.currentTrack.trackCost);
                            TracksServices.update($rootScope.currentTrack, function (err, result) {
                                console.log("Track actualizado con exito 3");
                                $rootScope.timerRunning = false;
                                console.log($rootScope.currentTrack)

                                $scope.stopTimer();
                            });
                        })
                    } else {
                        TracksServices.update($rootScope.currentTrack, function (err, result) {
                            console.log("Track actualizado con exito 4");
                            $rootScope.timerRunning = false;
                            console.log($rootScope.currentTrack)
                            $scope.stopTimer();
                        });
                    }
                }
            }
        };

        // Check for defined session values
        if (!$window.localStorage[TOKEN_KEY]) {
            $log.error('You are not logged in');
            $state.go('login');
        } else {
            $rootScope.showTrackTooltip = true;
            $rootScope.showManualTrackTooltip = false;
            $log.info('Welcome back', $window.localStorage["userName"]);
            $rootScope.userId = $window.localStorage["userId"];
            $rootScope.userName = $window.localStorage["userName"];
            $rootScope.userEmail = $window.localStorage["userEmail"];
            $rootScope.userRole = $window.localStorage["userRole"];
            $rootScope.isAdmin = $window.localStorage["isAdmin"];
            $rootScope.isClient = $window.localStorage["isClient"];
            if ($rootScope.isClient == 'true') {
                $rootScope.userIdClient = $window.localStorage["idUserClient"];
            }
            TracksServices.getCurrentUserLastTrack($rootScope.userId, function (err, track) {
                if (!err) {
                    if (track) {
                        console.log('track', track);
                        if (!track.endTime || track.endTime == '0000-00-00 00:00:00') {

                            //Update current track
                            $rootScope.currentTrack = track;
                            $rootScope.topBar.filterTask = angular.copy($rootScope.currentTrack);
                            var now = new Date().getTime(); //Fecha actual millisegundos
                            var start = new Date(track.startTime).getTime(); //Fecha de track en millisegundos
                            var ms = now - start;
                            $scope.toggleTimer(ms); //Iniciamos el clock con el tiempo corrido
                        }
                    }
                }
            });
        }


        $rootScope.topBar = {};
        $rootScope.topBar.filterTask = '';
        $rootScope.topBar.filterTasks = [];
        $rootScope.topBar.tasks = []

        $rootScope.searchTasks = function (text) {

            console.log("🚀  --> topBar.filterTask", $rootScope.topBar.filterTask)

            if (text) {
                $rootScope.topBar.filterTasks = { filter: [{ "name": text }], limit: 100, offset: 0 };
                console.log("🚀  --> TEXT", $rootScope.topBar.filterTasks)
                TasksServices.findByFilter($rootScope.topBar.filterTasks, function (err, tasks, countItems) {
                    if (!err) {
                        console.log('TEXT dsadsa tasks', tasks, countItems);
                        $rootScope.topBar.tasks = tasks;
                        console.log("🚀  --> TEXT $scope.topBar.tasks", $rootScope.topBar.tasks)
                        // $scope.tasks = tasks.slice(0, PAGE_SIZE - 1);
                        // $scope.total = countItems;
                    }
                });
            }


        };


    }]);

}(angular));
