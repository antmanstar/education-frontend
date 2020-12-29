'use strict';

angular.module('netbase')

.controller('WalletCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'Payments', '$localStorage', 'jwtHelper', 'Students', 'ngDialog', '$window', function($rootScope, $scope, $location, $route, University, Payments, $localStorage, jwtHelper, Students, ngDialog, $window) {
    let studentId;

    if ($localStorage.token != undefined && $localStorage.token != null) {
        studentId = jwtHelper.decodeToken($localStorage.token)._id;
    }

    Students.getCards().success(function(res) {
        let data = res.data;
        let success = res.success;

        if (success) {
            $scope.cards = data.sources.data;
            console.log("card details: ", $scope.cards)
        }
    });

    $scope.lastpageReturn = function() {
        $window.history.back();
    }

    $scope.addCard = function() {
        ngDialog.open({ template: 'partials/modals/payments.html', controller: 'PaymentsCtrl', className: 'ngdialog-theme-default', data: { flow: "addCard", page: "cardAdd" } });
    }

    Payments.getAllOrders(studentId).success(function(res) {
        $scope.orders = res.data;
    });
}])

.controller('DashboardOrdersCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'Payments', '$localStorage', 'jwtHelper', function($rootScope, $scope, $location, $route, University, Payments, $localStorage, jwtHelper) {
    let studentId;

    if ($localStorage.token != undefined && $localStorage.token != null) {
        studentId = jwtHelper.decodeToken($localStorage.token)._id;
    }

    Payments.getAllOrders(studentId).success(function(res) {
        $scope.orders = res.data;
    });
}])

.controller('DashboardAcademiaCreateCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', function($rootScope, $scope, $location, $route, University) {
    $scope.step = 1;
    $scope.loading = false

    //
    // DETERMINE THE LANGUAGE
    //
    let url = window.location.href;
    if (url.indexOf('universida.de') > 0) {
      $scope.language = "PT"
    } else {
      $scope.language = "EN"
    }


    /* background image */
    $scope.backgroundImage = "https://universida.de/img/misc/noimageacademia.jpg";

    $scope.backgroundImageUpdate = function() {
        // Bug if undefined.

        let backgroundImage = $("#file").attr("value");

        if (backgroundImage.indexOf("https") != -1) {
          $scope.backgroundImage = backgroundImage;
          console.log("backgroundImage: ", $scope.backgroundImage)
        }

    }

    $scope.removeBtn = function() {
      console.log("remove background")
      $("#university-background-image").attr("style", "background-image: url('https://universida.de/img/misc/noimageacademia.jpg')");
      $("#file").attr("value", 'https://universida.de/img/misc/noimageacademia.jpg');
      $scope.backgroundImage = "https://universida.de/img/misc/noimageacademia.jpg";
    }

    /* step 1 */
    $scope.move = function(value) {
      $scope.error.exists = false;

      // Only allow alpanumeric characters, dash and underscore ^[a-zA-Z0-9]+(?:[\w -]*[a-zA-Z0-9]+)*$
      let urlpattern = new RegExp(/^[a-zA-Z0-9_-]*$/)

      //
      // VALIDATION
      //  only description field is optional
      //

      if ($scope.step==2 && value==1) {

        console.log("perform validation")
        if ($scope.name == undefined || $scope.name == '') {
            $scope.error.text = "UNI_CREATE_NAME_EMPTY";
            $scope.error.exists = true;
            return
        }

        if ($scope.url == undefined || $scope.url == '') {
            $scope.error.text = "UNI_CREATE_URL_EMPTY";
            $scope.error.exists = true;
            return
        }

        if (!urlpattern.test($scope.url)) {
          $scope.error.text = "UNI_CREATE_URL_INVALID";
          $scope.error.exists = true;
          return
        }

        if ($scope.language == undefined) {
            $scope.error.text = "UNI_CREATE_SELECT_LANGUAGE";
            $scope.error.exists = true;
            return
        }

      }

      $scope.step += Number(value);

      if ($scope.step==3){
        $scope.backgroundImageUpdate();
      }

    }

    $scope.error = {
        text: [],
        exists: false
    }

    $scope.displayError = function(e) {
        let txt = "";
        for (var i = 0; i < e.length; i++) {
            if (i + 1 == e.length) {
                //end
                txt += e[i]
            } else {
                txt += e[i] + ", ";
            }
        }
        return txt;
    }

    $scope.create = function() {
      $scope.loading = true

      let data = {
          name: $scope.name,
          about: $scope.about,
          url: $scope.url,
          language: $scope.language
      };

      console.log("data: ", data)

      let backgroundImage = $("#file").attr("value");

      // Error while checking. If undefined, bugs
      if (backgroundImage != undefined) {
        if (backgroundImage.indexOf("https://") != -1) {
            data.backgroundImage = backgroundImage;
        }
      }

      University.create(data).success(function(res) {
        $scope.loading = false
        if (res.success) {
          $location.path('/a/' + res.data.url + '/forum');
        } else {
          console.log("create university error response: ", res)
          if (res.err.code == 11000) {
              $scope.error.text = "UNI_CREATE_URL_EXISTS";
              $scope.error.exists = true;
          }
        }
      });

    }
}])

/* manage */
.controller('DashboardAcademiaManageCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'User', function($rootScope, $scope, $location, $route, University, User) {
    $scope.manage = function(id) {
        $location.path('/dashboard/a/manage/id/' + id);
    }

    /* Get all universities by id */
    University.getUniversitiesByOwnerId(User.getId()).success(function(res) {
        if (res.success) {
            $scope.universities = res.data;
            console.log("universities: ", $scope.universities)
        }
    });
}])

.controller('DashboardAcademiaManageByIdCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', function($rootScope, $scope, $location, $route, University) {
    let universityId = $route.current.params.id;
    $scope.success = false;

    $scope.premiumMembers = 0;

    University.getUniversityById(universityId).success(function(res) {
        if (res.success) {
            $scope.university = res.data;

            for (let idx = 0; idx < $scope.university.members.length; idx++) {
                let member = $scope.university.members[idx];

                if (member.privilege == 10) {
                    $scope.premiumMembers += 1;
                }
            }
        }
    });

    $scope.update = function() {
        let data = {};

        if ($scope.name != undefined) {
            data.name = $scope.name;
        }

        if ($scope.about != undefined) {
            data.about = $scope.about;
        }

        if ($scope.url != undefined) {
            data.url = $scope.url;
        }

        University.update(universityId, data).success(function(res) {
            if (res.success) {
                $scope.university = res.data;
                $scope.success = true;


                University.storeLocal($scope.university);
            }
        });
    }
}])

/* Premium */
.controller('DashboardAcademiaManageByIdPremiumCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'Students', function($rootScope, $scope, $location, $route, University, Students) {
    let universityId = $route.current.params.id;
    $scope.haserror = false;
    $scope.errorMessage = "";

    /* get universities */
    let getUniversity = University.getUniversityById(universityId);

    getUniversity.success(function(res) {
        if (res.success) {
            $scope.university = res.data;
        }
    });

    /* functions */
    $scope.createPlan = function() {
      $scope.haserror = false;
      console.log("name: ", $scope.name)
      console.log("amount: ", $scope.amount)
      console.log("interval: ", $scope.interval)
      console.log("intervalCount: ", $scope.intervalCount)
      //validation
      if (($scope.amount == "" || $scope.amount == undefined) &&
          ($scope.name == "" || $scope.name == undefined) &&
          ($scope.interval == "" || $scope.interval == undefined) &&
          ($scope.intervalCount == "" || $scope.intervalCount == undefined)) {
            $scope.haserror = true;
            $scope.errorMessage = "PLEASE_FILL_UP_ALL_FIELDS";
            return
      } else if (($scope.name == "" || $scope.name == undefined)) {
        $scope.haserror = true;
        $scope.errorMessage = "PLEASE_FILL_UP_NAME_FIELD";
        return
      } else if (($scope.amount == "" || $scope.amount == undefined)) {
        $scope.haserror = true;
        $scope.errorMessage = "PLEASE_FILL_UP_AMOUNT_FIELD";
        return
      } else if (($scope.intervalCount == "" || $scope.intervalCount == undefined)) {
        $scope.haserror = true;
        $scope.errorMessage = "PLEASE_FILL_UP_INTERVAL_FIELD";
        return
      } else if (($scope.interval == "" || $scope.interval == undefined)) {
        $scope.haserror = true;
        $scope.errorMessage = "PLEASE_FILL_UP_INTERVAL_PERIOD";
        return
      } else if ($scope.intervalCount > 31) {
        $scope.haserror = true;
        $scope.errorMessage = "INTERVAL_COUNT_REACHED";
        return
      }

        let amount = parseFloat(Math.round($scope.amount * 100) / 100).toFixed(2);
        amount = (amount * 100);

        let data = {
            amount: Number(amount),
            name: $scope.name,
            interval: $scope.interval,
            intervalCount: $scope.intervalCount
        };

        if ($scope.trialPeriodDays != undefined) {
            data.trialPeriodDays = $scope.trialPeriodDays;
        }

        University.createPlan(universityId, data).success(function(res) {
          console.log("create plan: ", res)
            if (res.success) {
                $route.reload();
            }
        });
    }

    /* close dialog */
    $rootScope.$on('ngDialog.closed', function(e, $dialog) {
        $route.reload();
    });
}])

.controller('DashboardAcademiaManageByIdUsersCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'Students', function($rootScope, $scope, $location, $route, University, Students) {
    let universityId = $route.current.params.id;

    University.getUniversityById(universityId).success(function(res) {
        if (res.success) {
            $scope.university = res.data;
        }
    });

    $scope.getStudentById = function() {
        Students.getStudentById(id).success(function(res) {
            if (res.success) {}
        });
    }
}])

.controller('DashboardAcademiaManageByIdUsersByIdCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'Students', '$routeParams', '$localStorage', function($rootScope, $scope, $location, $route, University, Students, $routeParams, $localStorage) {
    let studentId = $route.current.params.userId;
    let universityId = $scope.universityId = $route.current.params.id;
    $scope.university = $localStorage.universityUserManage;

    $scope.privilege;

    /* university.members */
    University.getUniversityById(universityId).success(function(resUniversity) {
        if (resUniversity.success) {
            $scope.university = resUniversity.data;
            $scope.university.members.forEach(function(e, idx, a) {
                if (studentId == e.accountId) {
                    $scope.privilege = e.privilege;
                }
            });
        }
    });

    Students.getStudentById(studentId).success(function(res) {
        if (res.success) {
            $scope.student = res.data;
        }
    });

    $scope.setMemberPrivilege = function() {
        let data = {
            privilege: $scope.privilege
        };

        University.setMemberPrivilege(universityId, studentId, data).success(function(res) {
            if (res.success) {
                $scope.success = {
                    text: "PERMISSION_UPDATE_SUCCESS",
                    status: true
                };
            }
        });
    }
}])

/* end manage */
.controller('DashboardAcademiaManageByIdSalesCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'Sales', function($rootScope, $scope, $location, $route, University, Sales) {
    /* chart */
    $scope.labels = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];

    $scope.chartData = [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
    ];

    $scope.tableData = [
        [0, []],
        [0, []],
        [0, []],
        [0, []],
        [0, []],
        [0, []],
        [0, []],
        [0, []],
        [0, []],
        [0, []],
        [0, []],
        [0, []]
    ];

    $scope.datasetOverride = [{ yAxisID: 'y-axis-1' }, { yAxisID: 'y-axis-2' }];
    $scope.options = {
        scales: {
            yAxes: [{
                id: 'y-axis-1',
                type: 'linear',
                display: true,
                position: 'left',
                ticks: {
                    beginAtZero: true,
                    userCallback: function(label, index, labels) {
                        // when the floored value is the same as the value we have a whole number
                        if (Math.floor(label) === label) {
                            return label;
                        }
                    }
                }
            }]
        }
    };

    /* fill data */
    let universityId = $route.current.params.id;

    University.getUniversityById(universityId).success(function(res) {
        if (res.success) {
            $scope.university = res.data;
            Sales.reports($scope.university._id).success(function(res) {
                let report = res.data;
                report.forEach(function(e, idx, a) {
                    // 1 - append on chart data
                    $scope.chartData[e.month + 1] += (e.amount / 100);

                    $scope.tableData[e.month + 1][0] += e.amount;
                    $scope.tableData[e.month + 1][1].push(e);
                });
            });
        }
    });

    $scope.convertToDecimal = function(num) {
        num = String(num);

        if (num == 0) {
            return "0";
        } else if (num.length > 3) {
            return num.substring(0, num.length - 2) + "." + num.substring(num.length - 2, num.length);
        } else {
            return num.substring(0, num.length - 2) + "." + num.substring(num.length - 2, num.length);
        }
    }

    $scope.statusByDate = function(y, m) {
        $location.path('/dashboard/a/manage/id/' + universityId + "/sales/y/" + y + "/m/" + m);
    }
}])

.controller('DashboardAcademiaManageByIdSalesDatesCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'Sales', function($rootScope, $scope, $location, $route, University, Sales) {
    /* chart */
    $scope.labels = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

    $scope.chartData = [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
    ];

    $scope.tableData = [
        [0, []],
        [0, []],
        [0, []],
        [0, []],
        [0, []],
        [0, []],
        [0, []],
        [0, []],
        [0, []],
        [0, []],
        [0, []],
        [0, []]
    ];

    $scope.datasetOverride = [{ yAxisID: 'y-axis-1' }, { yAxisID: 'y-axis-2' }];
    $scope.options = {
        scales: {
            yAxes: [{
                id: 'y-axis-1',
                type: 'linear',
                display: true,
                position: 'left',
                ticks: {
                    beginAtZero: true,
                    userCallback: function(label, index, labels) {
                        // when the floored value is the same as the value we have a whole number
                        if (Math.floor(label) === label) {
                            return label;
                        }
                    }
                }
            }]
        }
    };

    /* fill data */
    let universityId = $route.current.params.id;
    let year = $route.current.params.y;
    let month = $route.current.params.m;
    //let day = $route.current.params.d;

    $scope.month = month;

    Sales.reportsByDate(universityId, year, month).success(function(res) {
        if (res.success) {}
    });

    University.getUniversityById(universityId).success(function(res) {
        if (res.success) {
            $scope.university = res.data;
            Sales.reports($scope.university._id).success(function(res) {
                let report = res.data;
                report.forEach(function(e, idx, a) {
                    // 1 - append on chart data
                    $scope.chartData[e.month + 1] += (e.amount / 100);

                    $scope.tableData[e.month + 1][0] += e.amount;
                    $scope.tableData[e.month + 1][1].push(e);
                });
            });
        }
    });

    $scope.convertToDecimal = function(num) {
        num = String(num);

        if (num == 0) {
            return "0";
        } else if (num.length > 3) {
            return num.substring(0, num.length - 2) + "." + num.substring(num.length - 2, num.length);
        } else {
            return num.substring(0, num.length - 2) + "." + num.substring(num.length - 2, num.length);
        }
    }
}])

.controller('DashboardAcademiaSubscribedCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'jwtHelper', '$localStorage', 'Students', function($rootScope, $scope, $location, $route, University, jwtHelper, $localStorage, Students) {
    let studentId;

    /* Get student from token */
    if ($localStorage.token != undefined && $localStorage.token != null) {
        studentId = jwtHelper.decodeToken($localStorage.token)._id;
    } else {
        //$location.path("/")
    }

    /* Get student on back-end */
    Students.getStudentById(studentId).success(function(res) {
        let success = res.success;
        let student = res.data;

        if (success) {
            $scope.student = student;
        } else {}
    });
}])

.controller('DashboardAcademiaPremiumCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'jwtHelper', '$localStorage', 'Students', function($rootScope, $scope, $location, $route, University, jwtHelper, $localStorage, Students) {
    let studentId;

    /* Get student from token */
    if ($localStorage.token != undefined && $localStorage.token != null) {
        studentId = jwtHelper.decodeToken($localStorage.token)._id;
    } else {
        //$location.path("/")
    }

    /* Get student on back-end */
    Students.getStudentById(studentId).success(function(res) {
        let success = res.success;
        let student = res.data;

        if (success) {
            $scope.student = student;
        } else {}
    });

    $scope.managePremium = function(subscriptionId) {
        ngDialog.open({ template: 'partials/modals/premium.html', controller: 'DashboardAcademiaSubscriptionModalCtrl', className: 'ngdialog-theme-default', data: { subscriptionId: subscriptionId } });
    }
}])

.controller('DashboardAcademiaSubscriptionModalCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', function($rootScope, $scope, $location, $route, University) {
    $scope.subscriptionId = $scope.ngDialogData.subscriptionId;
}])

.controller('DashboardAcademiaPlanManageCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', '$routeParams', function($rootScope, $scope, $location, $route, University, $routeParams) {
    let plan = $scope.ngDialogData.plan;
    let universityId = $routeParams.id;

    $scope.active = String(plan.active);

    if (plan.trialPeriodDays == null) {
        $scope.trialPeriodDays = 0;
    } else {
        $scope.trialPeriodDays = String(plan.trialPeriodDays);
    }

    let data = { docId: plan._id, stripeId: plan.stripeId, active: String(plan.active) };
    $scope.data = data;
    $scope.plan = plan;
    $scope.success = false;

    $scope.update = function() {
        let update = false;
        let status = $scope.data.active;

        if (plan.trialPeriodDays == null && $scope.trialPeriodDays != 0) {
            data.trialPeriodDays = $scope.trialPeriodDays;
            update = true;
        }

        if (plan.active != status) {
            data.active = $scope.data.active;
            update = true;
        }

        if (update) {
            University.updatePlan(universityId, data).success(function(res) {
                if (res.success) {
                    $scope.success = true;
                } else {}
            });
        }
    }
}])

.directive('uploadbox', ['Students', '$location', '$localStorage', '$timeout', 'Uploads', function(Students, $location, $localStorage, $timeout, Uploads) {
    return {
        restrict: 'AE',
        templateUrl: '../../partials/dashboard/upload/uploadbox.html',
        replace: true,
        scope: true,
        link: function(scope, element, attr) {
            scope.filesListing = [];
            scope.imageUploading = false;

            scope.$watch('files', function() {
                scope.upload(scope.files);
            });

            scope.$watch('file', function() {
                if (scope.file != null) {
                    scope.files = [scope.file];
                }
            });

            scope.remove = function() {
                scope.filesListing = [];
                scope.pictures = [];
                scope.uploadDisplay = true;
            }

            scope.filesListing = [];
            scope.pictures = [];

            scope.uploadDisplay = true;

            scope.upload = function(files) {
                if (files && files.length) {
                    scope.imageUploading = true;
                    let file = scope.files[0];

                    Uploads.upload(file).then(function(res) {
                        let data = res.data.data;
                        let img = data[0].path;

                        scope.pictures.push(img.path);
                        scope.filesListing.push(img);

                        scope.imageUploading = false;
                        scope.uploadDisplay = false;
                    }, null, function(evt) {
                        let progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                        scope.log = 'progress: ' + progressPercentage + '% ' + evt.config.data.file.name + '\n' + scope.log;
                    });
                }
            };
        }
    }
}])

.directive('academiadashboarduserrow', ['Students', '$location', '$localStorage', function(Students, $location, $localStorage) {
    return {
        restrict: 'A',
        templateUrl: '../../partials/dashboard/academia/userrow.html',
        replace: true,
        scope: true,
        link: function(scope, element, attr) {
            let member = JSON.parse(attr.m);
            let university = JSON.parse(attr.u);

            delete university.members;
            delete university.active;
            delete university.about;

            scope.manageUser = function() {
                let actualUrl = $location.path();
                $localStorage.universityUserManage = university;
                $location.path(actualUrl + "/id/" + member.accountId);
            }

            Students.getStudentById(member.accountId).success(function(res) {
                if (res.success) {
                    scope.member = res.data;
                }
            });

        }
    }
}])

.directive('academiadashboardsalesrow', ['Students', '$location', '$localStorage', function(Students, $location, $localStorage) {
    return {
        restrict: 'A',
        templateUrl: '../../partials/dashboard/academia/salesrow.html',
        replace: true,
        scope: true,
        link: function(scope, element, attr) {
            let labels = JSON.parse(attr.labels);
            let series = JSON.parse(attr.series);
            let data = JSON.parse(attr.data);

            scope.labels = labels;
            scope.series = series;
            scope.data = data;
        }
    }
}])

.directive('academiadashboardcard', ['$location', 'University', function($location, University) {
    return {
        restrict: 'A',
        templateUrl: '../../partials/dashboard/academia/academiacard.html',
        replace: true,
        scope: true,
        link: function(scope, element, attr) {
            let universityId = attr.uid;

            University.getUniversityById(universityId).success(function(res) {
                if (res.success) {
                    scope.university = res.data;
                    console.log("university: ", scope.university)
                }
            });
        }
    }
}])

.directive('academiadashboardplanrow', ['Students', '$location', '$localStorage', 'ngDialog', function(Students, $location, $localStorage, ngDialog) {
    return {
        restrict: 'A',
        templateUrl: '../../partials/dashboard/academia/planrow.html',
        replace: true,
        scope: true,
        link: function(scope, element, attr) {
            let plan = JSON.parse(attr.p);
            scope.plan = plan;
            scope.plan.amount = scope.plan.amount.substr(0, scope.plan.amount.length - 2) + "." + scope.plan.amount.substr(scope.plan.amount.length - 2, scope.plan.amount.length);
            scope.managePremium = function(subscriptionId) {
                ngDialog.open({
                    template: 'partials/modals/planmanage.html',
                    controller: 'DashboardAcademiaPlanManageCtrl',
                    className: 'ngdialog-theme-default',
                    data: { plan: plan }
                });
            };
        }
    }
}])

.directive('format', ['$filter', function($filter) {
    return {
        require: '?ngModel',
        link: function(scope, elem, attrs, ctrl) {
            if (!ctrl) return;

            ctrl.$formatters.unshift(function(a) {
                return $filter(attrs.format)(ctrl.$modelValue)
            });

            elem.bind('blur', function(event) {
                var plainNumber = elem.val().replace(/[^\d|\-+|\.+]/g, '');
                elem.val($filter(attrs.format)(plainNumber).replace("$", ""));

                let amount = $filter(attrs.format)(plainNumber).replace("$", "");
                elem.val(amount);
                scope.amount = amount;
            });
        }
    };
}]);
