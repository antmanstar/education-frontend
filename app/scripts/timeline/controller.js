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

.controller('HomeTimelineCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'Timeline', '$localStorage', 'jwtHelper', 'TimelineNew', function($rootScope, $scope, $location, $route, University, Timeline, $localStorage, jwtHelper, TimelineNew) {

  $scope.page = 1;
  $scope.pages = 1;

  $scope.loading = true;

  var studentId;

  if ($localStorage.token != undefined && $localStorage.token != null) {
    studentId = jwtHelper.decodeToken($localStorage.token)._id;
  }

  $scope.forumPosts = [];

  TimelineNew.getTimelineAll(studentId, $scope.page).success(function(res) {

    let forumPosts = res.data.docs;

    $scope.activities = forumPosts;
    $scope.pages = res.data.pages;

    $scope.loading = false;

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

.directive('timelinenewforumpost', ['University', 'Students', '$filter', '$sce', '$location', 'Forum', '$localStorage', "TimelineNew", function(University, Students, $filter, $sce, $location, Forum, $localStorage, TimelineNew) {
  return {
    restrict: 'E',
    templateUrl:  '../../partials/directive/timeline/forumpostcreate.html',
    replace: true,
    scope: true,
    link: function(scope, element, attr) {

      let universityId = attr.uid;
      let contentId = attr.cid;
      let accountId = attr.aid;
      let reshare = attr.reshare;
      let like = attr.like;
      let comments = attr.comments;

      scope.commentSection = false;
      scope.status = { reshare : reshare, like : like, comments : comments };
      scope.sharePost = false;
      TimelineNew.getTimelineRePostCount(contentId).success(function(res) {
        scope.rePostCount = res.data.count-1;
      });

      if ( University.isStoredLocal(universityId) ) {

        let universityStorage = University.retrieveStorage(universityId);

        scope.university = universityStorage[universityId];

        /* get post */
        Forum.getForumPostById(contentId, scope.university._id).then(function(res) {

          let status = res.data.status;
          let data = res.data.data;
          let success = res.data.success;

          if (status != 90010) {

            scope.forumPost = data;
            scope.votesCount = data.votesCount;

            scope.forumPost.text = $sce.trustAsHtml(scope.forumPost.text);

          } else {

            // Premium content
            scope.getPremium = true;
            scope.forumPost = data;

          }


        });

        /* get account id */
        Students.getStudentById(accountId).then(function(res) {

          scope.student = res.data.data;

        });

      } else {

        University.getUniversityById(universityId).success(function(res) {

          scope.university = res.data;
          University.storeLocal(scope.university);

          /* get post */
          Forum.getForumPostById(contentId, scope.university._id).then(function(res) {

            let status = res.data.status;
            let data = res.data.data;
            let success = res.data.success;

            console.log(res)

            if (status != 90010) {

              scope.forumPost = data;
              scope.votesCount = data.votesCount;

              scope.forumPost.text = $sce.trustAsHtml(scope.forumPost.text);

            } else {

              // Premium content
              scope.getPremium = true;
              scope.forumPost = data;

            }


          });

        });

      }

      scope.handleCommentSection = function() {
        scope.sharePost = false;
        scope.commentSection = !scope.commentSection;
      }

      scope.handleSharePost = function() {
        scope.commentSection = false;
        scope.sharePost = !scope.sharePost;
      }

      scope.createAnswerPost = function(answer) {
        console.log(answer);
        var data = { text : answer };

        if ($localStorage.token != undefined || $localStorage.token != null) {
          Forum.postAnswerByForumPostId(contentId, data).then(function(res) {

            let status = res.data.status;
            let data = res.data.data;
            let success = res.data.success;

            if (success) {
              scope.commentSection = !scope.commentSection;

              data.votesCount = 0;
              data.createdAt = Math.round((new Date()).getTime() / 1000);
              scope.forumPost.answers.push(data);
              var timelineData = {
                entryType: "comment",
                modelId: contentId,
                universityId: universityId
              }
              University.createForumPostTimeline(timelineData).then(function(res) {})

            }

          });
        } else {
          ngDialog.open({ template: 'partials/modals/login.html', controller: 'AccountCtrl', className: 'ngdialog-theme-default' });
        }


      };
      scope.premium = { value : "0" };
      scope.rePost = function(entryType) {
        var data = {
          text : scope.forumPost.text,
          title : scope.forumPost.title,
          premium : scope.forumPost.premium==false ? "0" : "1",
          categoryId : scope.forumPost.categoryId
        };

        University.createForumPost(universityId, data).then(function(res) {

          let status = res.data.status;
          let data = res.data.data;
          let success = res.data.success;

          if (success) {
            var timelineData = {
              entryType: "repost",
              modelId: data._id,
              universityId: data.universityId
            }
            University.createForumPostTimeline(timelineData).then(function(res) {
              // $location.path('/home/timeline')
              window.location.reload();
              window.scrollTo(0, 0);
            })

          }

        });
        //END University.createForumPost
      };

      scope.upvoteForumPost = function() {
          University.upvoteForumPost(universityId, contentId).then(function(res) {
            if (res.data.success) {
              scope.votesCount = res.data.data.votesCount;
              scope.forumPost.votes = res.data.data.votes;
            }
          });
      };

    }

  }

}])

.directive('timelinemenuuniversity', ['University', 'Students', '$filter', '$sce', '$location', function(University, Students, $filter, $sce, $location) {
  return {
    restrict: 'E',
    templateUrl:  '../../partials/directive/timelineuniversityrow.html',
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

        console.log("scope user name: ")
        console.log(scope.user.name)
        console.log(scope.user.name.length)

        if (scope.user.name.length > 14) {
          scope.user.name = $filter('limitHtml')(scope.user.name, 15, '...');
        }

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
