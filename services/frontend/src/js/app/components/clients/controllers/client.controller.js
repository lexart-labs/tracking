(function (ng) {

    'use strict';

    var Module = ng.module('LexTracking');

    /**
     * Controller for the Client detail/form view.
     * Manages the iframe loading for the React-based client creation/editing form.
     */
    Module.controller('ClientCtrl', ['$scope', '$state', '$stateParams', '$filter', 'ClientServices', 'ngDialog', '$rootScope', '$sce', function ($scope, $state, $stateParams, $filter, ClientServices, ngDialog, $rootScope, $sce) {

        $scope.client = {};
        $scope.visits = [];
        $scope.sendingData = false;
        var idClient = $stateParams.id || 'NEW';

        $scope.env_react_url = $sce.trustAsResourceUrl($rootScope.trackingReactUrl + '/#/client/' + idClient);

        if ($rootScope.showIframe) return false;


        if (idClient) {
            ClientServices.findById(idClient, function (err, client) {
                if (!err) {
                    console.log('client:', client);
                    $scope.client = client;
                }
            });
        }

        $scope.save = function () {
            $scope.error = '';
            console.log('client to save', $scope.client);

            $scope.sendingData = true;
            if (!$scope.client.company || !$scope.client.name) {
                $rootScope.showToaster('Please fill all fields', 'error');
                $scope.sendingData = false;
                return;
            }

            ClientServices.save($scope.client, function (err, result) {
                if (err) {
                    console.log("error", err);
                    $rootScope.showToaster(err.message || err.error.message || err.error || err, 'error');
                    $scope.sendingData = false;
                } else {
                    $state.go('app.clients');
                }
            });
        }

    }]);

}(angular));
