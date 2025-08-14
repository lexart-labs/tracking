(function (ng) {
	"use strict";

	var Module = ng.module("LexTracking");

	Module.factory("PaymentRequestsServiceAdmin", ["RestClient", function (RestClient) {
        var model = "payment_requests";
        var userModel = 'user';

				function formatDateForBackend(date) {
					if (!date) return null;
					return new Date(date).toISOString().split("T")[0];
				}

        var factory = {
            getAllUsers: function (cb) {
                const endpoint = `${userModel}/all`
                RestClient.get(endpoint, function (err, result) {
                    cb(err, result);
                })
            },
            find: function (query, cb) {
							let endpoint = `${model}/all`;
							if (query) {
									const params = new URLSearchParams();
									if (query.status) params.append('status', query.status);
									if (query.concept) params.append('concept', query.concept);
									if (query.user) params.append('user', query.user);
									if (query.currency) params.append('currency', query.currency);
									if (query.startDate) params.append('startDate', formatDateForBackend(query.startDate));
									if (query.endDate) params.append('endDate', formatDateForBackend(query.endDate));

									endpoint = `${model}/all?${params.toString()}`;
							}

							RestClient.get(endpoint, function (err, result) {
									cb(err, result);
							});
						},
            updateStatus: function (paymentRequestId, status, cb) {
                var endpoint = `${model}/update/${paymentRequestId}`;
                RestClient.put(endpoint, { status: status }, function (err, result) {
                    cb(err, result);
                });
            },
						updateConcept: function (paymentRequestId, data, cb) {
							var endpoint = `${model}/${paymentRequestId}/update_detail`;
							RestClient.put(endpoint, data, function (err, result) {
								cb(err, result);
							});
						}
        };

        return factory;
    }]);
}(angular));
