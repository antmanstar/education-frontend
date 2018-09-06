'use strict';

/* Controllers */

angular.module('netbase')

.controller('OnboardingScreenCtrl', ['$rootScope', '$scope', 'ngDialog', 'University', 'Knowledge' , function($rootScope, $scope, ngDialog, University, Knowledge) {

  $scope.universities = [];

  /* */

  /* */

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

  $scope.studentProExplore = function () {
    ngDialog.open({ template: 'partials/modals/studentpro.html',className: 'ngdialog-theme-default ngdialog-student-pro', controller: 'StudentProExploreCtrl' });
  };

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

    ngDialog.close();

  }

}])
