'use strict';

angular.module('netbase', ['ngStorage',
    'ngRoute',
    'pascalprecht.translate',
    'ngDialog',
    'angular-jwt',
    'angularTrix',
    'ngFileUpload',
    'ngDialog',
    'angularMoment',
    'angularjs-stripe-elements',
    'chart.js'
])
.config(['$translateProvider', '$localStorageProvider', 'StripeElementsProvider', function ($translateProvider, $localStorageProvider, StripeElementsProvider) {

  let stripeKey = "pk_test_2XclbP1INDqkspKrbRn6oBZR";

  StripeElementsProvider.setAPIKey(stripeKey);

  $translateProvider.translations('en', {
    HOME_TITLE: 'YOUR CAMPUS ONLINE',
    HOME_SUBTITLE: 'Welcome to the biggest college market online',
    MYSTORE_MENU: 'my store',
    BUTTON_LANG_EN: 'english',
    CREATE_YOUR_STORE: 'create store',
    CATEGORY_BOOKS_TITLE: 'Books',
    CATEGORY_CELLPHONE_TITLE: 'Mobile phones'
  });

  $translateProvider.translations('pt', {
    HOME_TITLE: 'SEU CAMPUS ONLINE',
    HOME_SUBTITLE: 'Bem vindo ao maior mercado universitÃ¡rio online',
    MYSTORE_MENU: 'minha loja',
    BUTTON_LANG_EN: 'englisch',
    BUTTON_LANG_DE: 'deutsch',
    CREATE_YOUR_STORE: 'criar loja',
    CATEGORY_BOOKS_TITLE: 'Livros',
    CATEGORY_CELLPHONE_TITLE: 'Celulares',
    CATEGORY_HEADPHONES_TITLE: 'Fone'
  });

  $translateProvider.preferredLanguage('en');

}])

.run(function($rootScope, $location, $localStorage, $http, $route, $translate) {

  // Sees Index page just one time
  if ($localStorage.indexVisited == undefined) {
    $localStorage.indexVisited = false;
  }

  $rootScope.logged = $localStorage.logged;

  $rootScope.logout = function() {

    $rootScope.logged = false;
    $localStorage.logged = false;
    $localStorage.token = undefined;

    $location.path('/home');
    $route.reload();

  };

})

.config(['$routeProvider', '$httpProvider', '$locationProvider', function ($routeProvider, $httpProvider, $locationProvider) {

    let auth = {

        app: function($q, $location, $localStorage) {

          var deferred = $q.defer();

          deferred.resolve();

          let logged = $localStorage.logged;

          if (!logged) {
             $location.path('/');
          }

          return deferred.promise;

        }

   };

    $routeProvider.
        when('/a/:academiaName/', {
            templateUrl: 'partials/academia/academia.html',
            controller: 'AcademiaCtrl',
        })
        .when('/a/:academiaName/forum', {
            templateUrl: 'partials/academia/academiaforum.html',
            controller: 'AcademiaForumCtrl',
        })
        .when('/a/:academiaName/forum/post/create', {
            templateUrl: 'partials/academia/academiaforumpostcreate.html',
            controller: 'AcademiaForumPostCreateCtrl',
        })
        .when('/a/:academiaName/forum/post/id/:postId', {
            templateUrl: 'partials/academia/academiaforumpost.html',
            controller: 'AcademiaForumPostCtrl',
        })
        .when('/a/:academiaName/chat', {
            templateUrl: 'partials/academia/academiachat.html',
            controller: 'AcademiaChatCtrl',
        })
        .when('/a/:academiaName/marketplace', {
            templateUrl: 'partials/academia/academiasmp.html',
            controller: 'AcademiaSmpCtrl',
        })
        .when('/a/:academiaName/jobs', {
            templateUrl: 'partials/academia/academiajobs.html',
            controller: 'AcademiaJobsCtrl',
        })
        .when('/profile', {
            templateUrl: 'partials/profile.html',
            controller: 'ProfileCtrl',
        })
        .when('/login', {
            templateUrl: 'partials/account.html',
            controller: 'AccountCtrl',
        })
        .when('/signup', {
            templateUrl: 'partials/account.html',
            controller: 'AccountCtrl',
        })
        .when('/reset/password', {
            templateUrl: 'partials/resetpassword.html',
            controller: 'ResetPasswordCtrl',
        })
        .when('/reset/password/new', {
            templateUrl: 'partials/resetpasswordnew.html',
            controller: 'ResetPasswordNewCtrl',
        })
        .when('/messenger', {
            templateUrl: 'partials/messenger.html',
            controller: 'MessengerCtrl',
            resolve: auth
        })
        .when('/smp/listing/id/:id', {
            templateUrl: 'partials/smpproduct.html',
            controller: 'SmpListingCtrl',
        })
        .when('/profile/', {
            templateUrl: 'partials/profile.html',
            controller: 'ProfileCtrl',
        })
        .when('/dashboard/', {
            templateUrl: 'partials/dashboard.html',
            controller: 'DashboardCtrl',
            resolve: auth
        })
        .when('/dashboard/university', {
            templateUrl: 'partials/universityfeed.html',
            controller: 'DashboardUniversityFeedCtrl',
            resolve: auth
        })
        .when('/dashboard/a/subscribed', {
            templateUrl: 'partials/dashboard/academia/subscribed.html',
            controller: 'DashboardAcademiaSubscribedCtrl',
            resolve: auth
        })
        .when('/dashboard/a/premium', {
            templateUrl: 'partials/dashboard/academia/premium.html',
            controller: 'DashboardAcademiaPremiumCtrl',
            resolve: auth
        })
        .when('/dashboard/a/create', {
            templateUrl: 'partials/dashboard/academia/create.html',
            controller: 'DashboardAcademiaCreateCtrl',
            resolve: auth
        })
        .when('/dashboard/a/manage', {
            templateUrl: 'partials/dashboard/academia/manage.html',
            controller: 'DashboardAcademiaManageCtrl',
            resolve: auth
        })
        .when('/dashboard/a/manage/id/:id', {
            templateUrl: 'partials/dashboard/academia/managebyid.html',
            controller: 'DashboardAcademiaManageByIdCtrl',
            resolve: auth
        })
        .when('/dashboard/a/manage/id/:id/sales', {
            templateUrl: 'partials/dashboard/academia/managebyidsales.html',
            controller: 'DashboardAcademiaManageByIdSalesCtrl',
            resolve: auth
        })
        .when('/dashboard/a/manage/id/:id/premium', {
            templateUrl: 'partials/dashboard/academia/managebyidpremium.html',
            controller: 'DashboardAcademiaManageByIdPremiumCtrl',
            resolve: auth
        })
        .when('/dashboard/a/manage/id/:id/users', {
            templateUrl: 'partials/dashboard/academia/managebyidusers.html',
            controller: 'DashboardAcademiaManageByIdUsersCtrl',
            resolve: auth
        })
        .when('/dashboard/a/manage/id/:id/users/id/:userId', {
            templateUrl: 'partials/dashboard/academia/managebyidusersbyid.html',
            controller: 'DashboardAcademiaManageByIdUsersByIdCtrl',
            resolve: auth
        })
        .when('/dashboard/smp/create', {
            templateUrl: 'partials/smpcreate.html',
            controller: 'DashboardSmpCreateCtrl',
            resolve: auth
        })
        .when('/dashboard/smp/manage', {
            templateUrl: 'partials/smpmanage.html',
            controller: 'DashboardSmpManageCtrl',
            resolve: auth
        })
        .when('/dashboard/smp/manage/listing/:id/edit', {
            templateUrl: 'partials/smpmanagelistingedit.html',
            controller: 'DashboardSmpManageListingEditCtrl',
            resolve: auth
        })
        .when('/dashboard/smp/manage/listing/:id/stats', {
            templateUrl: 'partials/smpmanagelistingstats.html',
            controller: 'DashboardSmpManageListingStatsCtrl',
            resolve: auth
        })
        .when('/dashboard/smp/iwant', {
            templateUrl: 'partials/smpmanageiwant.html',
            controller: 'DashboardSmpManageIwantCtrl',
            resolve: auth
        })
        .when('/dashboard/jobs/mylistings', {
            templateUrl: 'partials/jobsmanagemylistings.html',
            controller: 'DashboardJobsManageMyListingsCtrl',
            resolve: auth
        })
        .when('/dashboard/payments/wallet', {
            templateUrl: 'partials/dashboard/payments/wallet.html',
            controller: 'DashboardPaymentsWalletCtrl',
            resolve: auth
        })
        .when('/search', {
            templateUrl: 'partials/search.html',
            controller: 'SearchCtrl',
        })
        .when('/home', {
            templateUrl: 'partials/home/home.html',
            controller: 'HomeCtrl',
        })
        .when('/home/empregos/', {
            templateUrl: 'partials/home/homejobs.html',
            controller: 'HomeJobsCtrl',
        })
        .when('/home/empregos/categoria/:nome', {
            templateUrl: 'partials/home/homejobscategory.html',
            controller: 'HomeJobsCategoryCtrl',
        })
        .when('/home/colleges/', {
            templateUrl: 'partials/home/homeuniversidades.html',
            controller: 'HomeUniversidadesCtrl',
        })
        .when('/home/smp', {
            templateUrl: 'partials/home/homesocialmarketplace.html',
            controller: 'HomeSocialMarketPlaceCtrl',
        })
        .when('/home/smp/hashtag/:hash', {
            templateUrl: 'partials/home/homesocialmarketplacehashtag.html',
            controller: 'HomeSocialMarketPlaceHashTagCtrl',
        })
        .otherwise({
          redirectTo: '/home'
        });

        if(window.history && window.history.pushState){
          $locationProvider.html5Mode(true);
        }

    $httpProvider.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded';
    $httpProvider.defaults.headers.post['Content-Type'] =  'application/x-www-form-urlencoded';

    $httpProvider.interceptors.push(['$q', '$location', '$localStorage', function($q, $location, $localStorage) {

          return {
              'request': function (config) {
                  config.headers = config.headers || {};
                  if ($localStorage.token) {
                      config.headers.Authorization = 'Bearer ' + $localStorage.token;
                      config.headers['x-access-token'] = $localStorage.token;
                  }
                  return config;
              }
          }

    }]);

}]);
