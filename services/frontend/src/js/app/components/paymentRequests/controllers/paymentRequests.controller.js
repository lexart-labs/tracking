(function (ng) {
	"use strict";

	var Module = ng.module("LexTracking");

	Module.controller("PaymentRequestsCtrl", ["$scope","$rootScope","$translate","ngDialog","PaymentRequestsService",function ($scope, $rootScope, $translate, ngDialog, PaymentRequestsService) {
			
		const USER_ID = localStorage.getItem("userId");
		const INITIAL_STATE_PAYMENT_REQUEST = {
			concept: null,
			concept_description: null,
			amount: null,
		};
		// Make the min start date 2 months ago
		$scope.minDateAllowed = moment().subtract(2, 'months').format('YYYY-MM-DD');

		$scope.isCancelingPaymentRequest = false;
		$scope.isAmountInputDisabled = false;
		$scope.paymentRequestDetails = [];
		$scope.paymentRequestDetailsTotalAmount = 0;
		$scope.paymentRequests = [];
		$scope.concepts = ["Closure", "Benefits", "Compensation", "External"];
		$scope.paymentRequest = { ...INITIAL_STATE_PAYMENT_REQUEST };
		$scope.conceptTexts = {
			Closure: $translate.instant("payment_requests.concepts.closure"),
			Benefits: $translate.instant("payment_requests.concepts.benefits"),
			Compensation: $translate.instant("payment_requests.concepts.compensation"),
			External: $translate.instant("payment_requests.concepts.external_closure"),
		};
		$scope.statusTexts = {
			Pending: $translate.instant("payment_requests.status.pending"),
			Canceled: $translate.instant("payment_requests.status.canceled"),
			Approved: $translate.instant("payment_requests.status.approved"),
			Rejected: $translate.instant("payment_requests.status.rejected"),
		};
		$scope.statusColors = {
			Pending: 'tracking-tag-info',
			Canceled: 'tracking-tag-zafran',
			Approved: 'tracking-tag-lime',
			Rejected: 'tracking-tag-danger'
		};


		function getClosureAmount() {
			console.log("getting last closure")
			PaymentRequestsService.getAmountSinceLastClosure(
				{userId: USER_ID, start_date: $scope.paymentRequest.start_date, end_date: $scope.paymentRequest.end_date},
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
						const date = item.created_at;
						item.created_at = new Date(date).toLocaleDateString('en-US', { timeZone: 'UTC' });
						item.created_at_display = moment(date).format('MMM DD, YYYY');
						item.amount = $scope.calcTotalAmount(
							item.payment_request_details
						);
						return item;
					});
					
					$scope.paymentRequests = formattedResult;
				}
			);
		}

		if (USER_ID) {
			getUserPaymentRequestHistory();
		}

		$scope.handleCheckAmount = function () {
			$rootScope.closeToaster();
			// Make a description for each concept and show the toast with corresponding text
			if ($scope.paymentRequest.concept.toUpperCase() == "CLOSURE") {
				$rootScope.showToaster($translate.instant("payment_requests.concepts_explanation.closure"),"info");
			} else if ($scope.paymentRequest.concept.toUpperCase() == "BENEFITS") {
				$rootScope.showToaster($translate.instant("payment_requests.concepts_explanation.benefits"),"info");
			} else if ($scope.paymentRequest.concept.toUpperCase() == "COMPENSATION") {
				$rootScope.showToaster($translate.instant("payment_requests.concepts_explanation.compensation"),"info");
			} else if ($scope.paymentRequest.concept.toUpperCase() == "EXTERNAL"){
				$rootScope.showToaster($translate.instant("payment_requests.concepts_explanation.external_closure"),"info");
			}
			//Restore necesary values
			$scope.isAmountInputDisabled = $scope.paymentRequest.concept.toUpperCase() == "CLOSURE";
			if($scope.paymentRequest.concept.toUpperCase() == "CLOSURE") $scope.paymentRequest.amount = null;
			
			if ($scope.paymentRequest.concept.toUpperCase() == "CLOSURE" && $scope.paymentRequest.start_date && $scope.paymentRequest.end_date) {
				getClosureAmount();
			}

			return;
		};

		$scope.addPaymentRequest = function () {
			if ($scope.paymentRequest.amount === null || $scope.paymentRequest.concept === null || $scope.paymentRequest.concept_description === null) {
				return $rootScope.showToaster($translate.instant("payment_requests.error_messages.null_values"),"error");
			} else if ($scope.paymentRequest.amount <= 0) {
				return $rootScope.showToaster($translate.instant("payment_requests.error_messages.amount_greater_than_zero"),"error");
			} else if ($scope.paymentRequest.concept.toUpperCase() == 'EXTERNAL' && (!$scope.paymentRequest.bill_link || !$scope.paymentRequest.report_link)) {
				return $rootScope.showToaster('Invoice and Report links are mandatory for external closures',"error");
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

			//If concept is external 


			PaymentRequestsService.save(
				$scope.paymentRequestDetails, function (err, result) {
					if (err) {
						if (!err.Error) return $rootScope.showToaster($translate.instant( "payment_requests.error_messages.error_to_save"), "error");
						return $rootScope.showToaster(err.Error, "error");
					}
					if (err == null && result == null) {
						return $rootScope.showToaster($translate.instant("payment_requests.error_messages.error_to_hours"),"error");
					}

					getUserPaymentRequestHistory();

					$scope.paymentRequestDetails = [];
					$scope.paymentRequest = { ...INITIAL_STATE_PAYMENT_REQUEST };
					$scope.paymentRequestDetailsTotalAmount = 0.00
					$scope.isAmountInputDisabled = false;

					$rootScope.showToaster($translate.instant("payment_requests.success_messages.payment_request_created"),"success");
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

		$scope.showPaymentRequestDetailsDialog = function (paymentRequestIndex) {
			console.log($scope.paymentRequests[paymentRequestIndex])
			ngDialog.open({
				template: '/app/components/paymentRequests/views/showPaymentRequestDetails.modal.html',
				scope: $scope,
				disableAnimation: true,
				data: {
					paymentRequestDetails: $scope.paymentRequests[paymentRequestIndex].payment_request_details,
					conceptTexts: $scope.conceptTexts,
					reply: $scope.paymentRequests[paymentRequestIndex].reply,
					status: $scope.paymentRequests[paymentRequestIndex].status,
				}
			});
		};
	},
]);
})(angular);