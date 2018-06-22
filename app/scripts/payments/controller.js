'use strict';

/* Controllers */

angular.module('netbase')

.controller('PaymentsCtrl', ['$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', 'StripeElements', function($rootScope, $scope, $location, $route, $localStorage, Students, ngDialog, StripeElements) {

  /* FLOWS:
    -> addCard
    -> order

  */

  $scope.page = $scope.ngDialogData.page;
  $scope.flow = $scope.ngDialogData.flow;

  /* information */

  $scope.information = {
    title : "",
    text : ""
  };

  /* functions */

  $scope.goToPage = function(page, data) {

    $scope.page = page;
    $scope.$apply();

  }

  /* stripe */

  var elements = StripeElements.elements()

  let style = {
    base : {
      lineHeight: '45px'
    }
  };

  var card = elements.create('card', { style : style } );

  $scope.card = card;

  card.on('change', handleChange)

  $scope.form = {};

  function handleChange (e) {
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

    //if (success) { $scope.loading = false; }

  }

  $scope.cardAdd = function() {

    let additionalData = {
      name : $scope.cardName
    };

    if ($scope.validationError != undefined) {

      console.log("error")

    } else {

      $scope.loading = true;

      StripeElements.createToken(card, additionalData).then(function(result) {

        console.log(result)

        if (result.token) {

          // example.querySelector('.token').innerText = result.token.id;
          // example.classList.add('submitted');

          if ($scope.flow == "addCard") {

            $scope.information.title = "Card added";
            $scope.information.text = "Your card was added with success on your account. You can start using right now.";
            $scope.goToPage("information");

          }

          if ($scope.flow == "order") {

            $scope.goToPage("order");

          }


          $scope.loading = false;

        } else {

          // Otherwise, un-disable inputs.
          enableInputs();

        }

        $scope.loading = false;

      });

    }

  }

}])
