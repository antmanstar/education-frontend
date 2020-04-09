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
