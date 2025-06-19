(function (ng, _) {

	'use strict';

	var Module = ng.module('LexTracking');

	Module.directive('trackingTag', function () {
		//Example of invocation:
		// Color options (imm-tag-info, imm-tag-zafran, imm-tag-lime)
		// <imm-tag text="Texto a mostrar" color="imm-tag-info"></group-button>

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