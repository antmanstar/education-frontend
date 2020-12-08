'use strict';

/* Controllers */
angular.module('netbase')

.controller('EwalletDashboardCtrl', ['$rootScope', '$scope', '$location', '$localStorage', 'ngDialog', function($rootScope, $scope, $location, $localStorage, ngDialog) {
    $scope.amount;

    $scope.gotoRequestCard = function() {
      window.location.href = "/wallet/virtual_card/request"
    }

    $scope.openTopupModal = function() {
        ngDialog.open({ template: 'partials/modals/ewallet_topup_steps.html', controller: 'EwalletTopupCtrl', className: 'ngdialog-theme-default' });
    }

    $scope.openWithdrawModal = function() {
        ngDialog.open({ template: 'partials/modals/ewallet_withdraw_step1.html', controller: 'EwalletWithdrawCtrl', className: 'ngdialog-theme-default' });
    }
}])

.controller('EwalletCardsCtrl', ['$rootScope', '$scope', '$location', '$localStorage', 'ngDialog', function($rootScope, $scope, $location, $localStorage, ngDialog) {
    $scope.amount;
    $scope.cardId = "123456789"

    $scope.gotoRequestCard = function() {
      window.location.href = "/wallet/virtual_card/request"
    }

    $scope.openTopupModal = function() {
        ngDialog.open({ template: 'partials/modals/ewallet_topup_steps.html', controller: 'EwalletTopupCtrl', className: 'ngdialog-theme-default' });
    }

    $scope.openWithdrawModal = function() {
        ngDialog.open({ template: 'partials/modals/ewallet_withdraw_step1.html', controller: 'EwalletWithdrawCtrl', className: 'ngdialog-theme-default' });
    }

    $scope.gotoP2p = function() {
      window.location.href = "/wallet/payments/p2p"
    }

    $scope.openErasePopup = function(cardId) {
        ngDialog.open({
            template: 'eraseCardPopup',
            controller: 'EwalletCardsCtrl',
            data: { cardId: cardId },
            width: '50%',
            height: '40%',
            className: 'ngdialog-theme-default'
        });
    }

    $scope.openBlockPopup = function(cardId) {
        ngDialog.open({
            template: 'blockCardPopup',
            controller: 'EwalletCardsCtrl',
            data: { cardId: cardId },
            width: '50%',
            height: '40%',
            className: 'ngdialog-theme-default'
        });
    }

    $scope.eraseCardRequest = function() {
        let cardId = $scope.ngDialogData.cardId
        $scope.eraseLoading = true;


    }

    $scope.blockCardRequest = function() {
        let cardId = $scope.ngDialogData.cardId
        $scope.blockLoading = true;


    }

    $scope.closeErasePopup = function() {
        ngDialog.close();
    }

    $scope.closeBlockPopup = function() {
        ngDialog.close();
    }
}])

.controller('EwalletTopupCtrl', ['$rootScope', '$scope', '$location', '$localStorage', 'ngDialog', function($rootScope, $scope, $location, $localStorage, ngDialog) {
    $scope.amount;
    $scope.balance = 100
    $scope.newBalance = $scope.balance
    $scope.topup_step = "step-1"

    $scope.selectPrice = function(amount) {
      console.log("select price: ", amount)
      $scope.amount = amount
      $scope.newBalance = $scope.balance + amount
    }

    $scope.openTopupStep2 = function() {
      $scope.topup_step = "step-2"
    }

    $scope.openTopupStep3 = function() {
      $scope.topup_step = "step-3"
    }

    $scope.performTopupOperation = function() {
      alert("add balance")
    }

    $scope.modalTopupStep1Close = function() {
        ngDialog.close();
    }

    $scope.modalTopupStep2Back = function() {
        $scope.topup_step = "step-1"
    }

    $scope.modalTopupStep3Back = function() {
        $scope.topup_step = "step-2"
    }
}])

.controller('EwalletWithdrawCtrl', ['$rootScope', '$scope', '$location', '$localStorage', 'ngDialog', function($rootScope, $scope, $location, $localStorage, ngDialog) {
    $scope.amount;
    $scope.balance = 100
    $scope.newBalance = $scope.balance
    $scope.withdraw_step = "step-1"

    $scope.accountNumber
    $scope.bankName
    $scope.swiftCode
    $scope.routingNumber
    $scope.country
    $scope.currency

    $scope.selectPrice = function(amount) {
      $scope.amount = amount
      $scope.newBalance = $scope.balance - amount
    }

    $scope.openWithdrawStep1 = function() {
        $scope.withdraw_step = "step-1"
    }

    $scope.openWithdrawStep2 = function() {
      $scope.withdraw_step = "step-2"
      //ngDialog.open({ template: 'partials/modals/ewallet_withdraw_step2.html', controller: 'EwalletWithdrawCtrl', className: 'ngdialog-theme-default' });
    }

    $scope.openWithdrawStep3 = function() {
      $scope.withdraw_step = "step-3"
    }

    $scope.performWithdrawOperation = function() {
      alert("withdraw balance")
    }

    $scope.modalWithdrawStep1Close = function() {
        ngDialog.close();
    }

}])

.controller('EwalletPaymentP2PCtrl', ['$rootScope', '$scope', '$location', '$localStorage', 'Students', 'ngDialog', function($rootScope, $scope, $location, $localStorage, Students, ngDialog) {
    $scope.amount
    $scope.email
    $scope.selectedUser = {name: ''}
    $scope.balance = 0.00
    $scope.newBalance = $scope.balance

    $scope.gotoP2p = function() {
      window.location.href = "/wallet/payments/p2p"
    }

    $scope.selectUser = function(user) {
      $scope.selectedUser = user
    }

    $scope.selectPrice = function(amount) {
      console.log("select price: ", amount)
      $scope.amount = amount
      $scope.newBalance = $scope.balance - amount
    }

    $scope.userSearchResult = []

    Students.getAllStudents().success(function(res) {
        if (res.success) {
            $scope.users = res.data;
        }
    });

    $scope.filterByValue = function(string) {
      console.log("filter array: ", string)
      $scope.filtered = [];
      $scope.filtered = $scope.users.filter(
          item => item.email.includes(string.toLowerCase())
      );
      console.log($scope.filtered)
      $scope.$watch('filtered', function(newValue, oldValue) {
          $scope.filtered = newValue.splice(0, 4)
      }, true)
    }

    $scope.openReviewModal = function() {
      ngDialog.open({
        template: 'partials/modals/ewallet_review_p2p_transfer.html',
        controller: 'EwalletPaymentP2PReviewCtrl',
        className: 'ngdialog-theme-default' ,
        data: {user: $scope.selectedUser, amount: $scope.amount}
      });
    }

    $scope.cancelP2PTransfer = function() {
      window.location.href = "/wallet/virtual_card/index"
    }

}])

.controller('EwalletPaymentP2PReviewCtrl', ['$rootScope', '$scope', '$location', '$localStorage', 'Students', 'ngDialog', function($rootScope, $scope, $location, $localStorage, Students, ngDialog) {
    $scope.amount = $scope.ngDialogData.amount;
    $scope.user = $scope.ngDialogData.user;

    $scope.reviewModalBack = function() {
      ngDialog.close()
    }


}])

.controller('EwalletAddPaymentMethodCtrl', ['$rootScope', '$scope', '$location', '$localStorage', 'Students', 'ngDialog', function($rootScope, $scope, $location, $localStorage, Students, ngDialog) {
  $scope.showCreditCardForm = false
  $scope.showBankAccountForm = true

  $scope.displayCreditCardForm = function() {
    $scope.showCreditCardForm = true
    $scope.showBankAccountForm = false
  }

  $scope.displayBankAccountForm = function() {
    $scope.showCreditCardForm = false
    $scope.showBankAccountForm = true
  }


}])
