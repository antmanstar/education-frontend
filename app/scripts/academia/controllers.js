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
    });
}])

.controller('AcademiaTrainingCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'Forum', '$sce', '$filter', 'ngDialog', '$window', function($rootScope, $scope, $location, $route, University, Forum, $sce, $filter, ngDialog, $window) {
    let universityUrl = $route.current.params.academiaName;
    University.getUniversity(universityUrl).then(function(res) {
        $scope.university = res.data.data;
        University.storeLocal($scope.university);
    });
}])

.controller('AcademiaStudioCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'Forum', '$sce', '$filter', 'ngDialog', '$window', function($rootScope, $scope, $location, $route, University, Forum, $sce, $filter, ngDialog, $window) {
    let universityUrl = $route.current.params.academiaName;
    University.getUniversity(universityUrl).then(function(res) {
        $scope.university = res.data.data;
        University.storeLocal($scope.university);
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
.controller('AcademiaCoursesCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'Courses', '$localStorage', function($rootScope, $scope, $location, $route, University, Courses, $localStorage) {
    let universityUrl = $route.current.params.academiaName;
    $scope.showButton = $localStorage.studentIsAdmin
    University.getUniversity(universityUrl).then(function(res) {
        $scope.university = res.data.data;
        Courses.getByUniversityId($scope.university._id).success(function(res) {
            if (res.success) {
                console.log(res.data)
                $scope.courses = res.data;

            }
        });
    });
}])

.controller('AcademiaClassroomChatCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'Classroom', 'Students', 'ngDialog', 'jwtHelper', 'throttle', '$localStorage', '$window', function($rootScope, $scope, $location, $route, University, Classroom, Students, ngDialog, jwtHelper, throttle, $localStorage, $window) {
    var GENERAL_CHANNEL_UNIQUE_NAME;
    var GENERAL_CHANNEL_NAME;
    var MAX_LOAD_MESSAGE_COUNT = 120;
    var accountSid = $route.current.params.accountSid;
    var roomSID = $route.current.params.roomSID;

    $scope.channels = [];
    $scope.generalChannel = null;
    $scope.selectedChannel = null;
    $scope.sendingMessage = '';
    $scope.members = [];
    $scope.months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    $scope.monthToVal = {
        Jan: 0,
        Feb: 1,
        Mar: 2,
        Apr: 3,
        May: 4,
        Jun: 5,
        Jul: 6,
        Aug: 7,
        Sep: 8,
        Oct: 9,
        Nov: 10,
        Dec: 11
    };
    $scope.chattingNotification = '';
    var baseUrl = "https://educationalcommunity-classroom.herokuapp.com";

    $scope.openDialog = function(type, msg) { // Opens Error Dialogs
        if ($rootScope.alertDialog == null || $rootScope.alertDialog == undefined) $rootScope.alertDialog = [];
        $rootScope.alertDialog.push(ngDialog.open({
            template: 'partials/modals/classroom_alert_modal.html',
            controller: "AcademiaClassroomsAlertCtrl",
            className: 'ngdialog-theme-default classroom-alert-modal',
            data: {
                type: type,
                msg: msg
            }
        }));
    }

    if ($localStorage.token != undefined && $localStorage.token != null) { // Check if logged in user
        GENERAL_CHANNEL_UNIQUE_NAME = jwtHelper.decodeToken($localStorage.token)._id; // chat member unique name(= user identity)
        Students.getStudentById(GENERAL_CHANNEL_UNIQUE_NAME).then(res => {

            GENERAL_CHANNEL_NAME = res.data.data.name; // chat friendly name
            let url = '/classroom/chat_token/';
            Classroom.getChatAccessToken(baseUrl + url).then((res) => { // Get chat access token(obtained by user identity
                if (res.data.success == false) { // and device Id)
                    $scope.openDialog("ERROR", res.data.msg);
                } else {
                    $scope.chatCreate(res.data.token);
                }
            }).catch(err => {
                $scope.openDialog('ERROR', err);
            });
        });
    }

    $scope.joinChatting = function() {
        $scope.loadChannelList().then((channel) => { // Load current acive channels and define

            $scope.joinAdminChannel().then(() => {
                    $rootScope.messagingClient.on('channelAdded', $scope.loadChannelList); // events
                    $rootScope.messagingClient.on('channelRemoved', $scope.loadChannelList);
                    $rootScope.messagingClient.on('tokenExpired', $scope.chatCreate);
                })
                .catch((err) => {
                    $rootScope.alertDialog.push(ngDialog.open({
                        template: 'partials/modals/classroom_alert_modal.html',
                        controller: "AcademiaClassroomsAlertCtrl",
                        className: 'ngdialog-theme-default classroom-alert-modal',
                        data: { type: "ERROR", msg: err.name }
                    }));
                });
        });
    }

    $scope.chatCreate = function(token) {
        if ($rootScope.messagingClient) {
            $scope.joinChatting();
        } else {
            Twilio.Chat.Client.create(token).then(function(client) {
                $rootScope.messagingClient = client;
                $scope.joinChatting();
            });
        }
    }

    function updateConnectedUI() {}

    $scope.loadChannelList = function() { // Load published channel lists and find admin channel.
        return new Promise((resolve, reject) => {
            if ($rootScope.messagingClient == null) {
                $scope.openDialog('ERROR', 'Client is not initialized.');
                reject(new Error('none_message_client'));
            }

            $rootScope.messagingClient.getPublicChannelDescriptors().then(function(channels) {
                $scope.getPublicChannelsFromAllPages(channels).then(() => {
                    let i;

                    for (i = 0; i < $scope.publicChannelArr.length; i++) {
                        if ($scope.publicChannelArr[i].uniqueName == roomSID) {
                            break;
                        }
                    }

                    if (i == $scope.publicChannelArr.length) {
                        reject(new Error('none admin channel'));
                    }

                    console.log("KOKROOMSID", roomSID)
                    console.log("KOKAAA", $scope.publicChannelArr)

                    $rootScope.messagingClient.getChannelBySid($scope.publicChannelArr[i].sid).then((comparingChannel) => {
                        $rootScope.currentChatChannel = comparingChannel;
                        resolve(comparingChannel);
                    });
                });
            });
        });
    }

    $scope.getPublicChannelsFromAllPages = function(channel) {
        return new Promise((resolve, reject) => {
            if ($scope.publicChannelArr == null || $scope.publicChannelArr == undefined) {
                $scope.publicChannelArr = [];
            }
            let i;
            for (i = 0; i < channel.items.length; i++) {
                $scope.publicChannelArr.push({ sid: channel.items[i].sid, uniqueName: channel.items[i].uniqueName });
            }
            if (channel.hasNextPage) {
                channel.nextPage().then(nextChannel => {
                    $scope.getPublicChannelsFromAllPages(nextChannel).then(() => {
                        resolve();
                    });
                });
            } else {
                resolve();
            }
        });
    }

    $scope.createAdminChannel = function() { // Create Admin Channel( every chat channel created by roomSId so
        return new Promise((resolve, reject) => { // as to be identical to every video chat room, and here roomSid
            let studentId = jwtHelper.decodeToken($localStorage.token)._id; // varible is the admin roomSid.
            if (studentId == accountSid) { // check if admin, so the user is not admin user, he can't create channel
                $rootScope.messagingClient.createChannel({ // create admin channel
                    uniqueName: roomSID,
                    friendlyName: GENERAL_CHANNEL_NAME
                }).then((channel) => {
                    $rootScope.currentChatChannel = channel;
                    resolve($rootScope.currentChatChannel);
                }).catch((err) => {
                    reject(new Error('already exists'));
                })
            } else {
                reject(new Error('you are not admin'));
            }
        })
    }

    $scope.joinAdminChannel = function() {
        return $scope.setupChannel();
    }

    $scope.setupChannel = function() { // After create admin channel and join into it, should initialize the
        return new Promise((resolve, reject) => { // channel and define channel events
            if ($rootScope.currentChatChannel.status == 'joined') {
                $scope.leaveCurrentChannel().then(() => {
                        return $scope.initChannel($rootScope.currentChatChannel);
                    })
                    .then((channel) => {
                        return $scope.joinChannel(channel);
                    })
                    .then((_channel) => {
                        $rootScope.currentChatChannel = _channel;
                        $scope.initChannelEvents();
                        resolve();
                    })
                    .catch(err => {
                        reject(new Error('error'));
                    })
            } else {
                $scope.initChannel($rootScope.currentChatChannel).then((channel) => {
                    $rootScope.currentChatChannel = channel;
                    $scope.joinChannel(channel).then((_channel) => {
                        $rootScope.currentChatChannel = _channel;
                        $scope.initChannelEvents();
                        resolve();
                    })
                })
            }
        });
    }

    $scope.initChannel = function(channel) {
        return $rootScope.messagingClient.getChannelBySid(channel.sid);
    }

    $scope.joinChannel = function(channel) {
        return channel.join()
            .then(function(joinedChannel) {
                $rootScope.currentChatChannel = joinedChannel;
                $scope.loadMessages();
                return joinedChannel;
            })
            .catch(function(err) {
                if (channel.status == 'joined') {
                    $scope.loadMessages();
                    return channel;
                }
                $scope.openDialog('ERROR', "Couldn't join channel " + channel.friendlyName + ' because -> ' + err);
            });
    }

    $scope.initChannelEvents = function() { // Define channel events
        $rootScope.currentChatChannel.on('messageAdded', $scope.addMessageToList);
        $rootScope.currentChatChannel.on('typingStarted', $scope.showTypingStarted);
        $rootScope.currentChatChannel.on('typingEnded', $scope.hideTypingStarted);
        $rootScope.currentChatChannel.on('memberJoined', $scope.notifyMemberJoined);
        $rootScope.currentChatChannel.on('memberLeft', $scope.notifyMemberLeft);
    }

    $scope.sendMSG = function() { // Send message
        $rootScope.currentChatChannel.sendMessage($scope.sendingMessage);
        $scope.sendingMessage = '';
    }

    $scope.addMessageToList = function(message) {
        let currentMember = null;
        let i;
        for (i = 0; i < $scope.members.length; i++) {
            if ($scope.members[i].id == message.author) {
                currentMember = $scope.members[i];
                break;
            }
        }
        if (currentMember == null || (currentMember != null && currentMember.name == '')) {
            Students.getStudentById(message.author).then((res) => {
                $scope.members.push({
                    id: message.author,
                    name: res.data.data.name,
                    img_url: res.data.data.imageUrl
                });

                $scope.applyMessage(message, { name: res.data.data.name, img_url: res.data.data.imageUrl });
                return;
            })
        } else {
            $scope.applyMessage(message, currentMember);
        }
    }

    $scope.addMember = function(message) {
        let i;
        return new Promise((resolve, reject) => {
            let currentMember = '';
            for (i = 0; i < $scope.members.length; i++) {
                if ($scope.members[i].id == message.author) {
                    currentMember = $scope.members[i].name;
                    break;
                }
            }
            if (currentMember == "") {
                Students.getStudentById(message.author).then((res) => {
                    $scope.members.push({
                        id: message.author,
                        name: res.data.data.name,
                        img_url: res.data.data.imageUrl
                    });
                    resolve();
                });
            } else {
                resolve();
            }
        })
    }

    $scope.loadMessages = function() {
        let i;
        $rootScope.currentChatChannel.getMessages(MAX_LOAD_MESSAGE_COUNT).then(function(messages) {
            let messageArr = messages.items;
            messageArr.sort(msgSortFunc2);
            let promise = messageArr.reduce((accumulatorPromise, nextID) => {
                return accumulatorPromise.then(() => {
                    return $scope.addMember(nextID);
                });
            }, Promise.resolve());
            promise.then(() => {
                messageArr.forEach($scope.addMessageToList)
            });
        });
    }

    $scope.applyMessage = function(message, currentMember, id) {
        let messageListDom = document.getElementById('chat_list');
        let messageTitleDom = document.createElement('div');
        let messageTimeDom = document.createElement('div');
        let messageBodyDom = document.createElement('div');
        let messageItemDom = document.createElement('div');

        messageItemDom.setAttribute('id', id);

        messageTitleDom.setAttribute('class', 'chat-title-st row');
        messageBodyDom.setAttribute('class', 'chat-body-st');
        messageTimeDom.setAttribute('class', 'chat-time-st');

        let sentTime = message.timestamp;
        let month = sentTime.getMonth();
        let day = sentTime.getDate();
        let hour = sentTime.getHours();
        let minute = sentTime.getMinutes();
        let second = sentTime.getSeconds();
        sentTime = $scope.months[month] + ' ' + day + ' ' + hour + ':' + minute + ':' + second;

        let messageBody = message.body;

        let messageBodyTextDom = document.createElement('div');
        messageBodyTextDom.innerText = messageBody;

        let avatar = document.createElement('img');
        let avatar_url = currentMember.img_url == undefined ? "http://virtual-strategy.com/wp-content/plugins/all-in-one-seo-pack/images/default-user-image.png" : currentMember.img_url
        avatar.setAttribute('src', avatar_url);

        let nameDom = document.createElement('div');
        nameDom.innerText = currentMember.name;
        nameDom.setAttribute('class', 'chat-name-st');
        messageTimeDom.innerText = sentTime;

        messageTitleDom.appendChild(nameDom);
        messageTitleDom.appendChild(messageTimeDom);

        if (GENERAL_CHANNEL_UNIQUE_NAME == message.author) {
            messageItemDom.setAttribute('class', 'chat-item-st mine');
            messageBodyDom.appendChild(messageBodyTextDom);
            messageBodyDom.appendChild(avatar);
        } else {
            messageItemDom.setAttribute('class', 'chat-item-st other');
            messageBodyDom.appendChild(avatar);
            messageBodyDom.appendChild(messageBodyTextDom);
        }

        messageItemDom.appendChild(messageBodyDom);
        messageItemDom.appendChild(messageTitleDom);
        messageListDom.appendChild(messageItemDom);
        $scope.scrollToMessageListBottom();
    }

    $scope.sendingInputKeyPress = function($e) {
        if ($e.keyCode == 13) {
            $scope.sendMSG();
            $e.preventDefault();
        } else {
            $rootScope.currentChatChannel.typing();
        }
    }

    $scope.scrollToMessageListBottom = function() {
        var messageListDom = document.getElementById('chat_list');
        messageListDom.scrollBy(0, messageListDom.scrollHeight);
    }

    function getDateValue(date) {
        let dateSplit = date.split(' ');
        let res = 0;
        res = $scope.monthToVal[dateSplit[0]] * 30 * 24 * 60 * 60;
        res += parseInt(dateSplit[1]) * 24 * 60 * 60;
        let timeSplit = dateSplit[2].split(':');
        res += parseInt(timeSplit[0]) * 60 * 60;
        res += parseInt(timeSplit[1]) * 60;
        res += parseInt(timeSplit[2]);
        return res;
    }

    function msgSortFunc2(a, b) {
        let sentTime1 = a.timestamp;
        let month = sentTime1.getMonth();
        let day = sentTime1.getDate();
        let hour = sentTime1.getHours();
        let minute = sentTime1.getMinutes();
        let second = sentTime1.getSeconds();
        sentTime1 = $scope.months[month] + ' ' + day + ' ' + hour + ':' + minute + ':' + second;

        let sentTime2 = b.timestamp;
        month = sentTime2.getMonth();
        day = sentTime2.getDate();
        hour = sentTime2.getHours();
        minute = sentTime2.getMinutes();
        second = sentTime2.getSeconds();
        sentTime2 = $scope.months[month] + ' ' + day + ' ' + hour + ':' + minute + ':' + second;

        if (getDateValue(sentTime1) > getDateValue(sentTime2)) return 1;
        else return -1;
    }

    $scope.leaveCurrentChannel = function() {
        if ($rootScope.currentChatChannel) {
            return $rootScope.currentChatChannel.leave().then(function(leftChannel) {
                leftChannel.removeListener('messageAdded', $scope.addMessageToList);
                leftChannel.removeListener('typingStarted', $scope.showTypingStarted);
                leftChannel.removeListener('typingEnded', $scope.hideTypingStarted);
                leftChannel.removeListener('memberJoined', $scope.notifyMemberJoined);
                leftChannel.removeListener('memberLeft', $scope.notifyMemberLeft);
            });
        } else {
            return Promise.resolve();
        }
    }

    function msgSortFunc1(arr) {
        let i, j, temp;
        for (i = 0; i < arr.length - 1; i++) {
            for (j = i + 1; j < arr.length; j++) {
                let sentTime1 = arr[i].body.substring(0, arr[i].body.indexOf('::sent_time::'));
                let sentTime2 = arr[j].body.substring(0, arr[j].body.indexOf('::sent_time::'));

                if (getDateValue(sentTime1) > getDateValue(sentTime2)) {
                    temp = arr[i];
                    arr[i] = arr[j];
                    arr[j] = temp;
                }
            }
        }
        return arr;
    }

    $scope.showTypingStarted = function(member) {
        let i;
        for (i = 0; i < $scope.members.length; i++) {
            if (member.identity == $scope.members[i].id) {
                break;
            }
        }
        console.log(i + ' ' + $scope.members.length);
        if (i < $scope.members.length) {
            $scope.$apply(() => {
                $scope.chattingNotification = $scope.members[i].name + ' is typing ...';
            });
        }
    }

    $scope.hideTypingStarted = function(member) {
        $scope.$apply(() => {
            $scope.chattingNotification = "";
        });
    }

    $scope.notifyMemberJoined = function(member) {
        let i;
        for (i = 0; i < $scope.members.length; i++) {
            if (member.identity == $scope.members[i].id) {
                break;
            }
        }

        if (i < $scope.members.length) {
            $scope.$apply(() => {
                $scope.chattingNotification = $scope.members[i].name + ' joined the channel.';
            });
        } else {
            Students.getStudentById(member.identity).then((res) => {
                $scope.members.push({ id: member.identity, name: res.data.data.name });
                $scope.chattingNotification = res.data.data.name + ' joined the channel.';
            });
        }
    }

    $scope.notifyMemberLeft = function(member) {
        let i;
        for (i = 0; i < $scope.members.length; i++) {
            if (member.identity == $scope.members[i].id) {
                break;
            }
        }

        if (i < $scope.members.length) {
            $scope.$apply(() => {
                $scope.chattingNotification = $scope.members[i].name + ' left the channel.';
            });
        }
    }

    $scope.confirm = function() {
        ngDialog.close();
    }
}])

.controller('AcademiaClassroomSelectDeviceCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'Classroom', 'Students', 'ngDialog', '$localStorage', '$window', function($rootScope, $scope, $location, $route, University, Classroom, Students, ngDialog, $localStorage, $window) {
    $scope.audioInputDevices = [];
    $scope.videoInputDevices = [];
    $scope.videoTogglable = false;
    $scope.voiceTogglable = false;
    $scope.voiceToggle = 'fas fa-microphone-alt';
    $scope.videoToggle = 'fas fa-video';
    $scope.videoDisabled = 'color-white';
    $scope.audioDisabled = 'color-white';

    $scope.cancel = function() {
        ngDialog.close();
    }

    $scope.scanDevices = function() {
        return new Promise((resolve, reject) => {
            navigator.mediaDevices.enumerateDevices().then(devices => {
                let i;
                for (i = 0; i < devices.length; i++) {
                    if (devices[i].kind == 'audioinput') {
                        $scope.$apply(() => {
                            $scope.audioInputDevices.push({
                                deviceId: devices[i].deviceId,
                                label: devices[i].label
                            });
                        });
                    }
                    if (devices[i].kind == 'videoinput') {
                        $scope.$apply(() => {
                            $scope.videoInputDevices.push({
                                deviceId: devices[i].deviceId,
                                label: devices[i].label
                            });
                        });
                    }
                }
                resolve();
            });
        });
    }

    $scope.selectDevice = function() {
        let i;
        if ($scope.audioInputDevices.length == 0) {

            if ($rootScope.alertDialog == null || $rootScope.alertDialog == undefined) $rootScope.alertDialog = [];

            $rootScope.alertDialog.push(ngDialog.open({
                template: 'partials/modals/classroom_alert_modal.html',
                controller: "AcademiaClassroomsAlertCtrl",
                className: 'ngdialog-theme-default classroom-alert-modal',
                data: { type: "ERROR", msg: 'You have no microphones' }
            }));

            $scope.audioStatus = null;
            $scope.audioDisabled = 'color-red';

        } else {
            $scope.voiceTogglable = true;
        }

        for (i = 0; i < $scope.audioInputDevices.length; i++) {
            if ($scope.audioInputDevices[i].deviceId != "") {
                $scope.audioStatus = $scope.audioInputDevices[i].deviceId;
                break;
            }
        }

        if (i == $scope.audioInputDevices.length && i != 0) {
            $scope.audioStatus = 'auto search';
        }

        if ($scope.videoInputDevices.length == 0) {

            if ($rootScope.alertDialog == null || $rootScope.alertDialog == undefined) $rootScope.alertDialog = [];

            $rootScope.alertDialog.push(ngDialog.open({
                template: 'partials/modals/classroom_alert_modal.html',
                controller: "AcademiaClassroomsAlertCtrl",
                className: 'ngdialog-theme-default classroom-alert-modal',
                data: { type: "ERROR", msg: 'You have no cameras' }
            }));

            $scope.videoStatus = null;
            $scope.videoDisabled = 'color-red';

        } else {
            $scope.videoTogglable = true;
        }

        for (i = 0; i < $scope.videoInputDevices.length; i++) {
            if ($scope.videoInputDevices[i].deviceId != "") {
                $scope.videoStatus = $scope.videoInputDevices[i].deviceId;
                break;
            }
        }
        if (i == $scope.videoInputDevices.length && i != 0) {
            $scope.videoStatus = 'auto search';
        }

        $scope.currentVideoInputDevice = $scope.videoStatus;
        $scope.currentAudioInputDevice = $scope.audioStatus;
    }

    $scope.displayInitial = function() {
        navigator.getUserMedia = navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia

        $rootScope.constraints = { audio: null, video: null }

        if ($scope.currentAudioInputDevice == 'auto search') {
            $rootScope.constraints.audio = true;
        } else if ($scope.currentAudioInputDevice != null) {
            $rootScope.constraints.audio = {
                deviceId: $scope.currentAudioInputDevice
            };
        } else {
            $rootScope.constraints.audio = false;
        }

        if ($scope.currentVideoInputDevice == 'auto search') {
            $rootScope.constraints.video = true;
        } else if ($scope.currentVideoInputDevice != null) {
            $rootScope.constraints.video = {
                deviceId: $scope.currentVideoInputDevice
            };
        } else {
            $rootScope.constraints.video = false;
        }

        if ($rootScope.constraints.audio == false && $rootScope.constraints.video == false) {
            let video = document.getElementById('selecting_video');
            video.srcObject = null;
            return;
        }

        if (navigator.getUserMedia) {
            navigator.getUserMedia($rootScope.constraints,
                function(stream) {
                    var video = document.getElementById('selecting_video');
                    video.srcObject = stream;
                    video.onloadedmetadata = function(e) {
                        video.play();
                    };
                },
                function(err) {
                    $rootScope.alertDialog.push(ngDialog.open({
                        template: 'partials/modals/classroom_alert_modal.html',
                        controller: "AcademiaClassroomsAlertCtrl",
                        className: 'ngdialog-theme-default classroom-alert-modal',
                        data: { type: "ERROR", msg: "The following error occurred: " + err.name }
                    }));
                }
            );
        } else {
            navigator.mediaDevices.getUserMedia($rootScope.constraints)
                .then((stream) => {
                    var video = document.getElementById('selecting_video');
                    video.srcObject = stream;
                    video.onloadedmetadata = function(e) {
                        video.play();
                    };
                }).catch((err) => {
                    $rootScope.alertDialog.push(ngDialog.open({
                        template: 'partials/modals/classroom_alert_modal.html',
                        controller: "AcademiaClassroomsAlertCtrl",
                        className: 'ngdialog-theme-default classroom-alert-modal',
                        data: { type: "ERROR", msg: "The following error occurred: " + err.name }
                    }));
                });
        }
    }

    $scope.initSetting = function() {
        $scope.scanDevices().then(() => {
            $scope.selectDevice();
            $scope.displayInitial();
        });
    }

    $scope.toggleVideoSetting = function() {
        if (!$scope.videoTogglable) return;
        if ($scope.videoToggle == 'fas fa-video-slash') {
            $scope.videoToggle = 'fas fa-video';
            $scope.currentVideoInputDevice = $scope.videoStatus;
            $scope.videoDisabled = 'color-white';
            $scope.displayInitial();
        } else {
            $scope.videoToggle = 'fas fa-video-slash';
            $scope.currentVideoInputDevice = null;
            $scope.videoDisabled = 'color-red';
            $scope.displayInitial();
        }
    }

    $scope.toggleVoiceSetting = function() {
        if (!$scope.voiceTogglable) return;
        if ($scope.voiceToggle == 'fas fa-microphone-alt-slash') {
            $scope.voiceToggle = 'fas fa-microphone-alt';
            $scope.currentAudioInputDevice = $scope.audioStatus;
            $scope.audioDisabled = 'color-white';
            $scope.displayInitial();
        } else {
            $scope.voiceToggle = 'fas fa-microphone-alt-slash';
            $scope.currentAudioInputDevice = null;
            $scope.audioDisabled = 'color-red';
            $scope.displayInitial();
        }
    }

    $scope.confirmSelect = function() {
        $rootScope.ifSelectedDevice = true;
        if ($rootScope.constraints.audio == false && $rootScope.constraints.video == false) {
            if ($rootScope.alertDialog == null || $rootScope.alertDialog == undefined) $rootScope.alertDialog = [];

            $rootScope.alertDialog.push(ngDialog.open({
                template: 'partials/modals/classroom_alert_modal.html',
                controller: "AcademiaClassroomsAlertCtrl",
                className: 'ngdialog-theme-default classroom-alert-modal',
                data: { type: "ERROR", msg: 'You have no cameras and microphones' }
            }));
            return;
        }
        ngDialog.close();
    }
}])

.controller('AcademiaClassroomCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'Classroom', 'Students', 'ngDialog', '$localStorage', '$window', function($rootScope, $scope, $location, $route, University, Classroom, Students, ngDialog, $localStorage, $window) {
    let universityUrl = $route.current.params.academiaName; // Current university
    let roomSID = $route.current.params.roomSID; // Current roomsid
    let accountSid = $route.current.params.accountSid; // Admin user id ( = null if unlogged user)
    let roomName = $route.current.params.roomName; // Current room name
    $scope.administrator = []; // Array of administrators
    $scope.participants = []; // Array of participants
    $scope.selectedOne = false; // Flag varible showing if one participant's video selected by user
    $scope.currentVideoRoom = null; // Current Twilio video room vairble
    $scope.wholeClassroomList = []; //
    $scope.localParticipantUserName = ""; // Current user name
    $scope.currentLocalparticipant = null; // Current Twilio local participant varible
    $scope.showingParticipants = []; // Array of participants should be shown below the administrators
    $scope.shareScreenCaption = "Share Screen"; // Toggling caption of share screen button
    $scope.voiceToggle = 'fas fa-microphone-alt'; // Fontawesome class name toggled by voice mute button status
    $scope.voiceStatus = "Mute"; // Voice status
    $scope.videoToggle = 'fas fa-video'; // Fontawesome class name toggled by video mute button status
    $scope.videoStatus = 'Stop Video'; // Video status
    $scope.recordToggle = 'fas fa-record-vinyl'
    $scope.recordStatus = false;
    $scope.participantsStatus = false; // Participants Menu showing status
    $scope.chatStatus = false; // Chat box showing status
    $scope.mobileVisibleToggle = 'mobile-invisible'; // Bottom controllers mobile visible classNames
    $scope.isFullScreen = false; // Full screen status
    $scope.fullScreenStatus = ''; // Bottom controllers container showing classNames while full screen
    $scope.fullScreenToggle = "fa fa-expand"; // Full screen button's toggling classNames
    $scope.fullScreenIconPos = ' absolute';
    $scope.localConnected = 'false'; // Flag varible showing the current user connected video room
    $scope.recordToggleCaption = 'record';
    $rootScope.localMessager = null;
    $scope.recorder = null;

    var video = Twilio.Video; // Twilio video

    var baseUrl = "https://educationalcommunity-classroom.herokuapp.com";
    //var baseUrl = 'http://c395e03d.ngrok.io';
    var arr = $window.location.href.split("/");
    var domain = arr[0] + "//" + arr[2];

    angular.element($window).bind('resize', function() {
        $scope.videoSizeSet();
    });

    $scope.videoSizeSet = function() { // Participants' video layout
        var i;
        var videoContainer = document.getElementById('twilio');
        var videoDom = document.getElementsByTagName('video');
        var titleDom = document.getElementsByClassName('sub-video-title');
        var mainWidth;
        var mainHeight;
        var showingTitle;
        var countOfNone = 0;

        if ($scope.isFullScreen) {
            videoContainer.style.position = 'fixed';
            videoContainer.style.left = '0px';
            videoContainer.style.top = '0px';
            videoContainer.style.width = '100%';
            videoContainer.style.height = '100%';
        } else {
            videoContainer.style.position = 'initial';
            if (!$scope.isMobile()) videoContainer.style.width = '600px';
        }

        for (i = 0; i < titleDom.length; i++) {
            if (titleDom[i].style.display != 'none') {
                showingTitle = titleDom[i];
                countOfNone++;
            }
            let j;
            for (j = 0; j < $scope.participants.length; j++) {
                if ($scope.participants[j]._id == titleDom[i].getAttribute('id')) {
                    let checkEle = document.getElementById($scope.participants[j]._id + '_name');
                    if (checkEle == null) {
                        let label = document.createElement('div');
                        label.setAttribute('id', $scope.participants[j]._id + '_name');
                        label.setAttribute('class', 'sub-video-title-section');
                        label.innerText = $scope.participants[j].name;
                        titleDom[i].appendChild(label);
                    }
                }
            }
        }

        if (!$scope.isMobile()) {
            let participantMenu = document.getElementsByClassName('participant-menu-icon');
            let chatMenu = document.getElementsByClassName('chat-menu-icon');
            mainWidth = parseInt(videoContainer.offsetWidth);

            if (!$scope.isFullScreen) {
                videoContainer.style.height = mainWidth / 4 * 3 + 'px';
                mainHeight = mainWidth / 4 * 3;
                participantMenu[0].style.position = 'initial';
                chatMenu[0].style.position = 'initial';
            } else {
                mainHeight = videoContainer.style.height;
                participantMenu[0].style.position = 'fixed';
                participantMenu[0].style.left = '0px';
                participantMenu[0].style.top = '9px';
                chatMenu[0].style.position = 'fixed';
                chatMenu[0].style.top = '9px';
                chatMenu[0].style.right = '0px';
            }

            let px = 'px';

            if (titleDom.length == 1 || countOfNone == 1) {
                titleDom[0].style.width = "99.9%";
                titleDom[0].style.height = "99.9%";

                if ($scope.isFullScreen) {
                    titleDom[0].style.position = 'absolute';
                } else {
                    titleDom[0].style.position = 'relative';
                }

                let k;
                for (k = 0; k < titleDom[0].childElementCount; k++) {
                    if (titleDom[0].children[k].tagName == 'VIDEO') {

                        titleDom[0].children[k].style.width = "100%";
                        titleDom[0].children[k].style.height = "100%";

                    }
                }

                showingTitle.style.width = "99.9%";
                showingTitle.style.height = "99%";
                if ($scope.isFullScreen) {
                    showingTitle.style.position = 'absolute';
                } else {
                    showingTitle.style.position = 'relative';
                }

                for (k = 0; k < showingTitle.childElementCount; k++) {
                    if (showingTitle.children[k].tagName == 'VIDEO') {

                        showingTitle.children[k].style.width = "100%";
                        showingTitle.children[k].style.height = "100%";

                    }
                }

            } else if (titleDom.length > 1 && titleDom.length < 5 && countOfNone != 1) {
                for (i = 0; i < titleDom.length; i += 1) {
                    let k;
                    for (k = 0; k < titleDom[i].childElementCount; k++) {
                        if (titleDom[i].children[k].tagName == 'VIDEO') {
                            titleDom[i].children[k].style.width = "100%";
                            titleDom[i].children[k].style.height = "100%";
                            titleDom[i].children[k].style.position = 'initial';
                        }
                    }
                    titleDom[i].style.width = "49.9%";
                    titleDom[i].style.height = '50%';
                    titleDom[i].style.position = 'relative';
                }
                if (!$scope.isFullScreen) $scope.fullScreenStatus = '';

            } else if (titleDom.length > 4 && countOfNone != 1) {
                for (i = 0; i < titleDom.length; i += 1) {
                    let k;
                    for (k = 0; k < titleDom[i].childElementCount; k++) {
                        if (titleDom[i].children[k].tagName == 'VIDEO') {
                            titleDom[i].children[k].style.width = "100%";
                            titleDom[i].children[k].style.height = "100%";
                            titleDom[i].children[k].style.position = 'initial';
                        }
                    }
                    titleDom[i].style.width = '33%';
                    titleDom[i].style.height = '33%';
                    titleDom[i].style.position = 'relative';
                }
                if (!$scope.isFullScreen) $scope.fullScreenStatus = '';
            }
        } else {
            videoContainer.style.height = parseInt(screen.height) - 102 + 'px';
            if (titleDom.length == 1 || countOfNone == 1) {
                titleDom[0].style.width = "100%";
                titleDom[0].style.height = "100%";
                let k;
                for (k = 0; k < titleDom[0].childElementCount; k++) {
                    if (titleDom[0].children[k].tagName == 'VIDEO') {

                        titleDom[0].children[k].style.width = "100%";
                        titleDom[0].children[k].style.height = "100%";
                    }
                }

                showingTitle.style.width = "100%";
                showingTitle.style.height = "100%";

                for (k = 0; k < showingTitle.childElementCount; k++) {
                    if (showingTitle.children[k].tagName == 'VIDEO') {

                        showingTitle.children[k].style.width = "100%";
                        showingTitle.children[k].style.height = "100%";
                    }
                }

            } else if (titleDom.length == 2 && countOfNone != 1) {

                for (i = 0; i < titleDom.length; i += 1) {
                    titleDom[i].style.width = "100%";
                    titleDom[i].style.height = "50%";
                    let k;
                    for (k = 0; k < titleDom[i].childElementCount; k++) {
                        if (titleDom[i].children[k].tagName == 'VIDEO') {
                            titleDom[i].children[k].style.width = "100%";
                            titleDom[i].children[k].style.height = "100%";
                        }
                    }
                    titleDom[i].style.width = "100%";
                    titleDom[i].style.height = mainHeight / 2 + 'px';
                }

            } else if (titleDom.length > 2 && countOfNone != 1) {

                for (i = 0; i < titleDom.length; i += 1) {
                    titleDom[i].style.width = "50%";
                    titleDom[i].style.height = "50%";
                    let k;
                    for (k = 0; k < titleDom[i].childElementCount; k++) {
                        if (titleDom[i].children[k].tagName == 'VIDEO') {
                            titleDom[i].children[k].style.width = "100%";
                            titleDom[i].children[k].style.height = "100%";
                        }
                    }
                    titleDom[i].style.width = mainWidth / 2 + 'px';
                    titleDom[i].style.height = mainHeight / 2 + 'px';
                }
            }
        }
    }

    $scope.joinClassroom = function() {
        if ($rootScope.constraints.audio == false && $rootScope.constraints.video == false) {
            ngDialog.open({
                template: 'partials/modals/classroom_select_device_modal.html',
                controller: 'AcademiaClassroomSelectDeviceCtrl',
                className: 'ngdialog-theme-default classroom-select-device-modal',
                data: { redirectUrl: redirectUrl }
            });
            return;
        }

        Students.getStudentById(accountSid).then((res) => { // Get admin user data
            if ($scope.administrator.length == 0) {
                $scope.administrator.push(res.data.data);
            }
        });

        let url = '/classroom/' + roomSID + '/join/';
        Classroom.joinClassroom(baseUrl + url).then((res) => { // Join and get access token

                url = '/classroom/classroom/' + roomName + '/token/'
                Classroom.getAccessToken(baseUrl + url).then((response) => {
                    $scope.connectClassroom(response.data.token, roomName);
                });

            })
            .catch((err) => {
                alert('Join Error.');
            });
    }

    $scope.initClassroom = function() {
        let token = $localStorage.token;

        if (token == null || token == undefined) {
            let redirectUrl = '/a/university/' + universityUrl + '/roomid/' + roomSID + '/accountid/' + accountSid + '/roomname/' + roomName + '/';
            ngDialog.open({
                template: 'partials/modals/login.html',
                controller: 'AccountCtrl',
                className: 'ngdialog-theme-default',
                data: { redirectUrl: redirectUrl }
            });
            return;
        }
        let redirectUrl = '/a/university/' + universityUrl + '/roomid/' + roomSID + '/accountid/' + accountSid + '/roomname/' + roomName + '/';

        if ($rootScope.ifSelectedDevice == null || $rootScope.ifSelectedDevice == undefined) {

            ngDialog.open({
                template: 'partials/modals/classroom_select_device_modal.html',
                controller: 'AcademiaClassroomSelectDeviceCtrl',
                className: 'ngdialog-theme-default classroom-select-device-modal',
                data: { redirectUrl: redirectUrl }
            });
            return;
        }
        $scope.joinClassroom();
    }

    let joiningInterval = setInterval(() => {
        if ($rootScope.ifSelectedDevice == null || $rootScope.ifSelectedDevice == undefined) {
            return;
        }
        $scope.joinClassroom();
        joiningInterval.ifSelectedDevice
        clearInterval(joiningInterval);
    }, 100);

    $scope.disconnectClassroom = function() {
        var mainDom = document.getElementById('twilio');
        var i;
        var videos = document.getElementsByClassName('sub-video-title');
        for (i = videos.length - 1; i >= 0; i--) {
            videos[i].remove();
        }
        $scope.participants = [];
        $scope.showingParticipants = [];
        $scope.currentLocalparticipant = null;
        $scope.localConnected = false;
        $scope.currentVideoRoom = null;
    }

    $scope.isMobile = function() {
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            return true;
        }
        return false;
    }

    $scope.connectingClassroom = function(token, room_t) {
        $scope.videoSizeSet();

        video.connect(token, room_t).then(room => { // Video room connect
            const localParticipant = room.localParticipant;

            $scope.currentLocalparticipant = room.localParticipant;
            $scope.currentLocalparticipant.audioTracks.forEach(function(audioTrack) {
                $scope.currentLoaclAudioTrack = audioTrack;
            });
            $scope.localConnected = true;
            $scope.currentVideoRoom = room;

            var mainVideoDom = document.getElementById('twilio');
            var videoTitle = document.createElement('div');
            videoTitle.setAttribute('id', localParticipant.identity);
            videoTitle.setAttribute('class', 'sub-video-title');
            videoTitle.style.position = 'relative';

            $scope.localVideoContainer = videoTitle;

            let i;

            localParticipant.videoTracks.forEach(publication => {
                $scope.currentLocalScreen = publication.track;
                $scope.attachVideo(publication.track, videoTitle);
            });

            localParticipant.audioTracks.forEach(publication => {
                $scope.attachVideo(publication.track, videoTitle);
            });

            mainVideoDom.appendChild(videoTitle);

            Students.getStudentById(localParticipant.identity).then((res) => { // Check the user if admin and push the data into admin array
                $scope.localParticipantUserName = res.data.data.name;

                $rootScope.localMessager = {
                    id: res.data.data._id,
                    name: res.data.data.name
                }

                if (document.getElementById('my_local_video') != null) {
                    document.getElementById('my_local_video').innerText = $scope.localParticipantUserName;
                }
                if (res.data.data._id == $scope.administrator[0]._id) {
                    $scope.adminActive = 'admin-active';
                } else {
                    $scope.showingParticipants.push(res.data.data);
                }
                $scope.participants.push(res.data.data);

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

    $scope.isSafari = function() {
        var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        return isSafari;
    }

    $scope.connectClassroom = function(token, roomName, screenTrack = null) {
        $scope.currentShareScreen = screenTrack;
        $scope.currentRoomToken = token;
        $scope.currentRoomName = roomName;

        var room_t;
        if (screenTrack != null) {
            room_t = {
                name: roomName,
                tracks: [screenTrack[0], screenTrack[1]]
            }
            $scope.connectingClassroom(token, room_t);
        } else {

            video.createLocalTracks($rootScope.constraints).then((localTracks) => {
                room_t = {
                    name: roomName,
                    tracks: localTracks
                }
                $scope.connectingClassroom(token, room_t);
            })
        }
    }

    $scope.participantConnected = function(participant) { // Participant connected event handler
        var mainVideoDom = document.getElementById('twilio');
        var subTitleDom = document.createElement('div');
        subTitleDom.setAttribute('id', participant.identity);

        subTitleDom.setAttribute('class', 'sub-video-title');

        participant.on('trackSubscribed', track => {
            $scope.trackSubscribed(mainVideoDom, subTitleDom, track);
        });

        participant.on('trackUnsubscribed', $scope.trackUnsubscribed);

        Students.getStudentById(participant.identity).then((res) => {
            $scope.participants.push(res.data.data);
            if (res.data.data._id == $scope.administrator[0]._id) {
                $scope.adminActive = 'admin-active';
            } else {
                $scope.showingParticipants.push(res.data.data);
            }

            setTimeout(() => {
                    $window.dispatchEvent(new Event("resize"));
                },
                100);
        });
    }

    $scope.trackSubscribed = function(main, ele, track) { // Track subscribed event handler
        $scope.attachVideo(track, ele);
        main.appendChild(ele);

        setTimeout(() => {
            $window.dispatchEvent(new Event("resize"));
        }, 100);
    }

    $scope.participantDisconnected = function(participant) { // Participant disconnected event handler
        var i;
        for (i = 0; i < $scope.participants.length; i++) {
            if ($scope.participants[i] == null) continue;
            if ($scope.participants[i]._id == participant.identity) {
                $scope.participants.splice(i, 1);
            }
        }
        for (i = 0; i < $scope.showingParticipants.length; i++) {
            if ($scope.showingParticipants[i] == null) continue;
            if ($scope.showingParticipants[i]._id == participant.identity) {
                $scope.showingParticipants.splice(i, 1);
            }
        }
    }

    $scope.trackUnsubscribed = function(track) { // Track unsubscribed event handler
        track.detach().forEach(element => {

            let i, j;
            let videos = document.getElementsByTagName('video');
            let audios = document.getElementsByTagName('audio');
            let titles = document.getElementsByClassName('sub-video-title');
            let compareEle = null;
            for (i = 0; i < videos.length; i++) {
                if (element == videos[i]) {
                    break;
                }
            }

            if (i == videos.length) {
                for (i = 0; i < audios.length; i++) {
                    if (element == audios[i]) {
                        break;
                    }
                }
                if (i == audios.length) {
                    return;
                } else {
                    compareEle = audios[i];
                }
            } else {
                compareEle = videos[i];
            }

            for (i = 0; i < titles.length; i++) {
                for (j = 0; j < titles[i].childElementCount; j++) {
                    if (compareEle == titles[i].children[j]) break;
                }
                if (j < titles[i].childElementCount) break;
            }

            if (i == titles.length) return;

            for (j = 0; j < $scope.participants.length; j++) {
                if ($scope.participants[j] == null) continue;
                if (titles[i].getAttribute('id') == $scope.participants[j]._id) {
                    $scope.$apply(() => {
                        if ($scope.participants[j]._id == $scope.administrator[0]._id) $scope.adminActive = "";
                        $scope.participants.splice(j, 1);
                    });
                }
            }
            for (j = 0; j < $scope.showingParticipants.length; j++) {
                if ($scope.showingParticipants[j] == null) continue;
                if (titles[i].getAttribute('id') == $scope.showingParticipants[j]._id) {
                    $scope.$apply(() => {
                        if ($scope.showingParticipants[j]._id == $scope.administrator[0]._id) $scope.adminActive = "";
                        $scope.showingParticipants.splice(j, 1);
                    });
                }
            }
            titles[i].remove();
            setTimeout(() => {
                $scope.videoSizeSet();
            }, 100);
        });
    }

    $scope.returnBack = function() {
        $scope.administrator = [];
        $scope.participants = [];
        $scope.showingParticipants = [];
        $scope.shareScreenCaption = 'Share Screen';
        $scope.disconnectClassroom();
        $scope.adminActive = '';

        $rootScope.localMessager = null;
        $rootScope.currentChatChannel.leave();
        $window.close();
    }

    $scope.recordVideo = function() { // Works only chrome browser, not using Twilio api, instead of it, using MediaRecorder
        if ($scope.recordStatus == false) {
            $scope.videoRecordStream = [];
            $scope.recorder = [];
            $scope.audioRecordStream = new MediaStream();
            let videos = document.getElementsByTagName('video');
            let audios = document.getElementsByTagName('audio');
            let i;

            for (i = 0; i < audios.length; i++) {
                $scope.audioRecordStream.addTrack(audios[i].captureStream().getAudioTracks()[0]);
            }

            for (i = 0; i < videos.length; i++) {
                let videoS = new MediaStream();
                videoS.addTrack(videos[i].captureStream().getVideoTracks()[0]);
                $scope.videoRecordStream.push(videoS);

                var outputStream = new MediaStream();
                [$scope.audioRecordStream, videoS].forEach((s) => {
                    s.getTracks().forEach((t) => {
                        outputStream.addTrack(t);
                    })
                });

                let recorder = new MediaRecorder(outputStream);
                recorder.start();
                $scope.recorder.push(recorder);
            }

            $scope.recordStatus = true;
            $scope.recordToggle = 'fas fa-record-vinyl recording';
            $scope.recordToggleCaption = 'stop recording';
        } else {
            let i;
            $scope.tempScene = [];
            let promise = new Promise((resolve, reject) => {
                for (i = 0; i < $scope.recorder.length; i++) {

                    $scope.recorder[i].ondataavailable = e => {
                        $scope.tempScene.push(e.data);
                    };
                    $scope.recorder[i].stop();
                }

                setTimeout(() => {
                    resolve();
                }, 500);
            });

            promise.then(() => {
                var a = document.createElement('a');
                a.download = ['video_', (new Date() + '').slice(4, 28), '.webm'].join('');
                a.href = URL.createObjectURL($scope.tempScene[0]);
                a.textContent = a.download;
                a.click();
            })

            $scope.recordStatus = false;
            $scope.recordToggle = 'fas fa-record-vinyl';
            $scope.recordToggleCaption = 'record';
        }
    }

    $scope.attachVideo = function(track, videoContainer) { // Attach participant's video to dom
        angular.element(videoContainer.appendChild(track.attach())).bind('click', (e) => {
            var i;

            let mainDom = document.getElementById('twilio');
            if ($scope.selectedOne) {
                for (i = 0; i < mainDom.childElementCount; i++) {
                    mainDom.children[i].style.display = 'initial';
                }

            } else {

                let elements = document.getElementsByClassName('sub-video-title');
                for (i = 0; i < elements.length; i++) {
                    let flag = false;
                    let k;
                    for (k = 0; k < elements[i].childElementCount; k++) {
                        if (elements[i].children[k] == e.target) flag = true;
                    }
                    if (!flag) {
                        elements[i].style.display = 'none';
                    }
                }
            }
            setTimeout(() => {
                    $window.dispatchEvent(new Event("resize"));
                },
                100);
            $scope.selectedOne = !$scope.selectedOne;
        });
    }

    $scope.sharingScreen = function(stream) {
        const screenTrack = stream.getTracks()[0];

        screenTrack.onended = function(e) {
            if (!$scope.localConnected) return;
            $scope.disconnectClassroom();
            $scope.shareScreenCaption = 'Share Screen';
            $scope.connectClassroom($scope.currentRoomToken, $scope.currentRoomName);
            if ($scope.currentShareScreen != null) {
                $scope.currentShareScreen.forEach((track) => {
                    track.stop();
                });
            }
        }

        $scope.currentShareScreen = screenTrack;

        navigator.mediaDevices.enumerateDevices()
            .then((deviceInfos) => {
                for (let i = 0; i !== deviceInfos.length; ++i) {
                    const deviceInfo = deviceInfos[i];
                    if (deviceInfo.kind === 'audioinput') {
                        const constraints = {
                            audio: {
                                deviceId: { exact: deviceInfo.id }
                            }
                        };

                        navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
                            $scope.disconnectClassroom();
                            $scope.connectClassroom($scope.currentRoomToken, $scope.currentRoomName, [stream.getTracks()[0], screenTrack]);
                        });
                        break;
                    }
                }
            });
    }

    $scope.shareScreen = function() { // Share screen event handler(toggle share screen)
        if ($scope.localConnected == false) {
            return;
        }

        if ($scope.shareScreenCaption == 'Share Screen') {
            $scope.shareScreenCaption = 'Stop Sharing';
            if ($scope.isMobile()) {
                navigator.mediaDevices.getUserMedia({
                    audio: false,
                    video: true
                }).then((stream) => {
                    $scope.sharingScreen(stream);
                });
            } else {
                navigator.mediaDevices.getDisplayMedia({
                    audio: false,
                    video: { mediaSource: 'screen' }
                }).then((stream) => {
                    $scope.sharingScreen(stream);
                });
            }
        } else {
            $scope.disconnectClassroom();
            if ($scope.currentShareScreen != null) {
                $scope.currentShareScreen.forEach((track) => {
                    track.stop();
                });
            }
            $scope.shareScreenCaption = 'Share Screen';
            $scope.connectClassroom($scope.currentRoomToken, $scope.currentRoomName);
        }
    }

    $scope.toggleParticipantsBox = function() { // Participant menu button event handler
        $scope.participantsStatus = !$scope.participantsStatus;
        if ($scope.participantsStatus) {
            $scope.mobileToggleParticipantsList = 'drag-in-left-right';
            if ($scope.isMobile() == true && $scope.chatStatus == true) {
                $scope.toggleChatBox();
            }
        } else {
            $scope.mobileToggleParticipantsList = 'drag-out-right-left';
        }
    }

    $scope.toggleChatBox = function() { // Chatbox showing button event handler
        $scope.chatStatus = !$scope.chatStatus;
        if ($scope.chatStatus) {
            $scope.chatboxContainer = "drag-in-right-left";
            if ($scope.isMobile() == true && $scope.participantsStatus == true) {
                $scope.toggleParticipantsBox();
            }
        } else {
            $scope.chatboxContainer = "drag-out-left-right";
        }
    }

    $scope.toggleVoice = function() { // Voice toggle event handler
        if ($scope.voiceStatus == "Mute") {
            $scope.currentLocalparticipant.audioTracks.forEach(function(audioTrack) {
                audioTrack.track.disable();
            });
            $scope.voiceToggle = 'fas fa-microphone-alt-slash';
            $scope.voiceStatus = "Unmute";
        } else {
            $scope.currentLocalparticipant.audioTracks.forEach(function(audioTrack) {
                audioTrack.track.enable();
            });
            $scope.voiceToggle = 'fas fa-microphone-alt';
            $scope.voiceStatus = "Mute";
        }
    }

    $scope.toggleVideo = function() { // Video toggle button event handler
        if ($scope.videoStatus == "Stop Video") {
            $scope.currentLocalparticipant.videoTracks.forEach(function(videoTrack) {
                videoTrack.track.disable();
            });
            $scope.videoToggle = 'fas fa-video-slash';
            $scope.videoStatus = "Start Video";
        } else {
            $scope.currentLocalparticipant.videoTracks.forEach(function(videoTrack) {
                videoTrack.track.enable();
            });
            $scope.videoToggle = 'fas fa-video';
            $scope.videoStatus = "Stop Video";
        }
    }

    $scope.copyLink = function() { // Copy link button event handler
        let universityUrl = $route.current.params.academiaName;
        let roomSID = $route.current.params.roomSID;
        let accountSid = $route.current.params.accountSid;
        let roomName = $route.current.params.roomName;
        let text = domain + "/a/university/" + universityUrl + "/roomid/" + roomSID + "/accountid/" + accountSid + "/roomname/" + roomName + "/";

        Clipboard.copy(text); // Clipboard func is defined app/js/clipboard_func.js file
        if ($rootScope.alertDialog == null || $rootScope.alertDialog == undefined) $rootScope.alertDialog = [];

        $rootScope.alertDialog.push(ngDialog.open({
            template: 'partials/modals/classroom_alert_modal.html',
            controller: "AcademiaClassroomsAlertCtrl",
            className: 'ngdialog-theme-default classroom-alert-modal',
            data: { type: "Universidade", msg: 'Copied link to clipboard' }
        }));

    }

    $scope.toggleAllControllers = function() {
        if ($scope.mobileVisibleToggle == 'mobile-invisible') {
            $scope.mobileVisibleToggle = 'mobile-visible';
        } else {
            $scope.mobileVisibleToggle = 'mobile-invisible';
        }
    }

    $scope.toggleFullScreen = function() {
        $scope.isFullScreen = !$scope.isFullScreen;

        if ($scope.isFullScreen) {
            $scope.fullScreenToggle = "fa fa-compress";
            $scope.fullScreenIconPos = ' fixed';
            $scope.fullScreenStatus = 'bottom-controllers-fullscreen-show';
        } else {
            $scope.fullScreenToggle = "fa fa-expand";
            $scope.fullScreenIconPos = ' absolute';
            $scope.fullScreenStatus = '';
        }
        setTimeout(() => {
                $window.dispatchEvent(new Event("resize"));
            },
            100);
    }
    $scope.confirm = function() {
        ngDialog.close();
    }
}])

.controller('AcademiaClassroomsAlertCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'Classroom', 'Students', 'ngDialog', 'jwtHelper', '$localStorage', '$window', function($rootScope, $scope, $location, $route, University, Classroom, Students, ngDialog, jwtHelper, $localStorage, $window) {
    $scope.alertMsg = $scope.ngDialogData.msg;
    $scope.alertType = $scope.ngDialogData.type;
    $scope.confirmAlertFrom = function() {
        if ($rootScope.alertDialog.length == 0) return;
        $rootScope.alertDialog[$rootScope.alertDialog.length - 1].close();
        $rootScope.alertDialog.splice($rootScope.alertDialog.length - 1, 1);
    }
}])

.controller('AcademiaClassroomsCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'Classroom', 'Students', 'ngDialog', 'jwtHelper', '$localStorage', '$window', function($rootScope, $scope, $location, $route, University, Classroom, Students, ngDialog, jwtHelper, $localStorage, $window) {
    /* SHOWING CLASSROOM LIST PAGE */
    let universityUrl = $route.current.params.academiaName;
    $scope.administrator = [];
    $scope.participants = [];
    $scope.selectedOne = false;
    $scope.currentVideoRoom = null;
    $scope.wholeClassroomList = [];
    $scope.localParticipantUserName = "";
    $scope.showingParticipants = [];
    $scope.shareScreenCaption = "Share Screen";
    $scope.confirmDelete = false;
    $scope.classroomViewMode = false;

    $scope.isAdmin = $localStorage.studentIsAdmin

    //var baseUrl = "http://localhost:9001"; //Back-end server base url
    var baseUrl = "https://educationalcommunity-classroom.herokuapp.com";

    var arr = $window.location.href.split("/");
    var domain = arr[0] + "//" + arr[2];

    University.getUniversity(universityUrl).then(function(res) {
        $scope.university = res.data.data;
        $scope.getAllClassrooms();
    });

    /****************** Mobile / Web **************************/
    $scope.isMobile = function() {
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            return true;
        }
        return false;
    }

    $scope.maxHeight = {
        "max-height": '500px'
    }

    /******************** GET ALL Classrooms ******************/
    $scope.getAllClassrooms = function() {
        let url = '/classroom/university/' + $scope.university._id + '/all'
        Classroom.getAllClassroomsByUniversity(baseUrl + url).then((res) => {
            $scope.wholeClassroomList = res.data.data;
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
        ngDialog.open({
            controller: 'AcademiaClassroomsCtrl',
            template: 'partials/modals/classroom_modal.html',
            className: 'ngdialog-theme-default classroom-modal'
        });
    };

    $scope.confirmCreateClassroom = function() {
        let studentId;

        let token = $localStorage.token;
        let title = $scope.addingClassroom.uniqueName ? $scope.addingClassroom.uniqueName : '';
        let url = '/classroom/university/';

        if ($localStorage.token != undefined && $localStorage.token != null) {
            studentId = jwtHelper.decodeToken($localStorage.token)._id;
        }
        let i;
        let privilege = 0;

        for (i = 0; i < $scope.university.members.length; i++) {
            let member = $scope.university.members[i];
            if (studentId != undefined && member.accountId == studentId) {
                privilege = member.privilege;
                break;
            }
        }

        Classroom.createNewClassroom(baseUrl + url, title, privilege, $scope.university._id).then((response) => {
            if (response.data.success) {
                let url = '/classroom/university/' + $scope.university._id + '/all'
                Classroom.getAllClassroomsByUniversity(baseUrl + url).then((data) => {
                    $scope.wholeClassroomList = data;
                    $route.reload();
                });

                url = '/classroom/chat_token/';
                Classroom.getChatAccessToken(baseUrl + url).then((res) => {
                    Twilio.Chat.Client.create(res.data.token).then(function(client) {
                        $rootScope.messagingClient = client;

                        $rootScope.messagingClient.createChannel({ // create admin channel
                            uniqueName: response.data.data.roomData.roomSID,
                            friendlyName: response.data.data.roomData.uniqueName
                        }).then((channel) => {
                            $rootScope.currentChatChannel = channel;
                        });
                    });
                });
                ngDialog.close();
            } else {
                ngDialog.close();
                if ($rootScope.alertDialog == null || $rootScope.alertDialog == undefined) $rootScope.alertDialog = [];
                $rootScope.alertDialog.push(ngDialog.open({
                    template: 'partials/modals/classroom_alert_modal.html',
                    controller: "AcademiaClassroomsAlertCtrl",
                    className: 'ngdialog-theme-default classroom-alert-modal',
                    data: { type: "ERROR", msg: "Insufficient Privilege" }
                }));
            }
        });
    }

    $scope.copyLink = function(classroom) {
        let text = domain + "/a/university/" + universityUrl + "/roomid/" + classroom.roomSID + "/accountid/" + classroom.accountSid + "/roomname/" + classroom.uniqueName + "/";

        Clipboard.copy(text);
        if ($rootScope.alertDialog == null || $rootScope.alertDialog == undefined) $rootScope.alertDialog = [];

        $rootScope.alertDialog.push(ngDialog.open({
            template: 'partials/modals/classroom_alert_modal.html',
            controller: "AcademiaClassroomsAlertCtrl",
            className: 'ngdialog-theme-default classroom-alert-modal',
            data: { type: "Universidade", msg: 'Copied link to clipboard' }
        }));
    }

    $scope.joinClassroom = function(classroom) {
        window.open(domain + "/a/university/" +
            universityUrl + "/roomid/" +
            classroom.roomSID +
            "/accountid/" +
            classroom.accountSid +
            "/roomname/" +
            classroom.uniqueName + "/"
        );
    }

    $scope.deleteClassroom = function(classroom) {
        $rootScope.deleteRoom = classroom;
        ngDialog.open({
            template: 'partials/modals/classroom_confirm_delete_modal.html',
            controller: "AcademiaClassroomsCtrl",
            className: 'ngdialog-theme-default classroom-alert-modal'
        });
        if ($rootScope.currentChatChannel) $rootScope.currentChatChannel.leave();
    }

    $scope.confirmDelete = function() {
        let token = $localStorage.token;
        let url = '/classroom/end/';
        var i;
        var privilege = 0;
        let studentId;
        if ($localStorage.token != undefined && $localStorage.token != null) {
            studentId = jwtHelper.decodeToken($localStorage.token)._id;
        }
        for (i = 0; i < $scope.university.members.length; i++) {
            var member = $scope.university.members[i];
            if (studentId != undefined && member.accountId == studentId) {
                privilege = member.privilege;
                break;
            }
        }

        //privilege = 99;
        var roomId = $rootScope.deleteRoom.roomSID;
        Classroom.deleteClassroom(baseUrl + url, roomId, privilege).then((res) => {
            if (res.data.success) {
                let url = '/classroom/university/' + $scope.university._id + '/all';
                Classroom.getAllClassroomsByUniversity(baseUrl + url).then((data) => {
                    ngDialog.close();
                    $scope.wholeClassroomList = data;
                    $route.reload();
                });
            } else {
                ngDialog.close();
                if ($rootScope.alertDialog == null || $rootScope.alertDialog == undefined) $rootScope.alertDialog = [];
                $rootScope.alertDialog.push(ngDialog.open({
                    template: 'partials/modals/classroom_alert_modal.html',
                    controller: "AcademiaClassroomsAlertCtrl",
                    className: 'ngdialog-theme-default classroom-alert-modal',
                    data: { type: "ERROR", msg: 'Insufficient Privilege' }
                }));
            }
        });
    }

    $scope.cancelDelete = function() {
        $scope.deleteRoom = null;
        ngDialog.close();
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

.controller('AcademiaTimelineCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'Forum', 'User', 'Students', '$sce', '$filter', 'ngDialog', '$timeout', function($rootScope, $scope, $location, $route, University, Forum, User, Students, $sce, $filter, ngDialog, $timeout) {
    let universityUrl = $route.current.params.academiaName;

    $scope.loaded = false;
    let displayinvite = false;
    let INTERCOME_APP_ID = "qq74p5y0";

    $scope.setupIntercom = () => {
        Students.getStudentById(User.getId()).then(res => {
            let student = res.data.data;

            if ($scope.isAdmin(student._id) === true) {
                Intercom("boot", {
                    app_id: INTERCOME_APP_ID,
                    email: student.email,
                    created_at: student.createdAt,
                    name: student.name,
                    user_id: student._id,
                    language: student.language,
                    imageUrl: student.imageUrl,
                    widget: {
                        activator: "#IntercomDefaultWidget"
                    }
                });

                $rootScope.$on("$routeChangeStart", function(event, next, current) {
                    if (next.$$route.controller !== "AcademiaForumCtrl" &&
                        next.$$route.controller !== "AcademiaTimelineCtrl" &&
                        next.$$route.controller !== "AcademiaForumCategoryAllCtrl" &&
                        next.$$route.controller !== "AcademiaForumPostCtrl" &&
                        next.$$route.controller !== "AcademiaPlaylistsCtrl" &&
                        next.$$route.controller !== "AcademiaCoursesCtrl" &&
                        next.$$route.controller !== "AcademiaClassroomsCtrl") {
                        Intercom("shutdown");
                    }
                });
            }
        })
    }

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
                    $timeout.cancel()
                    displayinvite = true;
                }
            }, 13500, true);
        } else {
            $scope.setupIntercom();
        }
    } else {
        University.getUniversity(universityUrl).then(function(res) {
            $scope.university = res.data.data;
            University.storeLocal($scope.university);

            let universityId = $scope.university._id;

            Forum.getAllOwnerForumPost(universityId).then(function(res) {
                $scope.loaded = true;
                $scope.forumPosts = res.data.data.docs;
            });

            if (!$rootScope.logged) {
                $rootScope.accountSuggestion = $timeout(function() {
                    if (!displayinvite) {
                        $timeout.cancel()
                        displayinvite = true;
                    }
                }, 13500, true);
            } else {
                $scope.setupIntercom();
            }
        });
    }

    $scope.isAdmin = (id) => {
        let membersOfUniversity = $scope.university.members;
        return membersOfUniversity.filter(val => {
            return val.accountId == id && val.privilege == 99
        }).length == 0 ? false : true
    }

    $scope.textFilter = function(text) {
        if (text.indexOf("iframe") != -1) {
            return $sce.trustAsHtml(text)
        } else {
            return $filter('limitHtml')(text, 350, '...')
        }
    }
}])

.controller('AcademiaPlaylistsByIdCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'Playlist', 'Videos', '$localStorage', function($rootScope, $scope, $location, $route, University, Playlist, Videos, $localStorage) {
    let universityUrl = $route.current.params.academiaName;
    let playlistId = $route.current.params.playlistId;
    $scope.showButton = $localStorage.studentIsAdmin
        //set playlist id to localStorage
    $localStorage.createVideoPlaylistId = playlistId

    if (University.isStoredLocal(universityUrl)) {
        let universityStorage = University.retrieveStorage(universityUrl);
        $scope.university = universityStorage[universityUrl];
        Playlist.getPlaylistById(playlistId).success(function(res) {
            console.log(res);
            $scope.playlist = res.data;
        });
    } else {
        University.getUniversity(universityUrl).then(function(res) {
            $scope.university = res.data.data;
            University.storeLocal($scope.university);

            Playlist.getPlaylistById(playlistId).success(function(res) {
                $scope.playlist = res.data;
            });
        });
    }
}])

.controller('AcademiaPlaylistsCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'Playlist', '$localStorage', function($rootScope, $scope, $location, $route, University, Playlist, $localStorage) {
    let universityUrl = $route.current.params.academiaName;
    $scope.showButton = $localStorage.studentIsAdmin
    console.log("showButton: ", $scope.showButton)
    if (University.isStoredLocal(universityUrl)) {
        let universityStorage = University.retrieveStorage(universityUrl);
        $scope.university = universityStorage[universityUrl];

        Playlist.getAllPlaylistByUniversityId($scope.university._id).success(function(res) {
            console.log(res);
            $scope.playlists = res.data;
        });
    } else {
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

.controller('AcademiaForumCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'User', 'Students', '$timeout', 'ngDialog', 'jwtHelper', '$localStorage', '$cookies', function($rootScope, $scope, $location, $route, University, User, Students, $timeout, ngDialog, jwtHelper, $localStorage, $cookies) {
    let universityUrl = $route.current.params.academiaName;
    let displayinvite = false;

    let ownedUniversityId = $cookies.get("ownedUniversityId");
    console.log("university id: ", ownedUniversityId)

    //Set to localstorage for use in creating category
    $localStorage.universityUrl = universityUrl
    $localStorage.createPostCategoryId = null

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
                $scope.setupIntercom();
            }
        }).catch(function(e) {});
    } else {
        University.getUniversity(universityUrl).then(function(res) {
            $scope.university = res.data.data;
            University.storeLocal($scope.university);

            University.getUniversityForumPosts($scope.university._id, $scope.page).then(function(res) {
                let forumPostsRequested = res.data.data.docs;
                $scope.page = Number(res.data.data.page);
                $scope.pages = res.data.data.pages;
                $scope.forumPosts = $scope.forumPosts.concat(forumPostsRequested);
                $scope.loaded = true;

                if (!$rootScope.logged) {
                    if (!displayinvite) {
                        $rootScope.accountSuggestion = $timeout(function() {
                            $timeout.cancel()
                        }, 13500, true);
                    }
                } else {
                    $scope.setupIntercom();
                }
            }).catch(function(e) {
                console.log("forum post error request: ");
                console.log(e);
            });
        });
    }

    $scope.setupIntercom = () => {
        Students.getStudentById(User.getId()).then(res => {
            let student = res.data.data;
            $scope.showButton = $scope.isAdmin(student._id)
            if ($scope.isAdmin(student._id) === true) {
                Intercom("boot", {
                    app_id: "qq74p5y0",
                    email: student.email,
                    created_at: student.createdAt,
                    name: student.name,
                    user_id: student._id,
                    language: student.language,
                    imageUrl: student.imageUrl,
                    widget: {
                        activator: "#IntercomDefaultWidget"
                    }
                });

                $rootScope.$on("$routeChangeStart", function(event, next, current) {
                    if (next.$$route.controller !== "AcademiaForumCtrl" &&
                        next.$$route.controller !== "AcademiaTimelineCtrl" &&
                        next.$$route.controller !== "AcademiaForumCategoryAllCtrl" &&
                        next.$$route.controller !== "AcademiaForumPostCtrl" &&
                        next.$$route.controller !== "AcademiaPlaylistsCtrl" &&
                        next.$$route.controller !== "AcademiaCoursesCtrl" &&
                        next.$$route.controller !== "AcademiaClassroomsCtrl") {
                        Intercom("shutdown");
                    }
                });
            }
        })
    }

    $scope.isAdmin = (id) => {
        let membersOfUniversity = $scope.university.members;
        return membersOfUniversity.filter(val => {
            return val.accountId == id && val.privilege == 99
        }).length == 0 ? false : true
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

.controller('AcademiaForumCategoryByIdCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', '$timeout', 'Forum', '$localStorage', function($rootScope, $scope, $location, $route, University, $timeout, Forum, $localStorage) {
    let universityUrl = $route.current.params.academiaName;
    let categoryId = $route.current.params.categoryId;
    $localStorage.createPostCategoryId = categoryId

    $scope.showButton = $localStorage.studentIsAdmin
    $scope.universityUrl = universityUrl

    /* forum posts */
    $scope.forumPosts = [];
    $scope.page = 1;
    $scope.pages = 1;

    if ($location.search().page != undefined) {
        $scope.page = $location.search().page;
    }

    $scope.categoryId = categoryId;

    /* forum posts order */
    $scope.forumPostsOrder = "-createdAt";
    $scope.orderForumPosts = function(order) {
        $scope.forumPostsOrder = "-" + order;
    }

    /* get university informations */
    University.getUniversity(universityUrl).then(function(res) {
        let success = res.data.success;
        let university = res.data.data;

        if (success) {
            Forum.getCategoriesByUniversityId(university._id).success(function(resCategory) {
                if (resCategory.success) {
                    $scope.categories = resCategory.data;

                    for (let i = 0; i < $scope.categories.length; i++) {
                        if ($scope.categories[i]._id == $scope.categoryId) {
                            $scope.catHeader = $scope.categories[i].title
                        }
                    }
                }
            });

            $scope.university = university;
            Forum.getForumPostsByCategoryId(university._id, categoryId, $scope.page).success(function(res) {
                if (res.success) {
                    let forumPostsRequested = res.data.docs;
                    $scope.page = Number(res.data.page);
                    $scope.pages = res.data.pages;
                    $scope.forumPosts = $scope.forumPosts.concat(forumPostsRequested);
                }
            });
        } else {
            console.log("error while loading university");
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

.controller('AcademiaForumCategoryAllCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', '$timeout', 'Forum', '$localStorage', function($rootScope, $scope, $location, $route, University, $timeout, Forum, $localStorage) {
    let universityUrl = $route.current.params.academiaName;
    $scope.showButton = $localStorage.studentIsAdmin
        /* forum posts */
    $scope.forumPosts = [];

    /* get university informations */
    University.getUniversity(universityUrl).then(function(res) {
        let success = res.data.success;
        let university = res.data.data;

        if (success) {
            $scope.university = university;
            Forum.getCategoriesByUniversityId($scope.university._id).success(function(resCategory) {
                if (resCategory.success) {
                    $scope.categories = resCategory.data;
                }
            });
        } else {
            console.log("error while loading university");
        }
    });
    /* get all forum posts */
}])

.controller('AcademiaChatCtrl', ['$rootScope', '$scope', '$location', function($rootScope, $scope, $location) {

}])

.controller('AcademiaMenu', ['$rootScope', '$scope', '$location', '$route', 'University', function($rootScope, $scope, $location, $route, University) {
    let controllerActive = $route.current.$$route.controller;
    let universityUrl = $route.current.params.academiaName;

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
    } else {}
}])

.controller('AcademiaSmpCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'SocialMarketPlace', function($rootScope, $scope, $location, $route, University, SocialMarketPlace) {
    let universityUrl = $route.current.params.academiaName;

    University.getUniversity(universityUrl).then(function(res) {
        let university = res.data.data;

        $scope.university = university;
        SocialMarketPlace.getListingsByUniversity(university._id).then(function(res) {
            $scope.smpListings = res.data.data;
        });
    });
}])

.controller('AcademiaForumCategoryCreateCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'Forum', '$sce', '$localStorage', 'ngDialog', 'jwtHelper', 'Courses', function($rootScope, $scope, $location, $route, University, Forum, $sce, $localStorage, ngDialog, jwtHelper, Courses) {
    let universityUrl = $route.current.params.academiaName;
    let university;

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

    University.getUniversity(universityUrl).then(function(res) {
        $scope.university = res.data.data;
        university = res.data.data;
    });
    // END getUniversity

    $scope.privilege = {
        value: 0
    };

    $scope.createCategory = function() {
        let date = new Date().getTime().toString();

        let data = {
            title: $scope.title,
            description: $scope.description,
            privilegeMin: $scope.privilege.value,
            friendlyName: $scope.title + "channel",
            uniqueName: $scope.title + date + "general" // to make the unique name, used current time
        }

        Forum.createCategory(university._id, data).success(function(res) {
            if (res.success) {
                $location.path("/a/" + university.url + "/forum/category/id/" + res.data._id)
            }
        });
    }
}])

.controller('AcademiaForumPostCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'Forum', 'Courses', '$sce', '$localStorage', 'ngDialog', 'jwtHelper', '$timeout', function($rootScope, $scope, $location, $route, University, Forum, Courses, $sce, $localStorage, ngDialog, jwtHelper, $timeout) {
    let displayinvite = false;
    let universityUrl = $route.current.params.academiaName;
    let postId = $route.current.params.postId;
    let university;

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

    /* load information */
    University.getUniversity(universityUrl).then(function(res) {
        $scope.university = res.data.data;
        university = res.data.data;

        if (!$rootScope.logged) {
            if (!displayinvite) {
                $rootScope.accountSuggestion = $timeout(function() {
                    $timeout.cancel()
                    displayinvite = true;
                }, 13500, true);
            }
        }

        Forum.getForumPostById(postId, university._id).then(function(res) {
            let status = res.data.status;
            let data = res.data.data;
            let success = res.data.success;

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
        var data = { text: tinymce.activeEditor.getContent() };
        if ($localStorage.token != undefined || $localStorage.token != null) {
            Forum.postAnswerByForumPostId(postId, data).then(function(res) {
                let status = res.data.status;
                let data = res.data.data;
                let success = res.data.success;

                if (success) {
                    data.votesCount = 0;
                    data.createdAt = Math.round((new Date()).getTime() / 1000);
                    $scope.forumPost.answers.push(data);
                    tinymce.activeEditor.setContent("");
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
            let attachment = new Trix.Attachment({ content: embed });
            $rootScope.trix.insertAttachment(attachment);
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
            let attachment = new Trix.Attachment({ content: image });
            $rootScope.trix.insertAttachment(attachment);
            ngDialog.close();
        }
    }

    if (type == "video") {
        $scope.title = "Adicionar vídeo do YouTube";
        $scope.form.iconClass = "fab fa-youtube";
        $scope.form.placeholder = "YouTube Link";
        $scope.form.button = "Adicionar vídeo";

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

.controller('AcademiaForumPostCreateCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'ngDialog', 'Forum', 'Courses', '$localStorage', function($rootScope, $scope, $location, $route, University, ngDialog, Forum, Courses, $localStorage) {
    let universityUrl = $route.current.params.academiaName;
    let university;

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

    if ($location.search().categoryId != undefined) {
        $scope.categoryForum = { _id: $location.search().categoryId };
    } else {
        $scope.categoryForum = { _id: undefined };
    }


    //
    // If the admin accessed the create post page inside the category page
    //
    let categoryId = $localStorage.createPostCategoryId
    if (categoryId) {
        $scope.categoryForum._id = categoryId
    }

    University.getUniversity(universityUrl).then(function(res) {
        $scope.university = res.data.data;
        university = res.data.data;

        Forum.getCategoriesByUniversityId($scope.university._id).success(function(resCategory) {
            if (resCategory.success) {
                $scope.categories = resCategory.data;
            }
        });
    });

    // /* edit editor */
    // $scope.trixInitialize = function(e, editor) {
    //     var document = editor.getDocument()
    //     $rootScope.trix = editor;

    //     $(".block_tools").append('<button class="trix-icon yt" type="button" data-attribute="video" id="videoAppend"><i class="fab fa-youtube"></i></button>');
    //     $(".block_tools").append('<button class="trix-icon pic" type="button" data-attribute="pic" id="picAppend"><i class="glyphicon glyphicon-picture"></i></button>');
    //     $(".block_tools").append('<button class="trix-icon sound" type="button" data-attribute="sound" id="soundAppend"><i class="glyphicon glyphicon-picture"></i></button>');
    //     $("#soundAppend").click(function() {
    //         ngDialog.open({ template: 'partials/modals/forumpostoption.html', data: { type: "sound" }, controller: "AcademiaForumPostCreateOptionCtrl", className: 'ngdialog-theme-default' });
    //     });

    //     $("#picAppend").click(function() {
    //         ngDialog.open({ template: 'partials/modals/forumpostoption.html', data: { type: "pic" }, controller: "AcademiaForumPostCreateOptionCtrl", className: 'ngdialog-theme-default' });
    //     });

    //     $("#videoAppend").click(function() {
    //         ngDialog.open({ template: 'partials/modals/forumpostoption.html', data: { type: "video" }, controller: "AcademiaForumPostCreateOptionCtrl", className: 'ngdialog-theme-default' });
    //     });
    // }

    /* create forum post by id */
    $scope.premium = { value: "0" };
    $scope.createForumPost = function() {
        var data = {
            text: tinymce.activeEditor.getContent(),
            title: $scope.title,
            premium: $scope.premium.value,
            categoryId: $scope.categoryForum._id
        };

        let createPost = true;
        let errors = [];

        if (data.categoryId == undefined) {
            createPost = false;
            errors.push("Selecione a categoria do post.");
        }

        if (data.title == undefined || data.title.length == 0) {
            createPost = false;
            errors.push("Escreva um título para a postagem");
        }

        if (data.text == undefined || data.text.length == 0) {
            createPost = false;
            errors.push("Escreva um texto na postagem");
        }

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
                            tinymce.activeEditor.setContent("")
                            $location.path('/a/' + university.url + '/forum/post/id/' + data._id)
                            window.scrollTo(0, 0);
                        }
                    })
                }
            });
        } else {
            $scope.errors = errors;
        }
    };
}])

.controller('AcademiaForumPostUpdateCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'ngDialog', 'Forum', function($rootScope, $scope, $location, $route, University, ngDialog, Forum) {
    let universityUrl = $route.current.params.academiaName;
    let postId = $route.current.params.postId;
    let university;

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

    University.getUniversity(universityUrl).then(function(res) {
        $scope.university = res.data.data;
        university = res.data.data;

        Forum.getForumPostById(postId, university._id).then(function(res) {
            let status = res.data.status;
            let data = res.data.data;
            let success = res.data.success;
            $scope.forumPost = data;

            $scope.title = $scope.forumPost.title;
            $scope.text = $scope.forumPost.text;

            if ($scope.forumPost.premium == false) {
                $scope.premium = { value: 0 };
            } else if ($scope.forumPost.premium == true) {
                $scope.premium = { value: 1 };
            } else {}
        });
    });

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
                scope.student = res.data.data;
            });
        }
    }
}])

.directive('academiastatus', ['University', 'Students', '$localStorage', '$route', 'jwtHelper', 'ngDialog', function(University, Students, $localStorage, $route, jwtHelper, ngDialog) {
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
            scope.studentIsPremium = false;
            scope.userSubscribed = false;
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
            } else {}

            let studentId;
            if ($localStorage.token != undefined && $localStorage.token != null) {
                studentId = jwtHelper.decodeToken($localStorage.token)._id;
            }

            attr.$observe('university', function(value) {
                university = JSON.parse(value);

                // Handle Subscribe Functionality
                Students.getStudentById(studentId).then(function(res) {
                    let data = res.data.data;

                    // This variable will be used to check if a user / student
                    // has once been subscribed to a university or
                    // if the current university is included in user's universitiesSubscribed array
                    let unisub = false;

                    if (res.data.success == false) {
                        scope.userSubscribed = false;
                    } else {
                        for (let i = 0; i < data.universitiesSubscribed.length; i++) {
                            if (data.universitiesSubscribed[i].universityId == university._id && data.universitiesSubscribed[i].unsubscribed === false) {
                                scope.userSubscribed = true;
                            }

                            if (data.universitiesSubscribed[i].universityId == university._id && data.universitiesSubscribed[i].unsubscribed === true) {
                                scope.userSubscribed = false;
                            }

                            if (data.universitiesSubscribed[i].universityId == university._id) {
                                unisub = true;
                            }
                        }

                        // if unisub variable is false, it means that the current university is
                        // not a member of the students universitiesSubscribed array
                        // Means the button should display INSCREVER
                        if (!unisub) {
                            scope.userSubscribed = false;
                        }
                    }
                })

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
            });

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
        }
    }
}])

.directive('categorychat', ['University', 'Forum', '$localStorage', '$route', 'jwtHelper', 'ngDialog', '$location', 'Students', 'Courses', 'User', function(University, Forum, $localStorage, $route, jwtHelper, ngDialog, $location, Students, Courses, User) {
    return {
        restrict: 'EA',
        templateUrl: '../partials/academia/chat.html',
        replace: false,
        scope: true,
        link: (scope, element, attr) => {
            var MAX_LOAD_MESSAGE_COUNT = 120;
            var baseUrl = "https://educationalcommunity-uni.herokuapp.com";

            scope.channels = [];
            scope.messagingClient = null;
            scope.generalChannel = null;
            scope.selectedChannel = null;
            scope.members = [];
            scope.chattingNotification = '';
            scope.messages = [];
            scope.currentMember = null;
            scope.currentMember = null;
            scope.loading = true;
            scope.boxToggle = true;

            let categoryId = null;

            attr.$observe('category', function(value) {
                categoryId = value;
            })

            attr.$observe('university', function(value) {
                scope.university = JSON.parse(value);
                Forum.getCategoriesByUniversityId(scope.university._id).success(function(resCategory) {
                    if (resCategory.success) {
                        scope.categories = resCategory.data;

                        if (resCategory.data.length != 0) {
                            scope.curCategory = scope.categories[0];

                            for (let i = 0; i < scope.categories.length; i++) {
                                if (scope.categories[i]._id == categoryId) {
                                    scope.curCategory = scope.categories[i];
                                }
                            }


                            tinymce.init({
                                selector: 'textarea',
                                menuitem: 'textarea',
                                wordcound: 'count',
                                menubar: false,
                                branding: false,
                                wordcounts: false,
                                resize: false,
                                statusbar: false,
                                toolbar_location: 'bottom',
                                forced_root_block: false,
                                height: 100,
                                width: '100%',
                                relative_urls: false,
                                link_assume_external_targets: true,
                                default_link_target: "_blank",
                                extended_valid_elements: "a[href|target=_blank]",
                                readonly: scope.curCategory === undefined ? true : false,
                                placeholder: "Type here...",
                                plugins: [
                                    'autolink lists link image charmap print preview',
                                    'searchreplace visualblocks code fullscreen',
                                    'table paste code codesample emoticons'
                                ],
                                toolbar: 'bold italic underline strikethrough codesample link | bullist numlist outdent indent | emoticons',
                                tinydrive_token_provider: function(success, failure) {
                                    Courses.fileUploadUrl().success(function(msg) {
                                        success({ token: msg.token });
                                    })
                                },
                                setup: function(editor) {
                                    var fnc = editor.convertURL;
                                    editor.convertURL = convertURL_;

                                    function convertURL_(url, name, elm) {
                                        fnc.apply(this, arguments);
                                        var regex = new RegExp("(http:|https:)?\/\/");
                                        if (!regex.test(url)) {
                                            return url = "http://" + url
                                        }
                                        return url;
                                    }

                                    editor.on('init', function(e) {
                                        var fn = editor.windowManager.open;
                                        editor.windowManager.open = function(t, r) {
                                            if (t.title == 'Insert link') {
                                                var oldsubmit = t.onSubmit;
                                                t.onSubmit = function(e) {
                                                    if (!e.data.href.match(/(ftp|https?):\/\//i)) {
                                                        e.data.href = "http://" + e.data.href;
                                                    }
                                                    return oldsubmit(e);
                                                }
                                                fn.apply(this, [t, r]);
                                            } else {
                                                return fn(t, r);
                                            }
                                        }
                                    });
                                }
                            });

                            if ($localStorage.token != undefined && $localStorage.token != null) { // Check if logged in user
                                let stdId = jwtHelper.decodeToken($localStorage.token)._id;
                                scope.logged = true;

                                Students.getStudentById(stdId).then(res => {
                                    let url = '/university/chat_token/';
                                    scope.currentMember = res.data.data;
                                    University.getChatAccessToken(baseUrl + url).then((res) => {
                                        if (res.data.success == false) { // and device Id
                                            console.log("ERROR")
                                        } else {
                                            scope.chatCreate(res.data.token);
                                            console.log('here chat created', res.data.token);
                                        }
                                    }).catch(err => {
                                        alert("ERROR" + err)
                                    });
                                });
                            } else {
                                scope.logged = false;
                            }
                        }
                    }
                });
            })

            // select category channel
            scope.selectCategoryChannel = (category) => {
                scope.loading = true;
                scope.curCategory = category;
                scope.getCurrentCategoryChannel().then(() => { // Load current acive channels and define
                        scope.messagingClient.removeAllListeners();
                        scope.messagingClient.on('channelAdded', scope.getCurrentCategoryChannel); // events
                        scope.messagingClient.on('channelRemoved', scope.getCurrentCategoryChannel);
                        scope.messagingClient.on('tokenExpired', scope.updateToken); // recreate access token when expired
                    })
                    .catch((err) => {
                        // alert("The channel does not exist for this <" + scope.curCategory.title + "> category");
                        scope.messages = [];
                        scope.loading = false;
                        scope.$apply();
                    });
            }

            // create chat client
            scope.chatCreate = (token) => {
                Twilio.Chat.Client.create(token).then(client => {
                    scope.messagingClient = client;
                    scope.updateConnectedUI();
                    scope.getCurrentCategoryChannel().then(() => { // Load current active channels and define
                            scope.messagingClient.removeAllListeners();
                            scope.messagingClient.on('channelAdded', scope.getCurrentCategoryChannel); // events
                            scope.messagingClient.on('channelRemoved', scope.chatRemoved);
                            scope.messagingClient.on('tokenAboutToExpire', scope.updateToken); // recreate access token when expired
                        })
                        .catch((err) => {
                            // alert("The channel does not exist for this <" + scope.curCategory.title + "> category");
                            scope.loading = false;
                            scope.$apply();
                        });
                });
            }

            // the webhook for the update token
            scope.updateToken = () => {
                let url = '/university/chat_token/';
                University.getChatAccessToken(baseUrl + url).then((res) => {
                    if (res.data.success == false) { // and device Id
                    } else {
                        scope.messagingClient.updateToken(res.data.token);
                    }
                }).catch(err => {
                    alert("ERROR" + err)
                });
            }

            // the webhook for the chat removed
            scope.chatRemoved = () => {
                alert("idle channel deleted by the system")
            }

            // ui settings for the chat box
            scope.updateConnectedUI = () => {}

            // get current category channel
            scope.getCurrentCategoryChannel = () => {
                return new Promise((resolve, reject) => {
                    if (scope.messagingClient == null) {
                        alert('The channel is not initialized.');
                        reject(new Error('none_message_client'));
                    }

                    scope.messagingClient.getChannelBySid(scope.curCategory.channelSid).then(channel => {
                            scope.currentChannel = channel;
                            scope.joinAdminChannel().then(() => {
                                resolve();
                            });
                        })
                        .catch((err) => {
                            // alert("The channel does not exist for this <" + scope.curCategory.title + "> category");
                            scope.messages = [];
                            scope.loading = false;
                            scope.$apply();
                        });
                });
            }

            // join in to the admin channel (means join in to the current category channel)
            scope.joinAdminChannel = () => {
                return scope.setupChannel();
            }

            // setup the current category channel
            scope.setupChannel = () => {
                return new Promise((resolve, reject) => { // channel and define channel events
                    if (scope.currentChannel.status == 'joined') {
                        scope.currentChannel.removeAllListeners();
                        scope.initChannelEvents();
                        scope.loadAndSortMessages();
                        resolve();
                    } else {
                        if (scope.isAdmin(User.getId()) === true) {
                            scope.initChannel(scope.currentChannel).then((channel) => {
                                scope.currentChannel = channel;
                                scope.joinChannel(channel).then((_channel) => {
                                    scope.currentChannel = _channel;
                                    scope.initChannelEvents();
                                    resolve();
                                })
                            })
                        } else {
                            var r = confirm("You did not join this channel yet. Will join now?");
                            if (r == true) {
                                scope.initChannel(scope.currentChannel).then((channel) => {
                                    scope.currentChannel = channel;
                                    scope.joinChannel(channel).then((_channel) => {
                                        scope.currentChannel = _channel;
                                        scope.initChannelEvents();
                                        resolve();
                                    })
                                })
                            } else {
                                scope.loading = false;
                                scope.$apply();
                            }
                        }
                    }
                });
            }

            // is admin?
            scope.isAdmin = (id) => {
                let membersOfUniversity = scope.university.members;
                return membersOfUniversity.filter(val => {
                    return val.accountId == id && val.privilege == 99
                }).length == 0 ? false : true
            }

            // get channel by channel id
            scope.initChannel = channel => {
                return scope.messagingClient.getChannelBySid(channel.sid);
            }

            // get members of the channel
            scope.getChannelMembers = channelId => {
                let channel = scope.messagingClient.getChannelBySid(channelId);
            }

            // join into the specifiied channel
            scope.joinChannel = channel => {
                return channel.join()
                    .then(joinedChannel => {
                        console.log("joined");
                        scope.currentChannel = joinedChannel;
                        scope.loadAndSortMessages();
                        return joinedChannel;
                    })
                    .catch(err => {
                        if (channel.status == 'joined') {
                            scope.loadAndSortMessages();
                            return channel;
                        }
                        alert("Couldn't join channel " + channel.friendlyName + ' because -> ' + err);
                    });
            }

            // initalize channel event
            scope.initChannelEvents = () => { // Define channel events
                scope.currentChannel.on('messageAdded', scope.addMessage);
                scope.currentChannel.on('typingStarted', scope.showTypingStarted);
                scope.currentChannel.on('typingEnded', scope.hideTypingStarted);
                scope.currentChannel.on('memberJoined', scope.notifyMemberJoined);
                scope.currentChannel.on('memberLeft', scope.notifyMemberLeft);
            }

            // send message event
            scope.sendMSG = () => { // Send message
                scope.currentChannel.sendMessage(tinymce.activeEditor.getContent());
                tinymce.activeEditor.setContent("")
            }

            // Add messag to the message list
            scope.addMessage = message => {
                console.log("add message")
                let currentMember = '';
                let i;
                for (i = 0; i < scope.members.length; i++) {
                    if (scope.members[i].id == message.author) {
                        currentMember = scope.members[i].name;
                        break;
                    }
                }
                if (currentMember == '') {
                    Students.getStudentById(message.author).then((res) => {
                        scope.members.push({
                            id: message.author,
                            name: res.data.data.name,
                            imgUrl: res.data.data.imageUrl
                        });

                        scope.messages.push(message);
                        return;
                    })
                } else {
                    scope.messages.push(message);
                }
                scope.$apply();
                scope.scrollToMessageListBottom();
            }

            // add member to the member list
            scope.addMember = message => {
                let i;
                return new Promise((resolve, reject) => {
                    let currentMember = "";
                    for (i = 0; i < scope.members.length; i++) {
                        if (scope.members[i].id == message.author) {
                            currentMember = scope.members[i].name;
                            break;
                        }
                    }
                    if (currentMember == "") {
                        Students.getStudentById(message.author).then((res) => {
                            currentMember = res.data.success == true ? res.data.data.name : "Deactivated User"
                            scope.members.push({
                                id: message.author,
                                name: currentMember,
                                imgUrl: res.data.data.imageUrl
                            });
                            resolve();
                        });
                    } else {
                        resolve();
                    }
                })
            }

            // get name of channel member
            scope.getName = (id) => {
                let user = scope.members.filter(item => { return item.id === id; });
                return user[0].name;
            }

            // get image url of channel member
            scope.getImgUrl = (id) => {
                let user = scope.members.filter(item => { return item.id === id; });
                return user[0].imgUrl;
            }

            // get first capitals of the name
            scope.getFirstCapitals = (str) => {
                var matches = str.match(/\b(\w)/g);
                var acronym = matches.join(''); // JSON
                return acronym;
            }

            // convert hsl color to hex
            function hslToHex(h, s, l) {
                h /= 360;
                s /= 100;
                l /= 100;
                let r, g, b;
                if (s === 0) {
                    r = g = b = l; // achromatic
                } else {
                    const hue2rgb = (p, q, t) => {
                        if (t < 0) t += 1;
                        if (t > 1) t -= 1;
                        if (t < 1 / 6) return p + (q - p) * 6 * t;
                        if (t < 1 / 2) return q;
                        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                        return p;
                    };
                    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                    const p = 2 * l - q;
                    r = hue2rgb(p, q, h + 1 / 3);
                    g = hue2rgb(p, q, h);
                    b = hue2rgb(p, q, h - 1 / 3);
                }
                const toHex = x => {
                    const hex = Math.round(x * 255).toString(16);
                    return hex.length === 1 ? '0' + hex : hex;
                };
                return `${toHex(r)}${toHex(g)}${toHex(b)}`;
            }

            // get random color according to string of the name
            // use this func to get the avatar color of the user.
            scope.stringToHslColor = (str) => {
                var hash = 0;
                for (var i = 0; i < str.length; i++) {
                    hash = str.charCodeAt(i) + ((hash << 5) - hash);
                }

                var h = hash % 360;
                return str == "Deactivated User" ? "CCCCCC" : hslToHex(h, 90, 50);
            }

            // get display of the timestamp
            scope.getTimeDisplay = timestamp => {
                let h = timestamp.getHours();
                let m = timestamp.getMinutes();
                return `${h % 12 > 9 ? h % 12 : '0'+ h % 12} : ${m > 9 ? m : '0' + m} ${h > 12 ? 'PM' : 'AM'}`;
            }

            // load channel message to the message list
            scope.loadAndSortMessages = () => {
                let i;
                console.log('loading messages');
                scope.currentChannel.getMessages(MAX_LOAD_MESSAGE_COUNT).then(messages => {
                    let messageArr = messages.items;
                    let sortedMessageArr = messageArr.sort((msg1, msg2) => {
                        return msg1.timestamp > msg2.timestamp ? 1 : -1;
                    })
                    let promise = sortedMessageArr.reduce((accumulatorPromise, nextID) => {
                        return accumulatorPromise.then(() => {
                            return scope.addMember(nextID);
                        });
                    }, Promise.resolve());
                    promise.then(() => {
                        scope.messages = sortedMessageArr;
                        scope.loading = false;
                        scope.$apply();
                        scope.scrollToMessageListBottom();
                    });
                });
            }

            // set the scroll bar to the end of the message box.
            scope.scrollToMessageListBottom = function() {
                var messageListDom = document.getElementById('scrollbar');
                messageListDom.scrollBy(0, messageListDom.scrollHeight);
            }

            // 'enter' keyboard event to send the message to the channel
            scope.sendingInputKeyPress = $e => {
                if ($e.keyCode == 13) {
                    scope.sendMSG();
                    $e.preventDefault();
                }
            }

            // leave the specified channel
            scope.leaveCurrentChannel = () => {
                var r = confirm("Are you sure to leave the channel?");
                if (r == true) {
                    if (scope.currentChannel) {
                        return scope.currentChannel.leave().then(function(leftChannel) {
                            scope.messages = [];
                            scope.loading = false;
                            leftChannel.removeAllListeners();
                            scope.$apply();
                        });
                    } else {
                        return Promise.resolve();
                    }
                } else {}
            }

            // notification for the status - 'typing started'
            scope.showTypingStarted = member => {
                Students.getStudentById(member.identity).then((res) => {
                    scope.chattingNotification = res.data.data.name + ' is typing ...';
                });
            }

            scope.hideTypingStarted = member => {
                scope.chattingNotification = "";
            }

            // notification for the status - 'member joined to the channel'
            scope.notifyMemberJoined = member => {
                Students.getStudentById(member.identity).then((res) => {
                    scope.chattingNotification = res.data.data.name + ' joined the channel.';
                });
            }

            // notification for the status - 'member left from the channel'
            scope.notifyMemberLeft = member => {
                Students.getStudentById(member.identity).then((res) => {
                    scope.chattingNotification = res.data.data.name + ' left the channel.';
                });
            }

            scope.toggleBox = () => {
                scope.boxToggle = !scope.boxToggle;
            }
        }
    }
}])

.directive('academiarightcolumn', ['University', 'Forum', '$localStorage', '$route', 'jwtHelper', 'ngDialog', '$location', 'Students', function(University, Forum, $localStorage, $route, jwtHelper, ngDialog, $location, Students) {
    return {
        restrict: 'EA',
        templateUrl: '../partials/academia/rightcolumn.html',
        replace: false,
        scope: true,
        link: function(scope, element, attr) {
            let university;
            let studentId;
            $localStorage.studentIsAdmin = false
            if ($localStorage.token != undefined && $localStorage.token != null) {
                studentId = jwtHelper.decodeToken($localStorage.token)._id;
            }

            scope.studentIsPremium = false;
            scope.studentIsAdmin = false;
            scope.studentIsTeam = false;
            scope.showSubscribe = undefined;
            scope.hideButton = false;

            scope.userSubscribed = false;
            scope.chatDisplay = true;

            scope.categoryListOpen = true;

            scope.chatToggle = function() {
                if (scope.chatDisplay) {
                    scope.chatDisplay = false;
                } else {
                    scope.chatDisplay = true;
                }
            }

            attr.$observe('university', function(value) {
                university = JSON.parse(value);

                Forum.getCategoriesByUniversityId(university._id).success(function(resCategory) {
                    scope.categories = resCategory.data;
                })

                // Handle Subscribe Functionality
                Students.getStudentById(studentId).then(function(res) {
                        let data = res.data.data;

                        // This variable will be used to check if a user / student
                        // has once been subscribed to a university or
                        // if the current university is included in user's universitiesSubscribed array
                        let unisub = false;
                        scope.hideButton = true;

                        if (res.data.success == false) {
                            scope.userSubscribed = true;
                        } else {
                            for (let i = 0; i < data.universitiesSubscribed.length; i++) {
                                if (data.universitiesSubscribed[i].universityId == university._id && data.universitiesSubscribed[i].unsubscribed === false) {
                                    scope.userSubscribed = true;
                                }

                                if (data.universitiesSubscribed[i].universityId == university._id && data.universitiesSubscribed[i].unsubscribed === true) {
                                    scope.userSubscribed = false;
                                }

                                if (data.universitiesSubscribed[i].universityId == university._id) {
                                    unisub = true;
                                }
                            }

                            // if unisub variable is false, it means that the current university is
                            // not a member of the students universitiesSubscribed array
                            // Means the button should display INSCREVER
                            if (!unisub) {
                                scope.userSubscribed = false;
                            }
                        }
                    })
                    // End Handle Subscribe Functionality
                    /* REAL TIME MODULE */

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
                        $localStorage.studentIsAdmin = true
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
            });

            scope.gotoCategoryCreatPage = function() {
                let url = university.url
                $location.path("/a/" + url + "/forum/category/create")
            }

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
        }
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

            Forum.getForumPostsByCategoryId(universityid, category._id, 1).success(function(res) {
                if (res.success) {
                    let forumPostsRequested = res.data.docs;
                    scope.page = Number(res.data.page);
                    scope.pages = res.data.pages;
                    scope.posts = forumPostsRequested;
                    scope.total = res.data.total;
                    scope.docs = res.data.docs;
                }
            });
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

            Forum.getForumPostsByCategoryId(universityid, category._id, 1).success(function(res) {
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
                let status = res.status;
                if (status == 90010) {
                    $location.path('/home');
                } else {
                    scope.video = res.data;
                    let player = angular.element(element.find("video")[0]).get(0);
                    if (Hls.isSupported()) {
                        var hls = new Hls();
                        hls.loadSource(scope.video.file);
                        console.log("Video File", scope.video.file)
                        hls.attachMedia(player);
                    }
                    scope.video.file = $sce.trustAsResourceUrl(scope.video.file);
                }
            });
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
            scope.novotes = true;

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

            let latestStudentReadedTimestamps = studentReadedTimestamps.sort(function(a, b) { return b - a })[0];
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
                // var index = scope.$parent.forumPosts.findIndex(x => x._id === postId)

                University.upvoteForumPost(scope.$parent.university._id, postId).then(function(res) {
                    if (res.data.success) {
                        // let posts = scope.$parent.forumPosts;
                        // posts[index].votesCount += 1;
                        // scope.$parent.forumPosts = posts;
                        scope.post.votesCount = res.data.data.votesCount;
                    }
                });
            };

            /* down vote */
            scope.downvoteForumPost = function(postId) {
                University.downvoteForumPost(scope.university._id, postId).then(function(res) {
                    if (res.data.success) {
                        scope.post.votesCount = res.data.data.votesCount;
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
                scope.university = res.data;
            });
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
            let university = JSON.parse(attr.u);
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
            }
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

            Students.getStudentById(comment.accountId).then(function(res) {
                scope.student = res.data.data;
            })

            scope.voteComment = function(newsId) {
                News.voteCommentById(newsId, comment._id).success(function(res) {
                    if (res.success) {
                        if (res.vote) {
                            scope.commentsCount = scope.commentsCount - 1;
                        } else {
                            scope.commentsCount = scope.commentsCount + 1;
                        }
                    } else {}
                });
            }
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