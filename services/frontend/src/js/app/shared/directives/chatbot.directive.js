(function (ng) {
    'use strict';

    var Module = ng.module('LexTracking');

    Module.directive('chatbotWidget', function ($timeout, $window, $sce) {
		return {
			restrict: 'E',
            scope: {},
            template: `
			<div class="chatbot" ng-if="chatbotEnvReactUrl">
			<button class="chatbot-btn" 
			ng-click="toggleChatbot()" 
			ng-show="!chatbotOpened"
			ng-class="{'rotating': isButtonRotating}">
			<i class="ri-message-2-line"></i>
			</button>
			<div 
			class="chatbot-content" 
			ng-class="{
				'chatbot-content-hidden': !chatbotOpened,
				'chatbot-content-visible': chatbotOpened
				}">
				<iframe
				iframe-resizer
				options="iframeOptions"
				on-ready="onIframeReady($event)"
				on-initialized="guardarResizer(resizer, iframe)"
				style="width: 400px; height: 600px; border:none; overflow-y: scroll;"
				sandbox="allow-top-navigation allow-presentation allow-top-navigation-by-user-activation allow-pointer-lock allow-orientation-lock allow-modals allow-forms allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
				ng-src="{{chatbotEnvReactUrl}}">
				</iframe>
				</div>
                </div>
				`,
				link: function (scope, element, attrs) {
					console.log("link");
					var chatbotUrl = $window.TRACKING_REACT_URL + '/chatbot';
					scope.chatbotEnvReactUrl = $sce.trustAsResourceUrl(chatbotUrl);
					scope.chatbotOpened = false;
					scope.isButtonRotating = false;
					
					// Watch for URL changes
					scope.$watch('chatbotEnvReactUrl', function(newVal) {
						if (newVal) {
							console.log('Chatbot URL initialized:', newVal);
						}
					});
					
					scope.toggleChatbot = function () {
						scope.isButtonRotating = true;
						$timeout(function() {
							scope.chatbotOpened = !scope.chatbotOpened;
							scope.isButtonRotating = false;
						}, !scope.chatbotOpened ? 500 : 0);	
                	};

                // Handle postMessage events from the iframe
                window.addEventListener('message', function(e) {
                    if (e.data && e.data.type === 'chatbotClosed') {
                        scope.toggleChatbot();
                        scope.$apply();
                    }
                });
            },
            controller: ['$scope', '$window', '$sce', function ($scope, $window, $sce) {
                console.log("controller");
                var chatbotUrl = $window.TRACKING_REACT_URL + '/chatbot';
                $scope.chatbotEnvReactUrl = $sce.trustAsResourceUrl(chatbotUrl);
                
                $scope.iframeOptions = {
                    heightCalculationMethod: 'bodyOffset',
                    log: false
                };

                $scope.onIframeReady = function(event) {
                    // Handle iframe ready event
                };

                $scope.guardarResizer = function(resizer, iframe) {
                    // Store the resizer and iframe reference
                };
            }]
        };
    });

}(angular));