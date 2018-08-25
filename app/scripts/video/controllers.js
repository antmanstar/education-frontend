'use strict';

/* Controllers */

angular.module('netbase')

.filter('unsafe', function($sce) { return $sce.trustAsHtml; })

.controller('VideoWatchCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'Videos', '$sce', '$localStorage', 'User', 'Forum', 'Students' , function($rootScope, $scope, $location, $route, University, Videos, $sce, $localStorage, User, Forum, Students) {

  let videoId = $route.current.params.videoId;

  let player = $("video").get(0);

  let viewers = {};

  let logged = $rootScope.logged;

  Videos.getById(videoId).success(function(res) {

    console.log(res);

    let status = res.status;

    if (status == 90010) {

      $location.path('/home');

    } else {

      $scope.video = res.data;

      if(Hls.isSupported()) {
        var hls = new Hls();
        hls.loadSource($scope.video.file);
        hls.attachMedia(player);
      }

      $scope.video.file = $sce.trustAsResourceUrl($scope.video.file);
      $scope.forumPost = res.forumpost;
      /* video progress */

      //ng-src="{{video.file}}"

      /* Load channel owner */
      Students.getStudentById($scope.video.accountId).success(function(res) {

        console.log("student: ")
        console.log(res);
        $scope.student = res.data;

      });
      /* */

      viewers = $scope.video.viewers;

      if (logged) {

        let timeWatched = 0;

        let accountId = User.getId();

        if (viewers.length > 0) {

          for (let idx = 0; idx < viewers.length; idx++) {

            if (viewers[idx].accountId == accountId) {
              timeWatched = viewers[idx].time;
            }

          }

        }
        //END viewers

      }
      //END logged

      setInterval(function(){

          let percentComplete = player.currentTime / player.duration;

          if (timeWatched < player.currentTime) {

            timeWatched = player.currentTime;

            let payload = { timeWatched : timeWatched };

            Videos.progress(payload, videoId).success(function(res) {

              console.log("time viewed updated")

            });
            //END update progress

          }
          //END timeWatched < player.currentTime

      }, 10000);
      //END setInterval

    }
    //END status 90010

  });
  //END Videos.getById

  $scope.createAnswerPost = function() {

    var data = { text : $scope.answer };

    // change forum post structure

    Forum.postAnswerByForumPostId($scope.forumPost._id, data).then(function(res) {

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

}])

.controller('VideoCreateCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'Playlist', 'Videos', function($rootScope, $scope, $location, $route, University, Playlist, Videos) {

  let universityId;

  if ($location.search().universityId != undefined) {
    universityId = { _id : $location.search().universityId };
  } else {
    universityId = { _id : undefined };
  }

  $scope.playlistSelect = { _id : undefined };

  Playlist.getAllPlaylistByUniversityId(universityId._id).success(function(res) {

    $scope.playlists = res.data;

  });

  $scope.privilege = { value : 0 };
  $scope.premium = { value : 0 };
  $scope.errorDisplay = false;
  $scope.errorMessages = [];

  /* */

  $scope.createVideo = function() {

    let file = $("#file").attr("value");

    let upload = true;

    let payload = {

      playlistId : $scope.playlistSelect._id,
      title : $scope.title,
      description : $scope.description,
      file : file,
      permissionMin : $scope.privilege.value,
      universityId : universityId._id,
      premium : $scope.premium.value
    };

    console.log("send")
    console.log(payload)

    if (payload.file == undefined) {
      $scope.errorMessages.push("O upload do vídeo precisa estar completo.");
      upload = false;
    }

    if (payload.title == undefined || payload.title.length == 0) {
      $scope.errorMessages.push("Escreva um título para o vídeo.");
      upload = false;
    }

    if (payload.description == undefined || payload.title.description == 0) {
      $scope.errorMessages.push("Escreva uma descricao para o vídeo.");
      upload = false;
    }

    if (payload.universityId == undefined || payload.title.universityId == 0) {
      $scope.errorMessages.push("O video deve ser criado dentro da página de uma universidade.");
      upload = false;
    }

    console.log(payload);

    if (upload) {
      Videos.create(payload).success(function(res) {

        console.log(res);
        $location.path("/v/id/" + res.data._id)

      });
    } else {
      $scope.errorDisplay = true;
    }

    /*
    Videos.create(payload).success(function(res) {

      console.log(res);
      $location.path("/v/id/" + res.data._id)

    });
    */

  }

}])

.controller('PlaylistCreateCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'Playlist', function($rootScope, $scope, $location, $route, University, Playlist) {

  $scope.privilege = { value : 0 };
  $scope.premium = { value : 0 };

  let universityId;

  if ($location.search().universityId != undefined) {
    universityId = { _id : $location.search().universityId };
  } else {
    universityId = { _id : undefined };
  }

  $scope.createPlaylist = function() {

    let payload = {
      title : $scope.title,
      description : $scope.text,
      permissionMin : $scope.privilege.value,
      premium : $scope.premium.value,
      universityId : universityId._id
    };

    Playlist.create(payload).success(function(res) {

      console.log(res);
      let success = res.success;
      let data = res.data;

      if (res.success) {

        console.log("university id: ")
        console.log(payload.universityId)

        University.getUniversityById(payload.universityId).success(function(res) {

          console.log(res)

          let university = res.data;

          let playlistUrl = "/a/" + university.url + "/playlist/id/" + data._id;

          $location.path(playlistUrl);

        });

      } else {

      }

    });

  }

}])
