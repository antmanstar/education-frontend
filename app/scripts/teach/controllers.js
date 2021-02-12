angular.module('netbase')

.controller('TeachSalesPricingCtrl', ['$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', 'Payments', 'Email', '$window', function($rootScope, $scope, $location, $route, $localStorage, Students, ngDialog, Payments, Email, $window) {
    $scope.company_logo = $localStorage.company_logo;

    $scope.lastpageReturn = function() {
      console.log("last page return")
        $window.history.back();
    }

    $scope.openContactUs = function() {
      ngDialog.open({
        template: 'partials/modals/contact_us.html',
        controller: 'TeachSalesPricingCtrl',
        className: 'ngdialog-theme-default'
      });
    }

    $scope.contact = {
      email: null,
      requirements: null
    }


    $scope.contactError = false
    $scope.contactMessage = ''
    $scope.loading = false

    $scope.contactUs = function() {
      console.log("email: ", $scope.contact.email)
      console.log("requirements: ", $scope.contact.requirements)
      $scope.contactError = false
      $scope.contactMessage = ''
      $scope.loading = true

      let email = $scope.contact.email
      let requirements = $scope.contact.requirements


      let emailPattern = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);

      $scope.contactMessageError = false
      if (email == null || email.length ==0 ) {
        console.log("null email")
        $scope.contactError = true
        $scope.contactMessage = 'RESET_EMAIL_EMPTY'
        $scope.loading = false
        return
      } else if (!emailPattern.test(email)) {
        $scope.contactError = true
        $scope.contactMessage = 'RESET_EMAIL_INVALID'
        $scope.loading = false
        return
      } else if (requirements == null || email.length ==0 ) {
        $scope.contactError = true
        $scope.contactMessage = 'RESET_EMAIL_INVALID'
        $scope.loading = false
        return
      }

      let data = {
        email: email,
        requirements: requirements
      }
      console.log("contact data: ", data)

      Email.contactUs(data).then(function(res){
        console.log("contact us res: ", res)
        $scope.loading = false
        if (res.data.success){
          ngDialog.close()
        } else {
          $scope.contactError = true
          $scope.contactMessage = 'PLEASE_TRY_AGAIN'
        }

      })

    }


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
