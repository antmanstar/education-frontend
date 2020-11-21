'use strict';

/* Controllers */
angular.module('netbase')

.filter('unsafe', function($sce) { return $sce.trustAsHtml; })

.controller('VideoWatchCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'Videos', '$sce', 'User', 'Forum', 'Students', 'Courses', 'ngDialog', '$localStorage', 'jwtHelper', function($rootScope, $scope, $location, $route, University, Videos, $sce, User, Forum, Students, Courses, ngDialog, $localStorage, jwtHelper) {
    let videoId = $route.current.params.videoId;
    $scope.videoId = videoId;
    let viewers = {};
    let logged = $rootScope.logged;
    $scope.hasError = false;
    $scope.errMessage = '';

    Videos.getById(videoId).success(function(res) {
        let status = res.status;
        if (status == 90010) {
            $location.path('/home');
        } else {
            // setting up the textarea
            tinymce.init({
                selector: 'textarea',
                file_picker_types: 'file image media',
                tinydrive_token_provider: function(success, failure) {
                    Courses.fileUploadUrl().success(function(msg) {
                        success({ token: msg.token });
                    })
                },
                height: 400,
                tinydrive_google_drive_key: "carbisa-document-upload@carbisa.iam.gserviceaccount.com",
                tinydrive_google_drive_client_id: '102507978919142111240',
                plugins: 'print preview powerpaste casechange importcss tinydrive searchreplace autolink autosave save directionality advcode visualblocks visualchars fullscreen image link media mediaembed  codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists checklist wordcount tinymcespellchecker a11ychecker textpattern noneditable help formatpainter pageembed charmap mentions quickbars linkchecker emoticons advtable',
                toolbar: 'insertfile|undo redo | bold italic | alignleft aligncenter alignright | code|styleselect|outdent indent|link image'
            });

            $scope.video = res.data;
            if ($scope.video != null && $scope.video != undefined) {
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

                        /* Get Forum Post */
                        Forum.getForumPostById($scope.video.forumpostId, $scope.video.universityId).success(function(res) {
                            $scope.forumPost = res.data;
                        });
                    });
                }

                // Time Tracking
                Students.getStudentById($scope.video.accountId).success(function(res) {
                    $scope.student = res.data;
                });

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
                }

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
                        }
                    }
                }, 10000);
            }
        }
    });

    $scope.createAnswerPost = function() {
        // change forum post structure
        let text = tinymce.activeEditor.getContent()
        var data = { text: tinymce.activeEditor.getContent() };

        $scope.hasError = false;
        $scope.errorMessage = '';

        if ($localStorage.token != undefined || $localStorage.token != null) {
          // check if user enter a text
          if (text.length > 0) {
            Forum.postAnswerByForumPostId($scope.forumPost._id, data).then(function(res) {
                let status = res.data.status;
                let data = res.data.data;
                let success = res.data.success;

                if (success) {
                    data.votesCount = 0;
                    data.createdAt = Math.round((new Date()).getTime() / 1000);
                    $scope.forumPost.answers.push(data);
                    tinymce.activeEditor.setContent("");
                }
            });
          } else {
            $scope.hasError = true;
            $scope.errorMessage = 'COMMENT_NO_TEXT';
          }
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

.controller('VideoCreateCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'Playlist', 'Videos', 'Courses', '$cookies', '$localStorage', function($rootScope, $scope, $location, $route, University, Playlist, Videos, Courses, $cookies, $localStorage) {
    let universityId;
    $scope.loading = false

    let createVideoPlaylistId = $localStorage.createVideoPlaylistId

    $scope.tinymceOptions = {
        file_picker_types: 'file image media',
        tinydrive_token_provider: function(success, failure) {
            Courses.fileUploadUrl().success(function(msg) {
                success({ token: msg.token });
            })
        },
        height: 400,
        tinydrive_google_drive_key: "carbisa-document-upload@carbisa.iam.gserviceaccount.com",
        tinydrive_google_drive_client_id: '102507978919142111240',
        plugins: 'print preview powerpaste casechange importcss tinydrive searchreplace autolink autosave save directionality advcode visualblocks visualchars fullscreen image link media mediaembed  codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists checklist wordcount tinymcespellchecker a11ychecker textpattern noneditable help formatpainter pageembed charmap mentions quickbars linkchecker emoticons advtable',
        toolbar: 'insertfile|undo redo | bold italic | alignleft aligncenter alignright | code|styleselect|outdent indent|link image'
    };

    if ($location.search().universityId != undefined) {
        universityId = { _id: $location.search().universityId };
    } else {
        universityId = { _id: undefined };
    }

    $scope.universityId = universityId
    console.log('university ID: ', $scope.universityId)

    let universityid = universityId._id

    $scope.playlistSelect = { _id: createVideoPlaylistId };
    $scope.universityid = universityid;

    if (University.isStoredLocal($scope.universityid)) {
        let universityStorage = University.retrieveStorage($scope.universityid);
        $scope.university = universityStorage[$scope.universityid];

        console.log("university: ", $scope.university)
    } else {
        University.getUniversityById($scope.universityid).success(function(res) {
            $scope.university = res.data;
            console.log("university: ", $scope.university)
            University.storeLocal($scope.university);
        });
    }

    Playlist.getAllPlaylistByUniversityId(universityId._id).success(function(res) {
        $scope.playlists = res.data;
    });

    $scope.privilege = { value: 0 };
    $scope.premium = { value: 0 };
    $scope.errorDisplay = false;
    $scope.errorMessages = [];
    $scope.videoUploadAttension = () => {
        alert("Upload Video First");
    }

    $scope.createVideo = function() {
        $scope.loading = true
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
            $scope.errorMessages.push("VIDEO_UPLOAD_MUST_BE_COMPLETE");
            upload = false;
        }

        if (payload.title == undefined || payload.title.length == 0) {
            $scope.errorMessages.push("WRITE_VIDEO_TITLE_ERROR");
            upload = false;
        }

        if (payload.description == undefined || payload.description.length == 0) {
            $scope.errorMessages.push("WRITE_VIDEO_DESC_ERROR");
            upload = false;
        }

        if (payload.universityId == undefined || payload.universityId.length == 0) {
            $scope.errorMessages.push("WRITE_VIDEO_UNI_ERROR");
            upload = false;
        }

        if (upload) {
            $scope.loading = false
            Videos.create(payload).success(function(res) {
                console.log(res);
                $location.path("/v/id/" + res.data._id)
            });
        } else {
            $scope.loading = false
            $scope.errorDisplay = true;
        }
    }
}])

.controller('PlaylistCreateCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'Courses', 'Playlist', 'ngDialog', function($rootScope, $scope, $location, $route, University, Courses, Playlist, ngDialog) {
    $scope.privilege = { value: 0 };
    $scope.premium = { value: 0 };

    let universityId;

    $scope.tinymceOptions = {
        file_picker_types: 'file image media',
        tinydrive_token_provider: function(success, failure) {
            Courses.fileUploadUrl().success(function(msg) {
                success({ token: msg.token });
            })
        },
        height: 400,
        tinydrive_google_drive_key: "carbisa-document-upload@carbisa.iam.gserviceaccount.com",
        tinydrive_google_drive_client_id: '102507978919142111240',
        plugins: 'print preview powerpaste casechange importcss tinydrive searchreplace autolink autosave save directionality advcode visualblocks visualchars fullscreen image link media mediaembed  codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists checklist wordcount tinymcespellchecker a11ychecker textpattern noneditable help formatpainter pageembed charmap mentions quickbars linkchecker emoticons advtable',
        toolbar: 'insertfile|undo redo | bold italic | alignleft aligncenter alignright | code|styleselect|outdent indent|link image'
    };

    if ($location.search().universityId != undefined) {
        universityId = { _id: $location.search().universityId };
    } else {
        universityId = { _id: undefined };
    }

    let universityid = universityId._id
    $scope.universityid = universityid;

    if (University.isStoredLocal($scope.universityid)) {
        let universityStorage = University.retrieveStorage($scope.universityid);
        $scope.university = universityStorage[$scope.universityid];

        console.log("university: ", $scope.university)
    } else {
        University.getUniversityById($scope.universityid).success(function(res) {
            $scope.university = res.data;
            console.log("university: ", $scope.university)
            University.storeLocal($scope.university);
        });
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

            scope.playerDuration = playerDuration;
            scope.viewer = viewer;
            scope.percentage = Math.floor(viewer.time / playerDuration * 100);

            Students.getStudentById(viewer.accountId).then(function(res) {
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