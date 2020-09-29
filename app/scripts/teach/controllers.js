angular.module('netbase')

.controller('TeachSalesPricingCtrl', ['$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', 'Payments', function($rootScope, $scope, $location, $route, $localStorage, Students, ngDialog, Payments) {

}])

.controller('TeachSalesCtrl', ['$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', 'Payments', function($rootScope, $scope, $location, $route, $localStorage, Students, ngDialog, Payments) {
    $scope.testarPlataforma = function() {
        $location.url("/iniciar")
    }
}]);