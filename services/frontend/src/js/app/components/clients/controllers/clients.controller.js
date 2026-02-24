(function (ng) {

    'use strict';

    var Module = ng.module('LexTracking');

    /**
     * Controller for the Clients list view.
     * Manages the iframe loading for the React-based client list.
     */
    Module.controller('ClientsCtrl', ['$scope', '$timeout', 'ClientServices', 'ngDialog', '$sce', '$rootScope', function ($scope, $timeout, ClientServices, ngDialog, $sce, $rootScope) {

        $scope.clients = [];
        $scope.filter = {};
        $scope.query = "";
        $scope.currentPage = 0;

        $scope.env_react_url = $sce.trustAsResourceUrl($rootScope.trackingReactUrl + '/#/clients');

        // var timeout;
        // $scope.$watch('filter', function() {
        //     $timeout.cancel(timeout);
        //     timeout = $timeout(function() {
        //         search();
        //     }, 250);
        // }, true);

        // function search() {

        //     $scope.query = "";

        //     if ($scope.filter.id)
        //         $scope.query += "&where[id]=" + $scope.filter.id;

        //     if ($scope.filter.name)
        //         $scope.query += "&where[name][$like]=%" + $scope.filter.name + "%";

        //     if ($scope.filter.address)
        //         $scope.query += "&where[address][$like]=%" + $scope.filter.address + "%";

        //     if ($scope.filter.city)
        //         $scope.query += "&where[city][$like]=%" + $scope.filter.city + "%";

        //     if ($scope.filter.user)
        //         $scope.query += "&where[user][$like]=%" + $scope.filter.user + "%";

        //     $scope.currentPage = 0;
        //     console.log("query: " + $scope.query);
        //     ClientServices.find($scope.currentPage, $scope.query, function(err, clients, countItems) {
        //         if (!err) {
        //             console.log('clients', clients, countItems);
        //             $scope.clients  = clients;
        //             $scope.total    = countItems;
        //         }
        //     });
        // }

        ClientServices.find($scope.currentPage, $scope.query, function (err, clients, countItems) {
            if (!err) {
                console.log('clients', clients, countItems);
                $scope.clients = clients;
                $scope.total = countItems;
            }
        });

        $scope.pager = function (page) {
            var offset = PAGE_SIZE * (page - 1);
            ClientServices.find(offset, $scope.query, function (err, clients, countItems) {
                console.log('clients', clients);
                $scope.clients = clients;
            });
        };

    }]);

}(angular));
