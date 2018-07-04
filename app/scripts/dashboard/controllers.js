'use strict';

angular.module('netbase')

.controller('DashboardAcademiaCreateCtrl', ['$rootScope', '$scope', '$location', '$route', 'University' , function($rootScope, $scope, $location, $route, University) {

  $scope.step = 1;

  /* step 1 */
  $scope.move = function(value) {

    console.log(Number(value));

    $scope.step += Number(value);

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

  University.getUniversityById(universityId).success(function(res) {

    console.log(res);

    if (res.success) {

      $scope.university = res.data;

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

  Students.getStudentById(studentId).success(function(res) {

    if (res.success) {

      $scope.student = res.data;

    }

  });

  $scope.setMemberPrivilege = function() {

    let data = {
      privilege : $scope.privilege
    };

    console.log(data);

    University.setMemberPrivilege(universityId, studentId, data).success(function(res) {

      console.log(res);

      if (res.success) {

        $scope.success = {
          text : "Privilege updated with success",
          status : true
        };

      }

    });

  }

}])

/* end manage */

.controller('DashboardAcademiaManageByIdSalesCtrl', ['$rootScope', '$scope', '$location', '$route', 'University' , function($rootScope, $scope, $location, $route, University) {

  console.log("on")

  let universityId = $route.current.params.id;

  University.getUniversityById(universityId).success(function(res) {

    console.log(res);

    if (res.success) {

      $scope.university = res.data;

    }

  });

  /* chart */

  $scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
  $scope.series = ['Series A', 'Series B'];
  $scope.data = [
    [65, 59, 80, 81, 56, 55, 40],
    [28, 48, 40, 19, 86, 27, 90]
  ];

  $scope.onClick = function (points, evt) {
    console.log(points, evt);
  };
  $scope.datasetOverride = [{ yAxisID: 'y-axis-1' }, { yAxisID: 'y-axis-2' }];
  $scope.options = {
    scales: {
      yAxes: [
        {
          id: 'y-axis-1',
          type: 'linear',
          display: true,
          position: 'left'
        },
        {
          id: 'y-axis-2',
          type: 'linear',
          display: true,
          position: 'right'
        }
      ]
    }
  };

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

      console.log("plan: ")
      console.log(plan);

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
