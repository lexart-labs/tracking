(function (ng) {

    'use strict';

    var Module = ng.module('LexTracking');

    Module.run(function ($rootScope, $state, $window) {

        $rootScope.BASEURL = BASE_URL;
        $rootScope.url = window.location.origin;

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
            if ($state.current.name == "app.userEdit" && $rootScope.userRole == 'developer') {
                if ($state.params.id != $rootScope.userId) {
                    window.localStorage.clear();
                    $state.go('login');
                }
            }

        });
    });

    Module.controller('MainCtrl', ['$log', '$window', '$rootScope', '$scope', '$state', '$timeout', 'TracksServices', 'ProjectsServices', 'WeeklyHourServices', 'ngDialog', 'tasks_automaticServices', 'TasksServices', '$filter', function ($log, $window, $rootScope, $scope, $state, $timeout, TracksServices, ProjectsServices, WeeklyHourServices, ngDialog, tasks_automaticServices, TasksServices, $filter) {

        $scope.thisHide = false;
        $scope.userToolsActive = false;
        $rootScope.inprogress = false;
        $rootScope.sidebarItems = [];

        $rootScope.toggleActive = function () {
            $scope.userToolsActive = !$scope.userToolsActive;
        };

        $scope.hideItems = function () {
            $scope.thisHide = !$scope.thisHide;
            $rootScope.shohSwitchTooltip = false;
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
                            idProyecto: task.idProject || task.projectId || task.idProyecto,
                            typeTrack: task.typeTrack || task.type,
                            currency: $scope.currency

                        };
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
            // Already tracking, stop and then start
            if (task_automatic.idProyecto && task_automatic.idProyecto != null && task_automatic.idProyecto != 0) {
                if ($rootScope.currentTrack.id) {
                    $rootScope.currentTrack.endTime = getCurrentDate();
                    TracksServices.update($rootScope.currentTrack, function (err, result) {
                        if (!err) {
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
                        if (!err) {
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
                                }
                            })
                        },
                        confirm: function () {
                            var obj = {
                                'id': task_automatic.id,
                                'idProyecto': $scope.selected.value.id,
                                'error': task_automatic.error
                            }
                            if ($scope.selected.value.id != undefined) {
                                tasks_automaticServices.saveTask_Automatic(obj, function (err, result) {
                                    if (!err) {
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
                                            if (!err) {
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
                        $scope.toggleTimer();
                    }
                });
            } else {
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

                TracksServices.createJiraTask($rootScope.currentTrack, function (err, result) {
                    if (!err) {
                        $rootScope.currentTrack.id = result[0].id;
                        $scope.toggleTimer();
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
            return finalTracked;
        }

        var ConvertTimeToDecimal = function (value) {
            var time = value.split(":");
            var horas = parseFloat(time[0]);
            var minutes = parseFloat(time[1]) / 60;
            var seconds = parseFloat(time[2]) / 3600;
            var fraccionaria = minutes + seconds;
            var decimal = parseFloat(horas + fraccionaria);
            return decimal;
        }

        $scope.stopTrack = function () {
            var ms = 0;

            if ($rootScope.currentTrack && $rootScope.currentTrack.id) {
                $rootScope.currentTrack.endTime = getCurrentDate();
                var start = moment(new Date($rootScope.currentTrack.startTime));
                var end = moment(new Date($rootScope.currentTrack.endTime));
                var tracked = moment.duration(end.diff(start));
                $rootScope.currentTrack.duracion = convertTime(tracked);
                var decimalTime = ConvertTimeToDecimal(convertTime(tracked));
                // ms = tracked._milliseconds;
                getTotalCost(decimalTime);

                function getTotalCost(decimalTime) {
                    var idHourCost = $rootScope.userId;
                    WeeklyHourServices.find($scope.currentPage, $scope.query, function (err, weeklyHours, countItems) {
                        if (!err) {
                            if (weeklyHours.length > 0) {
                                var exist = false;
                                angular.forEach(weeklyHours, function (value, key) {
                                    if (value.idUser == $rootScope.userId) {
                                        exist = true;
                                        var costo = parseInt(value.costHour);
                                        if (value.currency == null || value.currency == '') {
                                            value.currency = '$'
                                        }
                                        $rootScope.currentTrack.currency = value.currency;
                                        var result = decimalTime * costo;
                                        getCost(result);
                                    }
                                });
                                if (exist === false) {
                                    TracksServices.update($rootScope.currentTrack, function (err, result) {
                                        $rootScope.timerRunning = false;
                                        $scope.stopTimer();
                                    });
                                }
                            } else {
                                TracksServices.update($rootScope.currentTrack, function (err, result) {
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
                            TracksServices.update($rootScope.currentTrack, function (err, result) {
                                $rootScope.timerRunning = false;
                                $scope.stopTimer();
                            });
                        })
                    } else {
                        TracksServices.update($rootScope.currentTrack, function (err, result) {
                            $rootScope.timerRunning = false;
                            $scope.stopTimer();
                        });
                    }
                }
            }
        };

        $rootScope.generateSidebarContent = function () {
            $rootScope.sidebarItems = [
                {
                    uisref: 'app.dashboard',
                    icon: 'ri-home-line',
                    name: 'Dashboard',
                    label: $filter('translate')('navigation.dashboard'),
                    access: true
                },
                {
                    uisref: 'app.paymentRequestsAdmin',
                    icon: 'ri-bank-line',
                    name: 'PaymentRequests',
                    label: $filter('translate')('navigation.payment_requests'),
                    access: $rootScope.userRole == 'admin' || $rootScope.userRole == 'pm'
                },
                {
                    uisref: 'app.users',
                    icon: 'ri-user-line',
                    name: 'Users',
                    label: $filter('translate')('navigation.users'),
                    access: $rootScope.userRole == 'admin' || $rootScope.userRole == 'pm'
                },
                {
                    uisref: 'app.clients',
                    icon: 'ri-user-shared-line',
                    name: 'Clients',
                    label: $filter('translate')('navigation.clients'),
                    access: $rootScope.userRole == 'admin' || $rootScope.userRole == 'pm'
                },
                {
                    uisref: 'app.projects',
                    icon: 'ri-briefcase-line',
                    name: 'Projects',
                    label: $filter('translate')('navigation.projects'),
                    access: true
                },

                {
                    uisref: 'app.calendar',
                    icon: 'ri-calendar-line',
                    name: 'Calendar',
                    label: $filter('translate')('navigation.calendar'),
                    access: true
                },

                {
                    uisref: '',
                    icon: 'ri-task-line',
                    name: 'Tasks',
                    label: $filter('translate')('navigation.tasks'),
                    access: true,
                    submenus: [
                        {
                            uisref: 'app.tasks',
                            name: 'Tasks Manuales',
                            label: 'Tareas Manuales',
                            access: true
                        },
                        // {
                        //     uisref: 'app.tasks_automatic',
                        //     name: 'Tasks Automatic',
                        //     label: $filter('translate')('navigation.tasks_automatic'),
                        //     access: true
                        // },
                        {
                            uisref: 'app.tasks_trello',
                            name: 'Tasks Trello',
                            label: $filter('translate')('navigation.tasks_trello'),
                            access: true
                        },
                        // {
                        //     uisref: 'app.jira',
                        //     name: 'Tasks Jira',
                        //     label: $filter('translate')('navigation.jira'),
                        //     access: true
                        // },
                        // {
                        //     uisref: 'app.taskManager',
                        //     name: 'Task Manager',
                        //     label: $filter('translate')('navigation.taskManager'),
                        //     access: true
                        // }
                    ]
                },
                // PROFILE
                {
                    uisref: `app.userEdit({id:${$rootScope.userId}})`,
                    icon: 'ri-user-settings-line',
                    name: 'Profile',
                    label: $filter('translate')('navigation.my-profile'),
                    access: $rootScope.userRole == 'developer'
                },
                
                
                
                {
                    uisref: 'app.reports',
                    icon: 'ri-bar-chart-line',
                    name: 'Reports',
                    label: 'Reportes',
                    access: true
                },
                {
                    uisref: 'app.weeklyHours',
                    icon: 'ri-calendar-2-line',
                    name: 'weeklyHour',
                    label: $filter('translate')('navigation.weeklyHour'),
                    access: $rootScope.userRole == 'admin'
                },
                // {
                //     uisref: '',
                //     icon: 'ri-folder-open-line',
                //     name: 'CRM',
                //     label: 'CRM',
                //     access: $rootScope.userRole == 'admin',
                //     submenus: [
                //         {
                //             uisref: 'app.banks',
                //             name: 'Bank',
                //             label: $filter('translate')('navigation.bank'),
                //             access: true
                //         },
                //         {
                //             uisref: 'app.finances',
                //             name: 'Finances',
                //             label: $filter('translate')('navigation.finance'),
                //             access: true
                //         },
                //         {
                //             uisref: 'app.sales',
                //             name: 'Sales',
                //             label: $filter('translate')('navigation.sale'),
                //             access: true
                //         },
                //         {
                //             uisref: 'app.weeklyHours',
                //             name: 'weeklyHour',
                //             label: $filter('translate')('navigation.weeklyHour'),
                //             access: true
                //         },
                //         {
                //             uisref: 'app.reports',
                //             name: 'Reportes',
                //             label: 'Reportes',
                //             access: true
                //         },
                //         {
                //             uisref: 'app.evaluate',
                //             name: 'Evaluaciones',
                //             label: 'Evaluaciones',
                //             access: true
                //         }

                //     ]
                // },

            ]
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
            $rootScope.generateSidebarContent();
            TracksServices.getCurrentUserLastTrack($rootScope.userId, function (err, track) {
                if (!err) {
                    if (track) {
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
            if (text) {
                $rootScope.topBar.filterTasks = { filter: [{ "name": text }], limit: 100, offset: 0 };
                TasksServices.findByFilter($rootScope.topBar.filterTasks, function (err, tasks, countItems) {
                    if (!err) $rootScope.topBar.tasks = tasks;
                });
            }
        };


    }]);

}(angular));
