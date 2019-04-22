'use strict';

angular.module('netbase')

.controller('DashboardOrdersCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'Payments', '$localStorage', 'jwtHelper' , function($rootScope, $scope, $location, $route, University, Payments, $localStorage, jwtHelper) {

  let studentId;

  if ($localStorage.token != undefined && $localStorage.token != null) {
    studentId = jwtHelper.decodeToken($localStorage.token)._id;
  }

  Payments.getAllOrders(studentId).success(function(res) {

    $scope.orders = res.data;

  });
  //END Payments.getAllOrders()

}])

.controller('DashboardAcademiaCreateCtrl', ['$rootScope', '$scope', '$location', '$route', 'University' , function($rootScope, $scope, $location, $route, University) {

  $scope.step = 1;

  /* background image */
  $scope.backgroundImage = "https://universida.de/img/misc/noimageacademia.jpg";

  $scope.backgroundImageUpdate = function() {

    // Bug if undefined.

    /*
    let backgroundImage = $("#file").attr("value");

    if (backgroundImage.indexOf("https") != -1) {
      $scope.backgroundImage = backgroundImage;
    }
    */

    console.log("update")
  }

  /* step 1 */
  $scope.move = function(value) {

    $scope.step += Number(value);

    $scope.backgroundImageUpdate();

  }

  $scope.error = {
    text : [],
    exists : false
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

    let validated = true;

    let data = {
      name : $scope.name,
      about : $scope.about,
      url : $scope.url,
      language : $scope.language
    };

    let backgroundImage = $("#file").attr("value");

    // Error while checking. If undefined, bugs

    if (backgroundImage.indexOf("https://") != -1) {
      data.backgroundImage = backgroundImage;
    }

    if (data.name == undefined) {
      validated = false;
      $scope.error.text.push("Type a name for your College");
      $scope.error.exists = true;
    }

    if (data.url == undefined) {
      validated = false;
      $scope.error.text.push("Type an url for your College");
      $scope.error.exists = true;
    }

    if (data.about == undefined) {
      validated = false;
      $scope.error.text.push("Type a short description for your College");
      $scope.error.exists = true;
    }

    if (data.language == undefined) {
      validated = false;
      $scope.error.text.push("Select a language for your College");
      $scope.error.exists = true;
    }

    if (validated) {

      University.create(data).success(function(res) {

        if (res.success) {

          console.log(res.data);
          $location.path('/a/' + res.data.url + '/forum')

        } else {
          console.log("error while creating university")
          console.log(res);

          if (res.err.errmsg.indexOf("url") != 1) {
            $scope.error.text.push("Type a different URL for your university. The one you choose already exists.");
            $scope.error.exists = true;
          }

        }

      });

    }

  }


}])

/* manage */

.controller('DashboardAcademiaManageCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'User', function($rootScope, $scope, $location, $route, University, User) {

  //let userId = User.getId();

  $scope.manage = function(id) {

    $location.path('/dashboard/a/manage/id/' + id);

  }

  /* Get all universities by id */

  University.getUniversitiesByOwnerId(User.getId()).success(function(res) {

    console.log(res);

    if (res.success) {

      $scope.universities = res.data;

    }

  });

}])

.controller('DashboardAcademiaManageByIdCtrl', ['$rootScope', '$scope', '$location', '$route', 'University' , function($rootScope, $scope, $location, $route, University) {

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

    console.log(data);

    University.update(universityId, data).success(function(res) {

      console.log(res);

      if (res.success) {

        console.log("success")
        $scope.university = res.data;
        $scope.success = true;

      }

    });

  }

}])

/* Premium */

.controller('DashboardAcademiaManageByIdPremiumCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'Students' , function($rootScope, $scope, $location, $route, University, Students) {

  console.log("on")

  let universityId = $route.current.params.id;

  /* get universities */

  let getUniversity = University.getUniversityById(universityId);

  getUniversity.success(function(res) {

    if (res.success) {

      $scope.university = res.data;

      console.log($scope.university);

    }

  });

  /* functions */

  $scope.createPlan = function () {

    let data = {
      amount : $scope.amount,
      name : $scope.name,
      interval : $scope.interval,
      intervalCount : $scope.intervalCount
    };

    if ($scope.trialPeriodDays != undefined) {
      data.trialPeriodDays = $scope.trialPeriodDays;
    }

    // interval != "day" && interval != "week" && interval != "month" && interval != "year"

    console.log(data);

    University.createPlan(universityId, data).success(function(res) {

      console.log(res);

      if (res.success) {

        console.log(res);
        $route.reload();

      }

    });

  }

  /* close dialog */

  $rootScope.$on('ngDialog.closed', function (e, $dialog) {

    $route.reload();

  });

}])

.controller('DashboardAcademiaManageByIdUsersCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'Students' , function($rootScope, $scope, $location, $route, University, Students) {

  console.log("on")

  let universityId = $route.current.params.id;

  University.getUniversityById(universityId).success(function(res) {

    console.log(res);

    if (res.success) {

      $scope.university = res.data;

    }

  });

  $scope.getStudentById = function() {

    Students.getStudentById(id).success(function(res) {

      if (res.success) {

      }

    });

  }

}])

.controller('DashboardAcademiaManageByIdUsersByIdCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'Students', '$routeParams', '$localStorage', function($rootScope, $scope, $location, $route, University, Students, $routeParams, $localStorage) {

  console.log("on")

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
      //END $scope.university.members.forEach

    }

  });

  Students.getStudentById(studentId).success(function(res) {

    if (res.success) {

      $scope.student = res.data;

    }
    //end Students.getStudentById -> res.success

  });

  $scope.setMemberPrivilege = function() {

    let data = {
      privilege : $scope.privilege + 1
    };

    console.log(data);

    University.setMemberPrivilege(universityId, studentId, data).success(function(res) {

      console.log(res);

      if (res.success) {

        $scope.success = {
          text : "Permissão atualizada com sucesso",
          status : true
        };

      }

    });

  }

}])

/* end manage */

.controller('DashboardAcademiaManageByIdSalesCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'Sales', function($rootScope, $scope, $location, $route, University, Sales) {

  /* chart */

  $scope.labels = ["January", "February", "March", "April", "May", "June", "July", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  $scope.chartData = [
    0,0,0,0,0,0,0,0,0,0,0,0
  ];

  $scope.tableData = [
    [0, []],[0, []],[0, []],[0, []],[0, []],[0, []],[0, []],[0, []],[0, []],[0, []],[0, []],[0, []]
  ];

  $scope.datasetOverride = [{ yAxisID: 'y-axis-1' }, { yAxisID: 'y-axis-2' }];
  $scope.options = {
    scales: {
      yAxes: [
        {
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
        }
      ]
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

          console.log($scope.chartData[e.month])

        });
        //end report.forEach

      });
      //end Sales.report

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

    console.log("status")

    $location.path('/dashboard/a/manage/id/' + universityId + "/sales/y/" + y + "/m/" + m);

  }

}])

.controller('DashboardAcademiaManageByIdSalesDatesCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'Sales', function($rootScope, $scope, $location, $route, University, Sales) {

  /* chart */

  $scope.labels = ["January", "February", "March", "April", "May", "June", "July", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  $scope.chartData = [
    0,0,0,0,0,0,0,0,0,0,0,0
  ];

  $scope.tableData = [
    [0, []],[0, []],[0, []],[0, []],[0, []],[0, []],[0, []],[0, []],[0, []],[0, []],[0, []],[0, []]
  ];

  $scope.datasetOverride = [{ yAxisID: 'y-axis-1' }, { yAxisID: 'y-axis-2' }];
  $scope.options = {
    scales: {
      yAxes: [
        {
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
        }
      ]
    }
  };

  /* fill data */

  let universityId = $route.current.params.id;
  let year = $route.current.params.y;
  let month = $route.current.params.m;
  //let day = $route.current.params.d;

  $scope.month = month;

  Sales.reportsByDate(universityId, year, month).success(function(res) {

    console.log(res);

    if (res.success) {

    }

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

          console.log($scope.chartData[e.month])

        });
        //end report.forEach

      });
      //end Sales.report

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

    } else {


    }

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

    console.log(res);

    if (success) {

      $scope.student = student;

    } else {


    }

  });

  $scope.managePremium = function (subscriptionId) {
    ngDialog.open({ template: 'partials/modals/premium.html', controller: 'DashboardAcademiaSubscriptionModalCtrl', className: 'ngdialog-theme-default', data : { subscriptionId : subscriptionId } });
  }

}])

.controller('DashboardAcademiaSubscriptionModalCtrl', ['$rootScope', '$scope', '$location', '$route', 'University' , function($rootScope, $scope, $location, $route, University) {

  $scope.subscriptionId = $scope.ngDialogData.subscriptionId;

}])

.controller('DashboardAcademiaPlanManageCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', '$routeParams' , function($rootScope, $scope, $location, $route, University, $routeParams) {

  let plan = $scope.ngDialogData.plan;
  let universityId = $routeParams.id;

  $scope.active = String(plan.active);

  if (plan.trialPeriodDays == null) {
    $scope.trialPeriodDays = 0;
  } else {
    $scope.trialPeriodDays = String(plan.trialPeriodDays);
  }

  let data = { docId : plan._id , stripeId : plan.stripeId, active : String(plan.active) };
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

        console.log(res);

        if (res.success) {

          $scope.success = true;

        } else {

        }

      });
      // end updatePlan

    }

  }

}])

.directive('uploadbox', ['Students', '$location', '$localStorage', '$timeout', 'Uploads', function(Students, $location, $localStorage, $timeout, Uploads) {

  return {

    restrict: 'AE',
    templateUrl : '../../partials/dashboard/upload/uploadbox.html',
    replace : true,
    scope : true,
    link : function(scope, element, attr) {

      scope.filesListing = [];
      scope.imageUploading = false;

      scope.$watch('files', function () {
        scope.upload(scope.files);
      });

      scope.$watch('file', function () {

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

      scope.upload = function (files) {

            if (files && files.length) {

              scope.imageUploading = true;

              let file = scope.files[0];

              console.log(file);

              Uploads.upload(file).then(function (res) {

                let data = res.data.data;

                let img = data[0].path;

                scope.pictures.push(img.path);
                scope.filesListing.push(img);

                scope.imageUploading = false;
                scope.uploadDisplay = false;

              }, null, function (evt) {

                let progressPercentage = parseInt(100.0 * evt.loaded / evt.total);

                scope.log = 'progress: ' + progressPercentage + '% ' + evt.config.data.file.name + '\n' + scope.log;

              });

            }
            // end if (files && files.length)
        };
        // end scope.upload

    }

  }

}])

.directive('academiadashboarduserrow', ['Students', '$location', '$localStorage', function(Students, $location, $localStorage) {

  return {
    restrict: 'A',
    templateUrl : '../../partials/dashboard/academia/userrow.html',
    replace : true,
    scope : true,
    link : function(scope, element, attr) {

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
    templateUrl : '../../partials/dashboard/academia/salesrow.html',
    replace : true,
    scope : true,
    link : function(scope, element, attr) {

      let labels = JSON.parse(attr.labels);
      let series = JSON.parse(attr.series);
      let data = JSON.parse(attr.data);

      console.log(attr.data)

      scope.labels = labels;
      scope.series = series;
      scope.data = data;

      console.log("labels")
      console.log(labels);

      console.log("series")
      console.log(series);

      console.log("data")
      console.log(data);

    }
  }

}])

.directive('academiadashboardcard', ['$location', 'University', function($location, University) {

  return {
    restrict: 'A',
    templateUrl : '../../partials/dashboard/academia/academiacard.html',
    replace : true,
    scope : true,
    link : function(scope, element, attr) {

      let universityId = attr.uid;

      University.getUniversityById(universityId).success(function(res) {

        if (res.success) {

          scope.university = res.data;

        }

      });

    }

  }

}])

.directive('academiadashboardplanrow', ['Students', '$location', '$localStorage', 'ngDialog', function(Students, $location, $localStorage, ngDialog) {

  return {
    restrict: 'A',
    templateUrl : '../../partials/dashboard/academia/planrow.html',
    replace : true,
    scope : true,
    link : function(scope, element, attr) {

      let plan = JSON.parse(attr.p);

      scope.plan = plan;

      scope.plan.amount = scope.plan.amount.substr(0, scope.plan.amount.length - 2) + "." + scope.plan.amount.substr(scope.plan.amount.length - 2, scope.plan.amount.length);

      scope.managePremium = function (subscriptionId) {

        ngDialog.open({ template: 'partials/modals/planmanage.html',
                        controller: 'DashboardAcademiaPlanManageCtrl',
                        className: 'ngdialog-theme-default',
                        data : { plan : plan } });

      };

    }

  }

}])

.directive('format', ['$filter', function ($filter) {
    return {
        require: '?ngModel',
        link: function (scope, elem, attrs, ctrl) {
            if (!ctrl) return;

            ctrl.$formatters.unshift(function (a) {
              return $filter(attrs.format)(ctrl.$modelValue)
            });

            elem.bind('blur', function(event) {
                var plainNumber = elem.val().replace(/[^\d|\-+|\.+]/g, '');
                elem.val($filter(attrs.format)(plainNumber).replace("$", ""));

                let amount = $filter(attrs.format)(plainNumber).replace("$", "");
                console.log(amount)
                elem.val(amount);
                scope.amount = amount;

            });
        }
    };
}]);
