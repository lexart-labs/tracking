(function (ng) {
	"use strict";

	var Module = ng.module("LexTracking");

	Module.controller("PaymentRequestsCtrl", [
		"$scope",
		"$rootScope",
		"$translate",
		"ngDialog",
		"PaymentRequestsService",
		function ($scope, $rootScope, $translate, ngDialog, PaymentRequestsService) {
			const USER_ID = localStorage.getItem("userId");
			const INITIAL_STATE_PAYMENT_REQUEST = {
				concept: null,
				concept_description: null,
				amount: null,
			};

			$scope.isCancelingPaymentRequest = false;
			$scope.isAmountInputDisabled = false;
			$scope.paymentRequestDetails = [];
			$scope.paymentRequestDetailsTotalAmount = 0;
			$scope.paymentRequests = [];
			$scope.concepts = ["Closure", "Benefits", "Compensation"];
			$scope.paymentRequest = { ...INITIAL_STATE_PAYMENT_REQUEST };
			$scope.conceptTexts = {
				Closure: $translate.instant("payment_requests.concepts.closure"),
				Benefits: $translate.instant("payment_requests.concepts.benefits"),
				Compensation: $translate.instant("payment_requests.concepts.compensation"),
			};
			$scope.statusTexts = {
				Pending: $translate.instant("payment_requests.status.pending"),
				Canceled: $translate.instant("payment_requests.status.canceled"),
				Approved: $translate.instant("payment_requests.status.approved"),
				Rejected: $translate.instant("payment_requests.status.rejected"),
			};

			this.$onInit = function () {
				getUserPaymentRequestHistory();
			};

			function getClosureAmount() {
				PaymentRequestsService.getAmountSinceLastClosure(
					USER_ID,
					function (err, result) {
						if (err) return $rootScope.showToaster(err.Error, "error");
						$scope.paymentRequest.amount = result.amount;
					}
				);
			}

			function getUserPaymentRequestHistory() {
				PaymentRequestsService.getUserPaymentRequests(
					USER_ID,
					function (err, result) {
						if (err) return $rootScope.showToaster(err.Error, "error");

						const formattedResult = result.map((item) => {
							item.created_at = moment(item.created_at).format(
								"YYYY-MM-DD HH:mm"
							);
							item.amount = $scope.calcTotalAmount(
								item.payment_request_details
							);
							return item;
						});

						$scope.paymentRequests = formattedResult;
					}
				);
			}

			$scope.changeConcept = function () {
				if ($scope.paymentRequest.concept != "Closure") {
					$scope.paymentRequest.amount = null;
					$scope.isAmountInputDisabled = false;
					return;
				}

				$scope.isAmountInputDisabled = true;

				getClosureAmount();

				return;
			};

			$scope.addPaymentRequest = function () {
				if (
					$scope.paymentRequest.amount === null ||
					$scope.paymentRequest.concept === null ||
					$scope.paymentRequest.concept_description === null
				) {
					$rootScope.showToaster(
						$translate.instant("payment_requests.error_messages.null_values"),
						"error"
					);
					return;
				} else if ($scope.paymentRequest.amount <= 0) {
					$rootScope.showToaster(
						$translate.instant(
							"payment_requests.error_messages.amount_greater_than_zero"
						),
						"error"
					);
					return;
				}

				$scope.paymentRequestDetails.push({
					id: $scope.paymentRequestDetails.length + 1,
					...$scope.paymentRequest,
				});
				$scope.paymentRequestDetailsTotalAmount = $scope.calcTotalAmount($scope.paymentRequestDetails);
				$scope.paymentRequest = { ...INITIAL_STATE_PAYMENT_REQUEST };
				$scope.isAmountInputDisabled = false;
			};

			$scope.removePaymentRequestFromList = function (paymentRequestId) {
				$scope.paymentRequestDetails = $scope.paymentRequestDetails.filter(
					(request) => request.id != paymentRequestId
				);
			};

			$scope.calcTotalAmount = function (paymentRequestDetails) {
				return paymentRequestDetails
					.reduce((acc, detail) => (acc += detail.amount), 0);
			};

			$scope.savePaymentRequest = function () {
				PaymentRequestsService.save(
					$scope.paymentRequestDetails,
					function (err, result) {
						if (err) {
							if (!err.Error)
								return $rootScope.showToaster(
									$translate.instant(
										"payment_requests.error_messages.error_to_save"
									),
									"error"
								);

							return $rootScope.showToaster(err.Error, "error");
						}
						if (err == null && result == null) {
							return $rootScope.showToaster(
								$translate.instant(
									"payment_requests.error_messages.error_to_hours"
								),
								"error"
							);
						}

						getUserPaymentRequestHistory();

						$scope.paymentRequestDetails = [];
						$scope.paymentRequest = { ...INITIAL_STATE_PAYMENT_REQUEST };
						$scope.paymentRequestDetailsTotalAmount = 0.00
						$scope.isAmountInputDisabled = false;

						$rootScope.showToaster(
							$translate.instant(
								"payment_requests.success_messages.payment_request_created"
							),
							"success"
						);
					}
				);
			};

			$scope.cancelPaymentRequest = function (paymentRequestId, cb) {
				PaymentRequestsService.cancel(paymentRequestId, function (err, result) {
					if (err && err.Error) {
						$rootScope.showToaster(
							$translate.instant(
								"payment_requests.error_messages.error_to_cancel"
							),
							"error"
						);
						return cb(false);
					}

					getUserPaymentRequestHistory();

					$rootScope.showToaster(
						$translate.instant(
							"payment_requests.success_messages.payment_request_cancelled"
						),
						"success"
					);
					return cb(true);
				});
			};

			$scope.showCancelPaymentRequestDialog = function(paymentRequestId) {
				ngDialog.open({
					template: '/app/shared/views/cancel.modal.html',
					showClose: true,
					scope: $scope,
					disableAnimation: true,
					data: {
						confirm: function() {
							$scope.isCancelingPaymentRequest = true;
							$scope.cancelPaymentRequest(paymentRequestId, function(isCanceled) {
								$scope.isCancelingPaymentRequest = false;
								if (isCanceled) ngDialog.close();
							});
						},
					}
				});
			};

			$scope.showPaymentRequestDetailsDialog = function(paymentRequestIndex) {
				ngDialog.open({
					template: '/app/components/paymentRequests/views/showPaymentRequestDetails.modal.html',
					scope: $scope,
					disableAnimation: true,
					data: {
						paymentRequestDetails: $scope.paymentRequests[paymentRequestIndex].payment_request_details,
						conceptTexts: $scope.conceptTexts
					}
				});
			};
		},
	]);
})(angular);
