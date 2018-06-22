'use strict';

angular.module('netbase')

.controller('DashboardAcademiaCreateCtrl', ['$rootScope', '$scope', '$location', '$route', 'University' , function($rootScope, $scope, $location, $route, University) {

  $scope.step = 3;

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

  University.getUniversityById(universityId).success(function(res) {

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

    console.log("creating this plan: ")
    console.log(data);

    if ($scope.trialPeriodDays != undefined) {
      data.trialPeriodDays = $scope.trialPeriodDays;
    }

    // interval != "day" && interval != "week" && interval != "month" && interval != "year"

    University.createPlan(universityId, data).success(function(res) {

      console.log(res);

      if (res.success) {

        console.log(res);

      }

    });

  }

  $scope.getStudentById = function() {

    Students.getStudentById(id).success(function(res) {

      if (res.success) {

      }

    });

  }

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

.controller('DashboardAcademiaSubscribedCtrl', ['$rootScope', '$scope', '$location', '$route', 'University' , function($rootScope, $scope, $location, $route, University) {

  console.log("on")

}])

.controller('DashboardAcademiaPremiumCtrl', ['$rootScope', '$scope', '$location', '$route', 'University' , function($rootScope, $scope, $location, $route, University) {

  console.log("on")

  console.log("load account.subscriptions")

  $scope.managePremium = function (subscriptionId) {
    ngDialog.open({ template: 'partials/modals/premium.html', controller: 'DashboardAcademiaSubscriptionModalCtrl', className: 'ngdialog-theme-default', data : { subscriptionId : subscriptionId } });
  }

}])

.controller('DashboardAcademiaSubscriptionModalCtrl', ['$rootScope', '$scope', '$location', '$route', 'University' , function($rootScope, $scope, $location, $route, University) {


  $scope.subscriptionId = $scope.ngDialogData.subscriptionId;

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

.directive('academiadashboardplanrow', ['Students', '$location', '$localStorage', function(Students, $location, $localStorage) {

  return {
    restrict: 'A',
    templateUrl : '../../partials/dashboard/academia/planrow.html',
    replace : true,
    scope : true,
    link : function(scope, element, attr) {

      //let plan = JSON.parse(attr.m);
      //let university = JSON.parse(attr.u);



    }
  }

}])

;
