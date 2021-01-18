angular.module('netbase')

.controller('TeachSalesPricingCtrl', ['$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', 'Payments', function($rootScope, $scope, $location, $route, $localStorage, Students, ngDialog, Payments) {
    $scope.company_logo = $localStorage.company_logo;
}])

.controller('TeachSalesCtrl', ['$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', 'Payments', function($rootScope, $scope, $location, $route, $localStorage, Students, ngDialog, Payments) {
    $scope.testarPlataforma = function() {

        let url = window.location.href;

        if (url.indexOf('universida.de') > 0) {
          $location.url("/iniciar")
        } else {
          $location.url("/start")
        }
    }
    $scope.company_logo = $localStorage.company_logo;
}]);
