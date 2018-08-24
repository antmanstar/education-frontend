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

.controller('AcademiaPlaylistsByIdCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'Playlist', 'Videos', function($rootScope, $scope, $location, $route, University, Playlist, Videos) {

  let universityUrl = $route.current.params.academiaName;
  let playlistId = $route.current.params.playlistId;

  University.getUniversity(universityUrl).then(function(res) {

    $scope.university = res.data.data;

    Playlist.getPlaylistById(playlistId).success(function(res) {

      console.log(res);

      $scope.playlist = res.data;

    });

  });


}])

.controller('AcademiaPlaylistsCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'Playlist', function($rootScope, $scope, $location, $route, University, Playlist) {

  let universityUrl = $route.current.params.academiaName;

  University.getUniversity(universityUrl).then(function(res) {

    $scope.university = res.data.data;

    Playlist.getAllPlaylistByUniversityId($scope.university._id).success(function(res) {

      console.log(res);

      $scope.playlists = res.data;

    });

  });

}])

.controller('AcademiaPlanPurchaseCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', '$filter', 'ngDialog' , function($rootScope, $scope, $location, $route, University, $filter, ngDialog) {

  $scope.university = $scope.ngDialogData.university;

  $scope.planAmount = function(amount) {
    return amount.substr(0, amount.length - 2) + "." + amount.substr(amount.length - 2, amount.length);
  }

  $scope.subscribe = function(plan) {
    ngDialog.open({ template: 'partials/modals/payments.html', controller: 'PaymentsCtrl', className: 'ngdialog-theme-default', data : { flow : "order", page : "order", plan : plan, university : $scope.university } });
  }


}])

.controller('AcademiaForumCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', '$timeout' , function($rootScope, $scope, $location, $route, University, $timeout) {

  let universityUrl = $route.current.params.academiaName;

  /* forum posts */
  $scope.forumPosts = [];
  $scope.page = 1;
  $scope.pages = 1;

  if ($location.search().page != undefined) {
    $scope.page = $location.search().page;
  }

  /* get university informations */

  University.getUniversity(universityUrl).then(function(res) {

    let success = res.data.success;
    let university = res.data.data;

    if (success) {

      $scope.university = university;

      console.log(university);

      University.getUniversityForumPosts(university._id, $scope.page).then(function(res) {

        let forumPostsRequested = res.data.data.docs;
        $scope.page = Number(res.data.data.page);
        $scope.pages = res.data.data.pages;
        $scope.forumPosts = $scope.forumPosts.concat(forumPostsRequested);

        console.log(res.data.data);

      }).catch(function(e) {

        console.log("forum post error request: ");
        console.log(e);

      });

    } else {

      console.log("error while loading university")

    }


  });

  /* get all forum posts */

  $scope.range = function(min, max, step) {
    step = step || 1;
    var input = [];
    for (var i = min; i <= max; i += step) {
        input.push(i);
    }
    return input;
  };

}])

.controller('AcademiaForumCategoryByIdCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', '$timeout', 'Forum', function($rootScope, $scope, $location, $route, University, $timeout, Forum) {

  let universityUrl = $route.current.params.academiaName;
  let categoryId = $route.current.params.categoryId;

  /* forum posts */
  $scope.forumPosts = [];
  $scope.page = 1;
  $scope.pages = 1;

  console.log($location.search().page)

  if ($location.search().page != undefined) {
    $scope.page = $location.search().page;
  }

  $scope.categoryId = categoryId;

  /* get university informations */
  University.getUniversity(universityUrl).then(function(res) {

    let success = res.data.success;
    let university = res.data.data;

    if (success) {

      $scope.university = university;

      Forum.getForumPostsByCategoryId(university._id, categoryId, $scope.page).success(function(res) {

        if (res.success) {

          let forumPostsRequested = res.data.docs;
          $scope.page = Number(res.data.page);
          $scope.pages = res.data.pages;
          $scope.forumPosts = $scope.forumPosts.concat(forumPostsRequested);

        }

      });

      //END Forum.getCategoriesByUniversityId

    } else {

      console.log("error while loading university")

    }


  });

  /* get all forum posts */

  $scope.range = function(min, max, step) {
    step = step || 1;
    var input = [];
    for (var i = min; i <= max; i += step) {
        input.push(i);
    }
    return input;
  };

}])

.controller('AcademiaForumCategoryAllCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', '$timeout', 'Forum', function($rootScope, $scope, $location, $route, University, $timeout, Forum) {

  let universityUrl = $route.current.params.academiaName;

  /* forum posts */
  $scope.forumPosts = [];

  /* get university informations */

  University.getUniversity(universityUrl).then(function(res) {

    let success = res.data.success;
    let university = res.data.data;

    if (success) {

      $scope.university = university;

      Forum.getCategoriesByUniversityId($scope.university._id).success(function(resCategory) {

        console.log(resCategory)

        if (resCategory.success) {

          $scope.categories = resCategory.data;

        }

      });
      //END Forum.getCategoriesByUniversityId

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

.controller('AcademiaForumCategoryCreateCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'Forum', '$sce', '$localStorage', 'ngDialog', 'jwtHelper', function($rootScope, $scope, $location, $route, University, Forum, $sce, $localStorage, ngDialog, jwtHelper) {

  let universityUrl = $route.current.params.academiaName;

  let university;

  University.getUniversity(universityUrl).then(function(res) {

    $scope.university = res.data.data;
    university = res.data.data;

    console.log(university);

  });
  // END getUniversity

  $scope.privilege = {
    value : 0
  };

  $scope.createCategory = function() {

    let data = {
      title : $scope.title,
      description : $scope.description,
      privilegeMin : $scope.privilege.value
    }

    Forum.createCategory(university._id, data).success(function(res) {

      if (res.success) {

        $location.path("/a/" + university.url + "/forum/category/id/" + res.data._id)

      }

    });

  }

}])

.controller('AcademiaForumPostCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'Forum', '$sce', '$localStorage', 'ngDialog', 'jwtHelper', function($rootScope, $scope, $location, $route, University, Forum, $sce, $localStorage, ngDialog, jwtHelper) {

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

      console.log(res)

      if (status != 90010) {

        $scope.forumPost = data;
        $scope.votesCount = data.votesCount;

        $scope.forumPost.text = $sce.trustAsHtml($scope.forumPost.text);

      } else {

        // Premium content
        $scope.getPremium = true;
        $scope.forumPost = data;

      }


    });

  });

  /* premium */
  let studentId;

  if ($localStorage.token != undefined && $localStorage.token != null) {
    studentId = jwtHelper.decodeToken($localStorage.token)._id;
  }

  $scope.premium = function () {

    //check if logged before
    if ($localStorage.token != undefined && $localStorage.token != null) {

      //ngDialog.open({ template: 'partials/modals/payments.html', controller: 'PaymentsCtrl', className: 'ngdialog-theme-default', data : { flow : "order", page : "order" } });
      ngDialog.open({ template: 'partials/modals/planbuy.html', controller: 'AcademiaPlanPurchaseCtrl', className: 'ngdialog-theme-default', data : { university : $scope.university } });

    } else {
      ngDialog.open({ template: 'partials/modals/login.html', controller: 'AccountCtrl', className: 'ngdialog-theme-default' });
    }

  }

  /* votes */

  $scope.votesCount = 0;

  $scope.updateForumPost = function() {

    $location.path("/a/" + universityUrl + "/forum/post/id/" + postId + "/update")

  }

  $scope.createAnswerPost = function() {

    var data = { text : $scope.answer };

    Forum.postAnswerByForumPostId(postId, data).then(function(res) {

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

  $scope.youtubeLink = "";
  $scope.title = "";
  $scope.form = { iconClass : "", placeholder : "" };

  let type = $scope.ngDialogData.type;
  $scope.type = type;

  if (type == "sound") {

    $scope.title = "Add SoundCloud embed";
    $scope.form.iconClass = "fab fa-soundcloud";
    $scope.form.placeholder = "SoundCloud embed link";
    $scope.form.button = "Add SoundCloud embed";

    $scope.imagePush = "";

    $scope.$watch('link', function() {

      let link = $scope.link;

      $scope.soundCloudIframe = $sce.trustAsHtml(link);

    }, true);

    $scope.add = function() {

      let embed = $scope.link;

      let attachment = new Trix.Attachment({content: embed})
      $rootScope.trix.insertAttachment(attachment)

      ngDialog.close();

    }

  }

  if (type == "pic") {

    $scope.title = "Add Picture";
    $scope.form.iconClass = "glyphicon glyphicon-picture";
    $scope.form.placeholder = "Image link";
    $scope.form.button = "Add image";

    $scope.imagePush = "";

    $scope.$watch('link', function() {

      let link = $scope.link;

    }, true);

    $scope.add = function() {

      let image = "<img class='trix-pic' src='" + $scope.imageLink + "' />"

      console.log(image);

      let attachment = new Trix.Attachment({content: image})
      $rootScope.trix.insertAttachment(attachment)

      ngDialog.close();

    }

  }

  if (type == "video") {

    $scope.title = "Add YouTube video";
    $scope.form.iconClass = "fab fa-youtube";
    $scope.form.placeholder = "YouTube Link";
    $scope.form.button = "Add video";

    $scope.add = function() {

      let iframe = "<iframe src='" + $scope.ytiFrame + "' frameborder='0' allowfullscreen></iframe>"

      let attachment = new Trix.Attachment({content: iframe})
      $rootScope.trix.insertAttachment(attachment)

      ngDialog.close();

    }

    $scope.$watch('link', function() {

      let link = $scope.link;
      let youtubeId = link.split('=').pop();
      let previewImage = 'http://img.youtube.com/vi/' + youtubeId + '/0.jpg';

      $scope.previewImage = previewImage;
      $scope.youtubeId = youtubeId;

      if (link.search("youtube.com") != -1) {
        $scope.ytiFrame = "https://www.youtube.com/embed/" + youtubeId;
        $scope.ytiFrameSCE = $sce.trustAsResourceUrl("https://www.youtube.com/embed/" + youtubeId);
      }

    }, true);

  }

}])

.controller('AcademiaForumPostCreateCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'ngDialog', 'Forum', function($rootScope, $scope, $location, $route, University, ngDialog, Forum) {

  let universityUrl = $route.current.params.academiaName;
  let university;

  console.log("look it ")
  console.log($location.search());

  if ($location.search().categoryId != undefined) {
    $scope.categoryForum = { _id : $location.search().categoryId };
  } else {
    $scope.categoryForum = { _id : undefined };
  }

  /* load information */

  University.getUniversity(universityUrl).then(function(res) {

    $scope.university = res.data.data;
    university = res.data.data;

    Forum.getCategoriesByUniversityId($scope.university._id).success(function(resCategory) {

      console.log(resCategory)

      if (resCategory.success) {

        $scope.categories = resCategory.data;

      }

    });
    //END Forum.getCategoriesByUniversityId

  });

  /* edit editor */
  $scope.trixInitialize = function(e, editor) {

	   var document = editor.getDocument()
     $rootScope.trix = editor;

     $(".block_tools").append('<button class="trix-icon yt" type="button" data-attribute="video" id="videoAppend"><i class="fab fa-youtube"></i></button>');

     $(".block_tools").append('<button class="trix-icon pic" type="button" data-attribute="pic" id="picAppend"><i class="glyphicon glyphicon-picture"></i></button>');

     $(".block_tools").append('<button class="trix-icon sound" type="button" data-attribute="sound" id="soundAppend"><i class="glyphicon glyphicon-picture"></i></button>');

     $("#soundAppend").click(function() {
       ngDialog.open({ template: 'partials/modals/forumpostoption.html', data : { type : "sound" }, controller: "AcademiaForumPostCreateOptionCtrl", className: 'ngdialog-theme-default' });
     });

     $("#picAppend").click(function() {
       ngDialog.open({ template: 'partials/modals/forumpostoption.html', data : { type : "pic" }, controller: "AcademiaForumPostCreateOptionCtrl", className: 'ngdialog-theme-default' });
     });

     $("#videoAppend").click(function() {
       ngDialog.open({ template: 'partials/modals/forumpostoption.html', data : { type : "video" }, controller: "AcademiaForumPostCreateOptionCtrl", className: 'ngdialog-theme-default' });
     });

  }

  /* create forum post by id */

  $scope.premium = { value : "0" };


  $scope.createForumPost = function() {

    var data = {
      text : $scope.text,
      title : $scope.title,
      premium : $scope.premium.value,
      categoryId : $scope.categoryForum._id
    };

    console.log(data);

    University.createForumPost(university._id, data).then(function(res) {

      let status = res.data.status;
      let data = res.data.data;
      let success = res.data.success;

      if (success) {

        $location.path('/a/' + university.url + '/forum/post/id/' + data._id)
        window.scrollTo(0, 0);

      }

    });

  };

}])

.controller('AcademiaForumPostUpdateCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'ngDialog', 'Forum', function($rootScope, $scope, $location, $route, University, ngDialog, Forum) {

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

      console.log($scope.forumPost)

      $scope.title = $scope.forumPost.title;
      $scope.text = $scope.forumPost.text;

      if ($scope.forumPost.premium == false) {
        $scope.premium = { value : 0 };
      } else if ($scope.forumPost.premium == true) {
        $scope.premium = { value : 1 };
      } else {

      }

    });

  });

  /* load forum post */


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

  $scope.updateForumPost = function() {

    var data = {
      text : $scope.text,
      title : $scope.title,
      premium : $scope.premium.value
    };

    /* find youtube video and turn into iframe */

    University.updateForumPost(university._id, postId, data).then(function(res) {

      let status = res.data.status;
      let data = res.data.data;
      let success = res.data.success;

      if (success) {

        $location.path('/a/' + university.url + '/forum/post/id/' + data._id)
        window.scrollTo(0, 0);

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
      } else if (controllerActive == "AcademiaForumCategoryByIdCtrl" || controllerActive == "AcademiaForumCategoryAllCtrl") {
        scope.categoryClass = "active";
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

      let studentId;

      if ($localStorage.token != undefined && $localStorage.token != null) {
        studentId = jwtHelper.decodeToken($localStorage.token)._id;
        console.log(studentId)
      }

      scope.studentIsPremium = false;
      scope.studentIsAdmin = false;

      attr.$observe('university', function(value) {

        if (value) {

          university = JSON.parse(value);

          /* check if student is a premium member */
          for (let idx = 0; idx < university.members.length; idx++) {

            var member = university.members[idx];

            if (studentId != undefined && member.accountId == studentId && member.privilege == 10) {
              scope.studentIsPremium = true;
            }

            if (studentId != undefined && member.accountId == studentId && member.privilege == 99) {
              console.log("é 99")
              scope.studentIsAdmin = true;
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

        }

      });

      scope.premium = function () {

        //check if logged before
        if ($localStorage.token != undefined && $localStorage.token != null) {

          //ngDialog.open({ template: 'partials/modals/payments.html', controller: 'PaymentsCtrl', className: 'ngdialog-theme-default', data : { flow : "order", page : "order" } });
          ngDialog.open({ template: 'partials/modals/planbuy.html', controller: 'AcademiaPlanPurchaseCtrl', className: 'ngdialog-theme-default ngdialog-plans', data : { university : university } });

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

.directive('videorow', ['Videos', '$rootScope', function(Videos, $rootScope) {
  return {
    restrict: 'E',
    templateUrl: '../partials/academia/videorow.html',
    replace: true,
    scope: true,
    link: function(scope, element, attr) {

      let videoId = attr.videoid;

      Videos.getById(videoId).success(function(res) {

        console.log(res);
        scope.video = res.data;

      });

      console.log(videoId)

    }
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
