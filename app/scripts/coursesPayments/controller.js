'use strict';

/* Controllers */

angular.module('netbase')

.controller('CoursesPaymentsCtrl', ['$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', 'StripeElements', 'Payments', 'Courses', function($rootScope, $scope, $location, $route, $localStorage, Students, ngDialog, StripeElements, Payments, Courses) {
    /* FLOWS: -> addCard -> order */
    $scope.plan = $scope.ngDialogData.plan;
    $scope.course = $scope.ngDialogData.course;
    $scope.accountId = $scope.ngDialogData.accountId;
    let userId = $rootScope.user._id;
    $scope.loading = false;

    /* plan amount */
    $scope.planAmount = function(amount) {
        amount = amount.toFixed(2);
        return amount;
    }

    /* stripe */
    var elements = StripeElements.elements();

    let style = {
        base: {
            lineHeight: '45px'
        }
    };

    var card = elements.create('card', { style: style });
    $scope.card = card;
    card.on('change', handleChange);

    $scope.form = {};

    function handleChange(e) {
        $scope.cardErrors = e.error ? e.error.message : ''

        if (e.error != undefined) {
            $scope.loading = false;
            $scope.validationError = e.error.message;
        } else {
            $scope.loading = false;
            $scope.validationError = undefined;
        }
    }

    $scope.handleSubmit = function() {
        let additionalData = {
            name: $scope.cardName
        };
        StripeElements.createToken($scope.card, additionalData).then(function(result) {
            if (result.error) {
                $scope.cardErrors = result.error.message
            } else {
                $scope.loading = true;

                let data = {
                    cardToken: result.token,
                    amount: $scope.plan.amount,
                    currency: $scope.plan.currency,
                    accountId: $scope.accountId
                }

                Payments.coursePayment(data).success(function(res) {
                    console.log('res payment', res);
                    if (res.success == false) {
                        $scope.loading = false;
                        $scope.errorMsg = res.error.message;
                    } else if (res.success == true) {
                        let paymentData = {
                            course_id: $scope.course._id,
                            memberId: $scope.accountId,
                            saleId: res.salesId
                        }

                        Courses.payment($scope.course._id, paymentData).success(function(paymentRes) {
                            $scope.loading = false;
                            $scope.successMsg = 'Payment Done Successfully';
                            $location.path('/cursos/id/' + $scope.course._id + '/timeline');
                        });
                    }
                });
            }
        })
    }

}])