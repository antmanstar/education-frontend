'use strict';

/* Controllers */

angular.module('netbase')

.controller('AcademiaDriverCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'Forum', '$sce', '$filter', 'ngDialog', '$window', 'jwtHelper', '$localStorage', function($rootScope, $scope, $location, $route, University, Forum, $sce, $filter, ngDialog, $window, jwtHelper, $localStorage) {

    let universityUrl = $route.current.params.academiaName;
    let studentId = jwtHelper.decodeToken($localStorage.token)._id;

    $scope.studentId = studentId;

    University.getUniversity(universityUrl).then(function(res) {

        $scope.university = res.data.data;
        University.storeLocal($scope.university);
        console.log("university parsed not stored: ")
        console.log($scope.university)

    });

}])

.controller('AcademiaTrainingCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'Forum', '$sce', '$filter', 'ngDialog', '$window', function($rootScope, $scope, $location, $route, University, Forum, $sce, $filter, ngDialog, $window) {

    let universityUrl = $route.current.params.academiaName;

    University.getUniversity(universityUrl).then(function(res) {

        $scope.university = res.data.data;
        University.storeLocal($scope.university);
        console.log("university parsed not stored: ")
        console.log($scope.university)

    });

}])

.controller('AcademiaStudioCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'Forum', '$sce', '$filter', 'ngDialog', '$window', function($rootScope, $scope, $location, $route, University, Forum, $sce, $filter, ngDialog, $window) {

    let universityUrl = $route.current.params.academiaName;

    University.getUniversity(universityUrl).then(function(res) {

        $scope.university = res.data.data;
        University.storeLocal($scope.university);
        console.log("university parsed not stored: ")
        console.log($scope.university)

    });

}])

.controller('AcademiaLandingCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'Forum', '$sce', '$filter', 'ngDialog', '$window', function($rootScope, $scope, $location, $route, University, Forum, $sce, $filter, ngDialog, $window) {

    let universityUrl = $route.current.params.academiaName;
    let step = $route.current.params.step;

    $scope.step = step;

    /* read params */
    if (step == 1) {
        ngDialog.open({ template: 'partials/modals/signup.html', controller: 'AccountCtrl', className: 'ngdialog-theme-default', data: { redirectUrl: "/a/olavodecarvalho/landing/2" } });
    }

    University.getUniversity(universityUrl).then(function(res) {

        $scope.university = res.data.data;

        let universityId = $scope.university._id;

        Forum.getAllOwnerForumPost(universityId).then(function(res) {

            $scope.loaded = true;
            $scope.forumPosts = res.data.data.docs;

        });

    });

    $scope.loaded = false;

    $scope.openPayment = function(plan) {
        ngDialog.open({ template: 'partials/modals/payments.html', controller: 'PaymentsCtrl', className: 'ngdialog-theme-default', data: { flow: "order", page: "order", plan: plan, university: $scope.university } });
    }

    $scope.planAmount = function(amount) {
        return amount.substr(0, amount.length - 2) + "." + amount.substr(amount.length - 2, amount.length);
    }

    $scope.landingRegister = function() {
        $location.path("/a/olavodecarvalho/landing/1")
    }

    $scope.textFilter = function(text) {

        if (text.indexOf("iframe") != -1) {
            return $sce.trustAsHtml(text)
        } else {
            return $filter('limitHtml')(text, 350, '...')
        }

    }

}])

/* end landing pages */

.controller('AcademiaCoursesCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', function($rootScope, $scope, $location, $route, University) {

    let universityUrl = $route.current.params.academiaName;

    University.getUniversity(universityUrl).then(function(res) {

        $scope.university = res.data.data;

    });
    //END University.getUniversity()

}])

.controller('AcademiaClassroomsCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'Classroom', 'Students', 'ngDialog', '$localStorage', '$window', function($rootScope, $scope, $location, $route, University, Classroom, Students, ngDialog, $localStorage, $window) {

    let universityUrl = $route.current.params.academiaName;

    $scope.administrator = [];
    $scope.participants = [];
    $scope.fullScreen = false;

    //$scope.currentLocalParticipant = null;
    $scope.currentVideoRoom = null;
    $scope.wholeClassroomList = [];
    $scope.localParticipantUserName = "";
    $scope.showingParticipants = [];
    //console.log($route);
    //console.log("$$$$$$$$$");
    //console.log(Twilio.Video);
    //console.log("$$$$$$$$$");
    var video = Twilio.Video;
    var localVideo = Twilio.createLocalTracks;
    console.log('here local video');
    console.log(localVideo);

    $scope.classroomView = 0;

    //var baseUrl = "http://localhost:9000"; //Back-end server base url
    // var baseUrl = "http://localhost:9001"; //Back-end server base url
    var baseUrl = "https://educationalcommunity-classroom.herokuapp.com";

    University.getUniversity(universityUrl).then(function(res) {
        console.log('here university');
        console.log(res);
        $scope.university = res.data.data;
        $scope.getAllClassrooms();
    });

    angular.element($window).bind('resize', function() {
        $scope.videoSizeSet();
    });

    /******************** GET ALL Classrooms ******************/

    $scope.getAllClassrooms = function() {

        let url = '/classroom/university/' + $scope.university._id + '/all'
        Classroom.getAllClassroomsByUniversity(baseUrl + url).then((res) => {
            $scope.wholeClassroomList = res.data.data;
            console.log('Classroom.getAllClassrooms');
            console.log($scope.wholeClassroomList);
        });
    }


    $scope.addingClassroom = {
        uniqueName: '',
        active: '',
        roomType: 0,
        publicRoom: {
            type: 0,
            payPerView: 0
        },
        privateRoom: {
            invite: -1,
            share: -1
        },
        chat: -1,
        donation: -1
    }


    $scope.createNewClassroom = function() {
        ngDialog.open({ template: 'partials/modals/classroom_modal.html', className: 'ngdialog-theme-default classroom-modal' });
    };

    $scope.confirmCreateClassroom = function() {

        let token = $localStorage.token;
        let title = $scope.addingClassroom.uniqueName ? $scope.addingClassroom.uniqueName : '';
        let url = '/classroom/university/' + $scope.university._id + '/room/' + title;
        Classroom.createNewClassroom(baseUrl + url, title).then((data) => {
                //$scope.getAllClassrooms();
                let url = '/classroom/university/' + $scope.university._id + '/all'
                Classroom.getAllClassroomsByUniversity(baseUrl + url).then((data) => {
                    $scope.wholeClassroomList = data;
                    console.log('Classroom.getAllClassrooms');
                    console.log($scope.wholeClassroomList);
                    $route.reload();
                });
                ngDialog.close();
            })
            .catch((err) => {
                alert('Error');
            });
    }

    $scope.joinClassroom = function(classroom) {

        $scope.currentClassroom = classroom;

        Students.getStudentById(classroom.accountSid).then((res) => {
            $scope.administrator.push(res.data.data);
        })

        console.log('administrator');
        console.log($scope.administrator);
        console.log('current classroom');
        console.log($scope.currentClassroom);
        let url = '/classroom/' + classroom.roomSID + '/join/';
        Classroom.joinClassroom(baseUrl + url).then((data) => {

                $scope.classroomView = 1;


                url = '/classroom/classroom/' + classroom.uniqueName + '/token/'
                Classroom.getAccessToken(baseUrl + url).then((data) => {
                    console.log('here access token');
                    console.log(data);
                    $scope.connectClassroom(data, classroom.uniqueName);
                });

            })
            .catch((err) => {
                alert('Join Error.');
            })
    }

    /*$scope.videoSizeSet = function() {
    	var i;
    	var videoContainer = document.getElementById('twilio');
    	var videoDom = document.getElementsByTagName('video');
    	var mainWidth;
    	var mainHeight;
    	var none_display_count = 0;
    	for(i = 0; i < videoContainer.childElementCount; i++){
    		if(videoContainer.children[i].style.display == 'none') none_display_count++;
    	}
    	if(!$scope.isMobile()) {
    		console.log('this is not mobile device');
    		mainWidth = parseInt(videoContainer.style.width || videoContainer.offsetWidth);
    		mainWidth -= 100;
    		mainHeight = parseInt(videoContainer.style.height || videoContainer.offsetHeight);
    		mainHeight -= 100;
    		if(mainHeight > mainWidth / 4 * 3) mainHeight = mainWidth / 4 * 3;
    		console.log(videoContainer.style.width || videoContainer.width);
    		console.log(mainWidth);
    		console.log(mainHeight);
    		let px = 'px';
    		if(videoContainer.childElementCount - none_display_count == 1 || videoContainer.childElementCount == 2) {
    			for(i = 0; i < videoContainer.childElementCount; i+=2) {
    				if(videoContainer.children[i].style.display == 'none') continue;
    				videoContainer.children[i].style.width = mainWidth + px;
    				videoContainer.children[i].style.height = mainHeight + px;
    				videoContainer.children[i + 1].style.width = mainWidth + px;
    				videoContainer.children[i + 1].style.height = '20px';
    				videoContainer.children[i + 1].style.left = videoContainer.children[i].offsetLeft + px;
    				videoContainer.children[i + 1].style.top = videoContainer.children[i].offsetTop 
    					+ videoContainer.children[0].offsetHeight -19 + px;
    			}
    		}
    		else if(videoContainer.childElementCount - none_display_count > 2 && videoContainer.childElementCount - none_display_count < 10){
    			for(i = 0; i < videoContainer.childElementCount; i+=2) {
    				videoContainer.children[i].style.width = (mainWidth / 2) + px;
    				videoContainer.children[i].style.height= (mainHeight / 2) + px;
    				videoContainer.children[i + 1].style.width = (mainWidth / 2) + px;
    				videoContainer.children[i + 1].style.height = '20px';
    				videoContainer.children[i + 1].style.left = videoContainer.children[i].offsetLeft + px;
    				videoContainer.children[i + 1].style.top = videoContainer.children[i].offsetTop 
    					+ videoContainer.children[0].offsetHeight -19 + px;
    			}
    		}
    		else {
    			for(i = 0; i < videoContainer.childElementCount; i+=2) {
    				videoContainer.children[i].style.width = (mainWidth / 3) + px;
    				videoContainer.children[i].style.height = (mainHeight / 3) + px;
    				videoContainer.children[i + 1].style.width = (mainWidth / 3) + px;
    				videoContainer.children[i + 1].style.height = '20px';
    				videoContainer.children[i + 1].style.left = videoContainer.children[i].offsetLeft + px;
    				videoContainer.children[i + 1].style.top = videoContainer.children[i].offsetTop 
    					+ videoContainer.children[0].offsetHeight - 19 + px;
    			}
    		}
    	}
    }*/

    $scope.videoSizeSet = function() {
        var i;
        var videoContainer = document.getElementById('twilio');
        var videoDom = document.getElementsByTagName('video');
        var titleDom = document.getElementsByClassName('sub-video-title');
        var mainWidth;
        var mainHeight;
        var showingVideo;
        var showingTitle;
        var countOfNone = 0;

        for (i = 0; i < videoDom.length; i++) {
            if (videoDom[i].style.display != 'none') {
                showingVideo = videoDom[i];
                showingTitle = titleDom[i];
                countOfNone++;
            }
        }
        if (!$scope.isMobile()) {
            console.log('this is not mobile device');
            mainWidth = parseInt(videoContainer.offsetWidth);
            videoContainer.style.height = mainWidth / 4 * 3 + 'px';
            mainHeight = mainWidth / 4 * 3;
            mainWidth -= 100;
            mainHeight -= 75;
            console.log(videoContainer.style.width || videoContainer.width);
            console.log(mainWidth);
            console.log(mainHeight);
            let px = 'px';
            if (videoDom.length == 1 || countOfNone == 1) {
                videoDom[0].style.width = mainWidth + px;
                videoDom[0].style.height = mainHeight + px;
                videoDom[0].style.left = '50px';
                videoDom[0].style.top = '37.5px';
                titleDom[0].style.width = mainWidth + px;
                titleDom[0].style.height = 20 + px;

                showingVideo.style.width = mainWidth + px;
                showingVideo.style.height = mainHeight + px;
                showingTitle.style.width = mainWidth + px;
                showingTitle.style.height = 20 + px;
                showingTitle.style.left = '50px';
                showingTitle.style.top = '37.5px';
                setTimeout(() => {
                    showingTitle.style.left = showingVideo.offsetLeft + px;
                    showingTitle.style.top = parseInt(showingVideo.offsetTop) + mainHeight - 19 + px;
                }, 100);
            } else if (videoDom.length > 1 && videoDom.length < 5 && countOfNone != 1) {
                for (i = 0; i < videoDom.length; i += 1) {
                    videoDom[i].style.width = (mainWidth / 2) + px;
                    videoDom[i].style.height = (mainHeight / 2) + px;
                    titleDom[i].style.width = (mainWidth / 2) + px;
                    titleDom[i].style.height = 20 + px;

                    $scope.resetPosition(i, (mainHeight / 2) - 19);
                    if (i > 0) {
                        if ($scope.participants[i - 1] != undefined) {
                            titleDom[i].innerText = $scope.participants[i - 1].username;
                            titleDom[i].innerText = $scope.participants[i - 1].name;
                        }
                    }
                }
            } else {
                for (i = 0; i < videoDom.length; i += 1) {
                    videoDom[i].style.width = (mainWidth / 3) + px;
                    videoDom[i].style.height = (mainHeight / 3) + px;
                    titleDom[i].style.width = (mainWidth / 3) + px;
                    titleDom[i].style.height = 20 + px;

                    $scope.resetPosition(i, (mainHeight / 3) - 19);
                    if (i > 0) {
                        if ($scope.participants[i - 1] != undefined) {
                            titleDom[i].innerText = $scope.participants[i - 1].username;
                            titleDom[i].innerText = $scope.participants[i - 1].name;
                        }
                    }
                }
            }
        }
    }

    $scope.resetPosition = function(index, height) {
        setTimeout(() => {
            var i;
            var videoDom = document.getElementsByTagName('video');
            var titleDom = document.getElementsByClassName('sub-video-title');

            titleDom[index].style.left = parseInt(videoDom[index].offsetLeft) + 'px';
            titleDom[index].style.top = parseInt(videoDom[index].offsetTop) + parseInt(videoDom[index].style.height) - 19 + 'px';

        }, 200);
    }

    $scope.disconnectClassroom = function() {
        var mainDom = document.getElementById('twilio');
        var i;
        for (i = mainDom.childElementCount - 1; i >= 0; i--) {
            mainDom.children[i].remove();
        }
        $scope.$apply(() => {
            $scope.participants = [];
        });
        if ($scope.currentVideoRoom != null) $scope.currentVideoRoom.disconnect();
    }

    $scope.isMobile = function() {
        try { document.createEvent("TouchEvent"); return true; } catch (e) { return false; }
    }

    $scope.connectClassroom = function(token, roomName, screenTrack = null) {

        //localVideo.connect()
        $scope.currentShareScreen = screenTrack;
        $scope.currentRoomToken = token;
        $scope.currentRoomName = roomName;

        var room_t;
        if (screenTrack != null) {
            room_t = {
                name: roomName,
                tracks: [screenTrack]
            }
        } else {
            room_t = {
                name: roomName
            }
        }

        $scope.videoSizeSet();

        video.connect(token, room_t).then(room => {
            const localParticipant = room.localParticipant;

            //$scope.currentLocalParticipant = localParticipant;

            //$scope.disconnectClassroom();

            $scope.currentVideoRoom = room;
            if ($scope.currentShareScreen != null) {
                room.localParticipant.publishTrack($scope.currentShareScreen);
            }

            var mainVideoDom = document.getElementById('twilio');
            var videoTitle = document.createElement('div');
            videoTitle.setAttribute('id', 'my_local_video');
            videoTitle.setAttribute('class', 'sub-video-title');
            Students.getStudentById(localParticipant.identity).then((res) => {
                $scope.localParticipantUserName = res.data.data.name;
                if (document.getElementById('my_local_video') != null) {
                    document.getElementById('my_local_video').innerText = $scope.localParticipantUserName;
                }
                if (res.data.data._id == $scope.administrator[0]._id) {
                    $scope.adminActive = 'admin-active';
                } else {
                    $scope.showingParticipants.push(res.data.data);
                }
            });
            videoTitle.style.position = 'absolute';

            localParticipant.videoTracks.forEach(publication => {
                const track = publication.track;

                /********************* Screen Full Screen *********************/


                //mainVideoDom.appendChild(track.attach());

                angular.element(mainVideoDom.appendChild(track.attach())).bind('click', (e) => {
                    var i;
                    if (e.target.tagName != 'VIDEO') return;
                    let mainDom = document.getElementById('twilio');
                    if ($scope.fullScreen) {
                        for (i = 0; i < mainDom.childElementCount; i++) {
                            mainDom.children[i].style.display = 'initial';
                        }
                        $scope.videoSizeSet();
                        setTimeout(() => {
                                $window.dispatchEvent(new Event("resize"));
                            },
                            100);
                    } else {
                        let videos = document.getElementsByTagName('video');
                        let titles = document.getElementsByClassName('sub-video-title');
                        for (i = 0; i < videos.length; i++) {
                            if (videos[i] != e.target) {
                                videos[i].style.display = 'none';
                                titles[i].style.display = 'none';
                            }
                        }
                        $scope.videoSizeSet();
                        setTimeout(() => {
                                $window.dispatchEvent(new Event("resize"));
                            },
                            100);
                    }
                    $scope.fullScreen = !$scope.fullScreen;
                });

                mainVideoDom.appendChild(videoTitle);

                $scope.videoSizeSet();
                setTimeout(() => {
                        $window.dispatchEvent(new Event("resize"));
                    },
                    100);
            });
            room.participants.forEach($scope.participantConnected);
            room.on('participantConnected', $scope.participantConnected);

            room.on('participantDisconnected', $scope.participantDisconnected);
            room.once('disconnected', error => room.participants.forEach($scope.participantDisconnected));
        });
    }

    $scope.participantConnected = function(participant) {
        var mainVideoDom = document.getElementById('twilio');
        var subTitleDom = document.createElement('div');

        //subTitleDom.id = participant.sid;
        //subTitleDom.innerText = $scope.participants.username;
        subTitleDom.setAttribute('class', 'sub-video-title');

        participant.on('trackSubscribed', track => $scope.trackSubscribed(mainVideoDom, subTitleDom, track));
        //participant.on('trackSubscribed', track => trackSubscribed(mainVideoDom, subTitleDom, track));

        participant.on('trackUnsubscribed', $scope.trackUnsubscribed);

        participant.tracks.forEach(publication => {
            if (publication.isSubscribed) {
                $scope.trackSubscribed(mainVideoDom, subTitleDom, publication.track);
            }
        });

        Students.getStudentById(participant.identity).then((res) => {
            /*var new_participant = {
              _id: res._id,
              active: res.active,
              createdAt: res.createdAt,
              knowledgeSubscribed: res.knowledgeSubscribed,
              language: res.language,
              membership: res.membership,
              name: res.name,
              stripeId: res.stripeId,
              universitiesSubscribed: res.universitiesSubscribed,
              username: res.username,
              validated: res.validated
            }*/

            $scope.participants.push(res.data.data);
            if (res.data.data._id == $scope.administrator[0]._id) {
                $scope.adminActive = 'admin-active';
            } else {
                $scope.showingParticipants.push(res.data.data);
            }


            console.log('Participant "%s" connected', participant.identity);
            console.log(res.data.data);
            console.log($scope.participants);
            setTimeout(() => {
                $scope.videoSizeSet();
            }, 100);
        });
        //document.body.appendChild(videoDom);
    }

    $scope.participantDisconnected = function(participant) {
        console.log('Participant "%s" disconnected', participant.identity);
        var i;
        for (i = 0; i < $scope.participants.length; i++) {
            if ($scope.participants[i].sid == participant.sid) {
                $scope.participants.pop($scope.participants[i]);
                $scope.showingParticipants.pop($scope.participants[i]);
                console.log('removed here1');
            }
        }
    }

    $scope.trackSubscribed = function(main, ele, track) {
        //main.appendChild(track.attach());
        angular.element(main.appendChild(track.attach())).bind('click', (e) => {
            var i;
            if (e.target.tagName != 'VIDEO') return;
            let mainDom = document.getElementById('twilio');
            if ($scope.fullScreen) {
                for (i = 0; i < mainDom.childElementCount; i++) {
                    mainDom.children[i].style.display = 'initial';
                }
                $scope.videoSizeSet();
                setTimeout(() => {
                        $window.dispatchEvent(new Event("resize"));
                    },
                    100);
            } else {
                let videos = document.getElementsByTagName('video');
                let titles = document.getElementsByClassName('sub-video-title');

                for (i = 0; i < videos.length; i++) {
                    if (videos[i] != e.target) {
                        videos[i].style.display = 'none';
                        titles[i].style.display = 'none';
                    }
                }
                $scope.videoSizeSet();
                setTimeout(() => {
                        $window.dispatchEvent(new Event("resize"));
                    },
                    100);
            }
            $scope.fullScreen = !$scope.fullScreen;
        });
        main.appendChild(ele);

        setTimeout(() => {
                $window.dispatchEvent(new Event("resize"));
            },
            100);
    }

    $scope.trackUnsubscribed = function(track) {
        track.detach().forEach(element => {

            console.log('removed here2');
            var i;
            let videos = document.getElementsByTagName('video');
            let titles = document.getElementsByClassName('sub-video-title');
            for (i = 0; i < videos.length; i++) {
                console.log(element);
                console.log(videos[i]);
                if (element == videos[i]) {
                    titles[i].remove();
                    $scope.$apply(() => {
                        $scope.participants.pop($scope.participants[i]);
                        $scope.showingParticipants.pop($scope.participants[i]);
                    });
                    console.log($scope.participants);
                }
            }
            element.remove();
            setTimeout(() => {
                $scope.videoSizeSet();
            }, 100);
        });
    }

    $scope.returnBack = function() {
        $scope.classroomView = 0;
        $scope.administrator = [];
        $scope.participants = [];
        $scope.showingParticipants = [];
        $scope.disconnectClassroom();
        //leave room
    }

    $scope.recordVideo = function() {
        let API_KEY_SID = "SK1a798d2be5f6c189daea5ff4e126793b";
        let API_KEY_SECRET = "iY7eTh3rYYR4matfxuZVNKJcPRpPOBtH";
        let ACCOUNT_SID = "AC49c057053ba1660bf1304758c0a3218d";

        //const client = new Twilio(API_KEY_SID, API_KEY_SECRET, {accountSid: ACCOUNT_SID});

        Twilio.Video.compositions.
        create({
                roomSid: $scope.currentClassroom._id,
                videoLayout: {
                    grid: {
                        max_rows: 1,
                        video_sources: [
                            "RTAAAA",
                            "MTBBBB",
                            "teacher-webcast"
                        ]
                    }
                },
                statusCallback: 'http://localhost:8080/callbacks',
                format: 'mp4'
            })
            .then(composition => {
                console.log('Created Composition with SID=' + composition.sid);
            });
    }

    $scope.shareScreen = function() {
        //if($scope.currentLocalParticipant == null){
        //	alert("Error");
        //	return;
        //}

        navigator.mediaDevices.getDisplayMedia().then((stream) => {
            const screenTrack = stream.getTracks()[0];

            screenTrack.onended = function(e) {
                $scope.disconnectClassroom();
                $scope.connectClassroom($scope.currentRoomToken, $scope.currentRoomName);
            }


            //$scope.currentVideoRoom.localParticipant.publishTrack(screenTrack);

            $scope.disconnectClassroom();

            console.log('screen track');
            console.log(screenTrack);
            $scope.connectClassroom($scope.currentRoomToken, $scope.currentRoomName, screenTrack);
            /*
            screenTrack.onended = function(e) {
            	$scope.disconnectClassroom();

            }

            video.connect($scope.currentRoomToken, {
            	name: $scope.currentRoomName,
            	tracks: [screenTrack]
            }).then((room) => {
            	$scope.currentVideoRoom = room;
            	room.localParticipant.publishTrack(screenTrack);
            	room.localParticipant.videoTracks.forEach(publication => {
            		console.log('publication1');
            		console.log(publication);
            		const track = publication.track;
            		document.getElementById('my_local_video').remove();
            		var mainVideoDom = document.getElementById('twilio');
            		var subVideoDom = document.createElement('div');
            		subVideoDom.setAttribute('id', 'my_local_video');
            		
            		mainVideoDom.appendChild(subVideoDom);
            		
            		subVideoDom.appendChild(track.attach());
            	});

            });
            */

        });
        //const screenTrack = new LocalVideoTrack(stream.getTracks()[0]);

    }

}])

.controller('AcademiaCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', function($rootScope, $scope, $location, $route, University) {

    let universityUrl = $route.current.params.url;

    University.getUniversity(universityUrl).then(function(res) {

        $scope.knowledge = res.data;

    });

    $location.path("/a/" + universityUrl + "/timeline");

}])

.controller('HomeTopicCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'Forum', '$sce', '$filter', function($rootScope, $scope, $location, $route, University, Forum, $sce, $filter) {

}])

.controller('AcademiaTimelineCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'Forum', '$sce', '$filter', 'ngDialog', '$timeout', function($rootScope, $scope, $location, $route, University, Forum, $sce, $filter, ngDialog, $timeout) {

    let universityUrl = $route.current.params.academiaName;

    $scope.loaded = false;
    let displayinvite = false;

    /* Accounts suggestion */
    if (University.isStoredLocal(universityUrl)) {

        let universityStorage = University.retrieveStorage(universityUrl);

        $scope.university = universityStorage[universityUrl];

        let universityId = $scope.university._id;

        Forum.getAllOwnerForumPost(universityId).then(function(res) {

            $scope.loaded = true;
            $scope.forumPosts = res.data.data.docs;

        });

        if (!$rootScope.logged) {

            $rootScope.accountSuggestion = $timeout(function() {

                if (!displayinvite) {

                    console.log("time out!");
                    //ngDialog.open({ template: 'partials/modals/accountsuggestion.html', controller: 'AccountCtrl', className: 'ngdialog-theme-default ngdialog-plans modal-accountsuggestion', data : { university : $scope.university } });
                    $timeout.cancel()
                    displayinvite = true;

                }

            }, 13500, true);

        }
        //END if (!$rootScope.logged)

    } else {

        console.log("not stored")

        University.getUniversity(universityUrl).then(function(res) {

            $scope.university = res.data.data;
            University.storeLocal($scope.university);
            console.log("university parsed not stored: ")
            console.log($scope.university)

            let universityId = $scope.university._id;

            Forum.getAllOwnerForumPost(universityId).then(function(res) {

                $scope.loaded = true;

                console.log(res.data.data.docs)
                $scope.forumPosts = res.data.data.docs;

            });

            if (!$rootScope.logged) {

                $rootScope.accountSuggestion = $timeout(function() {

                    if (!displayinvite) {

                        console.log("time out!");
                        //ngDialog.open({ template: 'partials/modals/accountsuggestion.html', controller: 'AccountCtrl', className: 'ngdialog-theme-default ngdialog-plans modal-accountsuggestion', data : { university : $scope.university } });
                        $timeout.cancel()
                        displayinvite = true;

                    }

                }, 13500, true);

            }
            //END if (!$rootScope.logged)

        });

    }

    $scope.textFilter = function(text) {

        if (text.indexOf("iframe") != -1) {
            return $sce.trustAsHtml(text)
        } else {
            return $filter('limitHtml')(text, 350, '...')
        }

    }

}])

.controller('AcademiaPlaylistsByIdCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'Playlist', 'Videos', function($rootScope, $scope, $location, $route, University, Playlist, Videos) {

    let universityUrl = $route.current.params.academiaName;
    let playlistId = $route.current.params.playlistId;

    if (University.isStoredLocal(universityUrl)) {

        let universityStorage = University.retrieveStorage(universityUrl);

        $scope.university = universityStorage[universityUrl];

        Playlist.getPlaylistById(playlistId).success(function(res) {

            console.log(res);

            $scope.playlist = res.data;

        });

        console.log("stored")

    } else {

        console.log("not stored")

        University.getUniversity(universityUrl).then(function(res) {

            $scope.university = res.data.data;
            University.storeLocal($scope.university);

            Playlist.getPlaylistById(playlistId).success(function(res) {

                console.log(res);

                $scope.playlist = res.data;

            });

        });

    }

}])

.controller('AcademiaPlaylistsCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'Playlist', function($rootScope, $scope, $location, $route, University, Playlist) {

    let universityUrl = $route.current.params.academiaName;

    if (University.isStoredLocal(universityUrl)) {

        let universityStorage = University.retrieveStorage(universityUrl);

        $scope.university = universityStorage[universityUrl];

        Playlist.getAllPlaylistByUniversityId($scope.university._id).success(function(res) {

            console.log(res);

            $scope.playlists = res.data;

        });

        console.log("stored")

    } else {

        console.log("not stored")

        University.getUniversity(universityUrl).then(function(res) {

            $scope.university = res.data.data;
            University.storeLocal($scope.university);

            Playlist.getAllPlaylistByUniversityId($scope.university._id).success(function(res) {

                console.log(res);

                $scope.playlists = res.data;

            });

        });

    }

}])

.controller('AcademiaPlanPurchaseCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', '$filter', 'ngDialog', '$localStorage', function($rootScope, $scope, $location, $route, University, $filter, ngDialog, $localStorage) {

    $scope.university = $scope.ngDialogData.university;

    $scope.planAmount = function(amount) {
        return amount.substr(0, amount.length - 2) + "." + amount.substr(amount.length - 2, amount.length);
    }

    $scope.subscribe = function(plan) {

        if ($localStorage.token != undefined || $localStorage.token != null) {
            ngDialog.open({ template: 'partials/modals/payments.html', controller: 'PaymentsCtrl', className: 'ngdialog-theme-default', data: { flow: "order", page: "order", plan: plan, university: $scope.university } });
        } else {
            ngDialog.open({ template: 'partials/modals/login.html', controller: 'AccountCtrl', className: 'ngdialog-theme-default' });
        }

    }


}])

.controller('AcademiaForumCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', '$timeout', 'ngDialog', 'jwtHelper', '$localStorage', function($rootScope, $scope, $location, $route, University, $timeout, ngDialog, jwtHelper, $localStorage) {

    let universityUrl = $route.current.params.academiaName;
    let displayinvite = false;

    /* forum posts */
    $scope.forumPosts = [];
    $scope.page = 1;
    $scope.pages = 1;
    $scope.loaded = false;

    if ($location.search().page != undefined) {
        $scope.page = $location.search().page;
    }

    /* forum posts order */
    $scope.forumPostsOrder = "-createdAt";
    //-votesCount

    $scope.orderForumPosts = function(order) {

        $scope.forumPostsOrder = "-" + order;

    }

    /* get university informations */

    if (University.isStoredLocal(universityUrl)) {

        let universityStorage = University.retrieveStorage(universityUrl);

        $scope.university = universityStorage[universityUrl];

        University.getUniversityForumPosts($scope.university._id, $scope.page).then(function(res) {

            let forumPostsRequested = res.data.data.docs;
            $scope.page = Number(res.data.data.page);
            $scope.pages = res.data.data.pages;
            $scope.forumPosts = $scope.forumPosts.concat(forumPostsRequested);
            $scope.loaded = true;

            if (!$rootScope.logged) {

                if (!displayinvite) {

                    $rootScope.accountSuggestion = $timeout(function() {

                        //ngDialog.open({ template: 'partials/modals/accountsuggestion.html', controller: 'AccountCtrl', className: 'ngdialog-theme-default ngdialog-plans modal-accountsuggestion', data : { university : $scope.university } });
                        $timeout.cancel()

                    }, 13500, true);

                }

            }
            //END if (!$rootScope.logged)

            /* organize new posts */

            if ($rootScope.logged) {

                let studentId;

                if ($localStorage.token != undefined && $localStorage.token != null) {
                    studentId = jwtHelper.decodeToken($localStorage.token)._id;
                }

                $scope.forumPostsNew = [];

                for (let idx = 0; idx < $scope.forumPosts.length; idx++) {

                    let userViewed = false;

                    for (let bdx = 0; bdx < $scope.forumPosts[idx].visualization.length; bdx++) {

                        if ($scope.forumPosts[idx].visualization[bdx].accountId == studentId) {
                            userViewed = true;
                        }

                    }

                    if (!userViewed) {
                        $scope.forumPostsNew.push($scope.forumPosts[idx]);
                    }

                }

                console.log($scope.forumPostsNew);

            }

            /* */

        }).catch(function(e) {


        });

    } else {

        University.getUniversity(universityUrl).then(function(res) {

            console.log("university: ")
            console.log(res.data.data)
            $scope.university = res.data.data;
            University.storeLocal($scope.university);

            University.getUniversityForumPosts($scope.university._id, $scope.page).then(function(res) {

                let forumPostsRequested = res.data.data.docs;
                $scope.page = Number(res.data.data.page);
                $scope.pages = res.data.data.pages;
                $scope.forumPosts = $scope.forumPosts.concat(forumPostsRequested);
                $scope.loaded = true;

                console.log(res)

                if (!$rootScope.logged) {

                    if (!displayinvite) {

                        $rootScope.accountSuggestion = $timeout(function() {

                            //ngDialog.open({ template: 'partials/modals/accountsuggestion.html', controller: 'AccountCtrl', className: 'ngdialog-theme-default ngdialog-plans modal-accountsuggestion', data : { university : $scope.university } });
                            $timeout.cancel()

                        }, 13500, true);

                    }

                }
                //END if (!$rootScope.logged)

            }).catch(function(e) {

                console.log("forum post error request: ");
                console.log(e);

            });

        });

    }

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

    if ($location.search().page != undefined) {
        $scope.page = $location.search().page;
    }

    console.log("scope page");
    console.log($scope.page)

    $scope.categoryId = categoryId;

    /* forum posts order */
    $scope.forumPostsOrder = "-createdAt";
    //-votesCount

    $scope.orderForumPosts = function(order) {

        $scope.forumPostsOrder = "-" + order;

    }

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

.controller('AcademiaChatCtrl', ['$rootScope', '$scope', '$location', function($rootScope, $scope, $location) {

}])

.controller('AcademiaMenu', ['$rootScope', '$scope', '$location', '$route', 'University', function($rootScope, $scope, $location, $route, University) {

    let controllerActive = $route.current.$$route.controller;
    let universityUrl = $route.current.params.academiaName;

    console.log(controllerActive);

    $scope.universityUrl = universityUrl
    $scope.controllerActive = controllerActive;
    $scope.forumClass = '';
    $scope.timelineClass = '';
    $scope.smpClass = '';
    $scope.jobsClass = '';
    $scope.actionPostButton = false;

    $scope.buttonActionUrl = '';

    if (controllerActive == "AcademiaForumCtrl") {
        $scope.forumClass = "active";
        $scope.actionPostButton = true;
        $scope.buttonActionUrl = "/a/" + universityUrl + "/forum/create";
    } else if (controllerActive == "AcademiaTimelineCtrl") {
        $scope.timelineClass = "active";
        $scope.actionPostButton = true;
        $scope.buttonActionUrl = "/a/" + universityUrl + "/forum";
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

.controller('AcademiaSmpCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'SocialMarketPlace', function($rootScope, $scope, $location, $route, University, SocialMarketPlace) {

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
        value: 0
    };

    $scope.createCategory = function() {

        let data = {
            title: $scope.title,
            description: $scope.description,
            privilegeMin: $scope.privilege.value
        }

        Forum.createCategory(university._id, data).success(function(res) {

            console.log(res)

            if (res.success) {

                $location.path("/a/" + university.url + "/forum/category/id/" + res.data._id)

            }

        });

    }

}])

.controller('AcademiaForumPostCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'Forum', '$sce', '$localStorage', 'ngDialog', 'jwtHelper', '$timeout', function($rootScope, $scope, $location, $route, University, Forum, $sce, $localStorage, ngDialog, jwtHelper, $timeout) {

    let displayinvite = false;
    let universityUrl = $route.current.params.academiaName;
    let postId = $route.current.params.postId;
    let university;

    //fbq('track', 'ViewContent');

    /* load information */

    University.getUniversity(universityUrl).then(function(res) {

        $scope.university = res.data.data;
        university = res.data.data;

        if (!$rootScope.logged) {

            if (!displayinvite) {

                $rootScope.accountSuggestion = $timeout(function() {

                    //ngDialog.open({ template: 'partials/modals/accountsuggestion.html', controller: 'AccountCtrl', className: 'ngdialog-theme-default ngdialog-plans modal-accountsuggestion', data : { university : $scope.university } });
                    $timeout.cancel()
                    displayinvite = true;

                }, 13500, true);

            }

        }
        //END if (!$rootScope.logged)

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

    $scope.premium = function() {

        //check if logged before
        if ($localStorage.token != undefined && $localStorage.token != null) {
            //ngDialog.open({ template: 'partials/modals/payments.html', controller: 'PaymentsCtrl', className: 'ngdialog-theme-default', data : { flow : "order", page : "order" } });
            ngDialog.open({ template: 'partials/modals/planbuy.html', controller: 'AcademiaPlanPurchaseCtrl', className: 'ngdialog-theme-default', data: { university: $scope.university } });
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

        var data = { text: $scope.answer };

        if ($localStorage.token != undefined || $localStorage.token != null) {
            Forum.postAnswerByForumPostId(postId, data).then(function(res) {

                let status = res.data.status;
                let data = res.data.data;
                let success = res.data.success;

                if (success) {

                    data.votesCount = 0;
                    data.createdAt = Math.round((new Date()).getTime() / 1000);
                    $scope.forumPost.answers.push(data);
                    var timelineData = {
                        entryType: "comment",
                        modelId: $scope.forumPost._id,
                        creatorType: "user",
                        universityId: $scope.forumPost.universityId
                    }
                    University.createForumPostTimeline(timelineData).then(function(res) {})

                }

            });
        } else {
            ngDialog.open({ template: 'partials/modals/login.html', controller: 'AccountCtrl', className: 'ngdialog-theme-default' });
        }


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

.controller('AcademiaJobsCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'ngDialog', function($rootScope, $scope, $location, $route, University, ngDialog) {

    let universityUrl = $route.current.params.academiaName;

    University.getUniversity(universityUrl).then(function(res) {

        console.log(res.data.data);
        $scope.university = res.data.data;

    });

    $scope.clickToOpen = function() {
        ngDialog.open({ template: 'partials/jobmodal.html', className: 'ngdialog-theme-default jobmodal' });
    };

}])

.controller('AcademiaForumPostCreateOptionCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'ngDialog', 'Videos', '$sce', function($rootScope, $scope, $location, $route, University, ngDialog, Videos, $sce) {

    $scope.youtubeLink = '';
    $scope.title = '';
    $scope.form = { iconClass: '', placeholder: '' };

    let type = $scope.ngDialogData.type;
    $scope.type = type;

    if (type == "sound") {

        $scope.title = "Add SoundCloud embed";
        $scope.form.iconClass = "fab fa-soundcloud";
        $scope.form.placeholder = "SoundCloud embed link";
        $scope.form.button = "Add SoundCloud embed";

        $scope.imagePush = '';

        $scope.$watch('link', function() {

            let link = $scope.link;

            $scope.soundCloudIframe = $sce.trustAsHtml(link);

        }, 13500, true);

        $scope.add = function() {

            let embed = $scope.link;

            let attachment = new Trix.Attachment({ content: embed })
            $rootScope.trix.insertAttachment(attachment)

            ngDialog.close();

        }

    }

    if (type == "pic") {

        $scope.title = "Adicionar imagem";
        $scope.form.iconClass = "glyphicon glyphicon-picture";
        $scope.form.placeholder = "Image link";
        $scope.form.button = "Adicionar imagem";

        $scope.imagePush = '';

        $scope.$watch('link', function() {

            let link = $scope.link;

            $scope.imageLink = link;

        }, 13500, true);

        $scope.add = function() {

            let image = "<img class='trix-pic' src='" + $scope.imageLink + "' />"

            console.log(image);

            let attachment = new Trix.Attachment({ content: image })
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

            let attachment = new Trix.Attachment({ content: iframe })
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

        }, 13500, true);

    }

}])

.controller('AcademiaForumPostCreateCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'ngDialog', 'Forum', function($rootScope, $scope, $location, $route, University, ngDialog, Forum) {

    let universityUrl = $route.current.params.academiaName;
    let university;

    if ($location.search().categoryId != undefined) {
        $scope.categoryForum = { _id: $location.search().categoryId };
    } else {
        $scope.categoryForum = { _id: undefined };
    }

    /* load information */

    University.getUniversity(universityUrl).then(function(res) {

        $scope.university = res.data.data;
        university = res.data.data;

        Forum.getCategoriesByUniversityId($scope.university._id).success(function(resCategory) {

            if (resCategory.success) {

                $scope.categories = resCategory.data;

                console.log("categories on this forum: ")
                console.log($scope.categories)

                //$scope.categoryForum = {}

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
            ngDialog.open({ template: 'partials/modals/forumpostoption.html', data: { type: "sound" }, controller: "AcademiaForumPostCreateOptionCtrl", className: 'ngdialog-theme-default' });
        });

        $("#picAppend").click(function() {
            ngDialog.open({ template: 'partials/modals/forumpostoption.html', data: { type: "pic" }, controller: "AcademiaForumPostCreateOptionCtrl", className: 'ngdialog-theme-default' });
        });

        $("#videoAppend").click(function() {
            ngDialog.open({ template: 'partials/modals/forumpostoption.html', data: { type: "video" }, controller: "AcademiaForumPostCreateOptionCtrl", className: 'ngdialog-theme-default' });
        });

    }

    /* create forum post by id */

    $scope.premium = { value: "0" };


    $scope.createForumPost = function() {

        var data = {
            text: $scope.text,
            title: $scope.title,
            premium: $scope.premium.value,
            categoryId: $scope.categoryForum._id
        };

        /* */

        let createPost = true;
        let errors = [];

        /* */

        if (data.categoryId == undefined) {
            createPost = false;
            errors.push("Selecione a categoria do post.")
        }

        if (data.title == undefined || data.title.length == 0) {
            createPost = false;
            errors.push("Escreva um título para a postagem")
        }

        if (data.text == undefined || data.text.length == 0) {
            createPost = false;
            errors.push("Escreva um texto na postagem")
        }

        /* */

        console.log(data)

        if (createPost) {

            University.createForumPost(university._id, data).then(function(res) {

                let status = res.data.status;
                let data = res.data.data;
                let success = res.data.success;

                if (success) {
                    var timelineData = {
                        entryType: "forumpost",
                        modelId: data._id,
                        universityId: data.universityId
                    }
                    University.createForumPostTimeline(timelineData).then(function(res) {
                        console.log("createForumPostTimeline", res);

                        let success = res.data.success;
                        if (success) {
                            $location.path('/a/' + university.url + '/forum/post/id/' + data._id)
                            window.scrollTo(0, 0);
                        }
                    })

                }

            });
            //END University.createForumPost

        } else {

            $scope.errors = errors;

        }

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
                $scope.premium = { value: 0 };
            } else if ($scope.forumPost.premium == true) {
                $scope.premium = { value: 1 };
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
            text: $scope.text,
            title: $scope.title,
            premium: $scope.premium.value
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

.directive('studentinfo', ['University', '$localStorage', '$route', 'jwtHelper', 'Students', function(University, $localStorage, $route, jwtHelper, Students) {
    return {
        restrict: 'EA',
        templateUrl: '../partials/directive/studentinfo.html',
        replace: false,
        scope: true,
        link: function(scope, element, attr) {

            let studentId = attr.sid;

            Students.getStudentById(studentId).then(function(res) {

                console.log("response student: ");
                console.log(res);
                scope.student = res.data.data;

            });

        }

    }

}])

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
            scope.forumClass = '';
            scope.smpClass = '';
            scope.jobsClass = '';
            scope.timelineClass = '';
            scope.playlistClass = '';
            scope.cursosClass = '';
            scope.actionPostButton = false;

            scope.buttonActionUrl = '';

            if (controllerActive == "AcademiaForumCtrl" || controllerActive == "AcademiaForumPostCreateCtrl" || controllerActive == "AcademiaForumPostCtrl") {
                scope.forumClass = "active";
                scope.actionPostButton = true;
            } else if (controllerActive == "AcademiaTimelineCtrl") {
                scope.timelineClass = "active";
            } else if (controllerActive == "AcademiaCoursesCtrl") {
                scope.cursosClass = "active";
            } else if (controllerActive == "AcademiaPlaylistsByIdCtrl" || controllerActive == "AcademiaPlaylistsCtrl") {
                scope.playlistClass = "active";
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

                    // ngMeta.setTitle(university.name);

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

                        scope.university.members.push({ accountId: studentId });

                    }

                });

            };
            /* end subscribe */

        }
    }
}])

.directive('academiarightcolumn', ['University', '$localStorage', '$route', 'jwtHelper', 'ngDialog', '$location', 'Chat', function(University, $localStorage, $route, jwtHelper, ngDialog, $location, Chat) {
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
                }

                scope.studentIsPremium = false;
                scope.studentIsAdmin = false;
                scope.studentIsTeam = false;

                /* chat */

                scope.chatDisplay = true;

                /* chat functions */

                scope.chatToggle = function() {

                    console.log("ae")

                    if (scope.chatDisplay) {
                        scope.chatDisplay = false;
                    } else {
                        scope.chatDisplay = true;
                    }

                }

                /* */

                attr.$observe('university', function(value) {

                    /* socket io */
                    var socket = io("https://educationalcommunity-realtime.herokuapp.com");

                    // userId
                    let student = { _id: studentId };

                    if (value) {

                        university = JSON.parse(value);

                        /* chat services */

                        console.log("university get channels 1")

                        console.log(university._id)

                        Chat.getUniversityChannels(university._id).success(function(res) {

                            console.log("chat get channels :: ")
                            console.log(res.data)

                            if (res.success) {

                                scope.channels = res.data;

                                const chatClient = new Twilio.Chat.Client($localStorage.tokenTwilio);

                                chatClient.on('channelJoined', function(channel) {
                                    console.log('Joined channel ' + channel.friendlyName);
                                });

                                console.log("hey")

                                chatClient.getSubscribedChannels().then(function(paginator) {
                                    console.log("paginator: ")
                                    console.log(paginator)
                                    for (let i = 0; i < paginator.items.length; i++) {
                                        const channel = paginator.items[i];
                                        console.log('Channel: ' + channel.friendlyName);
                                    }
                                });

                            } else {

                            }

                        });

                        /* real time connect */

                        socket.on('connect', function(data) {

                            console.log(data)

                            if (studentId != undefined) {

                                if (studentId.length > 0) {

                                    socket.emit('universityVisit', { universityUrl: university.url, student: student });

                                    socket.on('universityVisitsTodayList', function(data) {

                                        scope.universityVisitsTodayList = data;

                                    });
                                    //END socket.on('universityVisitsTodayList')

                                }
                                //END if (studentId.length > 0)

                            }
                            //END studentId

                        });
                        //END socket.on('connect')

                        /* check if student is a premium member */
                        for (let idx = 0; idx < university.members.length; idx++) {

                            var member = university.members[idx];

                            if (studentId != undefined && member.accountId == studentId && member.privilege >= 10) {
                                scope.studentIsPremium = true;
                            }

                            if (studentId != undefined && member.accountId == studentId && member.privilege >= 50) {
                                scope.studentIsTeam = true;
                            }

                            if (studentId != undefined && member.accountId == studentId && member.privilege == 99) {
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

                                if (array[studentIdMembersLocation].unsubscribed) {
                                    return false;
                                } else {
                                    return true;
                                }

                            } else {
                                return false;
                            }

                        };

                    }

                });
                //END attr.$observe('university')

                scope.createPost = function(url) {

                        if ($localStorage.token != undefined && $localStorage.token != null) {
                            $location.path("/a/" + url + "/forum/post/create")
                        } else {
                            ngDialog.open({ template: 'partials/modals/login.html', controller: 'AccountCtrl', className: 'ngdialog-theme-default' });
                        }

                    }
                    //END createPost

                scope.premium = function() {

                    ngDialog.open({ template: 'partials/modals/planbuy.html', controller: 'AcademiaPlanPurchaseCtrl', className: 'ngdialog-theme-default ngdialog-plans', data: { university: university } });

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

                        console.log("array student id member location");
                        console.log(array[studentIdMembersLocation].unsubscribed)

                        if (array[studentIdMembersLocation].unsubscribed) {
                            return false;
                        } else {
                            return true;
                        }

                    } else {
                        return false;
                    }

                };

                scope.subscribe = function() {

                    if ($localStorage.token != undefined && $localStorage.token != null) {

                        University.subscribeOnUniversity(university.url).then(function(res) {

                            if (userSubscribed(scope.university.members)) {

                                let studentIdMembersLocation = userMembersLocation(scope.university.members);

                                scope.university.members.splice(studentIdMembersLocation, 1);

                            } else {

                                scope.university.members.push({ accountId: studentId, unsubscribed: false });

                            }

                        });

                    } else {
                        ngDialog.open({ template: 'partials/modals/login.html', controller: 'AccountCtrl', className: 'ngdialog-theme-default' });
                    }

                };
                /* end subscribe */

            }
            // end link
    }
}])

.directive('videouploadrow', ['Forum', '$rootScope', '$sce', '$location', function(Forum, $rootScope, $sce, $location) {
    return {
        restrict: 'E',
        templateUrl: '../partials/academia/categoryrow.html',
        replace: true,
        scope: true,
        link: function(scope, element, attr) {

            let category = JSON.parse(attr.category);
            let universityid = attr.universityid;

            //let logged = $rootScope.logged;

            console.log(category._id)
            console.log(universityid)

            Forum.getForumPostsByCategoryId(universityid, category._id, 1).success(function(res) {

                console.log("category row: ")
                console.log(res)

                if (res.success) {

                    let forumPostsRequested = res.data.docs;

                    scope.page = Number(res.data.page);
                    scope.pages = res.data.pages;
                    scope.posts = forumPostsRequested;
                    scope.total = res.data.total;
                    scope.docs = res.data.docs;

                }

            });
            //END Videos.getById

        }
    }
}])

.directive('categoryrow', ['Forum', '$rootScope', '$sce', '$location', function(Forum, $rootScope, $sce, $location) {
    return {
        restrict: 'E',
        templateUrl: '../partials/academia/categoryrow.html',
        replace: true,
        scope: true,
        link: function(scope, element, attr) {

            let category = JSON.parse(attr.category);
            let universityid = attr.universityid;

            //let logged = $rootScope.logged;

            console.log(category._id)
            console.log(universityid)

            Forum.getForumPostsByCategoryId(universityid, category._id, 1).success(function(res) {

                console.log("category row: ")
                console.log(res)

                if (res.success) {

                    let forumPostsRequested = res.data.docs;

                    scope.page = Number(res.data.page);
                    scope.pages = res.data.pages;
                    scope.posts = forumPostsRequested;
                    scope.total = res.data.total;
                    scope.docs = res.data.docs;

                }

            });
            //END Videos.getById

        }
    }
}])

.directive('videorow', ['Videos', '$rootScope', '$sce', '$location', function(Videos, $rootScope, $sce, $location) {
    return {
        restrict: 'E',
        templateUrl: '../partials/academia/videorow.html',
        replace: false,
        scope: true,
        link: function(scope, element, attr) {

            let videoId = attr.videoid;

            let logged = $rootScope.logged;

            Videos.getById(videoId).success(function(res) {

                console.log(res);

                let status = res.status;

                if (status == 90010) {

                    $location.path('/home');

                } else {

                    scope.video = res.data;

                    let player = angular.element(element.find("video")[0]).get(0);

                    if (Hls.isSupported()) {
                        var hls = new Hls();
                        hls.loadSource(scope.video.file);
                        hls.attachMedia(player);
                    }

                    scope.video.file = $sce.trustAsResourceUrl(scope.video.file);

                }

            });
            //END Videos.getById

        }
    }
}])

/* forum post */
.directive('forumpost', ['University', '$rootScope', '$localStorage', 'jwtHelper', 'Students', function(University, $rootScope, $localStorage, jwtHelper, Students) {
    return {
        restrict: 'E',
        templateUrl: '../partials/forumposttemplate.html',
        replace: true,
        scope: true,
        link: function(scope, element, attr) {

            let post = JSON.parse(attr.p);

            scope.post = post;

            /* */

            let studentId;
            let studentReadedTimestamps = [];

            if ($localStorage.token != undefined && $localStorage.token != null) {
                studentId = jwtHelper.decodeToken($localStorage.token)._id;
            }

            /* who viewed */

            let viewers = [];
            let visualizations = post.visualization;

            for (let idx = 0; idx < visualizations.length; idx++) {

                let v = visualizations[idx];

                if (!viewers.includes(v.accountId) && v.accountId != undefined) {
                    viewers.push(v.accountId)
                }

                if (v.accountId == studentId) {
                    studentReadedTimestamps.push(v.createdAt);
                }

            }
            //END for()

            // latestStudentReadedTimestamps

            let latestStudentReadedTimestamps = studentReadedTimestamps.sort(function(a, b) { return b - a })[0];

            /* */

            scope.viewers = viewers;
            scope.viewersParseFirstTime = true;

            scope.viewersParsed = [];
            scope.viewersParsedDisplay = false;

            scope.viewersParse = function() {

                let firstTime = scope.viewersParseFirstTime;

                if (firstTime) {

                    // loop viewers
                    if (viewers.length > 0) {

                        for (let idx = 0; idx < viewers.length; idx++) {

                            let viewerId = viewers[idx];

                            // Parse students
                            Students.getStudentById(viewerId).then(function(res) {

                                    scope.viewersParsed.push(res.data.data)

                                })
                                //END Students.getStudentById

                        }

                    }

                    scope.viewersParsedDisplay = true;

                    scope.viewersParseFirstTime = false;

                } else {

                    // Just show, css
                    scope.viewersParsedDisplay = true;

                }

            };

            // Find user on viewers
            scope.studentReaded = false;

            if (studentId.length > 0) {

                if (viewers.includes(studentId)) {
                    scope.studentReaded = true;
                } else {
                    scope.studentReaded = false;
                }

            }
            //END studentId.length > 0

            scope.viewers = viewers;

            /* Display "alert" if new action */

            // 1 - Get timestamp from latest answer on FP
            // 2 - Compare with timestamp from lastest user timestamp viewed

            let answersTimestamps = [post.createdAt];

            for (let idx = 0; idx < post.answers.length; idx++) {

                let timestamp = post.answers[idx].createdAt;
                answersTimestamps.push(timestamp);

            }

            // 1.1 - Sort array, get highest

            let latestAnswersTimestamp = answersTimestamps.sort(function(a, b) { return b - a })[0];

            if (latestAnswersTimestamp > latestStudentReadedTimestamps) {
                scope.studentReaded = false;
            }

            /* up vote */

            scope.upvoteForumPost = function(post) {

                let postId = post._id;

                var index = scope.$parent.forumPosts.findIndex(x => x._id === postId)

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

.directive('knowledgecard', ['University', '$rootScope', 'Students', 'Knowledge', function(University, $rootScope, Students, Knowledge) {
    return {
        restrict: 'E',
        templateUrl: '../partials/directive/knowledgecard.html',
        replace: true,
        scope: true,
        link: function(scope, element, attr) {

            let knowledgeId = attr.kid;

            console.log(knowledgeId)

            Knowledge.getById(knowledgeId).success(function(res) {

                scope.knowledge = res.data;

            });

        }
    }
}])

.directive('homeuniversitynewcard', ['University', '$rootScope', 'Students', function(University, $rootScope, Students) {
    return {
        restrict: 'E',
        templateUrl: '../partials/directive/timelineuniversitynewcard.html',
        replace: true,
        scope: true,
        link: function(scope, element, attr) {

            let universityId = attr.uid;

            University.getUniversityById(universityId).success(function(res) {

                console.log(res);

                scope.university = res.data;

            });

            /*

            filter: { active: true } | orderBy:'-highlight'

            */

        }
    }
}])

.directive('timelineuniversitycard', ['University', '$rootScope', 'Students', function(University, $rootScope, Students) {
    return {
        restrict: 'E',
        templateUrl: '../partials/directive/timelineuniversitycard.html',
        replace: true,
        scope: true,
        link: function(scope, element, attr) {

            let universityId = attr.uid;

            University.getUniversityById(universityId).success(function(res) {

                console.log(res);

                scope.university = res.data;

            });

        }
    }
}])

.directive('timelineknowledgepost', ['University', '$rootScope', 'Students', '$filter', function(University, $rootScope, Students, $filter) {
    return {
        restrict: 'E',
        templateUrl: '../partials/directive/knowledgetimelinepost.html',
        replace: true,
        scope: true,
        link: function(scope, element, attr) {

            let post = JSON.parse(attr.p);
            let universityId = attr.uid;

            if (post.text.indexOf("iframe") != -1) {
                post.text = $sce.trustAsHtml(post.text)
            } else {
                post.text = $filter('limitHtml')(post.text, 350, '...')
            }

            scope.post = post;

            University.getUniversityById(universityId).success(function(res) {

                scope.university = res.data;

            });

            Students.getStudentById(post.accountId).then(function(res) {

                scope.student = res.data.data;

            })

        }
    }
}])

.directive('timelinepost', ['University', '$rootScope', 'Students', function(University, $rootScope, Students) {
    return {
        restrict: 'E',
        templateUrl: '../partials/academia/timelinepost.html',
        replace: true,
        scope: true,
        link: function(scope, element, attr) {

            let post = JSON.parse(attr.p);
            let university = JSON.parse(attr.u)

            scope.post = post;

            scope.university = university;

            let studentId = post.accountId;

            if (Students.isStoredLocal(studentId)) {

                let studentStorage = Students.retrieveStorage(studentId);

                scope.student = studentStorage[studentId];

            } else {

                Students.getStudentById(post.accountId).then(function(res) {

                    let user = res.data.data;

                    scope.student = user;

                    Students.storeLocal(user);

                });
                //END Students

            }
            //END Students.isStoredLocal(studentId)

        }
    }
}])

.directive('newscommentrow', ['University', '$rootScope', 'Students', 'News', function(University, $rootScope, Students, News) {
    return {
        restrict: 'E',
        templateUrl: '../partials/news/commentrow.html',
        replace: false,
        scope: true,
        link: function(scope, element, attr) {

            let comment = JSON.parse(attr.c);

            scope.comment = comment;

            scope.commentsCount = comment.votes.length;

            console.log(comment)

            Students.getStudentById(comment.accountId).then(function(res) {

                console.log("student: ")
                console.log(res)
                scope.student = res.data.data;
                console.log(scope.student)

            })

            scope.voteComment = function(newsId) {

                    News.voteCommentById(newsId, comment._id).success(function(res) {

                        console.log("success voting comment comment: ")
                        console.log(res);

                        if (res.success) {

                            if (res.vote) {
                                scope.commentsCount = scope.commentsCount - 1;
                            } else {
                                scope.commentsCount = scope.commentsCount + 1;
                            }

                        } else {

                        }

                    });

                }
                //END voteComment

        }
    }
}])

.filter('limitHtml', function() {
    return function(text, limit, ellipsis) {
        var _getClosedTagsString = function(_tagArray) {
                var _returnArray = [],
                    _getTagType = function(_string) {
                        return _string.replace(/<[\/]?([^>]*)>/, "$1");
                    };

                angular.forEach(_tagArray, function(_tag, _i) {
                    if (/<\//.test(_tag)) {
                        if (_i === 0) {
                            _returnArray.push(_tag);
                        } else if (_getTagType(_tag) !== _getTagType(_tagArray[_i - 1])) {
                            _returnArray.push(_tag);
                        }
                    }
                });
                return _returnArray.join('');
            },
            _countNonHtmlCharToLimit = function(_text, _limit) {
                var _isMarkup = false,
                    _isSpecialChar = false,
                    _break = false,
                    _underLimit = false,
                    _totalText = 0,
                    _totalChar = 0,
                    _element,
                    _return = {
                        textCounter: 0,
                        offsetCounter: 0,
                        setEllipsis: false,
                        overElementArray: []
                    };
                angular.forEach(_text, function(_c) {
                    _underLimit = _return.textCounter < _limit;
                    if (_c === '<' && !_isMarkup && !_isSpecialChar) {
                        (!_underLimit) && (_element = '<');
                        _isMarkup = true;
                    } else if (_c === '&' && !_isMarkup && !_isSpecialChar) {
                        _isSpecialChar = true;
                    } else if (_isMarkup) {
                        //tracking html elements that are beyond the text limit
                        (!_underLimit) && (_element = _element + _c);
                        if (_c === '>') {
                            //push element in array if it is complete, and we are
                            //beyond text limit, to close any html that is unclosed
                            (!_underLimit) && (_return.overElementArray.push(_element));
                            _break = true;
                            _isMarkup = false;
                        }
                    } else if (_c === ';' && _isSpecialChar) {
                        _isSpecialChar = false;
                        //count as one character
                        _return.textCounter++;
                        _break = true;
                    }

                    if (_underLimit) {
                        if (!_isMarkup && !_isSpecialChar && !_break) {
                            //counting number of characters in non html string
                            _return.textCounter++;
                        }
                        _return.offsetCounter++;
                    } else {
                        _return.setEllipsis = true
                    }
                    _break = false;

                });

                //returns offset within html of number of non html characters found
                return _return;
            },
            _charToLimitOutput = _countNonHtmlCharToLimit(text.toString(), limit);

        return text.toString().substr(0, _charToLimitOutput.offsetCounter) +
            ellipsis + _getClosedTagsString(_charToLimitOutput.overElementArray);
    }
})

.filter('unsafe', function($sce) { return $sce.trustAsHtml; });