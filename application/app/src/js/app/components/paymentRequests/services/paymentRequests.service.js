(function (ng) {
	"use strict";

	var Module = ng.module("LexTracking");

	Module.factory("PaymentRequestsService", ["RestClient", function (RestClient) {
        var model = "payment_requests";

        var factory = {
            getAmountSinceLastClosure: function (userId, cb) {
                RestClient.get(`${model}/closure/${userId}`, function (err, result) {
                    cb(err, result);
                });
            },
            getUserPaymentRequests: function (userId, cb) {
                RestClient.get(`${model}/${userId}`, function (err, result) {
                    cb(err, result);
                });
            },
            save: function (paymentRequests, cb) {
                RestClient.customPost(`${model}/create`, { details: paymentRequests }, function (err, result) {
                    cb(err, result);
                });
            },
            cancel: function (paymentRequestId, cb) {
                RestClient.customPut(`${model}/${paymentRequestId}/cancel`, null, function (err, result) {
                    cb(err, result);
                });
            }
        };

        return factory;
    }]);
}(angular));
