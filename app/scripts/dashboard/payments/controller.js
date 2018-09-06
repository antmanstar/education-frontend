'use strict';

/* Controllers */

angular.module('netbase')

.controller('DashboardPaymentsWalletCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'ngDialog', 'Students', 'jwtHelper', '$localStorage', function($rootScope, $scope, $location, $route, University, ngDialog, Students, jwtHelper, $localStorage) {

  var studentId;

  if ($localStorage.token != undefined && $localStorage.token != null) {
    studentId = jwtHelper.decodeToken($localStorage.token)._id;
  }

  Students.getCards().success(function(res) {

    let data = res.data;
    let success = res.success;

    console.log(data)

    if (success) {

      $scope.cards = data.sources.data;

    }

  });

  $scope.addCard = function () {
    ngDialog.open({ template: 'partials/modals/payments.html', controller: 'PaymentsCtrl', className: 'ngdialog-theme-default', data : { flow : "addCard", page : "cardAdd" } });
  }

}])
