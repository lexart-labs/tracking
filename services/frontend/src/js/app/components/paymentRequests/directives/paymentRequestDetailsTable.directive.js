(function (ng) {
	"use strict";

	var Module = ng.module("LexTracking");

	Module.directive("paymentRequestDetailsTable", function() {
        return  {
            restrict: "E",
            templateUrl: '/app/components/paymentRequests/views/paymentRequestDetailsTable.html',
            scope: {
                detailsToShow: '=',
                conceptTexts: '=',
                showActions: '=',
                showFooter: '=',
                totalAmount: '=',
            }
        }
    });
})(angular);
