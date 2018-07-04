'use strict';

/* Controllers */

angular.module('netbase')

.controller('AcademiaCtrl', ['$rootScope', '$scope', '$location', '$route', 'University' , function($rootScope, $scope, $location, $route, University) {

  let universityUrl = $route.current.params.academiaName;

  University.getUniversity(universityUrl).then(function(res) {

    $scope.university = res.data.data;

  });

  $location.path("/a/" + universityUrl + "/forum");

}])

.controller('AcademiaForumCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', '$timeout' , function($rootScope, $scope, $location, $route, University, $timeout) {

  let universityUrl = $route.current.params.academiaName;

  /* forum posts */
  $scope.forumPosts = [];

  /* get university informations */

  University.getUniversity(universityUrl).then(function(res) {

    let success = res.data.success;
    let university = res.data.data;

    if (success) {

      $scope.university = university;

      console.log(university);

      University.getUniversityForumPosts(university._id).then(function(res) {

        let forumPostsRequested = res.data.data;
        $scope.forumPosts = $scope.forumPosts.concat(forumPostsRequested);


      }).catch(function(e) {

        console.log("forum post error request: ");
        console.log(e);

      });

    } else {

      console.log("error while loading university")

    }


  });

  /* get all forum posts */


}])

.controller('AcademiaChatCtrl', ['$rootScope', '$scope', '$location' , function($rootScope, $scope, $location) {



}])

.controller('AcademiaMenu', ['$rootScope', '$scope', '$location', '$route', 'University' , function($rootScope, $scope, $location, $route, University) {

  let controllerActive = $route.current.$$route.controller;
  let universityUrl = $route.current.params.academiaName;

  console.log(controllerActive);

  $scope.universityUrl = universityUrl
  $scope.controllerActive = controllerActive;
  $scope.forumClass = "";
  $scope.smpClass = "";
  $scope.jobsClass = "";
  $scope.actionPostButton = false;

  $scope.buttonActionUrl = "";

  if (controllerActive == "AcademiaForumCtrl") {
    $scope.forumClass = "active";
    $scope.actionPostButton = true;
    $scope.buttonActionUrl = "/a/" + universityUrl + "/forum/create";
  } else if (controllerActive == "AcademiaSmpCtrl") {
    $scope.actionPostButton = true;
    $scope.smpClass = "active";
    $scope.buttonActionUrl = "/a/" + universityUrl + "/forum";
  } else if (controllerActive == "AcademiaJobsCtrl") {
    $scope.jobsClass = "active";
    $scope.actionPostButton = true;
  } else {

  }

}])

.controller('AcademiaSmpCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'SocialMarketPlace' , function($rootScope, $scope, $location, $route, University, SocialMarketPlace) {

  let universityUrl = $route.current.params.academiaName;

  University.getUniversity(universityUrl).then(function(res) {

    console.log(res.data.data);
    let university = res.data.data;

    $scope.university = university;

    SocialMarketPlace.getListingsByUniversity(university._id).then(function(res) {

      console.log("social market place results");
      console.log(res.data);
      $scope.smpListings = res.data.data;

    });

  });

}])

.controller('AcademiaForumPostCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'Forum', '$sce', function($rootScope, $scope, $location, $route, University, Forum, $sce) {

  let universityUrl = $route.current.params.academiaName;
  let postId = $route.current.params.postId;
  let university;

  /* load information */

  University.getUniversity(universityUrl).then(function(res) {

    $scope.university = res.data.data;
    university = res.data.data;

    Forum.getForumPostById(postId, university._id).then(function(res) {

      let status = res.data.status;
      let data = res.data.data;
      let success = res.data.success;

      $scope.forumPost = data;
      $scope.votesCount = data.votesCount;

      $scope.forumPost.text = $sce.trustAsHtml($scope.forumPost.text);

    });

  });

  /* votes */

  $scope.votesCount = 0;

  $scope.createAnswerPost = function() {

    var data = { text : $scope.answer };

    Forum.postAnswerByForumPostId(postId, university._id, data).then(function(res) {

      let status = res.data.status;
      let data = res.data.data;
      let success = res.data.success;

      if (success) {

        data.votesCount = 0;
        data.createdAt = Math.round((new Date()).getTime() / 1000);
        $scope.forumPost.answers.push(data);

      }

    });

  };

  $scope.upvoteForumPost = function() {

    University.upvoteForumPost($scope.university._id, postId).then(function(res) {

      if (res.data.success) {
        $scope.votesCount += 1;
      }

    });

  };

  $scope.downvoteForumPost = function() {

    University.downvoteForumPost($scope.university._id, postId).then(function(res) {

      if (res.data.success) {
        $scope.votesCount -= 1;
      }

    });

  };

}])

.controller('AcademiaJobsCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'ngDialog' , function($rootScope, $scope, $location, $route, University, ngDialog) {

  let universityUrl = $route.current.params.academiaName;

  University.getUniversity(universityUrl).then(function(res) {

    console.log(res.data.data);
    $scope.university = res.data.data;

  });

  $scope.clickToOpen = function () {
    ngDialog.open({ template: 'partials/jobmodal.html', className: 'ngdialog-theme-default jobmodal' });
  };

}])

.controller('AcademiaForumPostCreateOptionCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'ngDialog', 'Videos', '$sce', function($rootScope, $scope, $location, $route, University, ngDialog, Videos, $sce) {

  $scope.youtubeLink = "https://www.youtube.com/watch?v=WoiZ9PiPXyM";

  $scope.addVideo = function() {

    let iframe = "<iframe src='" + $scope.ytiFrame + "' frameborder='0' allowfullscreen></iframe>"

    let attachment = new Trix.Attachment({content: iframe})
    $rootScope.trix.insertAttachment(attachment)

    ngDialog.close();

  }

  $scope.$watch('youtubeLink', function() {

    let link = $scope.youtubeLink;
    let youtubeId = link.split('=').pop();
    let previewImage = 'http://img.youtube.com/vi/' + youtubeId + '/0.jpg';

    $scope.previewImage = previewImage;
    $scope.youtubeId = youtubeId;

    if (link.search("youtube.com") != -1) {
      $scope.ytiFrame = "https://www.youtube.com/embed/" + youtubeId;
      $scope.ytiFrameSCE = $sce.trustAsResourceUrl("https://www.youtube.com/embed/" + youtubeId);
    }

  }, true);

}])

.controller('AcademiaForumPostCreateCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'ngDialog', function($rootScope, $scope, $location, $route, University, ngDialog) {

  let universityUrl = $route.current.params.academiaName;
  let university;

  /* load information */

  University.getUniversity(universityUrl).then(function(res) {

    $scope.university = res.data.data;
    university = res.data.data;

  });

  ngDialog.open({ template: 'partials/modals/forumpostoption.html', controller: "AcademiaForumPostCreateOptionCtrl", className: 'ngdialog-theme-default' });

  /* edit editor */
  $scope.trixInitialize = function(e, editor) {

	   var document = editor.getDocument()
     $rootScope.trix = editor;

     $(".block_tools").append('<button class="yt" type="button" data-attribute="video" id="videoAppend"><i class="fab fa-youtube"></i></button>')

     $("#videoAppend").click(function() {
       ngDialog.open({ template: 'partials/modals/forumpostoption.html', controller: "AcademiaForumPostCreateOptionCtrl", className: 'ngdialog-theme-default' });
     });

  }

  $scope.trixChange = function(e, editor) {

    console.log(e.srcElement.innerText);
    console.log(e.srcElement.textContent);
    console.log($scope.text)

  }

  /* create forum post by id */

  $scope.createForumPost = function() {

    var data = {
      text : $scope.text,
      title : $scope.title
    };

    /* find youtube video and turn into iframe */


    University.createForumPost(university._id, data).then(function(res) {

      let status = res.data.status;
      let data = res.data.data;
      let success = res.data.success;

      if (success) {

        $location.path('/a/' + university.url + '/forum/post/id/' + data._id)
        window.scrollTo(0, 0);

      } else {

        console.log("error: ");
        console.log(data);
        console.log(status);

      }

    });

  };

}])

/* end academia */

.directive('academiastatus', ['University', '$localStorage', '$route', 'jwtHelper', function(University, $localStorage, $route, jwtHelper) {
  return {
    restrict: 'EA',
    templateUrl: '../partials/academia/status.html',
    replace: false,
    scope: true,
    link: function(scope, element, attr) {

      let university;

      let controllerActive = $route.current.$$route.controller;

      scope.controllerActive = controllerActive;
      scope.forumClass = "";
      scope.smpClass = "";
      scope.jobsClass = "";
      scope.actionPostButton = false;

      scope.buttonActionUrl = "";

      if (controllerActive == "AcademiaForumCtrl" || controllerActive == "AcademiaForumPostCreateCtrl" || controllerActive == "AcademiaForumPostCtrl") {
        scope.forumClass = "active";
        scope.actionPostButton = true;
      } else if (controllerActive == "AcademiaSmpCtrl") {
        scope.actionPostButton = true;
        scope.smpClass = "active";
      } else if (controllerActive == "AcademiaJobsCtrl") {
        scope.jobsClass = "active";
        scope.actionPostButton = true;
      } else {

      }

      attr.$observe('university', function(value) {
        if (value) {

          university = JSON.parse(value);

          function userMembersLocation(array) {

            function findStudentId(sId) {
              return sId.accountId = studentId;
            }

            return array.findIndex(findStudentId);

          }

          let userSubscribed = scope.userSubscribed = function userSubscribed(array) {

            let studentIdMembersLocation = userMembersLocation(array);

            if (studentIdMembersLocation != -1) {
              return true;
            } else {
              return false;
            }

          };

        }
      });

      let studentId;

      if ($localStorage.token != undefined && $localStorage.token != null) {
        studentId = jwtHelper.decodeToken($localStorage.token)._id;
      }

      scope.subscribe = function() {

        University.subscribeOnUniversity(university.url).then(function(res) {

          if (userSubscribed(scope.university.members)) {

            let studentIdMembersLocation = userMembersLocation(scope.university.members);

            scope.university.members.splice(studentIdMembersLocation, 1);

          } else {

            scope.university.members.push({ accountId : studentId });

          }

        });

      };
      /* end subscribe */

    }
  }
}])

.directive('academiarightcolumn', ['University', '$localStorage', '$route', 'jwtHelper', 'ngDialog', function(University, $localStorage, $route, jwtHelper, ngDialog) {
  return {
    restrict: 'EA',
    templateUrl: '../partials/academia/rightcolumn.html',
    replace: false,
    scope: true,
    link: function(scope, element, attr) {

      let university;

      attr.$observe('university', function(value) {
        if (value) {

          university = JSON.parse(value);

          function userMembersLocation(array) {

            function findStudentId(sId) {
              return sId.accountId = studentId;
            }

            return array.findIndex(findStudentId);

          }

          let userSubscribed = scope.userSubscribed = function userSubscribed(array) {

            let studentIdMembersLocation = userMembersLocation(array);

            if (studentIdMembersLocation != -1) {
              return true;
            } else {
              return false;
            }

          };

        }
      });

      let studentId;

      if ($localStorage.token != undefined && $localStorage.token != null) {
        studentId = jwtHelper.decodeToken($localStorage.token)._id;
      }

      scope.premium = function () {

        //check if logged before
        if ($localStorage.token != undefined && $localStorage.token != null) {
          ngDialog.open({ template: 'partials/modals/payments.html', controller: 'PaymentsCtrl', className: 'ngdialog-theme-default', data : { flow : "order", page : "order" } });
        } else {
          ngDialog.open({ template: 'partials/modals/login.html', controller: 'AccountCtrl', className: 'ngdialog-theme-default' });
        }

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
          return true;
        } else {
          return false;
        }

      };

      scope.createPost = function() {
        $
      }

      scope.subscribe = function() {

        University.subscribeOnUniversity(university.url).then(function(res) {

          if (userSubscribed(scope.university.members)) {

            let studentIdMembersLocation = userMembersLocation(scope.university.members);

            scope.university.members.splice(studentIdMembersLocation, 1);

          } else {

            console.log("user added: ");
            console.log(res);
            scope.university.members.push({ accountId : studentId });

          }

        });

      };
      /* end subscribe */

    }
    // end link
  }
}])

/* forum post */
.directive('forumpost', ['University', '$rootScope', function(University, $rootScope) {
  return {
    restrict: 'E',
    templateUrl: '../partials/forumposttemplate.html',
    replace: true,
    scope: true,
    link: function(scope, element, attr) {

      let post = JSON.parse(attr.p);

      scope.post = post;

      scope.upvoteForumPost = function(post) {

        let postId = post._id;

        var index = scope.$parent.forumPosts.findIndex(x=>x._id === postId)

        University.upvoteForumPost(scope.$parent.university._id, postId).then(function(res) {

          if (res.data.success) {

            let posts = scope.$parent.forumPosts;

            posts[index].votesCount += 1;
            scope.$parent.forumPosts = posts;

            scope.post.votesCount += 1;

          }

        });

      };

      /* down vote */

      scope.downvoteForumPost = function(postId) {

        console.log(postId);

        University.downvoteForumPost(scope.university._id, postId).then(function(res) {

          if (res.data.success) {

            scope.post.votesCount -= 1;

          }

        });

      };

    }
  }
}])

.filter('unsafe', function($sce) { return $sce.trustAsHtml; });
