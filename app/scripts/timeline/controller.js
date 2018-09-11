'use strict';

/* Controllers */

angular.module('netbase')

.controller('TopicMenuCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'Timeline', '$localStorage', 'jwtHelper', 'Knowledge', function($rootScope, $scope, $location, $route, University, Timeline, $localStorage, jwtHelper, Knowledge) {

  $scope.subscribe = function() {

    let knowledgeId = "";

    Knowledge.subscribe(knowledgeId).success(function(res) {

      let success = res.success;
      let data = res.data;

    });

  }

}])

.controller('HomeTimelineCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'Timeline', '$localStorage', 'jwtHelper', function($rootScope, $scope, $location, $route, University, Timeline, $localStorage, jwtHelper) {

  $scope.page = 1;
  $scope.pages = 1;

  var studentId;

  if ($localStorage.token != undefined && $localStorage.token != null) {
    studentId = jwtHelper.decodeToken($localStorage.token)._id;
  }

  $scope.forumPosts = [];

  Timeline.getTimelineByStudentId(studentId, $scope.page).success(function(res) {

    console.log(res)
    let forumPosts = res.data.docs;
    console.log(forumPosts)
    $scope.forumPosts = forumPosts;
    $scope.pages = res.data.pages;

  });
  //END Timeline.getTimelineByStudentId()

  $scope.busy = false;

  $scope.nextPage = function() {

    $scope.page = $scope.page + 1;

    $scope.busy = true;

    if ($scope.page <= $scope.pages) {

      Timeline.getTimelineByStudentId(studentId, $scope.page).success(function(res) {

        let forumPosts = res.data.docs;

        $scope.forumPosts = $scope.forumPosts.concat(forumPosts);

        $scope.busy = false;

      });
      //END Timeline
    }

  };

}])

.directive('timelinemenuuniversity', ['University', 'Students', '$filter', '$sce', '$location', function(University, Students, $filter, $sce, $location) {
  return {
    restrict: 'E',
    template: '<div class="option"><a href="/a/{{university.url}}">{{university.name}}</a></div>',
    replace: true,
    scope: true,
    link: function(scope, element, attr) {

      let universityId = attr.uid;

      if ( University.isStoredLocal(universityId) ) {

        let universityStorage = University.retrieveStorage(universityId);

        scope.university = universityStorage[universityId];
        console.log(scope.university)

      } else {

        University.getUniversityById(universityId).success(function(res) {

          scope.university = res.data;

          University.storeLocal(scope.university);

        });

      }

    }

  }

}])

.directive('timelineposthome', ['University', 'Students', '$filter', '$sce', '$location', function(University, Students, $filter, $sce, $location) {
  return {
    restrict: 'E',
    templateUrl: '../partials/directive/timelinepost.html',
    replace: true,
    scope: true,
    link: function(scope, element, attr) {

      let post = JSON.parse(attr.fp);

      if (post.text.indexOf("iframe") != -1) {
        post.text = $sce.trustAsHtml(post.text)
      } else {
        post.text = $filter('limitHtml')(post.text, 350, '...')
      }

      scope.post = post;

      let universityId = post.universityId;

      if ( University.isStoredLocal(universityId) ) {

        let universityStorage = University.retrieveStorage(universityId);

        scope.university = universityStorage[universityId];
        console.log(scope.university)

      } else {

        University.getUniversityById(post.universityId).success(function(res) {

          scope.university = res.data;

          University.storeLocal(scope.university);

        });

      }

      /* student id */

      let studentId = post.accountId;

      if ( Students.isStoredLocal(studentId) ) {

        let studentStorage = Students.retrieveStorage(studentId);

        scope.user = studentStorage[studentId];
        console.log(scope.user)

      } else {

        Students.getStudentById(post.accountId).then(function(res) {

          let user = res.data.data;

          scope.user = user;

          Students.storeLocal(user);

          if (user.imageUrl != undefined && user.imageUrl != null) {
            scope.userImage = user.imageUrl;
          }

        });
        //END Students

      }
      //END Students.isStoredLocal(studentId)

      scope.gotocomment = function() {
        $location.path('/a/' + scope.university.url + '/forum/post/id/' + scope.post._id);
      }

      scope.upvoteForumPost = function() {

        University.upvoteForumPost(post.universityId, post._id).then(function(res) {

          console.log("upvote with success")
          scope.post.votesCount = scope.post.votesCount + 1;

        });

      };

    }
  }
}])
