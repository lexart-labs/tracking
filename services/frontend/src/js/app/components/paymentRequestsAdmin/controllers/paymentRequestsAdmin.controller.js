(function (ng) {
	"use strict";

	var Module = ng.module("LexTracking");

	Module.controller("PaymentRequestsAdminCtrl", [
		"$scope",
		"$rootScope",
		"$translate",
		"ngDialog",
		"PaymentRequestsServiceAdmin",
		function ($scope, $rootScope, $translate, ngDialog, PaymentRequestsServiceAdmin) {

			console.log("YEREERERE")

			const INITIAL_STATE_FILTERS = {
				concept: null,
				status: "Pending",
				user: null,
				currency: null,
				startDate: null,
				endDate: null
			};
			$scope.paymentRequestFilters = { ...INITIAL_STATE_FILTERS };
			$scope.allPaymentRequests = [];
			$scope.users = [];
			$scope.conceptTexts = {
				Closure: $translate.instant("payment_requests.concepts.closure"),
				Benefits: $translate.instant("payment_requests.concepts.benefits"),
				Compensation: $translate.instant("payment_requests.concepts.compensation"),
				External: $translate.instant("payment_requests.concepts.external_closure")
			};
			$scope.currencyTexts = {
				CLP: $translate.instant("payment_requests.currency.clp"),
				USD: $translate.instant("payment_requests.currency.usd"),
				EUR: $translate.instant("payment_requests.currency.eur"),
				BRL: $translate.instant("payment_requests.currency.brl"),
				JPY: $translate.instant("payment_requests.currency.jpy"),
				GBP: $translate.instant("payment_requests.currency.gbp"),
				CAD: $translate.instant("payment_requests.currency.cad"),
				AUD: $translate.instant("payment_requests.currency.aud"),
				CNY: $translate.instant("payment_requests.currency.cny"),
				INR: $translate.instant("payment_requests.currency.inr"),
				MXN: $translate.instant("payment_requests.currency.mxn"),
				RUB: $translate.instant("payment_requests.currency.rub"),
				ZAR: $translate.instant("payment_requests.currency.zar"),
				CHF: $translate.instant("payment_requests.currency.chf"),
				KRW: $translate.instant("payment_requests.currency.krw"),
				SEK: $translate.instant("payment_requests.currency.sek"),
				NZD: $translate.instant("payment_requests.currency.nzd"),
				SGD: $translate.instant("payment_requests.currency.sgd"),
				HKD: $translate.instant("payment_requests.currency.hkd"),
				ARS: $translate.instant("payment_requests.currency.ars"),
				PYG: $translate.instant("payment_requests.currency.pyg"),
				UYU: $translate.instant("payment_requests.currency.uyu")
			};
			$scope.statusTexts = {
				All: 'All',
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
			$scope.concepts = Object.keys($scope.conceptTexts);
			$scope.statuses = Object.keys($scope.statusTexts);
			$scope.currencies = Object.keys($scope.currencyTexts);

			this.$onInit = function () {
					getAllPaymentRequests($scope.paymentRequestFilters);
					getAllUsers();
			};

			$scope.submitForm = function() {
				getAllPaymentRequests($scope.paymentRequestFilters);
			};

			function getAllUsers() {
				PaymentRequestsServiceAdmin.getAllUsers(function (err, result) {
					if (err) {
							$rootScope.showToaster(
									$translate.instant("payment_requests.error_messages.error_to_fetch"),
									"error"
							);
					} else {
						$scope.users = result;
					}
				});
			};

			$scope.showPaymentRequestDetailsDialog = function(paymentRequests) {
				ngDialog.open({
					template: '/app/components/paymentRequestsAdmin/views/showPaymentRequestDetailsAdmin.modal.html',
					scope: $scope,
					disableAnimation: true,
					data: {
						paymentRequests
					},
					controller: ['$scope', function ($scope) {
              $scope.updatePaymentRequestStatus = function (status) {
							const paymentRequest = $scope.ngDialogData.paymentRequests;
							console.log("🚀  --> $scope.paymentRequestObservation:", $scope.paymentRequestObservation)
							PaymentRequestsServiceAdmin.updateStatus(paymentRequest.id, { status, reply: $scope.paymentRequestObservation }, function (err, result) {
								ngDialog.close();
								if (err) return $rootScope.showToaster($translate.instant("payment_requests.error_messages.error_to_update_status"),"error");
								getAllPaymentRequests();
								$rootScope.showToaster($translate.instant("payment_requests.success_messages.status_updated"),"success");
							});
            			};
        			}]
				});
			};

			$scope.editPaymentRequest = function(paymentRequest) {
				$scope.editableRequest = angular.copy(paymentRequest);
				console.log($scope.editableRequest);


				ngDialog.open({
					template: '/app/components/paymentRequestsAdmin/views/editPaymentRequestModalTemplate.modal.html',
					disableAnimation: true,
					scope: $scope,
					data: { editableRequest: $scope.editableRequest }
				});
			};

			$scope.savePaymentRequest = function() {
				const paymentRequestData = {
					user: $scope.editableRequest.user,
					amount: $scope.editableRequest.payment_request_details[0].amount,
					concept_description: $scope.editableRequest.payment_request_details[0].concept_description
				};

				PaymentRequestsServiceAdmin.updateConcept($scope.editableRequest.id, paymentRequestData, function(err, result) {
					if (err) {
						$rootScope.showToaster(
							$translate.instant("payment_requests.error_messages.error_to_update"),
							"error"
						);
					} else {
						getAllPaymentRequests();
						ngDialog.close();
						$rootScope.showToaster(
							$translate.instant("payment_requests.success_messages.status_updated"),
							"success"
						);
					}
				});
			};

			function getAllPaymentRequests(query) {
				PaymentRequestsServiceAdmin.find(query, function (err, result) {
					if (err) {
						$rootScope.showToaster(
							$translate.instant("payment_requests.error_messages.error_to_fetch"),
							"error"
						);
					} else {
						const allPaymentRequests = result.map((r) => {
							const date = r.created_at;
							r.created_at = new Date(date).toLocaleDateString('en-US', { timeZone: 'UTC' });
							r.created_at_display = moment(date).format('MMM DD, YYYY');
							r.start_date_display = r.payment_request_details.find(detail => detail.start_date)?.start_date ? moment(r.payment_request_details.find(detail => detail.start_date).start_date).format('MMM DD, YYYY') : '';
							r.end_date_display = r.payment_request_details.find(detail => detail.end_date)?.end_date ? moment(r.payment_request_details.find(detail => detail.end_date).end_date).format('MMM DD, YYYY') : '';
							r.status_display = $scope.statusTexts[r.status];
							// Add http if not present
							r.payment_request_details.forEach(detail => {

								if (detail.bill_link && !/^https?:\/\//.test(detail.bill_link)) {
									detail.bill_link = 'https://' + detail.bill_link;
								}
								if (detail.report_link && !/^https?:\/\//.test(detail.report_link)) {
									detail.report_link = 'https://' + detail.report_link;
								}

							});
							r.total = r.payment_request_details.reduce((acc, curr) => {
								return acc += curr.amount;
							}, 0);
							return r;
						});
						$scope.allPaymentRequests = allPaymentRequests;
					}
				});
			};
		},
	]);
})(angular);