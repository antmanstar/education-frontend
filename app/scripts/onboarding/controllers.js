'use strict';

/* Controllers */
angular.module('netbase')

.controller('OnboardingUniversityCreateCtrl', ['$rootScope', '$scope', 'ngDialog', 'University', 'Knowledge', '$location', '$window', '$localStorage', function($rootScope, $scope, ngDialog, University, Knowledge, $location, $window, $localStorage) {
    $scope.mode = "";
    $scope.universityType = '';
    $scope.company_logo = $localStorage.company_logo;

    $scope.lastpageReturn = function() {
        $window.history.back();
    }

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
        if (backgroundImage != undefined) {
          if (backgroundImage.indexOf("https") != -1) {
            $scope.backgroundImage = backgroundImage;
            console.log("backgroundImage: ", $scope.backgroundImage)
          }
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
      if ($scope.step==1 && value==1) {
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
      if ($scope.step==2){
        $scope.backgroundImageUpdate();
      }
    }

    $scope.error = {
        text: [],
        exists: false
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

    $scope.openSelectPlan = function() {
        ngDialog.open({
            template: 'partials/modals/university_plan.html',
            controller: 'UniversityPlanCtrl',
            className: 'ngdialog-theme-default',
            closeByNavigation: true
        });
    }
}])

.controller('OnboardingUniversitiesScreenCtrl', ['$rootScope', '$scope', 'ngDialog', 'University', 'Knowledge', function($rootScope, $scope, ngDialog, University, Knowledge) {
    $scope.universities = [];
    $scope.page = 1;

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
        $scope.page = 2;
    }

    /* Universities -> Page 2 */
    let universitySelected = [];
    University.getAllUniversities().success(function(res) {
        let success = res.success;
        let data = res.data;
        $scope.universities = data;
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
        $scope.page = 2;
    }

    $scope.studentProExplore = function() {
        ngDialog.open({ template: 'partials/modals/studentpro.html', className: 'ngdialog-theme-default ngdialog-student-pro', controller: 'StudentProExploreCtrl' });
    };
}])

.controller('OnboardingSignUpScreenCtrl', ['$rootScope', '$scope', 'ngDialog', 'University', 'Knowledge', '$location', function($rootScope, $scope, ngDialog, University, Knowledge, $location) {
    $scope.mode = "";

    $scope.selectMode = function(mode) {
        $scope.mode = mode;
    }

    $scope.selectUniversityType = function(name) {
        $scope.universityType = name;
    }

    $scope.learning = function() {
        $location.path('/home/timeline');
    }

    $scope.teaching = function() {
        $location.path('/onboarding/universities/create');
    }

    $scope.videocalling = function() {
        $location.path('/home/calls');
    }
}])

.controller('OnboardingScreenCtrl', ['$rootScope', '$scope', 'ngDialog', 'University', 'Knowledge', function($rootScope, $scope, ngDialog, University, Knowledge) {
    $scope.universities = [];
    $scope.page = 2;

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
        $scope.page = 2;
    }

    /* Universities -> Page 2 */
    let universitySelected = [];
    University.getAllUniversities().success(function(res) {
        let success = res.success;
        let data = res.data;

        $scope.universities = data;
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
        $scope.page = 2;
    }
    $scope.studentProExplore = function() {
        ngDialog.open({ template: 'partials/modals/studentpro.html', className: 'ngdialog-theme-default ngdialog-student-pro', controller: 'StudentProExploreCtrl' });
    };
}])

.controller('OnboardingUniversitiesCtrl', ['$rootScope', '$scope', 'ngDialog', 'University', 'Knowledge', function($rootScope, $scope, ngDialog, University, Knowledge) {
    $scope.universities = [];
    $scope.page = 1;

    Knowledge.getAllPaginated().success(function(res) {
        let data = res.data;
        let success = res.success;
        let docs = data.docs;

        $scope.knowledges = docs;
    });

    $scope.studentProExplore = function() {
        ngDialog.open({ template: 'partials/modals/studentpro.html', className: 'ngdialog-theme-default ngdialog-student-pro', controller: 'StudentProExploreCtrl' });
    };
}])

.directive('onboardinguniversity', ['University', 'Students', '$localStorage', '$route', 'jwtHelper', '$filter', '$sce', '$location', function(University, Students, $localStorage, $route, jwtHelper, $filter, $sce, $location) {
    return {
        restrict: 'E',
        templateUrl: '../../partials/directive/onboarding/university.html',
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

                for (let i = 0; i < data.universitiesSubscribed.length; i++) {
                    if (data.universitiesSubscribed[i].universityId == universityId && data.universitiesSubscribed[i].unsubscribed === false) {
                        scope.showSubscribe = false;
                    }
                    if (data.universitiesSubscribed[i].universityId == universityId && data.universitiesSubscribed[i].unsubscribed === true) {
                        scope.showSubscribe = true;
                    }
                }
            })

            if (University.isStoredLocal(universityId)) {
                let universityStorage = University.retrieveStorage(universityId);
                scope.university = universityStorage[universityId];
            } else {
                University.getUniversityById(universityId).success(function(res) {
                    scope.university = res.data;
                    University.storeLocal(scope.university);
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
                            scope.university.members.push({ accountId: studentId, unsubscribed: false });
                            scope.showSubscribe = !scope.showSubscribe;
                        }
                    });
                } else {
                    ngDialog.open({ template: 'partials/modals/login.html', controller: 'AccountCtrl', className: 'ngdialog-theme-default' });
                }
            };
        }
    }
}])
