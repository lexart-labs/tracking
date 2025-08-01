(function (ng) {

    'use strict';

    var Module = ng.module('LexTracking');

    Module.controller('AppCtrl', ['$scope', '$log', '$window', '$rootScope', '$state', '$translate', '$timeout', 'RestClient', 'ngDialog', 'toastr', function ($scope, $log, $window, $rootScope, $state, $translate, $timeout, RestClient, ngDialog, toastr) {
        // ---- Initialization

        $log.info('%cLEXTRACKING %cAPP STARTUP ', 'background: #203678; color: #F9F9F9; font-weight:bold; padding: 4px;', 'background: #666; color: #F9F9F9; padding: 4px;');

        // Put here stuff that can be deferred for the next digest
        $scope.$evalAsync(function () {
            $log.info("Async calls..");
        });

        $rootScope.darkMode = $window.sessionStorage["darkMode"] || 0;
        $rootScope.userPhoto = window.localStorage.getItem("photo");
        $rootScope.FILES_BASE = FILES_BASE;
        $rootScope.darkMode == 1 ? $rootScope.darkModeBool = true : $rootScope.darkModeBool = false;
        $rootScope.shohSwitchTooltip = true;
        
        $rootScope.showToast = function(title, subTitle, type){
            toastr[type](subTitle, title, { timeOut: 0 });
        }

        $rootScope.showToaster = function (title, type, subtitle) {
            //Title is bold and big
            //Show toaster accept as type: info, success, warning, error.
            //Subtitle is normal and small
            $timeout(function () {
                var count = jQuery('#toast-container > div').length;
                if (count > 1) {
                    for (var index = 1; index < count; index++) {
                        if (jQuery('#toast-container > div')[index]) {
                            jQuery('#toast-container > div')[index].remove();
                        }
                    };
                };
                jQuery('div[toast]').css("bottom", "0");
            }, 50);

            switch (type) {
                case 'info':
                    toastr.info(subtitle, title);
                    break;
                case 'error':
                    toastr.error(subtitle, title);
                    break;
                case 'warning':
                    toastr.warning(subtitle, title);
                    break;
                case 'success':
                    toastr.success(subtitle, title);
                    break;
                default:
                    toastr.info(subtitle, title);
                    break;
            }
        };

        $rootScope.closeToaster = function () {
            toastr.clear()
        };

        $rootScope.logout = function () {
            $window.localStorage.clear();
            $rootScope.userName = '';
            $rootScope.token = '';
            $rootScope.darkModeSwitch = 0;
            $rootScope.darkMode = 0;
            $window.sessionStorage["darkMode"] = 0;
            $state.go('login');
        };

        $rootScope.toggleMode = function () {
            $rootScope.darkMode == 0 ? $rootScope.darkMode = 1 : $rootScope.darkMode = 0;
            $rootScope.darkModeBool = !$rootScope.darkModeBool;
            $window.sessionStorage["darkMode"] == '0' ? $window.sessionStorage["darkMode"] = '1' : $window.sessionStorage["darkMode"] = '0';
        }

        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
            //Close all dialogs
            ngDialog.closeAll();
        })

        $scope.$on('$routeChangeSuccess', function (e, currentRoute) {
            //Change page title, based on Route information
            if (currentRoute && currentRoute.title) {
                $window.title = currentRoute.title;
            }
        });

        $scope.changeLanguage = function (langKey) {
            $translate.use(langKey);
        };

    }]);

}(angular));
