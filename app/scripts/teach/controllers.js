angular.module('netbase')

.controller('TeachSalesPricingCtrl', ['$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', 'Payments', function($rootScope, $scope, $location, $route, $localStorage, Students, ngDialog, Payments) {
    $scope.company_logo = $localStorage.company_logo;
}])

.controller('TeachSalesCtrl', ['$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', 'Payments', function($rootScope, $scope, $location, $route, $localStorage, Students, ngDialog, Payments) {
    $scope.testarPlataforma = function() {
        $location.url("/iniciar")
    }
    $scope.company_logo = $localStorage.company_logo;
}]);