'use strict';

/* Controllers */
angular.module('netbase')

.controller('PaymentsCtrl', ['$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'User', 'ngDialog', 'StripeElements', 'Payments', function($rootScope, $scope, $location, $route, $localStorage, Students, User, ngDialog, StripeElements, Payments) {
    /* FLOWS: -> addCard -> order */
    $scope.page = $scope.ngDialogData.page;
    $scope.flow = $scope.ngDialogData.flow;
    $scope.plan = $scope.ngDialogData.plan;
    $scope.purchaseType = $scope.ngDialogData.purchaseType;
    $scope.university = $scope.ngDialogData.university;

    let userId = User.getId();

    /* plan amount */
    $scope.planAmount = function(amount) {
        return amount === undefined ? 0 : amount.substr(0, amount.length - 2) + "." + amount.substr(amount.length - 2, amount.length);
    }

    /* Get Cards */
    $scope.initOrder = function() {
        Students.getCards(userId).success(function(res) {
            if (res.success) {
                $scope.cards = res.data;
            } else {}
        });
    }

    if ($scope.flow == "order") {
        $scope.initOrder();
    }

    /* information */
    $scope.information = {
        title: "",
        text: ""
    };

    /* functions */
    $scope.goToPage = function(page, data) {
        $scope.page = page;
        if (page = "order") {
            $scope.initOrder();
        }
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
    card.on('change', handleChange)
    $scope.form = {};

    function handleChange(e) {
        $scope.cardErrors = e.error ? e.error.message : ''
        if (e.error != undefined) {
            $scope.validationError = e.error.message;
        } else {
            $scope.validationError = undefined;
        }
    }

    $scope.informationAction = function() {
        if ($scope.flow == "addCard") {
            $scope.closeThisDialog();
        }
    }

    $scope.confirmOrder = function() {
        $scope.loading = true;
        if ($scope.purchaseType == "proAnnual") {
            let interval = "year";
            Payments.subscribePro(interval).success(function(res) {
                let success = res.success;
                let data = res.data;

                if (success) {
                    $scope.page = "information";
                    $scope.information = {
                        title: "Ordem completa",
                        text: "Parabens, você completou a sua compra."
                    };
                }
            });
        } else {
            let payload = {
                universityId: $scope.university._id,
                currency: $scope.plan.currency,
                planId: $scope.plan.stripeId
            };

            Payments.subscription(payload).then(function(res) {
                let success = res.data.success;
                let university = res.data.data;

                if (success) {
                    // Move to success page0
                    $scope.page = "information";
                    $scope.information = {
                        title: "Ordem completa",
                        text: "Parabens, você completou a sua compra."
                    };
                }
            });
        }
    }

    $scope.informationAction = function() {
        ngDialog.closeAll();
    }

    $scope.cardAdd = function() {
        console.log("AAAA")
        let additionalData = {
            name: $scope.cardName
        };

        if ($scope.validationError != undefined) {
            console.log("error")
        } else {
            $scope.loading = true;
            StripeElements.createToken(card, additionalData).then(function(result) {
                console.log("BBBB", result)
                if (result.token) {
                    // Send card to API, then use routes below
                    let data = { source: result.token.id };
                    Students.postCards(userId, data).success(function(res) {
                        console.log("CCC", res)
                        if (res.success) {
                            if ($scope.flow == "addCard") {
                                $scope.information.title = "Card added";
                                $scope.information.text = "Your card was added with success on your account. You can start using right now.";
                                $scope.goToPage("information");
                            }
                            if ($scope.flow == "order") {
                                $scope.goToPage("order");
                            }
                            $scope.loading = false;
                        } else {}
                    });
                    // end student post card
                } else {
                    // Otherwise, un-disable inputs.
                    enableInputs();
                }
                $scope.loading = false;
            });
        }
    }
}])