'use strict';

angular.module('netbase', [
    '720kb.socialshare',
    'ngStorage',
    'ngRoute',
    'ngCookies',
    'ui.tinymce',
    'pascalprecht.translate',
    'ngDialog',
    'angular-jwt',
    'angularTrix',
    'ngFileUpload',
    'ngDialog',
    'angularMoment',
    'angularjs-stripe-elements',
    'chart.js',
    'dibari.angular-ellipsis',
    'ngSanitize',
    'infinite-scroll',
    'updateMeta',
    'as.sortable',
    'oc.lazyLoad'
])

.config(['$translateProvider', '$localStorageProvider', 'StripeElementsProvider', function($translateProvider, $localStorageProvider, StripeElementsProvider) {
    // let stripeKey = "pk_live_ZBmOf7GNQ13AIEGeP9WkPv3M";
    let stripeKey = "pk_test_2XclbP1INDqkspKrbRn6oBZR";

    //AnalyticsProvider.setAccount('UA-125408424-1');

    StripeElementsProvider.setAPIKey(stripeKey);

    $translateProvider.useStaticFilesLoader({
        prefix: 'locales/locale-',
        suffix: '.json'
    });

    //console.log("route provider is saying: ")
    //console.log(window.location.href)

    let url = window.location.href;
    //let url = "https://universida.de/home/explore"
    //let url = "https://colle.ge/home/explore"

    $translateProvider.preferredLanguage('en');

    if (url.indexOf('colle.ge') > 0) {
        $translateProvider.preferredLanguage('en');
    } else if (url.indexOf('universida.de') > 0) {
        $translateProvider.preferredLanguage('pt');
    } else {
        $translateProvider.preferredLanguage('en');
    }

    $translateProvider.useSanitizeValueStrategy('escape')

}])

.config(['$routeProvider', '$httpProvider', '$locationProvider', function($routeProvider, $httpProvider, $locationProvider) {
    let auth = {
        app: function($q, $location, $localStorage) {
            var deferred = $q.defer();
            deferred.resolve();
            let logged = $localStorage.logged;

            if (!logged) {
                $location.path('/home/landing');
            }
            return deferred.promise;
        }
    };

    $routeProvider.
    when('/onboarding/universities', {
            templateUrl: 'partials/onboarding/universities.html',
            controller: 'OnboardingUniversitiesScreenCtrl',
        })
        .when('/onboarding/universities/create', {
            templateUrl: 'partials/onboarding/universitycreate/create.html',
            controller: 'OnboardingUniversityCreateCtrl',
            resolve: auth
        })
        .when('/onboarding/signup', {
            templateUrl: 'partials/onboarding/signupstep1.html',
            controller: 'OnboardingSignUpScreenCtrl',
        })
        .when('/p/create', {
            templateUrl: 'partials/playlist/create.html',
            controller: 'PlaylistCreateCtrl',
        })
        .when('/sobre', {
            templateUrl: 'partials/sobre/index.html',
            controller: 'SobreIndexCtrl',
        })
        .when('/cursos/id/:id', {
            templateUrl: 'partials/courses/byid.html',
            controller: 'CoursesByIdCtrl',
        })
        .when('/quiz-result/:qid/:rid/:uid', {
            templateUrl: 'partials/courses/quiz/quizResult.html',
            controller: 'CoursesQuizResultCtrl',
        })
        .when('/cursos/suite/updateQuiz/:id', {
            templateUrl: 'partials/courses/suite/updateQuiz.html',
            controller: 'CoursesUpdateQuizCtrl',
        })
        .when('/cursos/id/:id/estudar', {
            templateUrl: 'partials/courses/estudar.html',
            controller: 'CoursesEstudarCtrl',
        })
        .when('/cursos/id/view/document/:id/:videoid/:post_id', {
            templateUrl: 'partials/courses/estudar/document.html',
            controller: 'CoursesEstudarTypeDocumentCtrl',
        })
        .when('/cursos/id/test/quiz/:id/:videoid/:post_id', {
            templateUrl: 'partials/courses/estudar/quiz.html',
            controller: 'CoursesEstudarTypeQuizCtrl',
        })
        .when('/cursos/id/:id/timeline', {
            templateUrl: 'partials/courses/dashboard/index.html',
            controller: 'CoursesByIdDashboardCtrl',
        })
        .when('/cursos/id/:id/modulos', {
            templateUrl: 'partials/courses/dashboard/modulo.html',
            controller: 'CoursesByIdDashboardModuloCtrl',
        })
        .when('/cursos/suite/criar', {
            templateUrl: 'partials/courses/suite/criar.html',
            controller: 'CoursesCriarCtrl',
        })
        .when('/cursos/suite/', {
            templateUrl: 'partials/courses/suite/index.html',
            controller: 'CoursesSuiteIndexCtrl',
        })
        .when('/cursos/a/:universityid/suite/modulos', {
            templateUrl: 'partials/courses/suite/modulos.html',
            controller: 'CoursesModulosCtrl',
        })
        .when('/cursos/a/:universityid/suite/owner/view/:id', {
            templateUrl: 'partials/courses/suite/modulos-course.html',
            controller: 'CoursesModulosSingleCtrl',
        })
        .when('/cursos/a/:universityid/suite/createPage/:id', {
            templateUrl: 'partials/courses/suite/createPage.html',
            controller: 'CoursesCreatePageCtrl',
        })
        .when('/cursos/suite/editPage/:id', {
            templateUrl: 'partials/courses/suite/createPage.html',
            controller: 'CoursesEditPageCtrl',
        })
        .when('/cursos/suite/createQuiz/:id', {
            templateUrl: 'partials/courses/suite/createQuiz.html',
            controller: 'CoursesCreateQuizCtrl',
        })
        .when('/cursos/suite/createForumpost/:id', {
            templateUrl: 'partials/courses/modals/video-forum-content.html',
            controller: 'CoursesVideoForumContentCtrl',
        })
        .when('/cursos/suite/editForumpost/:id', {
            templateUrl: 'partials/courses/modals/video-forum-content.html',
            controller: 'editVideoForumContentCtrl',
        })
        .when('/cursos/a/:universityid/suite/content', {
            templateUrl: 'partials/courses/suite/content.html',
            controller: 'CoursesContentModulosCtrl',
        })
        .when('/cursos/a/:universityid/suite/modulos/id/:id', {
            templateUrl: 'partials/courses/suite/modulosbyid.html',
            controller: 'CoursesModulosByIdCtrl',
        })
        .when('/cursos/a/:universityid/suite/owner', {
            templateUrl: 'partials/courses/suite/owner.html',
            controller: 'CoursesOwnerCtrl',
        })
        .when('/cursos/suite/createContent', {
            templateUrl: 'partials/courses/suite/createPage.html',
            controller: 'CoursesCreateContentCtrl',
        })
        .when('/cursos/suite/createPage', {
            templateUrl: 'partials/courses/suite/createPage.html',
            controller: 'CoursesCreatePageCtrl',
        })
        .when('/cursos/suite/createQuiz', {
            templateUrl: 'partials/courses/suite/createQuiz.html',
            controller: 'CoursesCreateQuizCtrl',
        })
        .when('/v/id/:videoId', {
            templateUrl: 'partials/video/videowatch.html',
            controller: 'VideoWatchCtrl',
        })
        .when('/v/create', {
            templateUrl: 'partials/video/create.html',
            controller: 'VideoCreateCtrl',
        })
        .when('/a/:academiaName/landing/:step', {
            templateUrl: 'partials/landing/fb/landingone.html',
            controller: 'AcademiaLandingCtrl'
        })
        .when('/a/:academiaName/', {
            templateUrl: 'partials/academia/academia.html',
            controller: 'AcademiaCtrl',
        })
        .when('/a/:academiaName/videostudio', {
            templateUrl: 'partials/academia/academiavideostudio.html',
            controller: 'AcademiaStudioCtrl',
        })
        .when('/a/:academiaName/driver/', {
            templateUrl: 'partials/academia/academiadriver.html',
            controller: 'AcademiaDriverCtrl',
        })
        .when('/a/:academiaName/handanalysis/', {
            templateUrl: 'partials/handanalysis/index.html',
            controller: 'AcademiaHandAnalysisCtrl',
        })
        .when('/a/:academiaName/handanalysis/id/:id', {
            templateUrl: 'partials/handanalysis/handbyid.html',
            controller: 'AcademiaHandAnalysisByIdCtrl',
        })
        .when('/a/:academiaName/handanalysis/create', {
            templateUrl: 'partials/handanalysis/create.html',
            controller: 'AcademiaHandAnalysisCreateCtrl',
        })
        .when('/a/:academiaName/training', {
            templateUrl: 'partials/academia/academiatraining.html',
            controller: 'AcademiaTrainingCtrl',
        })
        .when('/a/:academiaName/forum', {
            templateUrl: 'partials/academia/academiaforum.html',
            controller: 'AcademiaForumCtrl',
        })
        .when('/a/:academiaName/cursos', {
            templateUrl: 'partials/academia/courses/academiacourses.html',
            controller: 'AcademiaCoursesCtrl',
        })
        .when('/a/:academiaName/classroom', {
            templateUrl: 'partials/academia/classrooms/academiaclassrooms.html',
            controller: 'AcademiaClassroomsCtrl',
        })
        .when("/a/university/:academiaName/roomid/:roomSID/accountid/:accountSid/roomname/:roomName", {
            templateUrl: 'partials/academia/classrooms/academiaclassroom.html',
            controller: 'AcademiaClassroomCtrl',
        })
        .when('/a/:academiaName/timeline', {
            templateUrl: 'partials/academia/academiatimeline.html',
            controller: 'AcademiaTimelineCtrl',
        })
        .when('/a/:academiaName/playlist/all', {
            templateUrl: 'partials/academia/academiaplaylist.html',
            controller: 'AcademiaPlaylistsCtrl',
        })
        .when('/a/:academiaName/playlist/id/:playlistId', {
            templateUrl: 'partials/academia/academiaplaylistbyid.html',
            controller: 'AcademiaPlaylistsByIdCtrl',
        })
        .when('/a/:academiaName/forum/category/all', {
            templateUrl: 'partials/academia/academiaforumcategoryall.html',
            controller: 'AcademiaForumCategoryAllCtrl',
        })
        .when('/a/:academiaName/forum/category/id/:categoryId', {
            templateUrl: 'partials/academia/academiaforumcategorybyid.html',
            controller: 'AcademiaForumCategoryByIdCtrl',
        })
        .when('/a/:academiaName/forum/category/create', {
            templateUrl: 'partials/academia/academiaforumcategorycreate.html',
            controller: 'AcademiaForumCategoryCreateCtrl',
        })
        .when('/a/:academiaName/forum/post/create', {
            templateUrl: 'partials/academia/academiaforumpostcreate.html',
            controller: 'AcademiaForumPostCreateCtrl',
            resolve: auth
        })
        .when('/a/:academiaName/forum/post/id/:postId', {
            templateUrl: 'partials/academia/academiaforumpost.html',
            controller: 'AcademiaForumPostCtrl',
        })
        .when('/a/:academiaName/forum/post/id/:postId/update', {
            templateUrl: 'partials/academia/academiaforumpostupdate.html',
            controller: 'AcademiaForumPostUpdateCtrl',
            resolve: auth
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
        .when("/a/university/:academiaName/roomid/:roomSID/accountid/:accountSid/roomname/:roomName", {
            templateUrl: 'partials/academia/classrooms/academiaclassroom.html',
            controller: 'AcademiaClassroomCtrl',
        })
        .when('/ensinar', {
            templateUrl: 'partials/teach/home.html',
            controller: 'TeachSalesCtrl',
        })
        .when('/ensinar/preco', {
            templateUrl: 'partials/teach/pricing.html',
            controller: 'TeachSalesPricingCtrl',
        })
        .when('/perfil', {
            templateUrl: 'partials/profile/profile.html',
            controller: 'ProfileCtrl',
        })
        .when('/perfil/editar', {
            templateUrl: 'partials/profile/profileedit.html',
            controller: 'ProfileEditCtrl',
        })
        .when('/login', {
            templateUrl: 'partials/account.html',
            controller: 'AccountCtrl',
        })
        .when('/verify', {
            templateUrl: 'partials/verification.html',
            controller: 'AccountCtrl',
        })
        .when('/p/:studentUsername', {
            templateUrl: 'partials/profile/profilebyusername.html',
            controller: 'ProfileByUsernameCtrl',
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
        .when('/dashboard/a/manage/id/:id/sales/y/:y/m/:m/', {
            templateUrl: 'partials/dashboard/academia/managebyidsalesdates.html',
            controller: 'DashboardAcademiaManageByIdSalesDatesCtrl',
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
        .when('/wallet', {
            templateUrl: 'partials/dashboard/wallet/wallet.html',
            controller: 'WalletCtrl',
            resolve: auth
        })
        .when('/dashboard/orders', {
            templateUrl: 'partials/dashboard/orders/orders.html',
            controller: 'DashboardOrdersCtrl',
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
        .when('/apartments', {
            templateUrl: 'partials/apartments/index.html',
            controller: 'ApartmentsIndexCtrl',
        })
        .when('/iniciar', {
            templateUrl: 'partials/home/iniciar.html',
            controller: 'IniciarCtrl',
        })
        .when('/home/create', {
            templateUrl: 'partials/home/homecreate.html',
            controller: 'HomeCreateCtrl',
        })
        .when('/home/cursos', {
            templateUrl: 'partials/home/homecourses.html',
            controller: 'HomeCoursesCtrl',
        })
        .when('/home/explore', {
            templateUrl: 'partials/home/homestudentexplore.html',
            controller: 'HomeExploreCtrl'
        })
        .when('/home/landing', {
            templateUrl: 'partials/home/homelanding.html',
            controller: 'HomeLandingCtrl'
        })
        .when('/home/curadoria', {
            templateUrl: 'partials/home/curatorship.html',
            controller: 'HomeCuratorship'
        })
        .when('/home/curadoria/id/:id', {
            templateUrl: 'partials/home/curatorshipbyid.html',
            controller: 'HomeCuratorshipById'
        })
        .when('/home/calls', {
            templateUrl: 'partials/home/userclassrooms.html',
            controller: 'HomePersonalClassroom',
            resolve: auth
        })
        .when('/home/timeline', {
            templateUrl: 'partials/home/hometimeline.html',
            controller: 'HomeTimelineCtrl',
            resolve: auth
        })
        .when('/home/noticias', {
            templateUrl: 'partials/home/homenews.html',
            controller: 'HomeNoticiasCtrl',
        })
        .when('/home/conhecimento/', {
            templateUrl: 'partials/home/hometopic.html',
            controller: 'HomeTopicCtrl',
        })
        .when('/home/c/:url/', {
            templateUrl: 'partials/topic/topichome.html',
            controller: 'HomeTopicUrlCtrl',
        })
        .when('/home/c/:url/u', {
            templateUrl: 'partials/topic/topicacademia.html',
            controller: 'HomeTopicUrlAcademiaCtrl',
        })
        .when('/home/c/:url/posts', {
            templateUrl: 'partials/topic/topicposts.html',
            controller: 'HomeTopicUrlPostsCtrl',
        })
        .when('/home/c/:url/cursos', {
            templateUrl: 'partials/topic/topiccursos.html',
            controller: 'HomeTopicUrlCoursesCtrl',
        })
        .when('/home/c/:url/opiniao', {
            templateUrl: 'partials/topic/topicopiniao.html',
            controller: 'HomeTopicUrlOpiniaoCtrl',
        })
        .when('/home/empregos/', {
            templateUrl: 'partials/home/homejobs.html',
            controller: 'HomeJobsCtrl',
        })
        .when('/home/empregos/categoria/:nome', {
            templateUrl: 'partials/home/homejobscategory.html',
            controller: 'HomeJobsCategoryCtrl',
        })
        .when('/home/universidades/', {
            templateUrl: 'partials/home/homeuniversidades.html',
            controller: 'HomeUniversidadesCtrl',
        })
        .when('/home/universidades/user', {
            templateUrl: 'partials/home/homeuseruniversidades.html',
            controller: 'HomeUserUniversidadesCtrl',
            resolve: auth
        })
        .when('/home/smp', {
            templateUrl: 'partials/home/homesocialmarketplace.html',
            controller: 'HomeSocialMarketPlaceCtrl',
        })
        .when('/home/smp/hashtag/:hash', {
            templateUrl: 'partials/home/homesocialmarketplacehashtag.html',
            controller: 'HomeSocialMarketPlaceHashTagCtrl',
        })
        .when('/wallet/dashboard', {
            templateUrl: 'partials/ewallet/dashboard.html',
            controller: 'EwalletDashboardCtrl',
            resolve: auth
        })
        .when('/wallet/transaction/history', {
            templateUrl: 'partials/ewallet/transactions.html',
            controller: 'EwalletTransactionsDashboardCtrl',
            resolve: auth
        })
        .when('/wallet/payments', {
            templateUrl: 'partials/ewallet/payments.html',
            controller: 'EwalletPaymentMethodCtrl',
            resolve: auth
        })
        .when('/wallet/payments/add', {
            templateUrl: 'partials/ewallet/add_payment_method.html',
            controller: 'EwalletAddPaymentMethodCtrl',
            resolve: auth
        })
        .when('/wallet/payments/p2p', {
            templateUrl: 'partials/ewallet/payment_p2p.html',
            controller: 'EwalletPaymentP2PCtrl',
            resolve: auth
        })
        .when('/wallet/virtual_card/request', {
            templateUrl: 'partials/ewallet/card_request.html',
            controller: 'EwalletCardsRequestCtrl',
            resolve: auth
        })
        .when('/wallet/virtual_card/index', {
            templateUrl: 'partials/ewallet/virtual_cards.html',
            controller: 'EwalletCardsCtrl',
            resolve: auth
        })
        .when('/wallet/funds/add/amount', {
            templateUrl: 'partials/ewallet/topup.html',
            controller: 'EwalletTopupCtrl',
            resolve: auth
        })
        .when('/wallet/funds/add/method', {
            templateUrl: 'partials/ewallet/addMethod.html',
            controller: 'EwalletCardsCtrl',
            resolve: auth
        })
        .when('/', {
            templateUrl: 'partials/index.html',
            controller: 'IndexCtrl',
        })
        .otherwise({
            redirectTo: '/home/landing'
        });

    if (window.history && window.history.pushState) {
        $locationProvider.html5Mode(true);
    }

    $httpProvider.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded';
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

    $httpProvider.interceptors.push(['$q', '$location', '$localStorage', function($q, $location, $localStorage) {
        return {
            'request': function(config) {
                config.headers = config.headers || {};
                if ($localStorage.token) {
                    config.headers.Authorization = 'Bearer ' + $localStorage.token;
                    config.headers['x-access-token'] = $localStorage.token;
                }
                return config;
            }
        }
    }]);
}])

.run(function($rootScope, $location, $localStorage, $http, $route, $translate, amMoment) {
    // Sees Index page just one time
    if ($localStorage.indexVisited == undefined) {
        $localStorage.indexVisited = false;
    }


    // check localStorage for set language
    // if (currentLanguage == "en-US") {
    //     $translate.use("en")
    //     amMoment.changeLocale('en');
    // } else {
    //     $translate.use("pt")
    //     amMoment.changeLocale('pt-br');
    //     $localStorage.setLanguage = "pt"
    // }

    let url = window.location.href;
    //let url = "https://universida.de/home/explore"

    amMoment.changeLocale('en');
    $localStorage.company_logo = "img/college_logo.png"
    $localStorage.user_language = "EN";

    if (url.indexOf('colle.ge') > 0) {
        amMoment.changeLocale('en');
        $localStorage.company_logo = "img/college_logo.png";
        $localStorage.user_language = "EN";
    } else if (url.indexOf('universida.de') > 0) {
        amMoment.changeLocale('pt-br');
        $localStorage.company_logo = "img/universidade_logo.png"
        $localStorage.user_language = "PT";
    } else {
        amMoment.changeLocale('en');
        $localStorage.company_logo = "img/college_logo.png"
        $localStorage.user_language = "EN";
    }

    $rootScope.logged = $localStorage.logged;
    $rootScope.logout = function() {

        $localStorage.$reset();

        if (url.indexOf('colle.ge') > 0) {
            amMoment.changeLocale('en');
            $localStorage.company_logo = "img/college_logo.png";
            $localStorage.user_language = "EN";
        } else if (url.indexOf('universida.de') > 0) {
            amMoment.changeLocale('pt-br');
            $localStorage.company_logo = "img/universidade_logo.png"
            $localStorage.user_language = "PT";
        } else {
            amMoment.changeLocale('en');
            $localStorage.company_logo = "img/college_logo.png"
            $localStorage.user_language = "EN";
        }

        $rootScope.logged = false;
        $localStorage.logged = false;
        $localStorage.token = undefined;

        $location.path('/home/landing');
        $route.reload();
    };
});