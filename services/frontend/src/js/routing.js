(function(ng) {

    'use strict';

    // Webapp module
    var app = ng.module('LexTracking');

    app.run(['$rootScope', '$state', '$stateParams',
        function($rootScope, $state, $stateParams) {
            $rootScope.$state = $state;
            $rootScope.$stateParams = $stateParams;
            $rootScope.pageSize = PAGE_SIZE;
        }
    ]);
    app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider) {

        $locationProvider.html5Mode(false);

        if (window.localStorage[TOKEN_KEY]) {
            $urlRouterProvider.otherwise("/app/dashboard");
        } else {
            $urlRouterProvider.otherwise("/login");
        }

        $stateProvider.state("Default", {});

        $stateProvider
            .state('app', {
                abstract: true,
                url: '/app',
                templateUrl: 'app/shared/views/app.html',
                controller: 'MainCtrl'
            })

             // DASHBOARD
            .state('app.dashboard', {
                url: '/dashboard',
                templateUrl: 'app/components/dashboard/views/indexView.html',
                controller: 'DashboardCtrl'
            })

            .state('app.paymentRequestsAdmin', {
                url: '/admin/payment-requests',
                templateUrl: 'app/components/paymentRequestsAdmin/views/adminPaymentRequestsView.html',
                controller: 'PaymentRequestsAdminCtrl'
            })

            // LOGIN
            .state('login', {
                url: '/login',
                templateUrl: 'app/components/session/views/indexView.html',
                controller: 'AuthCtrl'
            })

            // USERS
            .state('app.users', {
                url: '/users',
                templateUrl: 'app/components/users/views/usersView.html',
                controller: 'UsersCtrl'
            })
            .state('app.userNew', {
                url: '/user/new',
                templateUrl: 'app/components/users/views/userFormView.html',
                controller: 'UserCtrl'
            })
            .state('app.userEdit', {
                url: '/user/edit/:id',
                templateUrl: 'app/components/users/views/userFormView.html',
                controller: 'UserCtrl'
            })

            // CLIENTS
            .state('app.clients', {
                url: '/clients',
                templateUrl: 'app/components/clients/views/clientsView.html',
                controller: 'ClientsCtrl'
            })
            .state('app.clientNew', {
                url: '/client/new',
                templateUrl: 'app/components/clients/views/clientFormView.html',
                controller: 'ClientCtrl'
            })
            .state('app.clientEdit', {
                url: '/client/edit/:id',
                templateUrl: 'app/components/clients/views/clientFormView.html',
                controller: 'ClientCtrl'
            })

            // PROJECTS
            .state('app.projects', {
                url: '/projects',
                templateUrl: 'app/components/projects/views/projectsView.html',
                controller: 'ProjectsCtrl'
            })
            .state('app.projectNew', {
                url: '/project/new',
                templateUrl: 'app/components/projects/views/projectFormView.html',
                controller: 'ProjectCtrl'
            })
            .state('app.projectEdit', {
                url: '/project/edit/:id',
                templateUrl: 'app/components/projects/views/projectFormView.html',
                controller: 'ProjectCtrl'
            })

            // TASKS
            .state('app.tasks', {
                url: '/tasks',
                templateUrl: 'app/components/tasks/tasks/views/tasksView.html',
                controller: 'TasksCtrl',
                resolve: {
                PreviousState: ["$state", function ($state) {
                    var currentStateData = {
                        Name: $state.current.name,
                        Params: $state.params,
                        URL: $state.href($state.current.name, $state.params)
                    };
                    return currentStateData;
                }]
                }
            })
            .state('app.tasks-user', {
                url: '/tasks/user/:id',
                templateUrl: 'app/components/tasks/tasks/views/tasksView.html',
                controller: 'TasksCtrl',
                resolve: {
                PreviousState: ["$state", function ($state) {
                    var currentStateData = {
                        Name: $state.current.name,
                        Params: $state.params,
                        URL: $state.href($state.current.name, $state.params)
                    };
                    return currentStateData;
                }]
                }
            })
            .state('app.taskNew', {
                url: '/task/new',
                templateUrl: 'app/components/tasks/tasks/views/taskFormView.html',
                controller: 'TaskCtrl'
            })
            .state('app.taskEdit', {
                url: '/task/:id',
                templateUrl: 'app/components/tasks/tasks/views/taskFormView.html',
                controller: 'TaskCtrl'
            })

            .state('app.taskForm', {
                url: '/task/edit/:id',
                templateUrl: 'app/components/tasks/tasks/views/taskEditFormView.html',
                controller: "TaskFormCtrl",
                resolve: {
                PreviousState: ["$state", function ($state) {
                    var currentStateData = {
                        Name: $state.current.name,
                        Params: $state.params,
                        URL: $state.href($state.current.name, $state.params)
                    };
                    return currentStateData;
                }]
                }
            })

            .state('app.reports', {
                url: '/reports',
                templateUrl: 'app/components/reports/views/reportsView.html',
                controller: 'ReportsCtrl'
            })


            .state('app.hour', {
                url: '/reports',
                templateUrl: 'app/components/reports/views/reportsView.html',
                controller: 'ReportsCtrl'
            })

            .state('app.finance', {
                url: '/reports',
                templateUrl: 'app/components/reports/views/reportsView.html',
                controller: 'ReportsCtrl'
            })

            .state('app.budgets', {
                url: '/budget',
                templateUrl: 'app/components/budgets/views/budgetsView.html',
                controller: 'BudgetsCtrl'
            })

            .state('app.budgetNew', {
                url: '/budget/new',
                templateUrl: 'app/components/budgets/views/budgetFormView.html',
                controller: 'BudgetCtrl'
            })
            .state('app.budgetEdit', {
                url: '/budget/edit/:id',
                templateUrl: 'app/components/budgets/views/budgetFormView.html',
                controller: 'BudgetCtrl'
            })

            .state('app.hoursCost', {
                url: '/hour-cost',
                templateUrl: 'app/components/hours-cost/views/hoursCostView.html',
                controller: 'HoursCostCtrl'
            })

            .state('app.hourCostNew', {
                url: '/hour-cost/new',
                templateUrl: 'app/components/hours-cost/views/hourCostFormView.html',
                controller: 'HourCostCtrl'
            })
            .state('app.hourCostEdit', {
                url: '/hour-cost/edit/:id',
                templateUrl: 'app/components/hours-cost/views/hourCostFormView.html',
                controller: 'HourCostCtrl'
            })

            .state('app.finances', {
                url: '/finance',
                templateUrl: 'app/components/finances/views/financesView.html',
                controller: 'FinancesCtrl'
            })

            .state('app.financeNew', {
                url: '/finance/new',
                templateUrl: 'app/components/finances/views/financeFormView.html',
                controller: 'FinanceCtrl'
            })
            .state('app.financeEdit', {
                url: '/finance/edit/:id',
                templateUrl: 'app/components/finances/views/financeFormView.html',
                controller: 'FinanceCtrl'
            })
            .state('app.tasks_automatic', {
                url: '/tasks_automatic',
                templateUrl: 'app/components/tasks/task_automatic/views/tasks_automaticView.html',
                controller: 'tasks_automaticCtrl'
            })
            .state('app.task_automaticEdit', {
                url: '/tasks_automatic/edit/:id',
                templateUrl: 'app/components/tasks/task_automatic/views/task_automaticFormView.html',
                controller: 'task_automaticCtrl'
            })



            .state('app.sales', {
                url: '/sale',
                templateUrl: 'app/components/sales/views/salesView.html',
                controller: 'SalesCtrl'
            })

            .state('app.saleNew', {
                url: '/sale/new',
                templateUrl: 'app/components/sales/views/saleFormView.html',
                controller: 'SaleCtrl'
            })
            .state('app.saleEdit', {
                url: '/sale/edit/:id',
                templateUrl: 'app/components/sales/views/saleFormView.html',
                controller: 'SaleCtrl'
            })


            .state('app.banks', {
                url: '/banks',
                templateUrl: 'app/components/banks/views/banksView.html',
                controller: 'BanksCtrl'
            })

            .state('app.bankNew', {
                url: '/bank/new',
                templateUrl: 'app/components/banks/views/bankFormView.html',
                controller: 'BankCtrl'
            })
            .state('app.bankEdit', {
                url: '/bank/edit/:id',
                templateUrl: 'app/components/banks/views/bankFormView.html',
                controller: 'BankCtrl'
            })






            .state('app.bills', {
                url: '/bills',
                templateUrl: 'app/components/bills/views/billsView.html',
                controller: 'BillsCtrl'
            })

            .state('app.billNew', {
                url: '/bill/new',
                templateUrl: 'app/components/bills/views/billFormView.html',
                controller: 'BillCtrl'
            })
            .state('app.billEdit', {
                url: '/bill/edit/:id',
                templateUrl: 'app/components/bills/views/billFormView.html',
                controller: 'BillCtrl'
            })

            .state('app.weeklyHours', {
                url: '/weeklyHour',
                templateUrl: 'app/components/weeklyHours/views/weeklyHoursView.html',
                controller: 'WeeklyHoursCtrl'
            })

            .state('app.weeklyHourNew', {
                url: '/weeklyHour/new',
                templateUrl: 'app/components/weeklyHours/views/weeklyHourFormView.html',
                controller: 'WeeklyHourCtrl'
            })
            .state('app.weeklyHourEdit', {
                url: '/weeklyHour/edit/:id',
                templateUrl: 'app/components/weeklyHours/views/weeklyHourFormView.html',
                controller: 'WeeklyHourCtrl'
            })

            //EVALUATE
            .state('app.evaluate', {
                url: '/evaluate',
                templateUrl: 'app/components/evaluate/views/evaluateView.html',
                controller: 'EvalCtrl'
            })
            .state('app.evaluateForm', {
                url: '/evaluate/user/:id',
                templateUrl: 'app/components/evaluate/views/evaluateFormView.html',
                controller: 'EvalFormCtrl'
            })

            // APPS BOTS
            .state('app.bots', {
                url: '/bots',
                templateUrl: 'app/components/Apps/catalogs/bots/views/botsView.html',
                controller: 'BotsCtrl'
            })
            .state('app.botNew', {
                url: '/bot/new',
                templateUrl: 'app/components/Apps/catalogs/bots/views/botFormView.html',
                controller: 'BotCtrl'
            })
            .state('app.botEdit', {
                url: '/bot/edit/:id',
                templateUrl: 'app/components/Apps/catalogs/bots/views/botFormView.html',
                controller: 'BotCtrl'
            })
            // APPS Min-SOFTWARE
            .state('app.minsoftwares', {
                url: '/minsoftwares',
                templateUrl: 'app/components/Apps/catalogs/minSoftware/views/minSoftwaresView.html',
                controller: 'MinSoftwaresCtrl'
            })
            .state('app.minsoftwareNew', {
                url: '/minsoftware/new',
                templateUrl: 'app/components/Apps/catalogs/minSoftware/views/minSoftwareFormView.html',
                controller: 'MinSoftwareCtrl'
            })
            .state('app.minsoftwareEdit', {
                url: '/minsoftware/edit/:id',
                templateUrl: 'app/components/Apps/catalogs/minSoftware/views/minSoftwareFormView.html',
                controller: 'MinSoftwareCtrl'
            })
            // APPS SMARTHOUSES
            .state('app.smarthouses', {
                url: '/smarthouses',
                templateUrl: 'app/components/Apps/catalogs/smartHouses/views/smartHousesView.html',
                controller: 'SmartHousesCtrl'
            })
            .state('app.smarthouseNew', {
                url: '/smarthouses/new',
                templateUrl: 'app/components/Apps/catalogs/smartHouses/views/smartHouseFormView.html',
                controller: 'SmartHouseCtrl'
            })
            .state('app.smarthouseEdit', {
                url: '/smarthouses/edit/:id',
                templateUrl: 'app/components/Apps/catalogs/smartHouses/views/smartHouseFormView.html',
                controller: 'SmartHouseCtrl'
            })
            // APPS MAILSENDER
            .state('app.mailSenders', {
                url: '/mailsenders',
                templateUrl: 'app/components/Apps/catalogs/mailSender/views/mailSendersView.html',
                controller: 'MailSendersCtrl'
            })
            .state('app.mailSenderNew', {
                url: '/mailsenders/new',
                templateUrl: 'app/components/Apps/catalogs/mailSender/views/mailSenderFormView.html',
                controller: 'MailSenderCtrl'
            })
            .state('app.mailSenderEdit', {
                url: '/mailsenders/edit/:id',
                templateUrl: 'app/components/Apps/catalogs/mailSender/views/mailSenderFormView.html',
                controller: 'MailSenderCtrl'
            })
            //APP HOSTING
            .state('app.hosting', {
                url: '/hosting',
                templateUrl: 'app/components/Apps/catalogs/hosting/views/hostingsView.html',
                controller: 'HostingsCtrl'
            })
            .state('app.hostingNew', {
                url: '/hosting/new',
                templateUrl: 'app/components/Apps/catalogs/hosting/views/hostingFormView.html',
                controller: 'HostingCtrl'
            })
            .state('app.hostingEdit', {
                url: '/hosting/edit/:id',
                templateUrl: 'app/components/Apps/catalogs/hosting/views/hostingFormView.html',
                controller: 'HostingCtrl'
            })


            .state('app.products', {
                url: '/products',
                templateUrl: 'app/components/Apps/catalogs/products/views/productsView.html',
                controller: 'ProductsCtrl'
            })

            .state('app.productNew', {
                url: '/product/new',
                templateUrl: 'app/components/Apps/catalogs/products/views/productFormView.html',
                controller: 'ProductCtrl'
            })
            .state('app.productEdit', {
                url: '/product/edit/:id',
                templateUrl: 'app/components/Apps/catalogs/products/views/productFormView.html',
                controller: 'ProductCtrl'
            })
            .state('app.taskManager', {
                url: '/taskManager',
                templateUrl: 'app/components/tasks/taskManager/views/taskManagerView.html',
                controller: 'taskManagerCtrl'
            })

            .state('app.taskManagerEdit', {
                url: '/taskManager/:id',
                templateUrl: 'app/components/taskManager/views/taskManagerEditView.html',
                controller: 'taskManagerEditCtrl'
            })

            .state('app.tasks_trello', {
                url: '/taskTrello',
                templateUrl: 'app/components/tasks/taskTrello/views/taskTrelloView.html',
                controller: 'tasks_trelloCtrl'
            })
            .state('app.tasks_trelloEdit', {
                url: '/taskTrello/edit/:id',
                templateUrl: 'app/components/tasks/taskTrello/views/taskTrelloFormView.html',
                controller: 'task_trelloCtrl'
            })

            //JIRA
            .state('app.jira', {
                url: '/jira',
                templateUrl: 'app/components/tasks/jira/views/jiraView.html',
                controller: 'JiraCtrl'
            })
            .state('app.jiraTasks', {
                url: '/jira-tasks/:id',
                templateUrl: 'app/components/tasks/jira/views/jiraTaskView.html',
                controller: 'JiraTaskCtrl'
            })
            .state('app.jiraTaskForm', {
                url: '/jira-task/:id',
                templateUrl: 'app/components/tasks/jira/views/jiraTaskFormView.html',
                controller: 'JiraTaskFormCtrl'
            })
            .state('app.jiraTaskNew', {
                url: '/jira-new-task/:idboard',
                templateUrl: 'app/components/tasks/jira/views/jiraTaskFormView.html',
                controller: 'JiraTaskFormCtrl'
            })

            .state('app.calendar', {
                url: '/calendar',
                templateUrl: 'app/components/calendar/views/calendarView.html',
                controller: 'CalendarCtrl'
            })
    }]);


}(angular));
