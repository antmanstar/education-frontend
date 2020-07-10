'use strict';

/* Controllers */

angular.module('netbase')

.filter('unsafe', function($sce) { return $sce.trustAsHtml; })

.controller('VideoWatchCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'Videos', '$sce', 'User', 'Forum', 'Students', 'ngDialog', '$localStorage', 'jwtHelper', function($rootScope, $scope, $location, $route, University, Videos, $sce, User, Forum, Students, ngDialog, $localStorage, jwtHelper) {

    let videoId = $route.current.params.videoId;

    let viewers = {};

    let logged = $rootScope.logged;

    Videos.getById(videoId).success(function(res) {

        console.log(res);

        let status = res.status;

        if (status == 90010) {

            $location.path('/home');

        } else {

            $scope.video = res.data;

            console.log($scope.video)

            if ($scope.video != null && $scope.video != undefined) {

                /* Video is being processed */
                //$scope.video

                /* */

                //console.log($scope.video.file.indexOf(".mp4"))

                if ($scope.video.file.indexOf(".mp4") == -1 && $scope.video.file.indexOf(".wmv") == -1) {

                    const video = document.querySelector('video');

                    const player = new Plyr(video);

                    if (!Hls.isSupported()) {
                        video.src = $scope.video.file;
                    } else {
                        // For more Hls.js options, see https://github.com/dailymotion/hls.js
                        const hls = new Hls();
                        hls.loadSource($scope.video.file);
                        hls.attachMedia(video);
                    }

                } else {

                    console.log("is mp4")
                    $("video").attr("src", $scope.video.file);

                }

                // Get University

                $scope.studentIsAdmin = false;

                if ($scope.video.universityId.length > 0) {

                    let studentId;

                    if ($localStorage.token != undefined && $localStorage.token != null) {
                        studentId = jwtHelper.decodeToken($localStorage.token)._id;
                    }

                    University.getUniversityById($scope.video.universityId).success(function(res) {

                        let university = res.data;
                        $scope.university = university;

                        /* check if student is a premium member */
                        for (let idx = 0; idx < university.members.length; idx++) {

                            var member = university.members[idx];

                            if (studentId != undefined && member.accountId == studentId && member.privilege == 99) {
                                $scope.studentIsAdmin = true;
                            }
                        }
                        //END for (let idx)

                        /* Get Forum Post */

                        Forum.getForumPostById($scope.video.forumpostId, $scope.video.universityId).success(function(res) {

                            $scope.forumPost = res.data;

                        });
                        //END Forum.getForumPostById

                    });
                    //END

                }

                // Time Tracking

                Students.getStudentById($scope.video.accountId).success(function(res) {

                    console.log("student: ")
                    console.log(res);
                    $scope.student = res.data;

                });
                /* */

                viewers = $scope.video.viewers;

                let timeWatched = 0;

                if (logged) {

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

                // FIX

                setInterval(function() {

                    let player = $("video").get(0);

                    if (player != undefined) {

                        let percentComplete = player.currentTime / player.duration;

                        if (timeWatched < player.currentTime) {

                            timeWatched = player.currentTime;

                            let payload = { timeWatched: timeWatched };

                            Videos.progress(payload, videoId).success(function(res) {

                                console.log("time viewed updated")
                                console.log(res);

                            });
                            //END update progress

                        }
                        //END timeWatched < player.currentTime

                    }

                }, 10000);
                //END setInterval


            }
            //END if (video is null or undefined)

        }
        //END status 90010

    });
    //END Videos.getById

    $scope.createAnswerPost = function() {

        var data = { text: $scope.answer };

        // change forum post structure

        var data = { text: $scope.answer };

        if ($localStorage.token != undefined || $localStorage.token != null) {

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
            //END Forum.postAnswerByForumPostId

        } else {
            ngDialog.open({ template: 'partials/modals/login.html', controller: 'AccountCtrl', className: 'ngdialog-theme-default' });
        }

    };

    $scope.openViewers = function() {
        let player = $("video").get(0);
        let duration = player.duration;
        console.log("duration: " + duration)
        ngDialog.open({ template: 'partials/modals/videoaccountviewer.html', controller: 'VideoViewersCtrl', className: 'ngdialog-theme-default', data: { viewers: viewers, duration: duration } });
    }

}])

.controller('VideoCreateCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'Playlist', 'Videos', function($rootScope, $scope, $location, $route, University, Playlist, Videos) {

    let universityId;

    if ($location.search().universityId != undefined) {
        universityId = { _id: $location.search().universityId };
    } else {
        universityId = { _id: undefined };
    }

    $scope.playlistSelect = { _id: undefined };

    $scope.universityId = universityId;

    Playlist.getAllPlaylistByUniversityId(universityId._id).success(function(res) {

        $scope.playlists = res.data;

    });

    $scope.privilege = { value: 0 };
    $scope.premium = { value: 0 };
    $scope.errorDisplay = false;
    $scope.errorMessages = [];

    /* */

    $scope.createVideo = function() {

        let file = $("#file").attr("value");

        let upload = true;

        let payload = {
            playlistId: $scope.playlistSelect._id,
            title: $scope.title,
            description: $scope.description,
            file: file,
            permissionMin: $scope.privilege.value,
            universityId: universityId._id,
            premium: $scope.premium.value
        };

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

.controller('PlaylistCreateCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'Playlist', 'ngDialog', function($rootScope, $scope, $location, $route, University, Playlist, ngDialog) {

    $scope.privilege = { value: 0 };
    $scope.premium = { value: 0 };

    let universityId;

    if ($location.search().universityId != undefined) {
        universityId = { _id: $location.search().universityId };
    } else {
        universityId = { _id: undefined };
    }

    $scope.createPlaylist = () => {
        let payload = {
            title: $scope.title,
            description: $scope.text,
            permissionMin: $scope.privilege.value,
            premium: $scope.premium.value,
            universityId: universityId._id
        };

        let createPlaylist = true;
        let errors = [];

        if ($scope.title == undefined || $scope.title.length == 0) {
            createPlaylist = false;
            errors.push("Escreva um título para a playlist")
        }

        if ($scope.text == undefined || $scope.text.length == 0) {
            createPlaylist = false;
            errors.push("Escreva um texto na playlist")
        }

        if (createPlaylist) {
            Playlist.create(payload).success(res => {
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
                } else {}
            });
        } else {
            $scope.errors = errors;
        }
    };

}])

.controller('VideoViewersCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'Videos', '$sce', '$localStorage', 'User', 'Forum', 'Students', function($rootScope, $scope, $location, $route, University, Videos, $sce, $localStorage, User, Forum, Students) {

    let viewers = $scope.ngDialogData.viewers;
    let playerDuration = $scope.ngDialogData.duration;

    $scope.viewers = viewers;
    $scope.playerDuration = playerDuration;

    console.log("viewers: ")
    console.log($scope.viewers)

}])

.directive('accountviewer', ['Students', function(Students) {
    return {
        restrict: 'E',
        templateUrl: "../partials/directive/accountviewer.html",
        replace: true,
        scope: true,
        link: function(scope, element, attr) {

            let viewer = JSON.parse(attr.v);
            let playerDuration = attr.pd;

            console.log("playerDuration: ");
            console.log(playerDuration);

            scope.playerDuration = playerDuration;
            scope.viewer = viewer;

            scope.percentage = Math.floor(viewer.time / playerDuration * 100);

            Students.getStudentById(viewer.accountId).then(function(res) {

                console.log("student by id: ")
                console.log(res);
                let account = res.data.data;

                scope.account = account;

                if (account.imageUrl != undefined) {
                    scope.picture = account.imageUrl;
                } else {
                    scope.picture = "/img/user/user.png";
                }

            });

        }
    }
}])