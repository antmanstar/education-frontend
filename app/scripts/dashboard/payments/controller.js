'use strict';

/* Controllers */

angular.module('netbase')

.controller('DashboardPaymentsWalletCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'ngDialog', function($rootScope, $scope, $location, $route, University, ngDialog) {

  $scope.addCard = function () {
    ngDialog.open({ template: 'partials/modals/payments.html', controller: 'PaymentsCtrl', className: 'ngdialog-theme-default', data : { flow : "addCard", page : "cardAdd" } });
  }

}])
