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

.controller('OnboardingSignUpScreenCtrl', ['$rootScope', '$scope', 'ngDialog', 'University', 'Knowledge', '$location' , function($rootScope, $scope, ngDialog, University, Knowledge, $location) {

  /* */
  $scope.mode = "";
  /* */

  $scope.selectMode = function(mode) {
    $scope.mode = mode;
  }

  $scope.selectUniversityType = function(name) {

    console.log(name)

    $scope.universityType = name;

  }

  $scope.learning = function() {
    $location.path('/home/timeline');
  }

  $scope.teaching = function() {
    $location.path('/onboarding/universities/create');
  }

}])

.controller('OnboardingUniversityCreateCtrl', ['$rootScope', '$scope', 'ngDialog', 'University', 'Knowledge', '$location', '$window' , function($rootScope, $scope, ngDialog, University, Knowledge, $location, $window) {

  /* */
  $scope.mode = "";

  $scope.universityType = '';
  /* */

  $scope.error = {
    text : [],
    exists : false
  }

  $scope.lastpageReturn = function() {
    $window.history.back();
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

    $scope.error.text = []

    let data = {
      name : $scope.name,
      about : $scope.about,
      url : $scope.url,
      language : 'pt'
    };

    console.log(data)

    if (data.name == undefined) {
      validated = false;
      $scope.error.text.push("Escreva um nome para a sua comunidade educacional.");
      $scope.error.exists = true;
    }

    if (data.url == undefined) {
      validated = false;
      $scope.error.text.push("Escreva uma URL para a sua comunidade educacional.");
      $scope.error.exists = true;
    }

    if (data.about == undefined) {
      validated = false;
      $scope.error.text.push("Escreva uma pequena descrição para explicar a sua comunidade educacional.");
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

    } else {

    }

  }

}])
