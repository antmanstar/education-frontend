'use strict';

/* Controllers */

angular.module('netbase')

.controller('OnboardingUniversitiesScreenCtrl', ['$rootScope', '$scope', 'ngDialog', 'University', 'Knowledge' , function($rootScope, $scope, ngDialog, University, Knowledge) {

  $scope.universities = [];

  /* */
  $scope.page = 1;
  /* */

  /* Knowledge -> Page 1 */

  Knowledge.getAllPaginated().success(function(res) {

    let data = res.data;
    let success = res.success;
    let docs = data.docs;

    $scope.knowledges = docs;

  });

  $scope.checkbox = false;

  let knowledgeSelected = [];

  $scope.knowledgeCheck = function(id) {

    let idx = knowledgeSelected.indexOf(id);

    if (idx >= 0) {
      knowledgeSelected.splice(idx, 1);
    } else {
      knowledgeSelected.push(id);
    }

    console.log(knowledgeSelected)

  }

  $scope.knowledgeStore = function() {

    // Get value id from inputs
    // Do a for loop
    // Do multiple requests to push into user account

    knowledgeSelected.forEach(function(id, idx) {

      Knowledge.subscribe(id).success(function(res) {

        console.log("knowledge registered")

      });

    });
    //END knowledgeSelected

    $scope.page = 2;

  }

  /* Universities -> Page 2 */

  let universitySelected = [];

  University.getAllUniversities().success(function(res) {

    let success = res.success;
    let data = res.data;

    $scope.universities = data;

    console.log(res);

  });

  $scope.universityCheck = function(url) {

    let idx = universitySelected.indexOf(url);

    if (idx >= 0) {
      universitySelected.splice(idx, 1);
    } else {
      universitySelected.push(url);
    }

  }

  $scope.universityStore = function() {

    // Get value id from inputs
    // Do a for loop
    // Do multiple requests to push into user account

    universitySelected.forEach(function(url, idx) {

      University.subscribeOnUniversity(url).success(function(res) {

        console.log("knowledge registered")

      });

      ngDialog.close();

    });
    //END knowledgeSelected

    $scope.page = 2;

  }

  $scope.studentProExplore = function () {
    ngDialog.open({ template: 'partials/modals/studentpro.html', className: 'ngdialog-theme-default ngdialog-student-pro', controller: 'StudentProExploreCtrl' });
  };

  //ngDialog.close();

}])


.controller('OnboardingScreenCtrl', ['$rootScope', '$scope', 'ngDialog', 'University', 'Knowledge' , function($rootScope, $scope, ngDialog, University, Knowledge) {

  $scope.universities = [];

  /* */
  $scope.page = 2;
  /* */

  /* Knowledge -> Page 1 */

  Knowledge.getAllPaginated().success(function(res) {

    let data = res.data;
    let success = res.success;
    let docs = data.docs;

    $scope.knowledges = docs;

  });

  $scope.checkbox = false;

  let knowledgeSelected = [];

  $scope.knowledgeCheck = function(id) {

    let idx = knowledgeSelected.indexOf(id);

    if (idx >= 0) {
      knowledgeSelected.splice(idx, 1);
    } else {
      knowledgeSelected.push(id);
    }

    console.log(knowledgeSelected)

  }

  $scope.knowledgeStore = function() {

    // Get value id from inputs
    // Do a for loop
    // Do multiple requests to push into user account

    knowledgeSelected.forEach(function(id, idx) {

      Knowledge.subscribe(id).success(function(res) {

        console.log("knowledge registered")

      });

    });
    //END knowledgeSelected

    $scope.page = 2;

  }

  /* Universities -> Page 2 */

  let universitySelected = [];

  University.getAllUniversities().success(function(res) {

    let success = res.success;
    let data = res.data;

    $scope.universities = data;

    console.log(res);

  });

  $scope.universityCheck = function(url) {

    let idx = universitySelected.indexOf(url);

    if (idx >= 0) {
      universitySelected.splice(idx, 1);
    } else {
      universitySelected.push(url);
    }

  }

  $scope.universityStore = function() {

    // Get value id from inputs
    // Do a for loop
    // Do multiple requests to push into user account

    universitySelected.forEach(function(url, idx) {

      University.subscribeOnUniversity(url).success(function(res) {

        console.log("knowledge registered")

      });

      ngDialog.close();

    });
    //END knowledgeSelected

    $scope.page = 2;

  }

  $scope.studentProExplore = function () {
    ngDialog.open({ template: 'partials/modals/studentpro.html', className: 'ngdialog-theme-default ngdialog-student-pro', controller: 'StudentProExploreCtrl' });
  };

  //ngDialog.close();

}])

.controller('OnboardingUniversitiesCtrl', ['$rootScope', '$scope', 'ngDialog', 'University', 'Knowledge' , function($rootScope, $scope, ngDialog, University, Knowledge) {

  $scope.universities = [];

  /* */
  $scope.page = 1;
  /* */

  /* Knowledge -> Page 1 */
  // Knowledge.getByUrl('esportes').success(function(res) {

  //   console.log("knowledge: ");
  //   console.log(res.data);

  //   $scope.knowledge = res.data;

  // });

  Knowledge.getAllPaginated().success(function(res) {

    let data = res.data;
    let success = res.success;
    let docs = data.docs;

    console.log("knowledge: ");
    console.log(docs);
    $scope.knowledges = docs;

  });

  $scope.studentProExplore = function () {
    ngDialog.open({ template: 'partials/modals/studentpro.html', className: 'ngdialog-theme-default ngdialog-student-pro', controller: 'StudentProExploreCtrl' });
  };

  //ngDialog.close();

}])

.directive('onboardinguniversity', ['University', 'Students', '$localStorage', '$route', 'jwtHelper', '$filter', '$sce', '$location', function(University, Students, $localStorage, $route, jwtHelper, $filter, $sce, $location) {
  return {
    restrict: 'E',
    templateUrl:  '../../partials/directive/onboarding/university.html',
    replace: true,
    scope: true,
    link: function(scope, element, attr) {

      let universityId = attr.uid;
      let studentId;
      
      scope.showSubscribe = true;

      if ($localStorage.token != undefined && $localStorage.token != null) {
        studentId = jwtHelper.decodeToken($localStorage.token)._id;
      }

      Students.getStudentById(studentId).then(function(res) {
        let data = res.data.data;
        
        for (let i=0; i < data.universitiesSubscribed.length; i++) {
          if (data.universitiesSubscribed[i].universityId == universityId && data.universitiesSubscribed[i].unsubscribed===false) {
            scope.showSubscribe = false;
          }
          if (data.universitiesSubscribed[i].universityId == universityId && data.universitiesSubscribed[i].unsubscribed===true) {
            scope.showSubscribe = true;
          }
        }
      })

      if ( University.isStoredLocal(universityId) ) {

        let universityStorage = University.retrieveStorage(universityId);

        scope.university = universityStorage[universityId];
        console.log(scope.university)

      } else {

        University.getUniversityById(universityId).success(function(res) {

          scope.university = res.data;

          University.storeLocal(scope.university);
          console.log(scope.university)

        });

      }

      function userMembersLocation(array) {

        function findStudentId(sId) {
          return sId.accountId = studentId;
        }

        return array.findIndex(findStudentId);

      }

      let userSubscribed = scope.userSubscribed = function userSubscribed(array) {

        let studentIdMembersLocation = userMembersLocation(array);

        if (studentIdMembersLocation != -1) {

          if (array[studentIdMembersLocation].unsubscribed) {
            return false;
          } else {
            return true;
          }

        } else {
          return false;
        }

      };

      /* start subscribe */
      scope.subscribe = function() {

        if ($localStorage.token != undefined && $localStorage.token != null) {

          University.subscribeOnUniversity(scope.university.url).then(function(res) {

            if (userSubscribed(scope.university.members)) {

              let studentIdMembersLocation = userMembersLocation(scope.university.members);

              scope.university.members.splice(studentIdMembersLocation, 1);
              scope.showSubscribe = !scope.showSubscribe;

            } else {

              scope.university.members.push({ accountId : studentId, unsubscribed : false });
              scope.showSubscribe = !scope.showSubscribe;

            }

          });

        } else {
          ngDialog.open({ template: 'partials/modals/login.html', controller: 'AccountCtrl', className: 'ngdialog-theme-default' });
        }

      };
      /* end subscribe */

    }

  }

}])
