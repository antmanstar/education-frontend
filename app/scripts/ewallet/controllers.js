'use strict';

/* Controllers */
angular.module('netbase')

.controller('EwalletDashboardCtrl', ['$rootScope', '$scope', '$location', '$localStorage', 'ngDialog', 'Ewallet', 'jwtHelper', 'Students', function($rootScope, $scope, $location, $localStorage, ngDialog, Ewallet, jwtHelper, Students) {
    $scope.fetchingTransactions = true
    $scope.amount;
    // GET USER'S EWALLET BALANCE
    let studentId = jwtHelper.decodeToken($localStorage.token)._id;
    console.log("studentId: ", studentId)
    Ewallet.getAccount(studentId).then(function(res) {
      console.log("get account: ", res)
      if(res.data.message == 'Success') {
        $scope.balance = res.data.result.walletBalance
      }
    })

    Students.getStudentById(studentId).then(function(res) {
      $scope.user = res.data.data;

      $localStorage.customerId = $scope.user.stripeId
    })

    // GET ALL USER'S TRANSACTIONS
    Ewallet.getAllTransactions(studentId).then(function(res) {
      $scope.fetchingTransactions = false
      console.log("user transactions: ", res)
      if(res.data.message == 'Success') {
        $scope.transactions = res.data.result
      }
    })

    $scope.$on('updateBalance', function(event, data) {
      $scope.balance = data
    })

    $scope.gotoRequestCard = function() {
      window.location.href = "/wallet/virtual_card/request"
    }

    $scope.openTopupModal = function() {
        ngDialog.open({
          template: 'partials/modals/ewallet_topup_steps.html',
          controller: 'EwalletTopupCtrl',
          className: 'ngdialog-theme-default',
          data: {balance: $scope.balance, userId: studentId, customerID: $scope.user.stripeId}
        });
    }

    $scope.openWithdrawModal = function() {
        ngDialog.open({
          template: 'partials/modals/ewallet_withdraw_step1.html',
          controller: 'EwalletWithdrawCtrl',
          className: 'ngdialog-theme-default',
          data: {balance: $scope.balance}
        });
    }

    $scope.repeatTransaction = function(transaction) {
      //sharedContext.addData("Transaction", transaction)

      if(transaction.type.toLowerCase()=="transfer") {
        $localStorage.repeatTransaction = transaction
        window.location.href = "/wallet/payments/p2p"
      }
    }
}])

.controller('EwalletCardsCtrl', ['$rootScope', '$scope', '$location', '$localStorage', 'ngDialog', 'jwtHelper', 'Ewallet', function($rootScope, $scope, $location, $localStorage, ngDialog, jwtHelper, Ewallet) {

    // GET USER'S EWALLET BALANCE
    let studentId = jwtHelper.decodeToken($localStorage.token)._id;
    Ewallet.getAccount(studentId).then(function(res) {
      console.log("get account: ", res)
      //$scope.balance = res.
      $scope.balance = res.data.result.walletBalance
    })

    $scope.amount;
    $scope.cardId = "123456789"

    $scope.$on('updateBalance', function(event, data) {
      console.log("data: ", data)
      $scope.balance = data
    })

    $scope.gotoRequestCard = function() {
      window.location.href = "/wallet/virtual_card/request"
    }

    $scope.openTopupModal = function() {
        ngDialog.open({
          template: 'partials/modals/ewallet_topup_steps.html',
          controller: 'EwalletTopupCtrl',
          className: 'ngdialog-theme-default',
          data: {balance: $scope.balance}
        });
    }

    $scope.openWithdrawModal = function() {
        ngDialog.open({
          template: 'partials/modals/ewallet_withdraw_step1.html',
          controller: 'EwalletWithdrawCtrl',
          className: 'ngdialog-theme-default',
          data: {balance: $scope.balance}
        });
    }

    $scope.gotoP2p = function() {

      if($scope.balance > 0) {
        window.location.href = "/wallet/payments/p2p"
      }else{
        ngDialog.open({
            template: 'alertNoBalancePopup',
            controller: 'EwalletCardsCtrl',
            width: '50%',
            height: '40%',
            className: 'ngdialog-theme-default'
        });
      }
    }

    $scope.gotoDashboard = function(){
      window.location.href = "/wallet/dashboard"
    }

    $scope.closeAlertPopup = function() {
        ngDialog.close();
    }

}])

.controller('EwalletCardsRequestCtrl', ['$rootScope', '$scope', '$location', '$localStorage', 'ngDialog', 'Students', 'jwtHelper', 'StripeElements', 'Ewallet', function($rootScope, $scope, $location, $localStorage, ngDialog, Students, jwtHelper, StripeElements, Ewallet) {
    $scope.applicantName = ""
    $scope.phoneNumber = ""
    $scope.emailAddress = ""
    $scope.country = ""
    $scope.stateProvince = ""
    $scope.townCity = ""
    $scope.addressLine1 = ""
    $scope.postalzip = ""
    $scope.hasError = false
    $scope.errorMessage = ""
    $scope.processing = false

    // GET USER DETAILS
    let logged = $rootScope.logged;
    if (logged) {
        let studentId = jwtHelper.decodeToken($localStorage.token)._id;

        Students.getStudentById(studentId).then(function(res) {
            $scope.user = res.data.data;
            console.log("user: ", $scope.user)

            // POPULATE FORM WITH USER DETAILS
            $scope.applicantName = $scope.user.name
            //$scope.phoneNumber = $scope.user.name
            $scope.emailAddress = $scope.user.email
        })
    }

    $scope.performRequestCardOperation = function() {
      console.log("request card")
      console.log("phoneNumber", $scope.phoneNumber)
      console.log("country", $scope.country)
      console.log("stateProvince", $scope.stateProvince)
      console.log("townCity", $scope.townCity)
      console.log("addressLine1", $scope.addressLine1)
      console.log("postalzip", $scope.postalzip)
      $scope.hasError = false

      //VALIDATE CARD REQUEST FORM
      if ($scope.phoneNumber==undefined || $scope.phoneNumber=='') {
        $scope.hasError = true
        $scope.errorMessage = "PLEASE_FILL_UP_PHONE_NUMBER"
        return
      } else if ($scope.country==undefined || $scope.country=='') {
        $scope.hasError = true
        $scope.errorMessage = "PLEASE_FILL_UP_COUNTRY"
        return
      } else if ($scope.stateProvince==undefined || $scope.stateProvince=='') {
        $scope.hasError = true
        $scope.errorMessage = "PLEASE_FILL_UP_STATE"
        return
      } else if ($scope.townCity==undefined || $scope.townCity=='') {
        $scope.hasError = true
        $scope.errorMessage = "PLEASE_FILL_UP_TOWN"
        return
      } else if ($scope.addressLine1==undefined || $scope.addressLine1=='') {
        $scope.hasError = true
        $scope.errorMessage = "PLEASE_FILL_UP_ADDRESS1"
        return
      } else if ($scope.postalzip==undefined || $scope.addressLine1=='') {
        $scope.hasError = true
        $scope.errorMessage = "PLEASE_FILL_UP_POSTAL"
        return
      }

      let cardData = {
      	email: $scope.user.email,
      	phoneNumber: $scope.phoneNumber,
        name: $scope.user.name,
        zipcode: $scope.postalzip,
        town_city: $scope.townCity,
        state_province: $scope.stateProvince,
        address_line_1: $scope.addressLine1,
        country: $scope.country,
      	status: "pending"
      }

      Ewallet.creditCardRequest(cardData)
      .then(function(res){
        if(res.data.success) {
          window.location.href = "/wallet/dashboard"
        }
      })
      .catch((err) => {
        console.log("error: ", err)
        $scope.processing = false
        $scope.hasError = true
        $scope.errorMessage = err.data.message
      });

    }

}])

.controller('EwalletTopupCtrl', ['$rootScope', '$scope', '$location', '$localStorage', 'ngDialog', 'Ewallet', 'StripeElements', 'Students', '$anchorScroll', function($rootScope, $scope, $location, $localStorage, ngDialog, Ewallet, StripeElements, Students, $anchorScroll) {
    $scope.amount;
    $scope.balance = $scope.ngDialogData.balance;
    $scope.userId = $scope.ngDialogData.userId;
    $scope.customerId = $scope.ngDialogData.customerID;
    $scope.amount;
    $scope.newBalance = $scope.balance || 0;
    $scope.topup_step = "step-1"

    $scope.processing = false
    $scope.hasError = false
    $scope.errorMessage = ""
    $scope.selectedMethod = null
    $scope.oneTimeToken = null
    $scope.cardData = {}
    $scope.oneTimeFormChange = false

    $scope.fetchingPaymentMethods = true

    // GET USERS SAVED PAYMENT METHOD
    Ewallet.getCardPaymentMethods($scope.customerId).then(function(res) {
      $scope.fetchingPaymentMethods = false
      if(res.data.success) {
        $scope.paymentMethods = res.data.data.data
        console.log("payment methods: ", $scope.paymentMethods)
      }
    })


    /* STRIPE */
    var elements = StripeElements.elements()
    let style = {
        base: {
            lineHeight: '64px'
        }
    };

    var card = elements.create('card', { style: style });
    $scope.card = card;
    card.on('change', handleChange)
    $scope.form = {};

    function handleChange(e) {
        console.log("handle change: ", e)
        if(e.empty) {
          $scope.oneTimeFormChange = false
        } else {
          $scope.oneTimeFormChange = true
        }
        //
        //  set the selectedMethod back to null when user starts
        //  typing on the one time payment form
        //
        $scope.selectedMethod = null

        $scope.cardErrors = e.error ? e.error.message : ''

        if (e.error != undefined) {
            $scope.loading = false;
            $scope.validationError = e.error.message;
        } else {
            $scope.loading = false;
            $scope.validationError = undefined;
        }

    }
    /* END OF STRIPE */


    $scope.selectPrice = function(amount) {
      console.log("select price: ", amount)
      $scope.amount = amount
      $scope.newBalance = $scope.balance + amount
    }

    $scope.selectPaymentMethod = function(card) {
      console.log("select payment method")
      $scope.selectedMethod = card
    }

    $scope.openTopupStep2 = function() {
      $scope.topup_step = "step-2"
    }

    $scope.openTopupStep3 = function() {
      $scope.hasError = false

      if ($scope.selectedMethod == null && !$scope.oneTimeFormChange) {
        $scope.hasError = true
        $scope.errorMessage = "PLEASE_SELECT_PAYMENT_METHOD"
        $location.hash('top');
        $anchorScroll();
        return
      }

      if ($scope.selectedMethod && !$scope.oneTimeFormChange) {
        console.log("continue to step 3")
        $scope.topup_step = "step-3"
      }else {
        console.log("generate token for one time payment before continuing to step 3")
        $scope.oneTimePaymentFunction()
      }
    }


    //
    //  TOP UP EWALLET BALANCE USING ONE TIME PAYMENT
    //
    $scope.oneTimePaymentFunction = function() {
      console.log("adding credit card")
      if ($scope.cardData.cardholderName==undefined || $scope.cardData.cardholderName=='') {
        $scope.validationError = "PLEASE_FILL_UP_CARDHOLDERS_NAME"
        return
      }

      //
      //  CREATE STRIPE TOKEN USING CREDIT CARD DETAILS
      //
      let additionalData = {
          name: $scope.cardData.cardholderName
      };
      console.log("additional data: ", additionalData)
      if ($scope.validationError==undefined) {
        console.log("creating token card: ", card)
          $scope.loading = true;
          StripeElements.createToken(card, additionalData).then(function(result) {
            console.log('create token: ', result)
              if (result.token) {
                $scope.oneTimeToken = result.token
                $scope.topup_step = "step-3"
                $scope.$apply();
              } else {
                  $scope.validationError = result.error.message;
                  $scope.loading = false;
                  $scope.$apply();
              }
              $scope.loading = false;
          });
      } else {
        console.log("validation error")
      }
    }

    $scope.performTopupOperation = function() {
      $scope.processing = true
      let data = {}
      if ($scope.selectedMethod) {

      	data.userId = $scope.userId
      	data.amount = $scope.amount
      	data.customerId = $scope.customerId
        data.cardId = $scope.selectedMethod.id
      	data.description = "Top up with " + $scope.amount

      } else {

      	data.userId = $scope.userId
      	data.amount = $scope.amount
        data.accountToken = $scope.oneTimeToken.id
      	data.description = "Top up with " + $scope.amount

      }

      console.log("data: ", data)

      Ewallet.topUpWalletTransaction(data)
      .then(function(res){
        console.log(res)
        console.log(res.status)
        $scope.processing = false
        if(res.data.message == "Success") {
          $scope.processing = false
          ngDialog.close();
          $rootScope.$broadcast('updateBalance', $scope.newBalance);
        }
      })
      .catch((err) => {
        console.log("error: ", err)
        $scope.processing = false
        $scope.hasError = true
        $scope.errorMessage = err.data.message
      });

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

.controller('EwalletWithdrawCtrl', ['$rootScope', '$scope', '$location', '$localStorage', 'ngDialog', 'Ewallet', function($rootScope, $scope, $location, $localStorage, ngDialog, Ewallet) {

    $scope.amount;
    $scope.balance = $scope.ngDialogData.balance
    $scope.newBalance = $scope.balance || 0;
    $scope.withdraw_step = "step-1"

    //validation variables
    $scope.hasError = false
    $scope.errorMessage = ""
    $scope.processing = false

    $scope.cardholderName = ""
    $scope.accountNumber = "";
    $scope.bankName = "";
    $scope.swiftCode = "";
    $scope.routingNumber = "";
    $scope.country = "";
    $scope.currency = "";

    $scope.updateCardholderName = function(cardholderName) {
      $scope.cardholderName = cardholderName
    }

    $scope.updateAccountNumber = function(accountNumber) {
      $scope.accountNumber = accountNumber
    }

    $scope.updateBankName = function(bankName) {
      $scope.bankName = bankName
    }

    $scope.updateSwiftCode = function(swiftCode) {
      $scope.swiftCode = swiftCode
    }

    $scope.updateRoutingNumber = function(routingNumber) {
      $scope.routingNumber = routingNumber
    }

    $scope.updateCountry = function(country) {
      $scope.country = country
    }

    $scope.updateCurrency = function(currency) {
      $scope.currency = currency
    }

    $scope.selectPrice = function(amount) {
      console.log("set amount")
      $scope.amount = amount
      $scope.newBalance = $scope.balance - amount
    }

    $scope.openWithdrawStep1 = function() {
        $scope.withdraw_step = "step-1"
    }

    $scope.openWithdrawStep2 = function() {
      $scope.hasError = false

      // validate amount entered
      if ($scope.amount > $scope.balance) {
        console.log("error")
        $scope.hasError = true
        $scope.errorMessage = "WITHDRAW_AMOUNT_HIGHER_THAN_BALANCE"
        return
      }

      $scope.withdraw_step = "step-2"
    }

    $scope.openWithdrawStep3 = function() {
      $scope.hasError = false

      // validation for withdrawal form
      if (($scope.cardholderName==undefined || $scope.cardholderName=='') &&
        ($scope.accountNumber==undefined || $scope.accountNumber=='') &&
        ($scope.bankName==undefined || $scope.bankName=='') &&
        ($scope.swiftCode==undefined || $scope.swiftCode=='') &&
        ($scope.routingNumber==undefined || $scope.routingNumber=='') &&
        ($scope.country==undefined || $scope.country=='') &&
        ($scope.currency==undefined || $scope.currency=='')
      ) {
        $scope.hasError = true
        $scope.errorMessage = "PLEASE_FILL_UP_ALL_FIELDS"
        return
      } else if ($scope.cardholderName==undefined || $scope.cardholderName=='') {
        $scope.hasError = true
        $scope.errorMessage = "PLEASE_FILL_UP_CARDHOLDERS_NAME"
        return
      } else if ($scope.accountNumber==undefined || $scope.accountNumber=='') {
        $scope.hasError = true
        $scope.errorMessage = "WITHDRAW_EMPTY_ACCOUNT_NUMBER"
        return
      }else if ($scope.bankName==undefined || $scope.bankName=='') {
        $scope.hasError = true
        $scope.errorMessage = "WITHDRAW_EMPTY_BANK_NAME"
        return
      }else if ($scope.swiftCode==undefined || $scope.swiftCode=='') {
        $scope.hasError = true
        $scope.errorMessage = "WITHDRAW_EMPTY_SWIFT_CODE"
        return
      }else if ($scope.routingNumber==undefined || $scope.routingNumber=='') {
        $scope.hasError = true
        $scope.errorMessage = "WITHDRAW_EMPTY_ROUTING_NUMBER"
        return
      }else if ($scope.country==undefined || $scope.country=='') {
        $scope.hasError = true
        $scope.errorMessage = "WITHDRAW_EMPTY_COUNTRY"
        return
      }else if ($scope.currency==undefined || $scope.currency=='') {
        $scope.hasError = true
        $scope.errorMessage = "WITHDRAW_EMPTY_CURRENCY"
        return
      }

      // if withdrawal form is validated then proceed to review
      $scope.withdraw_step = "step-3"
    }

    $scope.performWithdrawOperation = function() {
      console.log("perform withdrawl")
      $scope.processing = true
      let data = {
      	holderName: $scope.cardholderName,
      	amount: $scope.amount,
        bankAccNumber: $scope.accountNumber,
        bankName: $scope.bankName,
        swiftCode: $scope.swiftCode,
        routingNumber: $scope.routingNumber,
        country: $scope.country,
        currency: $scope.currency
      }

      Ewallet.withdrawalRequest(data)
      .then(function(res) {
        console.log("withdraw res: ", res)
        console.log("success: ", res.data.success)
        if(res.data.success) {
          $rootScope.$broadcast('updateBalance', $scope.newBalance);
          $scope.processing = false
          ngDialog.close();

        }else{
          $scope.processing = false
          console.log("error in creating withdrawal request")
          $scope.hasError = true
          $scope.errorMessage = "error in creating withdrawal request"
        }

      })
      .catch((err) => {
        console.log("error: ", err)
        $scope.processing = false
        $scope.hasError = true
        $scope.errorMessage = err.data.message
      });

    }

    $scope.modalWithdrawStep1Close = function() {
        ngDialog.close();
    }

}])

.controller('EwalletPaymentP2PCtrl', ['$rootScope', '$scope', '$location', '$localStorage', 'Students', 'ngDialog', 'jwtHelper', 'Ewallet', 'sharedContext', function($rootScope, $scope, $location, $localStorage, Students, ngDialog, jwtHelper, Ewallet, sharedContext) {

    // GET USER'S EWALLET BALANCE
    let studentId = jwtHelper.decodeToken($localStorage.token)._id;
    Ewallet.getAccount(studentId).then(function(res) {
      if(res.data.message == 'Success') {
        $scope.balance = res.data.result.walletBalance
      }
    })

    // GET ALL USER'S TRANSACTIONS
    $scope.userTransactions = []
    Ewallet.getAllTransactions(studentId).then(function(res) {
      $scope.fetchingTransactions = false
      console.log("user transactions: ", res.data.result)
      if(res.data.message == 'Success') {
        $scope.transactions = res.data.result
        if ($scope.transactions.length > 0) {
          $scope.prevTransactionEmails = [...new Set($scope.transactions.map(x => x.recieverId))]

          $scope.prevTransactionEmails = $scope.prevTransactionEmails.filter(function( element ) {
             return element !== undefined;
          });
          console.log("distinct email: ", $scope.prevTransactionEmails)

          if($scope.prevTransactionEmails.length > 0) {
            angular.forEach($scope.prevTransactionEmails, function (value) {
                Students.getStudentById(value).then(function(res) {
                  $scope.userTransactions.push(res.data.data);
                })
            });
          }

          console.log("user details: ", $scope.userTransactions)
        }
      }
    })

    $scope.amount
    $scope.email
    $scope.selectedUser
    $scope.newBalance = $scope.balance

    $scope.searchNotFound = false
    $scope.selectPreviousUser = false

    // CHECK IF THERE IS SHARED DATA
    $scope.repeatTransaction = $localStorage.repeatTransaction;

    if ($scope.repeatTransaction) {
      $scope.amount = $scope.repeatTransaction.amount

      Students.getStudentById($scope.repeatTransaction.recieverId).then(function(res) {
        console.log(res)
          $scope.users, $scope.selectedUser = res.data.data;
          console.log("user: ", $scope.users)
          $scope.newBalance = $scope.balance - $scope.amount
      })
    }


    // GET STUDENT DETAILS
    let logged = $rootScope.logged;
    if (logged) {

      Students.getStudentById(studentId).then(function(res) {
          $scope.sender = res.data.data;
          console.log("user: ", $scope.sender)
      })
    }

    $scope.gotoP2p = function() {
      window.location.href = "/wallet/payments/p2p"
    }

    $scope.selectUser = function(user) {
      $scope.selectedUser = user
      $scope.selectPreviousUser = true
      console.log("selected user: ", user)
    }

    $scope.selectPrice = function(amount) {
      console.log("select price: ", amount)
      $scope.amount = amount
      $scope.newBalance = $scope.balance - amount
    }

    $scope.searchUser = function(email) {

      console.log("searching.....")
      $scope.searchNotFound = false
      Students.searchUserByEmail(email).success(function(res) {
        console.log("search user res: ", res.success)
          if (res.success) {
              console.log("search result: ", res.data)
              $scope.selectPreviousUser = false
              $scope.users = res.data;
              $scope.selectedUser = $scope.users
          } else {
            $scope.searchNotFound = true
          }
      });
    }

    // Students.getAllStudents().success(function(res) {
    //     if (res.success) {
    //         $scope.users = res.data;
    //     }
    // });

    // $scope.filterByValue = function(string) {
    //   console.log("filter array: ", string)
    //   $scope.filtered = [];
    //   $scope.filtered = $scope.users.filter(
    //       item => item.email.includes(string.toLowerCase())
    //   );
    //   console.log($scope.filtered)
    //   $scope.$watch('filtered', function(newValue, oldValue) {
    //       $scope.filtered = newValue.splice(0, 4)
    //   }, true)
    // }

    $scope.openReviewModal = function() {
      ngDialog.open({
        template: 'partials/modals/ewallet_review_p2p_transfer.html',
        controller: 'EwalletPaymentP2PReviewCtrl',
        className: 'ngdialog-theme-default' ,
        data: {receiver: $scope.selectedUser, sender: $scope.sender, amount: $scope.amount, newBalance: $scope.newBalance}
      });
    }

    $scope.cancelP2PTransfer = function() {
      window.location.href = "/wallet/virtual_card/index"
    }

    $scope.$on("$destroy", function(){
        console.log("leaving p2p page")
        $localStorage.repeatTransaction = null
    });

}])

.controller('EwalletPaymentP2PReviewCtrl', ['$rootScope', '$scope', '$location', '$localStorage', 'Students', 'ngDialog', 'Ewallet', 'jwtHelper', function($rootScope, $scope, $location, $localStorage, Students, ngDialog, Ewallet, jwtHelper) {

    $scope.amount = $scope.ngDialogData.amount;
    $scope.sender = $scope.ngDialogData.sender;
    $scope.receiver = $scope.ngDialogData.receiver;
    $scope.newBalance = $scope.ngDialogData.newBalance || 0;


    $scope.reviewModalBack = function() {
      ngDialog.close()
    }

    $scope.performTransferOperation = function() {
      let data = {
      	userId:$scope.sender._id,
        type:"TRANSFER",
        senderId:$scope.sender._id,
        recieverId:$scope.receiver._id,
        amount:$scope.amount,
        status:"COMPLETED",
        description:"Peer to peer transfer to " + $scope.receiver.name,
        remark:"",
        subscriptionId:""
      }

      console.log("transfer data: ", data)
      Ewallet.ewalletTransaction(data).then(function(res){
        console.log(res)
        if(res.data.message == "Success"){
          $localStorage.repeatTransaction = null
          window.location.href = "/wallet/dashboard"
        }
      })
    }


}])

.controller('EwalletPaymentMethodCtrl', ['$rootScope', '$scope', '$location', '$localStorage', 'Students', 'ngDialog', 'Ewallet', function($rootScope, $scope, $location, $localStorage, Students, ngDialog, Ewallet) {
  $scope.fetchingPaymentMethods = true
  $scope.processing = false
  $scope.hasError = false
  $scope.errorMessage = ''
  $scope.apiSuccess = false
  $scope.successMessage = ''
  $scope.dropdownId = ""

  // GET USERS SAVED PAYMENT METHOD
  function loadpaymentMethods() {
    Ewallet.getCardPaymentMethods($localStorage.customerId).then(function(res) {
      $scope.fetchingPaymentMethods = false
      if(res.data.success) {
        $scope.paymentMethods = res.data.data.data
        console.log("payment methods: ", $scope.paymentMethods)
      }
    })

    Ewallet.getBankPaymentMethods($localStorage.customerId).then(function(res) {
      $scope.fetchingPaymentMethods = false
      if(res.data.success) {
        $scope.bankPaymentMethods = res.data.data.data
        console.log("bank payment methods: ", $scope.bankPaymentMethods)
      }
    })
  }

  loadpaymentMethods()

  $scope.showDropDown = function(id) {
    $scope.dropdownId = id
  }

  $scope.openErasePopup = function(card) {
    console.log("erase card id: ", card)
    ngDialog.open({
        template: 'eraseCardPopup',
        controller: 'EwalletPaymentMethodCtrl',
        data: { card: card },
        width: '50%',
        height: '40%',
        className: 'ngdialog-theme-default'
    });
  }

  $scope.openBlockPopup = function(card) {
    ngDialog.open({
        template: 'blockCardPopup',
        controller: 'EwalletPaymentMethodCtrl',
        data: { card: card },
        width: '50%',
        height: '40%',
        className: 'ngdialog-theme-default'
    });
  }

  $scope.eraseCardRequest = function() {
    let data = {
      customerId: $localStorage.customerId,
      id: $scope.ngDialogData.card.id
    }
    console.log("request card remove: ", data)
    Ewallet.removepaymentMethod(data)
    .then(function(res){
      console.log("res.data.success: ", res.data.success)
      console.log("res.data.msg: ", res.data.msg)
      if(res.data.success) {

        $scope.processing = false
        $scope.apiSuccess = true
        $scope.successMessage = res.data.msg
        $scope.closeErasePopup();
        loadpaymentMethods()
      }
    })
    .catch((err) => {
      console.log("error: ", err)
      $scope.processing = false
      $scope.hasError = true
      $scope.errorMessage = err.data.message
    });


  }

  $scope.blockCardRequest = function() {
      let cardId = $scope.ngDialogData.cardId
      $scope.blockLoading = true;
  }

  $scope.editCardRequest = function(card) {
      $localStorage.editCard = card
      window.location.href = "/wallet/payments/add"
  }

  $scope.closeErasePopup = function() {
    console.log("close erase popup")
      ngDialog.close();
  }

  $scope.closeBlockPopup = function() {
      ngDialog.close();
  }

}])

.controller('EwalletAddPaymentMethodCtrl', ['$rootScope', '$scope', '$location', '$localStorage', 'Students', 'ngDialog', 'StripeElements', 'Ewallet', 'jwtHelper', function($rootScope, $scope, $location, $localStorage, Students, ngDialog, StripeElements, Ewallet, jwtHelper) {
  $scope.hasError = false
  $scope.errorMessage = ""
  $scope.showCreditCardForm = false
  $scope.showBankAccountForm = true
  $scope.paymentType = "bank account"

  var d = new Date();
  $scope.yearLastTwo =  d.getFullYear() % 100;
  console.log("last two year: ", $scope.yearLastTwo)

  $scope.countries = ['AD','AE','AF','AG','AI','AL','AM','AO','AQ','AR','AS','AT','AU','AW','AX','AZ','BA','BB','BD','BE','BF','BG','BH','BI','BJ','BL','BM','BN','BO','BQ','BR','BS','BT','BV','BW','BY','BZ','CA','CC','CD','CF','CG','CH','CI','CK','CL','CM','CN','CO','CR','CU','CV','CW','CX','CY','CZ','DE','DJ','DK','DM','DO','DZ','EC','EE','EG','EH','ER','ES','ET','FI','FJ','FK','FM','FO','FR','GA','GB','GD','GE','GF','GG','GH','GI','GL','GM','GN','GP','GQ','GR','GS','GT','GU','GW','GY','HK','HM','HN','HR','HT','HU','ID','IE','IL','IM','IN','IO','IQ','IR','IS','IT','JE','JM','JO','JP','KE','KG','KH','KI','KM','KN','KP','KR','KW','KY','KZ','LA','LB','LC','LI','LK','LR','LS','LT','LU','LV','LY','MA','MC','MD','ME','MF','MG','MH','MK','ML','MM','MN','MO','MP','MQ','MR','MS','MT','MU','MV','MW','MX','MY','MZ','NA','NC','NE','NF','NG','NI','NL','NO','NP','NR','NU','NZ','OM','PA','PE','PF','PG','PH','PK','PL','PM','PN','PR','PS','PT','PW','PY','QA','RE','RO','RS','RU','RW','SA','SB','SC','SD','SE','SG','SH','SI','SJ','SK','SL','SM','SN','SO','SR','SS','ST','SV','SX','SY','SZ','TC','TD','TF','TG','TH','TJ','TK','TL','TM','TN','TO','TR','TT','TV','TW','TZ','UA','UG','UM','US','UY','UZ','VA','VC','VE','VG','VI','VN','VU','WF','WS','YE','YT','ZA','ZM','ZW'
]

  $scope.currencies = ['AED','AFN','ALL','AMD','ANG','AOA','ARS','AUD','AWG','AZN','BAM','BBD','BDT','BGN','BHD','BIF','BMD','BND','BOB','BRL','BSD','BTN','BWP','BYR','BZD','CAD','CDF','CHF','CLF','CLP','CNY','COP','CRC','CUP','CVE','CZK','DJF','DKK','DOP','DZD','EGP','ETB','EUR','FJD','FKP','GBP','GEL','GHS','GIP','GMD','GNF','GTQ','GYD','HKD','HNL','HRK','HTG','HUF','IDR','ILS','INR','IQD','IRR','ISK','JEP','JMD','JOD','JPY','KES','KGS','KHR','KMF','KPW','KRW','KWD','KYD','KZT','LAK','LBP','LKR','LRD','LSL','LTL','LVL','LYD','MAD','MDL','MGA','MKD','MMK','MNT','MOP','MRO','MUR','MVR','MWK','MXN','MYR','MZN','NAD','NGN','NIO','NOK','NPR','NZD','OMR','PAB','PEN','PGK','PHP','PKR','PLN','PYG','QAR','RON','RSD','RUB','RWF','SAR','SBD','SCR','SDG','SEK','SGD','SHP','SLL','SOS','SRD','STD','SVC','SYP','SZL','THB','TJS','TMT','TND','TOP','TRY','TTD','TWD','TZS','UAH','UGX','USD','UYU','UZS','VEF','VND','VUV','WST','XAF','XCD','XDR','XOF','XPF','YER','ZAR','ZMK','ZWL'
  ]

  // GET USER DETAILS
  let studentId = jwtHelper.decodeToken($localStorage.token)._id;
  Students.getStudentById(studentId).then(function(res) {
    $scope.user = res.data.data;
    console.log("customerID: ", $scope.user)
  })

  $scope.cardData = {}
  // BANK ACCOUNT FORM
  $scope.accountNumber = ""
  $scope.bankName = ""
  $scope.iban = ""
  $scope.routingNumber = ""
  $scope.country = ""
  $scope.currency = ""
  // CREDIT CARD FORM
  $scope.cardholderName = ""
  $scope.cardNumber = ""
  $scope.expiry = ""
  $scope.cvv = ""


  //
  //  CHECK LOCALSTORAGE FOR CARD EDIT
  //
  let editCard = $localStorage.editCard
  console.log("edit card: ", editCard)


  $scope.displayCreditCardForm = function() {
    $scope.paymentType = "credit card"
    $scope.showCreditCardForm = true
    $scope.showBankAccountForm = false
  }

  $scope.displayBankAccountForm = function() {
    $scope.paymentType = "bank account"
    $scope.showCreditCardForm = false
    $scope.showBankAccountForm = true
  }

  $scope.validateExpiryMonth = function() {
    $scope.hasError = false

    if ($scope.cardData.expiryMonth > 12) {
      $scope.hasError = true
      $scope.errorMessage = "INVALID_MONTH_NUMBER"
      return
    }
  }

  $scope.validateExpiryYear = function() {
    // $scope.hasError = false
    // if ($scope.cardData.expiryYear < $scope.yearLastTwo) {
    //   $scope.hasError = true
    //   $scope.errorMessage = "INVALID_YEAR_NUMBER"
    //   return
    // }
  }

  $scope.performAddPaymentMethodOperation = function() {
    $scope.hasError = false
    $scope.errorMessage = ""
    // getBkToken
    // { "currency": "usd", "country": "US", "holderName": "Kok Zhang", "holderType": "individual", "routingNumber": "110000000", "accountNumber": "000123456789" }
    // getCardToken
    // { "cardNumber": "4242424242424242", "expMonth": 12, "expYear": 2025, "cvc": 314 }
    // addPaymentMethod
    // { "customerId": "cus_IX7gGISMWVDosf", "source": "btok_1Hx8qHJq0JMleAeg15asUiF0" }

    $scope.hasError = false
    let cardData = {}

    //VALIDATE REQUEST DATA
    if ($scope.paymentType == "bank account"){
      if ($scope.cardData.accountNumber==undefined || $scope.cardData.accountNumber=='') {
        $scope.hasError = true
        $scope.errorMessage = "PLEASE_FILL_UP_ACCOUNT_NUMBER"
        return
      } else if ($scope.cardData.country==undefined || $scope.cardData.country=='') {
        $scope.hasError = true
        $scope.errorMessage = "PLEASE_FILL_UP_COUNTRY"
        return
      } else if ($scope.cardData.currency==undefined || $scope.cardData.currency=='') {
        $scope.hasError = true
        $scope.errorMessage = "PLEASE_FILL_UP_CURRENCY"
        return
      }

      $scope.cardData.type = "bank account"

      let bkdata = {
        currency: $scope.cardData.currency,
        country: $scope.cardData.country,
        holderName: $scope.cardData.cardholderName,
        holderType: $scope.cardData.accountHolderType,
        routingNumber: $scope.cardData.routingNumber,
        accountNumber: $scope.cardData.accountNumber
      }

      console.log('bkdata" ', bkdata)

      Ewallet.getBankAccountToken(bkdata).then(function(response){
        console.log("get bk token: ", response)
        if (response.data.success) {
          let data = {
            customerId: $scope.user.stripeId,
            source: response.data.token.id
          }
          Ewallet.addPaymentMethod(data).then(function(res){
            console.log("add payment method response: ", res)
            console.log(res.data.success)
            if (res.data.success) {
              window.location.href = "/wallet/payments"
            } else {
              $scope.hasError = true
              $scope.errorMessage = res.data.msg.message
            }
          }).catch((err) => {
            console.log("error: ", err)
          });
        } else {
          $scope.hasError = true
          $scope.errorMessage = response.data.msg.message
        }
      }).catch((err) => {
        console.log("error: ", err)
      });
    }

    if ($scope.paymentType == "credit card"){
      console.log("adding credit card")
      if ($scope.cardData.cardholderName==undefined || $scope.cardData.cardholderName=='') {
        $scope.hasError = true
        $scope.errorMessage = "PLEASE_FILL_UP_CARDHOLDERS_NAME"
        return
      } else if ($scope.cardData.number==undefined || $scope.cardData.number=='') {
        $scope.hasError = true
        $scope.errorMessage = "PLEASE_FILL_UP_CARD_NUMBER"
        return
      } else if ($scope.cardData.expiryMonth==undefined || $scope.cardData.expiryMonth=='') {
        $scope.hasError = true
        $scope.errorMessage = "PLEASE_FILL_UP_EXPIRY_MONTH"
        return
      } else if ($scope.cardData.expiryYear==undefined || $scope.cardData.expiryYear=='') {
        $scope.hasError = true
        $scope.errorMessage = "PLEASE_FILL_UP_EXPIRY_YEAR"
        return
      } else if ($scope.cardData.cvc==undefined || $scope.cardData.cvc=='') {
        $scope.hasError = true
        $scope.errorMessage = "PLEASE_FILL_UP_CVV"
        return
      } else if ($scope.cardData.expiryYear < $scope.yearLastTwo) {
        $scope.hasError = true
        $scope.errorMessage = "INVALID_YEAR_NUMBER"
        return
      }

      //
      //  CREATE STRIPE TOKEN USING CREDIT CARD DETAILS
      //

      let cdata = {
        cardNumber: $scope.cardData.number,
        expMonth: $scope.cardData.expiryMonth,
        expYear: $scope.cardData.expiryYear,
        cvc: $scope.cardData.cvc,
        holderName: $scope.cardData.cardholderName,
      }



      console.log('cdata" ', cdata)

      Ewallet.getCardToken(cdata).then(function(response){
        console.log("get card token: ", response)

        let data = {
          customerId: $scope.user.stripeId,
          source: response.data.token.id
        }
        Ewallet.addPaymentMethod(data).then(function(res){
          console.log("add payment method response: ", res)
          console.log(res.data.success)
          if (res.data.success) {
            window.location.href = "/wallet/payments"
          } else {

          }
        }).catch((err) => {
          console.log("error: ", err)
        });
      }).catch((err) => {
        console.log("error: ", err)
      });


      // let additionalData = {
      //     name: $scope.cardData.cardholderName
      // };
      // console.log("additional data: ", additionalData)
      // if ($scope.validationError==undefined) {
      //   console.log("creating token card: ", card)
      //     $scope.loading = true;
      //     StripeElements.createToken(card, additionalData).then(function(result) {
      //       console.log('create token: ', result)
      //         if (result.token) {
      //             // Send card to API, then use routes below
      //             let data = {
      //               customerId: $scope.user.stripeId,
      //               source: result.token.id
      //             }
      //
      //         } else {
      //             $scope.validationError = result.error.message;
      //             $scope.loading = false;
      //             $scope.$apply();
      //         }
      //         $scope.loading = false;
      //     });
      // } else {
      //   console.log("validation error")
      // }

    }

  }

}])

.controller('EwalletTransactionsDashboardCtrl', ['$rootScope', '$scope', '$location', '$localStorage', 'ngDialog', 'Ewallet', 'jwtHelper', 'sharedContext', function($rootScope, $scope, $location, $localStorage, ngDialog, Ewallet, jwtHelper, sharedContext) {
    $scope.fetchingTransactions = true
    $scope.amount;

    let studentId = jwtHelper.decodeToken($localStorage.token)._id;

    // GET ALL USER'S TRANSACTIONS
    Ewallet.getAllTransactions(studentId).then(function(res) {
      $scope.fetchingTransactions = false
      console.log("user transactions: ", res)
      if(res.data.message == 'Success') {
        $scope.transactions = res.data.result
      }
    })

    $scope.repeatTransaction = function(transaction) {
      //sharedContext.addData("Transaction", transaction)
      if(transaction.type.toLowerCase()=="transfer") {
        $localStorage.repeatTransaction = transaction
        window.location.href = "/wallet/payments/p2p"
      }
    }


}])

.service('walletBalance', function () {
  this.balance = null;
})

.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.ngEnter);
                });

                event.preventDefault();
            }
        });
    };
});
