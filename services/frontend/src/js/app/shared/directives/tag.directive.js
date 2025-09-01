(function (ng, _) {

	'use strict';

	var Module = ng.module('LexTracking');

	Module.directive('trackingTag', function () {
		//Example of invocation:
		// Color options (tracking-tag-info, tracking-tag-zafran, tracking-tag-lime)
		// <tracking-tag text="Texto a mostrar" color="tracking-tag-info"></group-button>

		return {
			restrict: 'E',
			scope: {
				color: '@',
				text: '@',
			},
			templateUrl: '/app/shared/directives/tag.view.html',
			link: function (scope, element, attrs) {
				
			}
		};

	});

}(angular, _));