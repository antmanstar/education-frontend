'use strict';

/* Controllers */
angular.module('netbase')

.controller('IniciarCtrl', ['$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', 'Courses', 'University', 'Playlist', 'Forum', 'User', '$window', function($rootScope, $scope, $location, $route, $localStorage, Students, ngDialog, Courses, University, Playlist, Forum, User, $window) {
    let url = $route.current;
    let originalPath = url.$$route.originalPath;
    $scope.originalPath = originalPath;

    $scope.login = function() {
        ngDialog.open({ template: 'partials/modals/login.html', controller: 'AccountCtrl', className: 'ngdialog-theme-default' });
    }

    $scope.signup = function() {
        ngDialog.open({ template: 'partials/modals/signup.html', controller: 'AccountCtrl', className: 'ngdialog-theme-default' });
    }
}])

.controller('SobreIndexCtrl', ['$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', 'Courses', 'University', 'Playlist', 'Forum', 'User', '$window', function($rootScope, $scope, $location, $route, $localStorage, Students, ngDialog, Courses, University, Playlist, Forum, User, $window) {
    let url = $route.current;
    let originalPath = url.$$route.originalPath;
    $scope.originalPath = originalPath;

}])

.controller('HomeCuratorshipForumPostCreate', ['$rootScope', '$scope', '$location', '$route', 'University', 'ngDialog', 'Forum', function($rootScope, $scope, $location, $route, University, ngDialog, Forum) {
    let studentId = jwtHelper.decodeToken($localStorage.token)._id;
    $scope.studentId = studentId;
    let universityUrl = studentId;

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
                        let success = res.data.success;
                        if (success) {
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

.controller('HomeCuratorshipById', ['$rootScope', '$scope', '$location', '$route', 'University', '$timeout', 'Forum', 'jwtHelper', '$localStorage', '$window', function($rootScope, $scope, $location, $route, University, $timeout, Forum, jwtHelper, $localStorage, $window) {
    let studentId = jwtHelper.decodeToken($localStorage.token)._id;
    $scope.studentId = studentId;
    let universityUrl = studentId;
    let categoryId = $route.current.params.id;

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
            $scope.university = university;
            Forum.getForumPostsByCategoryId(university._id, categoryId, $scope.page).success(function(res) {
                if (res.success) {
                    let forumPostsRequested = res.data.docs;
                    $scope.page = Number(res.data.page);
                    $scope.pages = res.data.pages;
                    $scope.forumPosts = $scope.forumPosts.concat(forumPostsRequested);
                }
            });
        } else {}
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

.controller('HomeCuratorship', ['$rootScope', '$scope', '$location', '$route', 'University', 'Classroom', 'Students', 'ngDialog', 'jwtHelper', '$localStorage', '$window', 'Forum', function($rootScope, $scope, $location, $route, University, Classroom, Students, ngDialog, jwtHelper, $localStorage, $window, Forum) {
    let studentId = jwtHelper.decodeToken($localStorage.token)._id;
    $scope.studentId = studentId;

    let universityUrl = studentId;
    let university;

    // GET ALL CURATORSHIP
    $scope.loading = true;

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
                    $scope.loading = false;
                }
            });
        } else {
            console.log("error while loading university");
        }
    });

    /* get all forum posts */
    //CREATE CATEGORY
    $scope.openDialog = function() {
        ngDialog.open({ template: 'partials/modals/curatorshipcreate.html', controller: 'HomeCuratorship', className: 'ngdialog-theme-default' });
    }

    // Button to add category
    $scope.privilege = {
        value: 0
    };

    $scope.createCategory = function() {
        let data = {
            title: $scope.title,
            description: $scope.description,
            privilegeMin: $scope.privilege.value
        }

        Forum.createCategory($scope.university._id, data).success(function(res) {
            if (res.success) {
                ngDialog.close();
                $location.path("/home/curadoria/id/" + res.data._id)
            }
        });
    }
}])

.controller('HomePersonalClassroom', ['$rootScope', '$scope', '$location', '$route', 'University', 'Classroom', 'Students', 'ngDialog', 'jwtHelper', '$localStorage', '$window', function($rootScope, $scope, $location, $route, University, Classroom, Students, ngDialog, jwtHelper, $localStorage, $window) {
    let studentId = jwtHelper.decodeToken($localStorage.token)._id;
    $scope.studentId = studentId;
    let universityUrl = studentId;
    $scope.administrator = [];
    $scope.participants = [];
    $scope.selectedOne = false;
    $scope.currentVideoRoom = null;
    $scope.wholeClassroomList = [];
    $scope.localParticipantUserName = "";
    $scope.showingParticipants = [];
    $scope.shareScreenCaption = "Share Screen";
    $scope.confirmDelete = false;

    var video = Twilio.Video;
    var localVideo = Twilio.createLocalTracks;
    $scope.classroomViewMode = false;

    var baseUrl = "https://educationalcommunity-classroom.herokuapp.com";
    var arr = $window.location.href.split("/");
    var domain = arr[0] + "//" + arr[2];

    University.getUniversity(universityUrl).then(function(res) {
        console.log('here university');
        console.log(res);
        $scope.university = res.data.data;
        $scope.getAllClassrooms();
    });

    angular.element($window).bind('resize', function() {
        $scope.videoSizeSet();
    });

    /****************** Mobile / Web **************************/
    $scope.isMobile = function() {
        var check = false;
        (function(a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
        $scope.classroomViewMode = check;
        return check;
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
        ngDialog.open({ controller: 'HomePersonalClassroom', template: 'partials/modals/classroom_modal.html', className: 'ngdialog-theme-default' });
    };

    $scope.confirmCreateClassroom = function() {
        let studentId;
        let token = $localStorage.token;
        let title = $scope.addingClassroom.uniqueName ? $scope.addingClassroom.uniqueName : '';
        let url = '/classroom/university/';

        if ($localStorage.token != undefined && $localStorage.token != null) {
            studentId = jwtHelper.decodeToken($localStorage.token)._id;
        }
        var i;
        var privilege = 0;

        for (i = 0; i < $scope.university.members.length; i++) {
            var member = $scope.university.members[i];
            if (studentId != undefined && member.accountId == studentId) {
                privilege = member.privilege;
                break;
            }
        }

        Classroom.createNewClassroom(baseUrl + url, title, privilege, $scope.university._id).then((data) => {
                let newClassroom = data.data;
                let url = '/classroom/university/' + $scope.university._id + '/all'
                Classroom.getAllClassroomsByUniversity(baseUrl + url).then((data) => {
                    $scope.wholeClassroomList = data;
                    let text = "/a/university/" + universityUrl + "/roomid/" + newClassroom.id + "/accountid/" + newClassroom.sid + "/roomname/" + $scope.addingClassroom.uniqueName + "/";
                    $route.reload();
                });
                ngDialog.close();
            })
            .catch((err) => {
                ngDialog.close();
                ngDialog.open({ template: 'partials/modals/classroom_alert_modal.html', controller: "AcademiaClassroomsAlertCtrl", className: 'ngdialog-theme-default classroom-alert-modal', data: { type: "ERROR", msg: err } });
            });
    }

    $scope.copyLink = function(classroom) {
        let text = domain + "/a/university/" + universityUrl + "/roomid/" + classroom.roomSID + "/accountid/" + classroom.accountSid + "/roomname/" + classroom.uniqueName + "/";
        Clipboard.copy(text);
        ngDialog.open({ template: 'partials/modals/classroom_alert_modal.html', controller: "AcademiaClassroomsAlertCtrl", className: 'ngdialog-theme-default classroom-alert-modal', data: { type: "Universidade", msg: 'Copied link to clipboard' } });
    }

    $scope.joinClassroom = function(classroom) {
        let text = domain + "/a/university/" + universityUrl + "/roomid/" + classroom.roomSID + "/accountid/" + classroom.accountSid + "/roomname/" + classroom.uniqueName + "/";
        window.open(text);
    }

    $scope.deleteClassroom = function(classroom) {
        $rootScope.deleteRoom = classroom;
        ngDialog.open({ template: 'partials/modals/classroom_confirm_delete_modal.html', controller: "HomePersonalClassroom", className: 'ngdialog-theme-default classroom-alert-modal' });
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

        privilege = 99;
        var roomId = $rootScope.deleteRoom.roomSID;
        Classroom.deleteClassroom(baseUrl + url, roomId, privilege).then((data) => {
                let url = '/classroom/university/' + $scope.university._id + '/all';
                Classroom.getAllClassroomsByUniversity(baseUrl + url).then((data) => {
                    ngDialog.close();
                    $scope.wholeClassroomList = data;
                    $route.reload();
                });
            })
            .catch((err) => {
                ngDialog.close();
                ngDialog.open({ template: 'partials/modals/classroom_alert_modal.html', controller: "AcademiaClassroomsAlertCtrl", className: 'ngdialog-theme-default classroom-alert-modal', data: { type: "ERROR", msg: err } });
            });
    }
    $scope.cancelDelete = function() {
        $scope.deleteRoom = null;
        ngDialog.close();
    }
}])

/* Courses */
.directive('footermobile', ['$route', function($route) {
    return {
        restrict: 'AE',
        templateUrl: '../partials/footer/footer.html',
        replace: false,
        scope: true,
        link: function(scope, element, attr) {
            let url = $route.current;
            let originalPath = url.$$route.originalPath;

            scope.originalPath = originalPath;
            scope.actionMenu = false;

            scope.actionMenuToggle = function() {
                if (scope.actionMenu) {
                    scope.actionMenu = false;
                } else {
                    scope.actionMenu = true;
                }
            }
        }
    }
}])

.controller('FooterCtrl', ['$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', 'Courses', 'University', 'Playlist', 'Forum', 'User', '$window', function($rootScope, $scope, $location, $route, $localStorage, Students, ngDialog, Courses, University, Playlist, Forum, User, $window) {
    let url = $route.current;
    let originalPath = url.$$route.originalPath;
    $scope.originalPath = originalPath;
}])

.controller('HomeExploreCtrl', ['$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', 'Courses', 'University', 'Playlist', 'Forum', 'User', '$window', 'Knowledge', function($rootScope, $scope, $location, $route, $localStorage, Students, ngDialog, Courses, University, Playlist, Forum, User, $window, Knowledge) {
    let id = $route.current.params.videoid;
    $scope.courseId = id;
    let url = $route.current;
    let originalPath = url.$$route.originalPath;
    $scope.originalPath = originalPath;
    $scope.universitiesKnowledgeDisplay = 'popular';

    Knowledge.getAllPaginated().success(function(res) {
        let data = res.data;
        let success = res.success;
        let docs = data.docs;

        $scope.knowledges = docs;
    });

    University.getUniversities().then(function(res) {
        $scope.universities = res.data.data;
    });

    Courses.getAll().success(function(res) {
        console.log("response courses: ")
        $scope.courses = res.data;
    });

    $scope.testarPlataforma = function() {
        $location.path("/iniciar")
    }

    $scope.construction = function() {
        alert("Em construção")
    }

    $scope.createCommunity = function() {
        $location.path('/onboarding/universities/create');
    }

    $scope.createVideocall = function() {
        $location.path('/home/calls');
    }

    $scope.downloadVRAndroid = function() {
        $window.open('https://play.google.com/store/apps/details?id=com.AnduraStudio.SalaDeAula', '_blank');
    }

    $scope.knowledgeValidate = function(id) {
        if ($scope.universitiesKnowledgeSelect == id) {
            return true
        } else {
            return false
        }
    }

    $scope.signup = function() {
        ngDialog.open({ template: 'partials/modals/signup.html', controller: 'AccountCtrl', className: 'ngdialog-theme-default' });
    }

    $scope.selectKnowledge = function(id) {
        $scope.universitiesKnowledgeSelect = id;
        if (id === 'popular') {
            // University.getUniversities().then(function(res) {
            //     $scope.universitiesKnowledgeDisplay = 'popular';
            //     $scope.universities = res.data.data;
            // });
            $scope.universitiesKnowledgeDisplay = 'popular';
        } else {
            Knowledge.getById(id).success(function(res) {
                let universitiesInKnowledge = res.data.universities;
                $scope.universitiesKnowledgeDisplay = 'category';
                $scope.universities = universitiesInKnowledge;
            });
        }
    }

    $scope.actionMenuDisplay = false;
    $scope.open = function() {
        if ($scope.actionMenuDisplay) {
            $scope.actionMenuDisplay = false;
        } else {
            $scope.actionMenuDisplay = true;
        }
    }

    /* LEARNING TAB */
    $scope.learningTabActive = 'paths';
}])

/* course module */
.controller('CoursesDashboardMenuCtrl', ['$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', 'Courses', 'University', 'Playlist', 'Forum', 'User', '$window', '$cookies', function($rootScope, $scope, $location, $route, $localStorage, Students, ngDialog, Courses, University, Playlist, Forum, User, $window, $cookies) {
    let id = $route.current.params.id;
    let userId = User.getId();
    let cookieId = "course_" + id + "_" + userId
    let cookieCheck = $cookies.getObject(cookieId);

    $scope.courseId = id;
    $rootScope.courseId = id;
    let url = $route.current;
    let originalPath = url.$$route.originalPath;

    $scope.originalPath = originalPath;

    $scope.estudar = function() {
        // set document type to localstorage
        if (cookieCheck) {
            let courseCookie = {
                "content_id": cookieCheck.content_id,
                "type": cookieCheck.type,
                "post_id": cookieCheck.post_id,
                "quizresult": false
            }

            $cookies.putObject(cookieId, courseCookie)
        }
        $localStorage.showInitiarCursoButton = true;
        $localStorage.showControlButton = false
        $localStorage.viewRequest = "estudar"
        $window.open('/cursos/id/' + id + '/estudar', "popup", "width=1500,height=700,left=100,top=150");
    }
}])

.controller('CoursesCreateContentCtrl', ['$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', 'Courses', function($rootScope, $scope, $location, $route, $localStorage, Students, ngDialog, Courses) {
    $scope.moduleId = $scope.ngDialogData.moduleId;
    $scope.universityId = $scope.ngDialogData.universityId;

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
}])

.controller('CoursesVideoForumContentCtrl', ['Videos', '$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', 'Courses', 'University', 'Playlist', 'Forum', 'User', '$cookies', function(Videos, $rootScope, $scope, $location, $route, $localStorage, Students, ngDialog, Courses, University, Playlist, Forum, User, $cookies) {
    $scope.page = $route.current.params.id;
    ngDialog.close();
    let universityId;

    let ownedUniversityId = $cookies.get("ownedUniversityId");
    $scope.universityid = $cookies.get("ownedUniversityId");
    $scope.ownedUniversityId = ownedUniversityId
    $scope.universityUrl = $localStorage.universityUrl

    $scope.universities = [];
    $scope.customPlaylist = [];
    $scope.cusloading = 0;

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

    $scope.loadForumPosts = function() {
        University.getallCategorybyUniversity().success(function(res) {
            if (res.success) {
                $scope.categories = res.data;
            } else {
                console.log("error while loading university")
            }
        });
    }

    $scope.loadForumPostCategory = function(uni_id, categoryId) {
        $scope.page = 'categoryforumposts';
        $scope.universityId = uni_id
        universityId = uni_id;
        Forum.getForumPostsByCategoryId(uni_id, categoryId, 1).success(function(resCategory) {
            if (resCategory.success) {
                $scope.categoryPosts = resCategory.data.docs;
            }
        });
    }

    if ($scope.page == 'post') {
        $scope.type = 'forumpost';
        $scope.loadForumPosts();
    }

    if ($scope.page == 'video') {
        //$scope.loadPlaylists();
        //if($scope.universities.length==$scope.cusloading)
    }

    $scope.savePlay = function(play) {
        $scope.page = 'checkout';
        $scope.contentType = 'video';
        $scope.play = play;

        Videos.getById(play._id).success(function(res) {
            let status = res.status;
            if (status == 90010) {
                $location.path('/home');
            } else {
                $scope.video = res.data;
                if ($scope.video != null && $scope.video != undefined) {
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
                        $("video").attr("src", $scope.video.file);
                    }

                    // FIX
                    setInterval(function() {
                        let player = $("video").get(0);

                        if (player != undefined) {
                            let percentComplete = player.currentTime / player.duration;

                            if (timeWatched < player.currentTime) {
                                timeWatched = player.currentTime;
                                let payload = { timeWatched: timeWatched };
                                Videos.progress(payload, videoId).success(function(res) {});
                            }
                        }
                    }, 10000);
                }
            }
        });

        // let mid = $route.current.params.id;
        // let formdata = {
        //     title: play.title,
        //     description: play.description,
        //     contentType: "video",
        //     text: "video",
        //     modelId: play._id,
        //     universityId: $scope.universityId,
        // }
        //
        // Courses.createContentModule(formdata).success(function (res) {
        //
        //     if (res.success) {
        //
        //         console.log(res);
        //         $location.path("/cursos/a/" + ownedUniversityId + "/suite/content")
        //
        //     } else {
        //
        //     }
        //
        // });

    }

    $scope.save = function() {
        let mid = $route.current.params.id;

        if (!$scope.title) {
            $scope.title = $scope.forumPost.title;
        }

        if (!$scope.description) {
            $scope.description = $scope.forumPost.description;
        }

        let formdata = {
            title: $scope.title,
            description: $scope.description,
            contentType: "",
            modelId: "$scope.url",
            universityId: $scope.universityId,
        }

        if ($scope.contentType == 'forumpost') {
            formdata.contentType = 'forumpost';
            formdata.modelId = $scope.forumPost._id
        }

        if ($scope.contentType == 'video') {
            formdata.contentType = 'video';
            formdata.modelId = $scope.play._id
        }

        Courses.createContentModule(formdata).success(function(res) {
            if (res.success) {
                $location.path("/cursos/a/" + ownedUniversityId + "/suite/content")
            } else {
                alert("error")
            }
        });
    }

    /* FORUM POST */
    //END loadForumPostCategory
    $scope.loadForumPost = function(forumpostId) {
        $scope.page = 'checkout';
        $scope.contentType = 'forumpost';

        Forum.getForumPostById(forumpostId, $scope.universityId).success(function(resForumPost) {
            if (resForumPost.success) {
                $scope.forumPost = resForumPost.data;
            }
        });
    }

    /* Video List */
    $scope.loadVideos = function(id) {
        $scope.videolist = [];
        $scope.page = "videolist";

        Videos.getByPlaylist(id).success(function(res) {
            $scope.videolist = res.data;
        });
    }

    /* PLAYLISTS */
    $scope.loadPlaylists = function(id) {
        Playlist.getAllPlaylistByUniversityId(id).success(function(res) {
            $scope.playlists = res.data;
            $scope.customPlaylist = $scope.customPlaylist.concat($scope.playlists);
            $scope.cusloading++;
        });
    }

    University.getUniversitiesByAdminMembers().success(function(res) {
        if (res.success) {
            $scope.universities = res.data;
            $scope.universities.forEach(function(u) {
                $scope.loadPlaylists(u._id);
            })
        }
    });
    /* END PLAYLISTS */
}])

.controller('editVideoForumContentCtrl', ['Videos', '$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', 'Courses', 'University', 'Playlist', 'Forum', 'User', '$cookies', function(Videos, $rootScope, $scope, $location, $route, $localStorage, Students, ngDialog, Courses, University, Playlist, Forum, User, $cookies) {
    let id = $route.current.params.id

    // Get university id from the cookies
    let universityId = $cookies.get("ownedUniversityId");
    $scope.universityid = universityId;

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

    Courses.getContentModuleById(id).success(function(msg) {
        $scope.content = msg.data;
        $scope.title = $scope.content.title;
        $scope.description = $scope.content.description;

        if ($scope.content.contentType == "forumpost") {
            $scope.loadForumPost($scope.content.modelId);
        }
        if ($scope.content.contentType == "video") {
            $scope.loadVideo($scope.content.modelId);
        }
    })

    $scope.save = function() {
        let mid = $scope.content.modelId;

        if (!$scope.title) {
            $scope.title = $scope.forumPost.title;
        }
        if (!$scope.description) {
            $scope.description = $scope.forumPost.description;
        }
        let formdata = {
            title: $scope.title,
            description: $scope.description,
        }

        Courses.updateQuiz(id, formdata).success(function(res) {
            if (res.success) {
                $location.path('/cursos/a/' + $scope.universityid + '/suite/content')
            } else {
                alert("error")
            }
        });
    }

    /* FORUM POST */
    $scope.loadForumPost = function(forumpostId) {
        $scope.page = 'checkout';
        $scope.contentType = 'forumpost';

        Forum.getForumPostById(forumpostId, $scope.universityId).success(function(resForumPost) {
            if (resForumPost.success) {
                $scope.forumPost = resForumPost.data;
            }
        });
    }

    $scope.loadVideo = function(videoid) {
        $scope.page = 'checkout';
        $scope.contentType = 'video';
        Videos.getById(videoid).success(function(res) {
            console.log(res);
            let status = res.status;
            if (status == 90010) {
                $location.path('/home');
            } else {
                $scope.video = res.data;
                if ($scope.video != null && $scope.video != undefined) {
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
                        $("video").attr("src", $scope.video.file);
                    }

                    setInterval(function() {
                        let player = $("video").get(0);
                        if (player != undefined) {
                            let percentComplete = player.currentTime / player.duration;
                            if (timeWatched < player.currentTime) {
                                timeWatched = player.currentTime;
                                let payload = { timeWatched: timeWatched };
                                Videos.progress(payload, videoId).success(function(res) {
                                    console.log("time viewed updated")
                                });
                            }
                        }
                    }, 10000);
                }
            }
        });
    }
}])

.controller('CoursesCreatePageCtrl', ['$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', 'Courses', function($rootScope, $scope, $location, $route, $localStorage, Students, ngDialog, Courses) {
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
}])

.controller('CoursesEstudarCtrl', ['$cookies', 'User', '$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', 'Courses', 'University', 'Playlist', 'Forum', 'User', '$window', function($cookies, User, $rootScope, $scope, $location, $route, $localStorage, Students, ngDialog, Courses, University, Playlist, Forum, Users, $window) {
    $localStorage.estudarModulos = [];
    $scope.showControlButton = $localStorage.showControlButton;

    let course = $scope.course;
    let id = $route.current.params.id;
    $scope.courseId = id;
    $scope.access = false;
    $scope.studying = false;

    // check if course id is already saved in cookies
    let userId = User.getId();
    $scope.cookieId = "course_" + id + "_" + userId
    let cookieCheck = $cookies.getObject($scope.cookieId)
    let module_id = ""
    let type = "";
    let cid = "";
    let post_id = "";
    let quizResult = false;
    var url = "/cursos/id/";

    // Get the last viewed
    let estudarModulos = $localStorage.estudarModulos;
    $scope.estudarModulos = estudarModulos;
    $scope.viewRequest = $localStorage.viewRequest;
    $scope.lastViewed = undefined // This variable will hold the module content info
    $scope.courseFinished = false;
    $scope.hasPrev = true;
    $scope.hasNext = true;

    Courses.getById(id).success(function(msg) {
        $scope.course = msg.data;
        if (msg.data.free == true) {
            $scope.access = true;
        }

        let mem = msg.data.members;

        if (mem.indexOf(User.getId()) >= 0) {
            console.log("user id indexOf greater than 0")
        }

        $scope.access = true;
        if ($scope.access == false) {
            $location.path('/cursos/id/' + res.data._id);
        }

        // Get the last module
        let len = $scope.course.module.length
        let lastModule = $scope.course.module[len - 1].moduleId._id
        $localStorage.lastModuleId = lastModule
    }, function error(response) {
        $location.path('/home/cursos');
    })

    // auto check if student finished the course
    $scope.$watch('estudarModulos', function(newValue, oldValue) {
        console.log("viewRequest: ", $scope.viewRequest)
            // Check if request to view content comes from Course contents menu
        if ($scope.viewRequest !== "course_menu") {
            if (newValue.length > 0) {
                $scope.courseFinished = viewedAll()
            }
        }
    }, true)

    if (cookieCheck) {
        module_id = cookieCheck.module_id;
        type = cookieCheck.type;
        cid = cookieCheck.content_id;
        post_id = cookieCheck.post_id;
        quizResult = cookieCheck.quizresult;
    }

    // what happens when the course module is not yet saved in the cookie?
    $scope.module_id = module_id;
    $scope.type = type;
    $scope.quizresult = quizResult;
    $scope.cid = cid;
    $scope.post_id = post_id;
    $scope.showInitiarCursoButton = $localStorage.showInitiarCursoButton;
    $scope.id = id;
    $scope.startStudyCourseId = $localStorage.startStudyButtonDisplay;

    // id parameter is either $scope.lastViewed.modelId
    $scope.startStudy = function(id) {
            $localStorage.showControlButton = true
            let estudarModulos = $localStorage.estudarModulos;

            // First check if user's first time visit
            let firstTime = firstTimeVisit()

            // Check if user already finished viewing the course
            let finishcourse = viewedAll()

            if (firstTime) {
                // if this is true return the first content of the first module
                // start of the course
                let firstContent = $scope.course.module[0].moduleId.content[0]
                let data = {
                    _id: firstContent.modelId,
                    module_id: $scope.course.module[0].moduleId._id
                }
                getContent(data)
            }

            if (finishcourse) {
                // if this is true, the student already finished viewing all the content
                // display a Congratulation message
                $scope.courseFinished = true
            } else {
                // this means that the student already viewed some module content
                // find and return the last content viewed
                for (let idx = 0; idx < estudarModulos.length; idx++) {
                    if (estudarModulos[idx].viewed) {
                        $scope.lastViewed = estudarModulos[idx];
                    }

                    if (idx == estudarModulos.length - 1) {
                        if ($scope.lastViewed) {
                            getContent($scope.lastViewed)
                        }
                    }
                }
            }
        }
        // End of startStudy function

    function firstTimeVisit() {
        let visited = true
        for (let idx = 0; idx < estudarModulos.length; idx++) {
            if (estudarModulos[idx].viewed) {
                visited = false
            }
        }
        return visited
    }

    function viewedAll() {
        let viewedall = true
        for (let idx = 0; idx < estudarModulos.length; idx++) {
            if (!estudarModulos[idx].viewed) {
                viewedall = false
            }
        }
        return viewedall
    }

    function getContent(c) {
        Courses.getContentModuleById(c._id).success(function(result) {
            if (result.success) {
                let content = result.data
                let courseCookie = {
                    "module_id": c.module_id,
                    "content_id": content._id,
                    "type": content.contentType,
                    "post_id": content.modelId,
                    "quizresult": false
                }
                $localStorage.showInitiarCursoButton = false;
                $localStorage.viewRequest = "course_menu"
                $cookies.putObject($scope.cookieId, courseCookie);

                // Update viewer
                Courses.updateViewers(c.module_id, content._id).then(function(res) {
                    $window.location.href = "/cursos/id/" + $scope.courseId + "/estudar";
                })
            }
        })
    }

    $scope.moveContent = function(direction) {
        // For navigating after viewing quiz result
        // check if quizresult is true
        // content_id is same as quiz content id
        // locate the content in estudarModulos
        // get module id
        if (cookieCheck.type == 'quiz' && quizResult == true) {
            for (let i = 0; i < $localStorage.estudarModulos.length; i++) {
                if ($localStorage.estudarModulos[i]._id == cid) {
                    module_id = $localStorage.estudarModulos[i].module_id
                }
            }
        }

        for (let idx = 0; idx < $localStorage.estudarModulos.length; idx++) {
            if (direction == "next") {
                if ($localStorage.estudarModulos[idx]._id == cid && $localStorage.estudarModulos[idx].module_id == module_id) {
                    if ($localStorage.lastModuleId == $localStorage.estudarModulos[idx].module_id) {
                        if (idx == $localStorage.estudarModulos.length - 1) {
                            $scope.hasNext = false
                            $scope.courseFinished = true
                        } else {
                            if ($localStorage.estudarModulos[idx + 1].module_id != $localStorage.lastModuleId) {
                                $scope.hasNext = false
                                $scope.courseFinished = true
                            } else {
                                $scope.nextContent = $localStorage.estudarModulos[idx + 1]
                                getContent($scope.nextContent)
                                break
                            }
                        }
                    } else {
                        console.log($localStorage.estudarModulos)
                        $scope.nextContent = $localStorage.estudarModulos[idx + 1]
                        getContent($scope.nextContent)
                        break
                    }
                }
            }

            if (direction == "prev") {
                if ($localStorage.estudarModulos[idx]._id == cid && $localStorage.estudarModulos[idx].module_id == module_id) {
                    if (idx == 0) {
                        $scope.hasPrev = false
                        $scope.navigationMessage = "This is the first content"
                        break
                    } else {
                        $scope.prevContent = $localStorage.estudarModulos[idx - 1]
                        console.log("prev content")
                        console.log($scope.prevContent)
                        getContent($scope.prevContent)
                        break
                    }
                }
            }
        }
    }
    $rootScope.$emit('childEmit', $scope.cid);
    if (type == "videos") {
        url = url + "watch/videos/"
    } else if (type == "document") {
        url = url + "view/document/"
    } else {
        url = url + "test/quiz/"
    }
    $scope.url = url + $scope.courseId + "/" + cid + "/" + post_id;
}])

.controller('CoursesEstudarTypeDocumentCtrl', ['Courses', '$rootScope', '$scope', '$location', '$route', 'University', 'Videos', '$sce', 'User', 'Forum', 'Students', 'ngDialog', '$localStorage', 'jwtHelper', function(Courses, $rootScope, $scope, $location, $route, University, Videos, $sce, User, Forum, Students, ngDialog, $localStorage, jwtHelper) {
    let id = $scope.id;
    $scope.courseId = id;
    $scope.access = false;
    Courses.getById(id).success(function(msg) {
            console.log(msg)
            $scope.course = msg.data;
            if (msg.data.free == true) $scope.access = true;
            let mem = msg.data.members;
            if (mem.indexOf(User.getId()) >= 0)
                $scope.access = true;
            if ($scope.access == false)
                $location.path('/cursos/id/' + res.data._id);
        }, function error(response) {
            $location.path('/home/cursos');
        })
        //let videoId = $route.current.params.videoid;
    let videoId = $scope.cid;
    //let post_id = $route.current.params.post_id;
    let post_id = $scope.post_id;
    let viewers = {};
    let logged = $rootScope.logged;

    Courses.getContentModuleById(videoId).success(function(res) {
        $scope.contentData = res.data;
        $scope.trustedContent = $sce.trustAsHtml($scope.contentData.text)
        Forum.getForumPostById(post_id, $scope.contentData.universityId).success(function(res) {
            let status = res.status;
            if (status == 90010) {} else {
                $scope.video = res.data;
                if ($scope.video != null && $scope.video != undefined) {
                    if ($scope.video.file.indexOf(".mp4") == -1 && $scope.video.file.indexOf(".wmv") == -1) {
                        const video = document.querySelector('video');
                        viewers = $scope.contentData.viewers;
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
                    }
                }
            }

            let payload = { timeWatched: timeWatched };
            Courses.progress(payload, videoId).success(function(res) {
                console.log("time viewed updated")
            });
        });
    });
}])

.controller('CoursesEstudarTypeForumCtrl', ['Courses', '$rootScope', '$scope', '$location', '$route', 'University', 'Videos', '$sce', 'User', 'Forum', 'Students', 'ngDialog', '$localStorage', 'jwtHelper', '$cookies', function(Courses, $rootScope, $scope, $location, $route, University, Videos, $sce, User, Forum, Students, ngDialog, $localStorage, jwtHelper, $cookies) {
    let id = $scope.id;
    let userId = User.getId()
    $scope.courseId = id;
    $scope.cookieId = "course_" + id + "_" + userId;
    $scope.access = false;

    Courses.getById(id).success(function(msg) {
        $scope.course = msg.data;
        if (msg.data.free == true) $scope.access = true;
        let mem = msg.data.members;
        if (mem.indexOf(userId) >= 0)
            $scope.access = true;
        if ($scope.access == false)
            $location.path('/cursos/id/' + res.data._id);
    }, function error(response) {
        $location.path('/home/cursos');
    });

    // CONTENT MODULE ID
    let contentModuleId = $scope.cid;

    //let post_id = $cookies.get("post_id");
    let cookieCheck = $cookies.getObject($scope.cookieId);
    let post_id = cookieCheck.post_id;

    let viewers = {};

    let logged = $rootScope.logged;
    let content_id = cookieCheck.content_id;

    Courses.userViewedContentInsideCourse($scope.courseId, $cookies.get("module_id"), content_id).success(function(res) {
        console.log("user viewed content inside course")
    })

    Courses.getContentModuleById(contentModuleId).success(function(res) {
        $scope.contentData = res.data;
        $scope.trustedContent = $sce.trustAsHtml($scope.contentData.description)

        Forum.getForumPostById(post_id, $scope.contentData.universityId).success(function(res) {
            $scope.forumPost = res.data;
            $scope.forumPost.text = $sce.trustAsHtml(res.data.text);
            /*
            Courses.progress(payload, videoId).success(function(res) {
              console.log("time viewed updated")
            });
            */
        });
    });
}])

.controller('CoursesEstudarTypeVideoCtrl', ['Courses', '$rootScope', '$scope', '$location', '$route', 'University', 'Videos', '$sce', 'User', 'Forum', 'Students', 'ngDialog', '$localStorage', 'jwtHelper', '$cookies', function(Courses, $rootScope, $scope, $location, $route, University, Videos, $sce, User, Forum, Students, ngDialog, $localStorage, jwtHelper, $cookies) {
    let id = $scope.id;
    $scope.courseId = id;
    let userId = User.getId()

    Courses.getById(id).success(function(msg) {
        $scope.course = msg.data;
        if (msg.data.free == true) $scope.access = true;
        let mem = msg.data.members;
        if (mem.indexOf(userId) >= 0)
            $scope.access = true;
        if ($scope.access == false)
            $location.path('/cursos/id/' + res.data._id);
    }, function error(response) {
        $location.path('/home/cursos');
    })

    let cookieCheck = $cookies.getObject("course_" + id + "_" + userId);
    let content_id = cookieCheck.content_id;
    Courses.userViewedContentInsideCourse($scope.courseId, $cookies.get("module_id"), content_id).success(function(res) {
        console.log("user viewed content inside course")
    })

    let videoId = cookieCheck.post_id;
    let post_id = $scope.post_id;

    // GET VIDEO
    let viewers = {};
    let logged = $rootScope.logged;

    Videos.getById(videoId).success(function(res) {
        let status = res.status;
        if (status == 90010) {
            $location.path('/home');
        } else {
            $scope.video = res.data;
            if ($scope.video != null && $scope.video != undefined) {
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

                setInterval(function() {
                    let player = $("video").get(0);
                    if (player != undefined) {
                        let percentComplete = player.currentTime / player.duration;
                        if (timeWatched < player.currentTime) {
                            timeWatched = player.currentTime;
                            let payload = { timeWatched: timeWatched };
                            Videos.progress(payload, videoId).success(function(res) {
                                console.log("time viewed updated")
                            });
                        }
                    }
                }, 10000);
            }
        }
    });
}])

.controller('CoursesQuizResultCtrl', ['Courses', '$rootScope', '$scope', '$location', '$route', 'University', 'Videos', '$sce', 'User', 'Forum', 'Students', 'ngDialog', '$localStorage', 'jwtHelper', '$cookies', function(Courses, $rootScope, $scope, $location, $route, University, Videos, $sce, User, Forum, Students, ngDialog, $localStorage, jwtHelper, $cookies) {
    let qrId = "qr_" + $route.current.params.id
    let quizResultCookie = $cookies.getObject(qrId)
    let qid = quizResultCookie._id;
    let rid = quizResultCookie.quiz_id;
    let uid = quizResultCookie.user;

    Courses.getquizResult(qid, uid, rid).success(function(msg) {
        if (msg.status == 1) {
            $scope.view = 1;
            $scope.first = msg.first;
            $scope.data = msg.data;
            $scope.correct = msg.first.resultsView.filter(x => (x.ans_status == "true"));
            $scope.cor = 0;
            if ($scope.correct) $scope.cor = $scope.correct.length;
        } else $scope.view = 0;
        $scope.showresultPreview = function() {
            ngDialog.open({
                template: 'partials/courses/quiz/quizPreview.html',
                controller: 'CoursesQuizResultViewCtrl',
                className: 'ngdialog-theme-default',
                data: { title: $scope.data.title, "questions": $scope.data.questions, result: $scope.first },
                closeByNavigation: true,
                width: '70%',

            });
        }
    }).error(function(msg) {
        console.log(msg)
    })
}])

.controller('CoursesQuizResultViewCtrl', ['Courses', '$rootScope', '$scope', '$location', '$route', 'University', 'Videos', '$sce', 'User', 'Forum', 'Students', 'ngDialog', '$localStorage', 'jwtHelper', function(Courses, $rootScope, $scope, $location, $route, University, Videos, $sce, User, Forum, Students, ngDialog, $localStorage, jwtHelper) {
    $scope.questions = $scope.ngDialogData.questions;
    $scope.result = $scope.ngDialogData.result;
    $scope.title = $scope.ngDialogData.title;
    $scope.indexQ = 0;
    $scope.question = {}

    $scope.showQuestion = function(index) {
        $scope.question = $scope.questions[index]
        $scope.res = $scope.result.resultsView.find(x => x.ques_id == $scope.question.qes_id)
        $scope.cor = 5;
        if ($scope.res.ans_status == "true") $scope.cor = $scope.res.ques_id;
    }

    $scope.showQuestion($scope.indexQ);
    $scope.showNext = function() {
        if (parseInt($scope.indexQ + 1) < $scope.questions.length) {
            $scope.indexQ++;
            $scope.showQuestion($scope.indexQ);
        }
    }

    $scope.showPrev = function() {
        if ($scope.indexQ > 0) {
            $scope.indexQ--;
            $scope.showQuestion($scope.indexQ);
        }
    }
}])

.controller('CoursesEstudarTypeQuizCtrl', ['Courses', '$rootScope', '$scope', '$location', '$route', 'University', 'Videos', '$sce', 'User', 'Forum', 'Students', 'ngDialog', '$localStorage', 'jwtHelper', '$cookies', '$window', function(Courses, $rootScope, $scope, $location, $route, University, Videos, $sce, User, Forum, Students, ngDialog, $localStorage, jwtHelper, $cookies, $window) {
    let id = $scope.id;
    $scope.courseId = id;
    $scope.access = false;

    let userId = User.getId();
    $scope.cookieId = "course_" + id + "_" + userId
    Courses.getById(id).success(function(msg) {
        $scope.course = msg.data;
        if (msg.data.free == true) $scope.access = true;
        let mem = msg.data.members;
        if (mem.indexOf(userId) >= 0)
            $scope.access = true;
        if ($scope.access == false)
            $location.path('/cursos/id/' + res.data._id);
    }, function error(response) {
        $location.path('/home/cursos');
    })

    let videoId = $scope.cid;
    let post_id = $scope.post_id;

    let viewers = {};

    let cookieCheck = $cookies.getObject($scope.cookieId)
    let contentId = cookieCheck.content_id;

    Courses.userViewedContentInsideCourse($scope.courseId, $cookies.get("content_id")).success(function(res) {
        console.log("user viewed content inside course")
    })

    let logged = $rootScope.logged;
    $scope.quesNo = 0;
    $scope.quesArr = [];
    $scope.quizResult = [];
    $scope.questionIndex = 1;
    $scope.finalquestion = false;

    Courses.getQuestionsByQuizId(videoId).success(function(res) {
        if (res.success) {
            $scope.contentData = res.data;
            $scope.quesArr = res.data.questions;
            $scope.question = $scope.quesArr[$scope.quesNo];
        }
    });

    $scope.clearSelectionColor = function() {
        document.getElementById('op1').style.backgroundColor = '';
        document.getElementById('op2').style.backgroundColor = '';
        document.getElementById('op3').style.backgroundColor = '';
        document.getElementById('op4').style.backgroundColor = '';
    }

    $scope.selectOption = function(optionNumber) {
        $scope.selectedOption = optionNumber;
        $scope.clearSelectionColor();
        let selection = document.getElementById('op' + optionNumber);
        selection.style.backgroundColor = '#a6e1f3';
    }

    $scope.saveQuizSubmit = function(descriptiveAnswer) {
        $scope.descriptiveAnswer = descriptiveAnswer;
        if (!$scope.selectedOption && !$scope.descriptiveAnswer) {
            alert("answer  your questions")
        } else {
            let data = {}
            if ($scope.question.title_type == 'mcq') {
                data = {
                    ques_id: $scope.question.qes_id,
                    answer: $scope.selectedOption
                }
            } else if ($scope.question.title_type == 'descriptive') {
                data = {
                    ques_id: $scope.question.qes_id,
                    answer: $scope.descriptiveAnswer
                }
            }
            $scope.quizResult[$scope.quesNo] = data
            let formData = {
                quiz_id: videoId,
                answers: $scope.quizResult
            }
            Courses.saveQuizResult(formData).success(function(msg) {
                let res = msg.data;

                // Do not redirect to other page, instead show the result on the current page "/estudar"
                //$location.path("/quiz-result/"+res._id+"/"+res.quiz_id+"/"+res.user)
                let cId = "course_" + id;
                let quizResCookie = "qr_" + id;
                let courseCookie = {
                    "content_id": cookieCheck.content_id,
                    "type": 'quiz',
                    "post_id": cookieCheck.post_id,
                    "quizresult": true
                }
                $localStorage.showInitiarCursoButton = false;
                $cookies.putObject($scope.cookieId, courseCookie);
                $cookies.putObject(quizResCookie, res);
                $window.location.href = "/cursos/id/" + id + "/estudar";
            }).error(function(msg) {
                alert("try again")
            })
        }
    }

    $scope.nextQues = function(des) {
        $scope.questionIndex = parseInt($scope.quesNo + 1)
        if ($scope.quesArr.length > $scope.questionIndex) {
            let data = {};

            if ($scope.question.title_type == 'mcq') {
                data = {
                    ques_id: $scope.question.qes_id,
                    answer: $scope.selectedOption
                }
            } else if ($scope.question.title_type == 'descriptive') {
                data = {
                    ques_id: $scope.question.qes_id,
                    answer: des
                }
            }

            $scope.quizResult[$scope.quesNo] = data;

            // clear color of all option
            $scope.clearSelectionColor();

            let openAgain = $scope.quizResult[$scope.questionIndex];
            if (openAgain) {
                $scope.selectedOption = openAgain.answer
                $scope.descriptiveAnswer = openAgain.answer
            } else {
                // uncheck from selected checkbox
                $scope.selectedOption = undefined;

                // reset descriptive answer
                $scope.descriptiveAnswer = undefined;
            }
            // increase question number

            $scope.quesNo++;
            if ($scope.quesArr.length == parseInt($scope.quesNo + 1))
                $scope.finalquestion = true
            else
                $scope.finalquestion = false;
            // reset question variable with next question in quesArr
            $scope.question = $scope.quesArr[$scope.quesNo];
        }
    }

    $scope.prevQues = function() {
        $scope.questionIndex = parseInt($scope.quesNo - 1)
        if ($scope.quesArr.length > $scope.questionIndex && $scope.questionIndex >= 0) {
            $scope.quesNo--;
            $scope.question = $scope.quesArr[$scope.quesNo];
            let data = $scope.quizResult[$scope.quesNo];

            if ($scope.question.title_type == 'mcq') {
                $scope.selectOption(data.answer)

            } else if ($scope.question.title_type == 'descriptive') {
                $scope.descriptiveAnswer = data.answer
            }

            $scope.quizResult[$scope.quesNo] = data

            // clear color of all option
            $scope.clearSelectionColor();
            // uncheck from selected checkbox
            //$scope.selectedOption = undefined;

            // reset descriptive answer
            //$scope.descriptiveAnswer = undefined;

            // increase question number
            $scope.finalquestion = false;

            // reset question variable with next question in quesArr
            //$scope.question = $scope.quesArr[$scope.quesNo];
        }
    }
}])

.controller('CoursesEstudarTypeVideoIdCtrl', ['$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', 'Courses', 'University', 'Playlist', 'Forum', 'User', function($rootScope, $scope, $location, $route, $localStorage, Students, ngDialog, Courses, University, Playlist, Forum, User) {
    let id = $route.current.params.id;
    let userId = User.getId()
    $scope.courseId = id;
    $scope.cookieId = "course_" + id + "_" + userId;
    $scope.access = false;

    Courses.getById(id).success(function(msg) {
        $scope.course = msg.data;
        if (msg.data.free == true) $scope.access = true;
        let mem = msg.data.members;
        if (mem.indexOf(userId) >= 0)
            $scope.access = true;
        if ($scope.access == false)
            $location.path('/cursos/id/' + res.data._id);
    }, function error(response) {
        $location.path('/home/cursos');
    })

    let cookieCheck = $cookies.getObject($scope.cookieId)
    let contentId = cookieCheck.content_id;
    Courses.userViewedContentInsideCourse($scope.courseId, content_id).success(function(res) {
        console.log("user viewed content inside course")
        console.log(res);
    })
}])

.controller('CoursesByIdDashboardModuloCtrl', ['$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', 'Courses', 'University', 'Playlist', 'Forum', 'User', function($rootScope, $scope, $location, $route, $localStorage, Students, ngDialog, Courses, University, Playlist, Forum, User) {
    let id = $route.current.params.id;
    $scope.courseId = id;
    $scope.access = false;
    Courses.getById(id).success(function(msg) {
        $scope.course = msg.data;
        if (msg.data.free == true) $scope.access = true;
        let mem = msg.data.members;
        //if (mem.indexOf(User.getId()) >= 0)
        let userid = User.getId()
        const userExists = msg.data.members.some(user => user.member = userid);
        if (userExists)
            $scope.access = true;
        if ($scope.access == false)
            $location.path('/cursos/id/' + msg.data._id);
    }, function error(response) {
        $location.path('/home/cursos');
    })
}])

.controller('CoursesEstudarCtrlCopy', ['$cookies', 'User', '$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', 'Courses', 'University', 'Playlist', 'Forum', 'User', function($cookies, User, $rootScope, $scope, $location, $route, $localStorage, Students, ngDialog, Courses, University, Playlist, Forum, Users) {
    let id = $route.current.params.id;

    $scope.courseId = id;
    $scope.access = false;

    let type = $cookies.get("type");
    let cid = $cookies.get("content_id");
    let post_id = $cookies.get("post_id");
    var url = "/cursos/id/";

    if (type == "videos")
        url = url + "watch/videos/"
    else if (type == "document")
        url = url + "view/document/"
    else
        url = url + "test/quiz/"

    $scope.url = url + $scope.courseId + "/" + cid + "/" + post_id

    Courses.getById(id).success(function(msg) {
        $scope.course = msg.data;
        if (msg.data.free == true) $scope.access = true;
        let mem = msg.data.members;
        //if (mem.indexOf(User.getId()) >= 0)
        let userid = User.getId()
        const userExists = msg.data.members.some(user => user.member = userid);
        if (userExists)
            $scope.access = true;
        if ($scope.access == false)
            $location.path('/cursos/id/' + msg.data._id);

    }, function error(response) {
        $location.path('/home/cursos');
    })
}])

.controller('CoursesByIdDashboardCtrl', ['$document', '$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', 'Courses', 'University', 'Playlist', 'Forum', 'User', function($document, $rootScope, $scope, $location, $route, $localStorage, Students, ngDialog, Courses, University, Playlist, Forum, User) {
    $localStorage.estudarModulos = [];
    $localStorage.showControlButton = false

    let id = $route.current.params.id;
    $scope.courseId = id;
    $scope.access = false;
    $scope.description = '';
    $scope.timelineError = false;
    $scope.timelineMessage = ""
    $scope.timelineNotification = false;

    $scope.timelines = [];
    $scope.course = {}
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

    Courses.getById(id).success(function(msg) {
        if (msg.data.free == true) $scope.access = true;
        let mem = msg.data.members;
        //if (mem.indexOf(User.getId()) >= 0)
        let userid = User.getId()
        const userExists = msg.data.members.some(user => user.member = userid);
        if (userExists)
            $scope.access = true;
        if ($scope.access == false)
            $location.path('/cursos/id/' + msg.data._id);
        $scope.course = msg.data;
        $scope.get();
    }, function error(response) {
        $location.path('/home/cursos');
    })

    $scope.get = function() {
        Courses.getTimeline($scope.courseId).success(function(res) {
            $scope.timelines = res.data;
        }).error(function(msg) {
            $scope.timelineError = true;
            $scope.timelineMessage = "TIMELINE_GET_ERROR";
            $scope.timelineNotification = true;
        })
    }

    $scope.save = function(dd) {
        if (dd.length < 9) {
            $scope.timelineError = true;
            $scope.timelineMessage = "ADD_TIMELINE_ERROR_LESS_CHARACTER";
            $scope.timelineNotification = true;
            return
        }

        Courses.insertTimeline($scope.courseId, { description: dd }).success(function(res) {
            $scope.timelines && $scope.timelines.unshift(res.data)
            $scope.description = '';

            $scope.timelineError = false;
            $scope.timelineMessage = "ADD_TIMELINE_MESSAGE_SUCCESS";
            $scope.timelineNotification = true;

        }).error(function(msg) {
            $scope.timelineError = true;
            $scope.timelineMessage = "ADD_TIMELINE_MESSAGE_ERROR";
            $scope.timelineNotification = true;
        })
    }
}])

.controller('CoursesContentCreateCtrl', ['Videos', '$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', 'Courses', 'University', 'Playlist', 'Forum', 'User', function(Videos, $rootScope, $scope, $location, $route, $localStorage, Students, ngDialog, Courses, University, Playlist, Forum, User) {
    $scope.page = 'universitySelect';
    let universityId;
}])

.controller('CoursesModulosByIdCtrl', ['$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', 'Courses', '$window', function($rootScope, $scope, $location, $route, $localStorage, Students, ngDialog, Courses, $window) {
    $scope.page = false;
    $scope.activeSection = "modulos";
    let moduleId = $route.current.params.id;
    let universityid = $route.current.params.universityid;
    $scope.universityid = universityid;
    $scope.save_module_success = false;

    $scope.back = function() {
        $window.history.back();
    }

    $scope.conteudocriar = function() {
        ngDialog.open({
            template: 'partials/courses/modals/createContent.html',
            controller: 'CoursesCreateContentCtrl',
            className: 'ngdialog-theme-default',
            closeByNavigation: true,
            width: '70%',
            data: {
                moduleId: moduleId,
                universityId: $scope.universityid
            }
        });
    }

    $scope.openDeletePopup = function() {
        ngDialog.open({
            template: 'deleteModulePopup',
            controller: 'CoursesModulosByIdCtrl',
            width: '50%',
            height: '40%',
            className: 'ngdialog-theme-default'
        });
    }

    $scope.deleteModule = function() {
        $scope.deleteLoading = true;

        Courses.deleteModuleById(moduleId).success(function(res) {
            if (res.success) {
                $scope.deleteLoading = false;
                ngDialog.close();
                $window.history.back();
            }
        });
    }

    $scope.closePopup = function() {
        ngDialog.close();
    }

    /* save order id */
    $scope.saveModule = function() {
        let neworder = [];
        for (let idx = 0; idx < $scope.module.content.length; idx++) {
            let content;
            if ($scope.module.content[idx].accountId == undefined) {
                content = { order: idx, modelId: $scope.module.content[idx].modelId };
            } else {
                content = { order: idx, modelId: $scope.module.content[idx]._id };
            }
            neworder.push(content);
        }

        let formdata = {
            corder: JSON.stringify(neworder)
        };

        Courses.updateModuleById(moduleId, formdata).success(function(res) {
            if (res.success) {
                $scope.save_module_success = true;
                $scope.modules = res.data;
            }
        });
    }

    $scope.dragControlListeners = {
        itemMoved: function(event) {
            console.log("item moved")
            console.log(event)
            $scope.module.content = event.dest.sortableScope.modelValue;
        },
        orderChanged: function(event) {
            console.log("order changed")
        },
        containment: '#board1',
        containerPositioning: 'relative'
    };

    $scope.dragControlListeners1 = {
        containment: '#board2',
        orderChanged: function(event) {
            console.log("order changed 2 ")
            console.log(event)
        },
        itemMoved: function(event) {
            console.log("item moved 2")
            console.log(event)
        },
        allowDuplicates: true,
        containerPositioning: 'relative'
    };

    Courses.getModuleById(moduleId).success(function(res) {
        if (res.success) {
            $scope.module = res.data;
            Courses.getContentModulesByAccount().success(function(res) {
                if (res.success) {
                    let mods = res.data;
                    $scope.modulesByAccount = mods;
                    // if ($scope.module.content.length > 0) {
                    //   for (let i=0; i < $scope.module.content.length; i++){
                    //     let content = $scope.module.content[i]
                    //     mods.filter( function(item){ return item._id==content.modelId})
                    //
                    //     if(i == $scope.module.content.length - 1) {
                    //       $scope.modulesByAccount = mods
                    //     }
                    //   }
                    // }
                }
            });
        }
    });
}])

.controller('CoursesModulosCtrl', ['$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', 'Courses', function($rootScope, $scope, $location, $route, $localStorage, Students, ngDialog, Courses) {
        let universityid = $route.current.params.universityid;
        $scope.universityid = universityid;

        $scope.page = false;
        $scope.activeSection = "modulos";

        Courses.getModulesByAccount().success(function(res) {
            if (res.success) {
                $scope.modules = res.data;
            }
        });

        $scope.updateModule = function(moduleData) {
            ngDialog.open({ template: 'partials/courses/modals/updateModule.html', data: { moduleData: moduleData }, controller: 'CoursesUpdateModuleCtrl', className: 'ngdialog-theme-default' });
        }

        $scope.openDeletePopup = function(moduleId) {
            ngDialog.open({
                template: 'deleteModulePopup',
                //controller: 'CoursesModulosByIdCtrl',
                controller: 'CoursesModulosCtrl',
                data: { moduleId: moduleId },
                width: '50%',
                height: '40%',
                className: 'ngdialog-theme-default'
            });
        }

        $scope.deleteModule = function() {
            let moduleId = $scope.ngDialogData.moduleId;
            $scope.deleteLoading = true;

            Courses.deleteModuleById(moduleId).success(function(res) {
                if (res.success) {
                    $scope.deleteLoading = false;
                    ngDialog.close();
                    // $location.path('/cursos/suite/modulos');
                    $route.reload();
                }
            });
        }
    }])
    .controller('CoursesModulosSingleCtrl', ['$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', 'Courses', 'Sales', function($rootScope, $scope, $location, $route, $localStorage, Students, ngDialog, Courses, Sales) {
        $scope.page = false;
        let universityid = $route.current.params.universityid;
        $scope.universityid = universityid;
        $scope.section = 'module';
        $scope.addmemberstatus = false;
        $scope.addmembermessage = "";
        $scope.addmembererr = false;
        $scope.hasMember = false;
        $scope.addstep = 1

        let id = $route.current.params.id;

        Courses.getById(id).success(function(res) {
            if (res.success) {
                $scope.course = res.data;

                // Check if the course is Free or Paid
                if ($scope.course.free) {
                    // The course is free, get member's details
                    if ($scope.course.members.length > 0) {
                        $scope.hasMember = true
                        let coursemembers = []
                        for (let i = 0; i < $scope.course.members.length; i++) {
                            let member = $scope.course.members[i]
                            let memberid = member.member

                            // Get member details
                            Students.getStudentById(memberid).success(function(res) {
                                if (res.success) {
                                    let memberdetails = res.data

                                    let fulldetails = {
                                        name: memberdetails.name,
                                        datejoined: member.date
                                    }

                                    coursemembers.push(fulldetails);
                                    $scope.members = coursemembers;
                                }
                            })
                        }
                    }
                } else {
                    // The course is paid, get members and sales details
                    if ($scope.course.salesss.length > 0) {
                        $scope.hasMember = true
                        prepareCourseMembers($scope.course)
                    }

                    // Get all the students from the Accounts microservice
                    // To be used for the select dropdown - Add member in the members tab
                    Students.getAllStudents().success(function(res) {
                        if (res.success) {
                            $scope.allstudents = res.data

                            // remove course members to the list of all students
                            for (let i = 0; i < $scope.course.members.length; i++) {
                                $scope.allstudents = $scope.allstudents.filter(function(obj) {
                                    return obj._id !== $scope.course.members[i].member;
                                });
                            }
                        }
                    })
                }
            }
        });

        // Search implementation for the add member dropdown select
        $scope.selected = '';
        $scope.state = closed;

        // This function is called whenever there is a change in
        // the input for the Searchable dropdown in Add Member
        $scope.change = function() {
            if ($scope.query.length == 0) {
                return $scope.state = "closed"
            }

            $scope.filtered = [];
            $scope.filtered = $scope.allstudents.filter(
                item => item.name.toLowerCase().includes($scope.query.toLowerCase())
            );
            console.log($scope.filtered)
            $scope.$watch('filtered', function(newValue, oldValue) {
                $scope.filtered = newValue
            }, true)
            return $scope.state = $scope.filtered.length > 0 ? 'opened' : 'closed';
        };

        $scope.select = function(item) {
            $scope.selected = item;
            $scope.query = item.name
            return $scope.state = closed;
        };

        // Open the add member confirmation modal
        $scope.openAddMemberPopup = function(student) {
            ngDialog.open({
                template: 'addMemberPopup',
                controller: 'CoursesModulosSingleCtrl',
                data: { student: student, course: $scope.course },
                width: '50%',
                height: '40%',
                className: 'ngdialog-theme-default'
            });
        }

        // This function is called for closing the add member confirmation modal
        $scope.closePopup = function() {
            ngDialog.close();
        }

        // Display add member confirmation
        $scope.confirmAddMember = function() {
            $scope.addstep = 2
        }

        //
        $scope.cancelAddMember = function() {
            clearAddMemberVars()
        }

        // This function is called to add a member to a paid course
        // To be used only by university admin
        $scope.addMember = function() {
            ngDialog.close();
            let student = $scope.selected;
            let course = $scope.course;

            let memberData = {
                course_id: course._id,
                memberId: student._id
            }

            updateAddMemberNotification(true, false, "ADD_MEMBER_SUCCESS");

            Courses.addForFree(course._id, memberData).success(function(res) {
                if (res.success) {
                    // Update the coursemembers array to include the newly added member
                    $scope.course = res.data
                    prepareCourseMembers(res.data)
                    updateAddMemberNotification(true, false, "ADD_MEMBER_SUCCESS")
                    clearAddMemberVars()

                } else {
                    updateAddMemberNotification(true, true, "ADD_MEMBER_FAILS")
                    clearAddMemberVars()
                }
            });
        }

        function prepareCourseMembers(course) {
            let coursemembers = []
            for (let i = 0; i < course.salesss.length; i++) {
                let sale = course.salesss[i]
                let memberid = sale.member
                let saleid = sale.sale

                // Get member details
                Students.getStudentById(memberid).success(function(res) {
                    if (res.success) {
                        let memberdetails = res.data

                        if (saleid) {
                            // Get Sale details
                            Sales.saleDetails(saleid).success(function(resp) {
                                if (resp.success) {
                                    let saledetails = resp.data[0];

                                    let fulldetails = {
                                        name: memberdetails.name,
                                        datejoined: saledetails.createdAt,
                                        amount: saledetails.paymentData.payment_method_details.card.brand,
                                        currency: saledetails.currency,
                                        note: "Paid user"
                                    }

                                    coursemembers.push(fulldetails);
                                    $scope.members = coursemembers;
                                }
                            })
                        } else {
                            let item = course.members
                            let freemember = course.members.filter(function(obj) {
                                return obj.member == memberid;
                            });
                            let fulldetails = {
                                name: memberdetails.name,
                                datejoined: freemember[0].date,
                                amount: null,
                                currency: null,
                                note: "Added for free"
                            }
                            coursemembers.push(fulldetails)
                            $scope.members = coursemembers
                        }
                    }
                })
            }
        }

        function updateAddMemberNotification(status, err, message) {
            $scope.addmemberstatus = status
            $scope.addmembererr = err
            $scope.addmembermessage = message
        }

        function clearAddMemberVars() {
            $scope.selected = '';
            $scope.query = '';
            $scope.state = closed;
            $scope.addstep = 1;
        }

        $scope.selectTab = function(type) {
            $scope.section = type;
            $scope.addmemberstatus = false;
            $scope.addmembermessage = "";
            $scope.addmembererr = false;
        }

        $scope.moduleCreate = function(id) {
            ngDialog.open({ template: 'partials/courses/modals/modulecreate.html', data: { id: id }, controller: 'CoursesModulosCriarCtrl', className: 'ngdialog-theme-default' });
        }

        $scope.addInstructors = function(universityId, courseId, members) {
            ngDialog.open({ template: 'partials/courses/modals/addInstructors.html', data: { universityId: universityId, courseId: courseId, members: members }, controller: 'CoursesAddInstructorsCtrl', className: 'ngdialog-theme-default' });
        }
    }])

.controller('CoursesContentModulosCtrl', ['$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', 'Courses', '$cookies', function($rootScope, $scope, $location, $route, $localStorage, Students, ngDialog, Courses, $cookies) {
    $scope.page = false;
    $scope.universityid = $cookies.get('ownedUniversityId')
    $scope.activeSection = "content";
    $scope.conteudocriar = function() {
        ngDialog.open({
            width: '70%',
            template: 'partials/courses/modals/createContent.html',
            controller: 'CoursesContentCreateCtrl',
            className: 'ngdialog-theme-default',
            data: { "universityId": "fdasdfa" }
        });
    }

    Courses.getContentModulesByAccount().success(function(res) {
        if (res.success) {
            $scope.modulesByAccount = res.data;
        }

    });
    //END Courses.getCoursesByAccount()
    $scope.updateContent = function(contentData) {
        console.log('content data', contentData);
        if (contentData.contentType == 'page') {
            $location.path("/cursos/suite/editPage/" + contentData._id)
        }
        if (contentData.contentType == 'quiz') {
            console.log('quiz');

            localStorage.setItem('updateQuizData', JSON.stringify(contentData));
            $location.path('/cursos/suite/updateQuiz/' + contentData._id);
        }
        if (contentData.contentType == 'forumpost') {
            console.log('forumpost');

            //localStorage.setItem('updateQuizData', JSON.stringify(contentData));
            $location.path('/cursos/suite/editForumpost/' + contentData._id);
        }
        if (contentData.contentType == 'video') {
            //localStorage.setItem('updateQuizData', JSON.stringify(contentData));
            $location.path('/cursos/suite/editForumpost/' + contentData._id);
        }
    }

    $scope.openDeletePopup = function(contentId) {
        $scope.contentId = contentId;

        ngDialog.open({
            template: 'deleteContentPopup',
            controller: 'CoursesContentModulosCtrl',
            data: { contentId: contentId },
            width: '50%',
            height: '40%',
            className: 'ngdialog-theme-default'
        });
    }

    $scope.deleteContent = function() {
        let contentId = $scope.ngDialogData.contentId;
        $scope.deleteLoading = true;
        Courses.deleteContentById(contentId).success(function(res) {
            if (res.success) {
                $scope.deleteLoading = false;
                ngDialog.close();
                $route.reload();
            }
        });
    }

    $scope.closePopup = function() {
        ngDialog.close();
    }
}])

.controller('CoursesOwnerCtrl', ['$rootScope', '$scope', '$location', '$route', '$localStorage', '$cookies', 'Students', 'ngDialog', 'Courses', function($rootScope, $scope, $location, $route, $localStorage, $cookies, Students, ngDialog, Courses) {
    let universityid = $route.current.params.universityid;
    $scope.universityid = universityid;

    // Set universityid to cookies for easy access
    // will be using this id for redirecting
    // newly created post, video, page and quiz to
    // /cursos/a/<ID>/suite/content
    $cookies.put("ownedUniversityId", universityid);
    $scope.page = false;
    $scope.activeSection = "owner";

    $scope.moduleCreate = function(id) {
        ngDialog.open({ template: 'partials/courses/modals/modulecreate.html', data: { id: id }, controller: 'CoursesModulosCriarCtrl', className: 'ngdialog-theme-default' });
    }

    $scope.addInstructors = function(universityId, courseId, members) {
        ngDialog.open({ template: 'partials/courses/modals/addInstructors.html', data: { universityId: universityId, courseId: courseId, members: members }, controller: 'CoursesAddInstructorsCtrl', className: 'ngdialog-theme-default' });
    }

    $scope.editCourse = function(courseData) {
        ngDialog.open({ template: 'partials/courses/modals/updateCourse.html', data: { courseData: courseData }, controller: 'CoursesUpdateCtrl', className: 'ngdialog-theme-default' });
    }

    $scope.openDeletePopup = function(courseId) {
        ngDialog.open({
            template: 'deleteCoursePopup',
            controller: 'CoursesOwnerCtrl',
            data: { courseId: courseId },
            width: '50%',
            height: '40%',
            className: 'ngdialog-theme-default'
        });
    }

    $scope.deleteCourse = function() {
        let courseId = $scope.ngDialogData.courseId
        $scope.deleteLoading = true;

        Courses.deleteCourseById(courseId).success(function(res) {
            if (res.success) {
                $scope.deleteLoading = false;
                ngDialog.close();
                $route.reload();
            }
        });
    }

    $scope.closePopup = function() {
        console.log('close');
        ngDialog.close();
    }

    $scope.coursesCreate = function() {
        ngDialog.open({ template: 'partials/courses/modals/coursecreate.html', controller: 'CoursesCriarCtrl', className: 'ngdialog-theme-default', data: { universityId: universityid }, closeByNavigation: true });
    }

    // GET COURSES BY UNIVERSITY
    Courses.getByUniversityId(universityid).success(function(res) {
        if (res.success) {
            console.log(res.data)
            $scope.courses = res.data;

        }
    });
}])

.controller('CoursesAddInstructorsCtrl', ['$rootScope', '$scope', '$location', '$route', '$localStorage', 'ngDialog', 'Courses', 'University', function($rootScope, $scope, $location, $route, $localStorage, ngDialog, Courses, University) {
    let universityId = $scope.ngDialogData.universityId;
    let courseId = $scope.ngDialogData.courseId;

    $scope.selectedMember = $scope.ngDialogData.members;
    if (!$scope.selectedMember) $scope.selectedMember = [];

    University.getUniversityById(universityId).success(function(res) {
        if (res.success) {
            $scope.university = res.data;
        }
    });

    $scope.pushMembers = function(mem, t) {
        let inn = $scope.selectedMember.indexOf(mem);

        if (inn < 0) {
            $scope.selectedMember.push(mem)

        } else {
            $scope.selectedMember.splice(inn, 1)
        }
    }

    $scope.save = function() {
        if ($scope.selectedMember != undefined && $scope.selectedMember.length > 0) {
            Courses.addInstructor(courseId, $scope.selectedMember).success(function(res) {
                if (res.success) {
                    ngDialog.close();
                }
            });
        }
    }
}])

.controller('CoursesUpdateCtrl', ['$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', 'Courses', 'Knowledge', function($rootScope, $scope, $location, $route, $localStorage, Students, ngDialog, Courses, Knowledge) {
    $scope.courseData = $scope.ngDialogData.courseData;
    $scope.title = $scope.courseData.title;
    $scope.selectedKnowledge = $scope.courseData.knowledgeId;

    $scope.hasError = false;
    $scope.createcourseerrmessage = ""

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

    if ($scope.courseData.free == false) {
        $scope.free = false;
        $scope.preco = $scope.courseData.price;
    } else {
        $scope.free = true;
    }

    $scope.description = $scope.courseData.description;

    Knowledge.getAllPaginated().success(function(res) {
        if (res.success) {
            $scope.knowledge = res.data.docs;
        }
    });

    $scope.updateCourse = function() {

        //form validation
        if ($scope.title == '') {
            $scope.hasError = true;
            $scope.createcourseerrmessage = "PLEASE_ENTER_COURSE_TITLE"
            return
        } else if ($scope.selectedKnowledge == '') {
            $scope.hasError = true;
            $scope.createcourseerrmessage = "PLEASE_SELECT_COURSE_KNOWLEDGE"
            return
        } else if ($scope.free == undefined) {
            $scope.hasError = true;
            $scope.createcourseerrmessage = "PLEASE_SELECT_COURSE_PAYMENT"
            return
        } else if ($scope.description == '') {
            $scope.hasError = true;
            $scope.createcourseerrmessage = "PLEASE_ENTER_COURSE_DESCRIPTION"
            return
        }

        let formdata = {
            title: $scope.title,
            description: $scope.description,
            knowledgeId: $scope.selectedKnowledge,
        };

        if ($scope.free == undefined) {
            error = true;
        } else {
            formdata.free = $scope.free;
        }

        if ($scope.free == false) {
            formdata.price = $scope.preco;
        }

        Courses.updateCourse($scope.courseData._id, formdata).success(function(res) {
            if (res.success == true) {
                ngDialog.close();
                $route.reload();
            }
        });
    }
}])

.controller('CoursesUpdateModuleCtrl', ['$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', 'Courses', function($rootScope, $scope, $location, $route, $localStorage, Students, ngDialog, Courses) {
    $scope.moduleData = $scope.ngDialogData.moduleData;
    $scope.title = $scope.moduleData.title;
    $scope.duration = $scope.moduleData.duration;
    $scope.goal = $scope.moduleData.goal;
    $scope.description = $scope.moduleData.description;

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

    $scope.updateModule = function() {
        let formData = {
            title: $scope.title,
            description: $scope.description,
            goal: $scope.goal,
            duration: $scope.duration
        }

        Courses.updateModule($scope.moduleData._id, formData).success(function(res) {
            if (res.success == true) {
                ngDialog.close();
                $route.reload();
            }
        });
    }
}])

.controller('CoursesEditPageCtrl', ['$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', 'Courses', function($rootScope, $scope, $location, $route, $localStorage, Students, ngDialog, Courses) {
    let id = $route.current.params.id;

    $scope.activeSection = "createPage";
    $scope.idd = '';
    Courses.getContentModuleById(id).success(function(res) {
        $scope.tinymceModel = res.data.text
        $scope.title = res.data.title;
        $scope.idd = res.data.moduleId;
        $scope.tinymceOptions = {
            file_picker_types: 'file image media',
            tinydrive_token_provider: function(success, failure) {
                Courses.fileUploadUrl().success(function(msg) {
                    success({ token: msg.token });
                })
            },
            tinydrive_google_drive_key: "carbisa-document-upload@carbisa.iam.gserviceaccount.com",
            tinydrive_google_drive_client_id: '102507978919142111240',
            plugins: 'print preview powerpaste casechange importcss tinydrive searchreplace autolink autosave save directionality advcode visualblocks visualchars fullscreen image link media mediaembed  codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists checklist wordcount tinymcespellchecker a11ychecker textpattern noneditable help formatpainter pageembed charmap mentions quickbars linkchecker emoticons advtable',
            toolbar: 'insertfile|undo redo | bold italic | alignleft aligncenter alignright | code|styleselect|outdent indent|link image'
        };
    }).error(function(msg) {
        alert("Error")
        $location.path("/home/cursos")
    })

    $scope.saveContent = function() {
        Courses.savePage({ text: $scope.tinymceModel, contentType: 'page', title: $scope.title }, id).
        success(function(res) {
            $location.path("/cursos/a/" + id + "/suite/content")
        }).error(function(er) {
            alert(er)
        })
    };
}])

.controller('CoursesCreatePageCtrl', ['$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', 'Courses', '$cookies', function($rootScope, $scope, $location, $route, $localStorage, Students, ngDialog, Courses, $cookies) {
    ngDialog.close();
    $scope.activeSection = "createPage";
    $scope.tinymceModel = 'Initial content';

    // Get university id from the cookies
    let universityId = $cookies.get("ownedUniversityId");
    $scope.universityid = universityId;

    $scope.saveContent = function() {
        Courses.createPage({ text: $scope.tinymceModel, contentType: 'page', title: $scope.title, moduleId: $route.current.params.id }).
        success(function(res) {
            console.log("create page response: ", JSON.stringify(res))
            $location.path("/cursos/a/" + $scope.universityid + "/suite/content")
                //$location.path("/cursos/suite/modulos/id/"+$route.current.params.id)
        }).error(function(er) {
            alert(er)
        })
    };

    $scope.tinymceOptions = {
        file_picker_types: 'file image media',
        tinydrive_token_provider: function(success, failure) {
            Courses.fileUploadUrl().success(function(msg) {


                    success({ token: msg.token });
                })
                // failure('Could not create a jwt token')
        },
        tinydrive_google_drive_key: "carbisa-document-upload@carbisa.iam.gserviceaccount.com",
        tinydrive_google_drive_client_id: '102507978919142111240',
        plugins: 'print preview powerpaste casechange importcss tinydrive searchreplace autolink autosave save directionality advcode visualblocks visualchars fullscreen image link media mediaembed  codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists checklist wordcount tinymcespellchecker a11ychecker textpattern noneditable help formatpainter pageembed charmap mentions quickbars linkchecker emoticons advtable',
        toolbar: 'insertfile|undo redo | bold italic | alignleft aligncenter alignright | code|styleselect|outdent indent|link image'
    };
}])

.controller('CoursesCreateQuizCtrl', ['$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', 'Courses', '$cookies', function($rootScope, $scope, $location, $route, $localStorage, Students, ngDialog, Courses, $cookies) {
    ngDialog.close();
    $scope.activeSection = "createQuiz";
    $scope.quesArr = [];
    $scope.quesNumber = 0;
    $scope.q = null;

    // Get university id from the cookies
    let universityId = $cookies.get("ownedUniversityId");
    $scope.universityid = universityId;

    let moduleId = $route.current.params.id;

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

    $scope.createQuiz = function() {
        if (($scope.quizDescription != undefined && $scope.quizDescription != '') && $scope.createQuizForm.$valid) {
            $scope.createQuizLoading = true;

            let data = {
                modleId: moduleId,
                title: $scope.quizTitle,
                contentType: 'quiz',
                description: $scope.quizDescription
            }

            Courses.createQuiz(data).success(function(res) {
                if (res.success) {
                    $scope.createQuizLoading = false;
                    $scope.addQuestions = true;
                    console.log('quiz id created', res.data._id);
                    $scope.contentId = res.data._id;
                }
            });
        }
    }

    $scope.selectType = function(type, index) {
        if (type == 'mcq') {

            $scope.q = {
                title: '',
                answer: '',
                title_type: '',
                ques_options: [
                    { title: '' },
                    { title: '' },
                    { title: '' },
                    { title: '' }
                ],
            }
        } else if (type == 'descriptive') {
            $scope.quesArr[index].ques_options[0].title = 'not_available'
            $scope.quesArr[index].ques_options[1].title = 'not_available'
            $scope.quesArr[index].ques_options[2].title = 'not_available'
            $scope.quesArr[index].ques_options[3].title = 'not_available'

            $scope.q = {
                title: '',
                answer: '',
                title_type: '',
            }
        }
    }

    // add new question one by one
    $scope.addNewQues = function() {
        $scope.showSelection = "true"

        if ($scope.quizForm.$valid) {
            $scope.quesNumber++;

            let q = {
                title: '',
                answer: '',
                title_type: 'mcq',
                ques_options: [
                    { title: '' },
                    { title: '' },
                    { title: '' },
                    { title: '' }
                ],
            }

            $scope.$evalAsync(function() {
                $scope.quesArr.push(q);
            })
        }
    }

    $scope.saveQuiz = function() {
        if ($scope.quizForm.$valid) {
            $scope.addQuesLoading = true;

            let quesData = {
                data: $scope.quesArr
            }

            Courses.addQuizQuestions($scope.contentId, quesData).success(function(res) {
                console.log('ques api res', res);

                if (res.success) {
                    $scope.addQuesLoading = false;
                    //$location.path('/cursos/suite/content');
                    $location.path('/cursos/a/' + $scope.universityid + '/suite/content');
                }
            });
        }
    }
}])

.controller('CoursesUpdateQuizCtrl', ['$sce', 'User', '$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', 'Courses', '$cookies', function($sce, User, $rootScope, $scope, $location, $route, $localStorage, Students, ngDialog, Courses, $cookies) {
    $scope.quizData = JSON.parse(localStorage.getItem('updateQuizData'));
    $scope.quizTitle = $scope.quizData.title;
    $scope.quizDescription = $scope.quizData.description;

    // Get university id from the cookies
    let universityId = $cookies.get("ownedUniversityId");
    $scope.universityid = universityId;

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

    $scope.updateQuiz = function() {

        if (($scope.quizDescription != undefined && $scope.quizDescription != '') && $scope.createQuizForm.$valid) {
            $scope.createQuizLoading = true;

            let data = {
                title: $scope.quizTitle,
                description: $scope.quizDescription
            }

            Courses.updateQuiz($scope.quizData._id, data).success(function(res) {
                if (res.success) {
                    $scope.createQuizLoading = false;
                    $scope.addQuestions = true;
                    console.log('quiz id created', res.data._id);

                    for (let i = 0; i < $scope.quizData.questions.length; i++) {
                        $scope.quizData.questions[i]['ques_options'] = $scope.quizData.questions[i]['qes_options'];
                        delete $scope.quizData.questions[i]['qes_options'];
                        $scope.quizData.questions[i].answer = $scope.quizData.answers[i].answer;
                    }

                    $scope.quesArr = $scope.quizData;
                }
            });
        }
    }


    $scope.selectType = function(type, index) {
        if (type == 'mcq') {

            $scope.q = {
                title: '',
                answer: '',
                title_type: '',
                ques_options: [
                    { title: '' },
                    { title: '' },
                    { title: '' },
                    { title: '' }
                ],
            }
        } else if (type == 'descriptive') {
            $scope.quesArr.questions[index].ques_options[0].title = 'not_available'
            $scope.quesArr.questions[index].ques_options[1].title = 'not_available'
            $scope.quesArr.questions[index].ques_options[2].title = 'not_available'
            $scope.quesArr.questions[index].ques_options[3].title = 'not_available'

            $scope.q = {
                title: '',
                answer: '',
                title_type: '',
            }
        }
    }

    // add new question one by one
    $scope.addNewQues = function() {
        $scope.showSelection = "true"

        if ($scope.quizForm.$valid) {
            $scope.quesNumber++;

            let q = {
                title: '',
                answer: '',
                title_type: 'mcq',
                ques_options: [
                    { title: '' },
                    { title: '' },
                    { title: '' },
                    { title: '' }
                ],
            }

            $scope.$evalAsync(function() {
                $scope.quesArr.questions.push(q);
            })
        }
    }

    $scope.saveQuiz = function() {
        if ($scope.quizForm.$valid) {
            $scope.addQuesLoading = true;

            let quesData = {
                data: $scope.quesArr.questions
            }

            Courses.addQuizQuestions($scope.quizData._id, quesData).success(function(res) {
                if (res.success) {
                    $scope.addQuesLoading = false;
                    $location.path('/cursos/suite/content');
                }
            });
        }
    }
}])

.controller('CoursesByIdCtrl', ['$sce', 'User', '$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', 'Courses', function($sce, User, $rootScope, $scope, $location, $route, $localStorage, Students, ngDialog, Courses) {
    $scope.page = false;
    let id = $route.current.params.id;
    $scope.activeSection = "comprados";
    $scope.useraccess = false;

    Courses.getById(id).success(function(res) {
        if (res.success) {
            $scope.course = res.data;
            //let mem = res.data.members;

            // if (mem.indexOf(User.getId()) >= 0) {
            //     $scope.useraccess = true;
            //     $sce.trustAsHtml($scope.course)
            // }

            // Check if the student / user id is in the members array
            // if its in the array, it means user has access to the course
            let userid = User.getId();
            const userExists = $scope.course.members.some(user => user.member = userid);
            if (userExists) {
                $scope.useraccess = true;
                $sce.trustAsHtml($scope.course)
            }
        }
    });

    let logged = $localStorage.logged;

    $scope.openFreeCourse = function() {

        // When the user has access, redirect to course timeline
        if ($scope.useraccess) {
            $location.path('/cursos/id/' + $scope.course._id + '/timeline')
        }

        if (logged) {

            // 1 - IF USER IS NOT REGISTERED ON MEMBERS, REGISTERED
            // 2 - then registered
            let userId = User.getId();
            let userRegistered = false;
            let members = $scope.course.members;

            for (let idx = 0; idx < members.length; idx++) {
                let member = members[idx];

                if (member.member == userId) {
                    userRegistered = true;
                }
            }
            console.log(userRegistered)

            if (userRegistered) {
                $location.path('/cursos/id/' + $scope.course._id + '/timeline')

            } else {
                let memberData = {
                    course_id: $scope.course._id,
                    memberId: userId
                }

                Courses.subscribeFree($scope.course._id, memberData).success(function(res) {
                    if (res.success) {
                        $location.path('/cursos/id/' + $scope.course._id + '/timeline');
                    }
                });
            }
        } else {
            ngDialog.open({ template: 'partials/modals/login.html', controller: 'AccountCtrl', className: 'ngdialog-theme-default' });
        }

        // CHECK IF USER IS LOGGED OR NOT
        // 1 - IF USER IS NOT REGISTERED ON MEMBERS, REGISTERED
        // 2 - OTHERWISE, REGISTER IT!
    }

    $scope.openPaymentDialog = function() {
        let plan = { amount: $scope.course.price, currency: $scope.course.currency, name: $scope.course.title };

        ngDialog.open({
            template: 'partials/courses/modals/payments.html',
            controller: 'CoursesPaymentsCtrl',
            className: 'ngdialog-theme-default',
            closeByDocument: false,
            closeByEscape: false,
            closeByNavigation: true,
            data: {
                plan: plan,
                course: $scope.course,
                accountId: $scope.course.accountId
            }
        });
    }
}])

.controller('CoursesPaymentsCtrl', ['$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', 'StripeElements', 'Payments', 'Courses', 'User', function($rootScope, $scope, $location, $route, $localStorage, Students, ngDialog, StripeElements, Payments, Courses, User) {
    /* FLOWS: -> addCard-> order */
    $scope.plan = $scope.ngDialogData.plan;
    $scope.course = $scope.ngDialogData.course;
    $scope.accountId = $scope.ngDialogData.accountId;
    $scope.flow = "order";
    $scope.page = "order"

    // if the student does not have entered a credit card / debit card
    // disable the Confirm button and display a notification
    // that the student needs to add card first before the course can
    // be accessed
    $scope.hasCard = false
    $scope.savedCard = null
    $scope.customer_id = null

    let userId;

    if ($localStorage.logged) {
        userId = User.getId();
    }

    $scope.loading = false;

    /* */
    $scope.initOrder = function() {
        Students.getCards(userId).success(function(res) {
            if (res.success) {
                $scope.cards = res.data;
                if ($scope.cards.sources.data.length > 0) {
                    $scope.hasCard = true
                    for (let i = 0; i < $scope.cards.sources.data.length; i++) {
                        let card = $scope.cards.sources.data[i]
                        if (card.id === $scope.cards.default_source) {
                            $scope.customer_id = card.customer
                            $scope.savedCard = card;

                        } else {
                            console.log("wrong check")
                        }
                    }
                }

            } else {}

        });
    }

    $scope.informationAction = function() {
        if ($scope.flow == "addCard") {
            //$scope.closeThisDialog();
            console.log("information action -> redirect to order")
                //$scope.flow = "order";
                //$scope.page = "order";

            // after the card was successfully added
            // perform course payment
            $scope.handleSubmit();
        }
    }

    if ($scope.flow == "order") {
        $scope.initOrder();
    }

    /* information */
    $scope.information = {
        title: "",
        text: ""
    };

    /* functions */
    $scope.goToPage = function(page, data) {
        $scope.errorMsg = null
        $scope.page = page;

        if (page = "order") {
            $scope.initOrder();
        }
    }

    /* plan amount */
    $scope.planAmount = function(amount) {
        amount = amount.toFixed(2);
        return amount;
    }

    /* ADD CARD */
    $scope.cardAdd = function() {

        // Update the scope.flow value from order -> addCard
        $scope.flow = "addCard"

        let additionalData = {
            name: $scope.cardName
        };

        if ($scope.validationError != undefined) {} else {
            $scope.loading = true;
            StripeElements.createToken(card, additionalData).then(function(result) {
                if (result.token) {
                    // Send card to API, then use routes below
                    let data = { source: result.token.id };
                    Students.postCards(userId, data).success(function(res) {
                        if (res.success) {
                            if ($scope.flow == "addCard") {
                                console.log("page is addcard")
                                $scope.customer_id = res.data.id;
                                $scope.information.title = "Card added";
                                $scope.information.text = "Your card was added with success on your account. You can start using right now.";
                                $scope.goToPage("information");
                            }
                            if ($scope.flow == "order") {
                                console.log("page is order")
                                $scope.goToPage("order");

                            }
                            $scope.loading = false;
                        } else {
                            console.log("postCard res.success is false")
                            $scope.validationError = res.err.message;
                        }
                    });
                    // end student post card

                } else {
                    // Otherwise, un-disable inputs.
                    //enableInputs();
                    $scope.validationError = result.error.message;
                    $scope.loading = false;
                    $scope.$apply();
                }
                $scope.loading = false;
            });
        }
    }

    /* STRIPE */
    var elements = StripeElements.elements()
    let style = {
        base: {
            lineHeight: '45px'
        }
    };

    var card = elements.create('card', { style: style });
    $scope.card = card;
    card.on('change', handleChange)
    $scope.form = {};

    function handleChange(e) {
        console.log("handle change")
        $scope.cardErrors = e.error ? e.error.message : ''

        if (e.error != undefined) {
            $scope.loading = false;
            $scope.validationError = e.error.message;
        } else {
            $scope.loading = false;
            $scope.validationError = undefined;
        }

    }

    // In
    $scope.handleSubmit = function() {
        console.log("handleSUbmit")
        $scope.loading = true;
        let additionalData = {
            name: $scope.cardName
        };

        console.log("customer id: ", $scope.customer_id)

        let data = {
            customer: $scope.customer_id,
            amount: $scope.plan.amount,
            currency: $scope.plan.currency,
            accountId: $scope.accountId
        }

        Payments.coursePayment(data).success(function(res) {
            if (res.success == false) {
                $scope.loading = false;
                $scope.errorMsg = res.error.message;

            } else if (res.success == true) {
                let paymentData = {
                    course_id: $scope.course._id,
                    memberId: $scope.accountId,
                    saleId: res.salesId
                }

                Courses.payment($scope.course._id, paymentData).success(function(paymentRes) {
                    $scope.loading = false;
                    $scope.successMsg = 'Payment Done Successfully';
                    $location.path('/cursos/id/' + $scope.course._id + '/timeline');

                });
                //END Courses.payment()
            }
        });
        //END Payments.coursePayment()

        //});
        //END StripeElements
        //}
    }
}])

.controller('CoursesSuiteIndexCtrl', ['$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', 'Courses', function($rootScope, $scope, $location, $route, $localStorage, Students, ngDialog, Courses) {
    $scope.page = false;
    $scope.activeSection = "comprados";

    Courses.getCoursesByAccount().success(function(res) {
        if (res.success) {}
    });
}])

.controller('CoursesModulosCriarCtrl', ['$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', 'Courses', function($rootScope, $scope, $location, $route, $localStorage, Students, ngDialog, Courses) {
    $scope.page = false;
    $scope.activeSection = "modulos";

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

    $scope.criar = function() {
        let error = false;

        let formdata = {
            title: $scope.title,
            duration: $scope.duration,
            description: $scope.description,
            goal: $scope.goal,
            course_id: $scope.ngDialogData.id
        };

        Courses.createModule(formdata).success(function(res) {
            let courseModule = res.data;

            if (res.success) {
                ngDialog.close();
                $route.reload()
            }
        });
    }
}])

.controller('CoursesCriarCtrl', ['$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', 'Courses', 'Knowledge', function($rootScope, $scope, $location, $route, $localStorage, Students, ngDialog, Courses, Knowledge) {
    $scope.universityId = $scope.ngDialogData.universityId;
    $scope.page = false;

    $scope.hasError = false;
    $scope.createcourseerrmessage = '';

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

    Knowledge.getAllPaginated().success(function(res) {
        if (res.success) {
            $scope.knowledge = res.data.docs;
        }
    });

    $scope.criar = function() {
        let error = false;

        //form validation
        if ($scope.title == undefined) {
            $scope.hasError = true;
            $scope.createcourseerrmessage = "PLEASE_ENTER_COURSE_TITLE"
            return
        } else if ($scope.selectedKnowledge == undefined) {
            $scope.hasError = true;
            $scope.createcourseerrmessage = "PLEASE_SELECT_COURSE_KNOWLEDGE"
            return
        } else if ($scope.free == undefined) {
            $scope.hasError = true;
            $scope.createcourseerrmessage = "PLEASE_SELECT_COURSE_PAYMENT"
            return
        } else if ($scope.description == undefined) {
            $scope.hasError = true;
            $scope.createcourseerrmessage = "PLEASE_ENTER_COURSE_DESCRIPTION"
            return
        }

        let formdata = {
            title: $scope.title,
            description: $scope.description,
            currency: $scope.currency,
            knowledgeId: $scope.selectedKnowledge,
            university: $scope.universityId
        };

        if ($scope.free == undefined) {
            $scope.hasError = true;
        } else {
            formdata.free = $scope.free;
        }

        if ($scope.free == false) {
            if ($scope.preco.length > 0) {
                formdata.price = $scope.preco;
            } else {
                console.log("price zero")
            }
        }

        Courses.create(formdata).success(function(res) {
            if (res.success) {
                ngDialog.close();
                $route.reload();
            }
        });
    }
}])

.controller('CoursesByIdManagementNavBarCtrl', ['$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', 'Payments', function($rootScope, $scope, $location, $route, $localStorage, Students, ngDialog, Payments) {
    $scope.page = false;
    let url = $route.current;
    let originalPath = url.$$route.originalPath;
    $scope.originalPath = originalPath;

    $scope.coursesCreate = function(universityId) {
        ngDialog.open({ template: 'partials/courses/modals/coursecreate.html', controller: 'CoursesCriarCtrl', className: 'ngdialog-theme-default', data: { universityId: universityId }, closeByNavigation: true });
    }
}])

.controller('CoursesNavBarCtrl', ['$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', 'Payments', '$cookies', function($rootScope, $scope, $location, $route, $localStorage, Students, ngDialog, Payments, $cookies) {
    $scope.page = false;
    let url = $route.current;
    let originalPath = url.$$route.originalPath;
    let universityid = $route.current.params.universityid;

    if (universityid) {
        $scope.universityid = universityid;
    } else {
        $scope.universityid = $cookies.get('ownedUniversityId');
    }

    $scope.originalPath = originalPath;

    $scope.coursesCreate = function(universityId) {
        ngDialog.open({
            template: 'partials/courses/modals/coursecreate.html',
            controller: 'CoursesCriarCtrl',
            className: 'ngdialog-theme-default',
            data: { universityId: universityId },
            closeByNavigation: true
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

.controller('StudentProExploreCtrl', ['$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', 'Payments', function($rootScope, $scope, $location, $route, $localStorage, Students, ngDialog, Payments) {
    $scope.step = "exhibition";
    $scope.subscribePro = function() {
        // Check if user has card registered
        let plan = { amount: "11988", currency: 'brl', name: "Estudante Pro" }
        if ($localStorage.token != undefined || $localStorage.token != null) {
            ngDialog.open({ template: 'partials/modals/payments.html', controller: 'PaymentsCtrl', className: 'ngdialog-theme-default', data: { flow: "order", page: "order", purchaseType: "proAnnual", plan: plan } });
        } else {
            ngDialog.open({ template: 'partials/modals/login.html', controller: 'AccountCtrl', className: 'ngdialog-theme-default' });
        }
    };

    $scope.timeToStudy = function() {
        ngDialog.close();
    }
}])

.controller('AccountSuggestionCtrl', ['$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', function($rootScope, $scope, $location, $route, $localStorage, Students, ngDialog) {
    let university = $scope.ngDialogData.university;
    $scope.university = university;

    $scope.create = function() {
        ngDialog.open({ template: 'partials/modals/signup.html', controller: 'AccountCtrl', className: 'ngdialog-theme-default' });
    }

    $scope.close = function() {
        ngDialog.close();
    }
}])

.controller('AccountCtrl', ['$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', '$timeout', function($rootScope, $scope, $location, $route, $localStorage, Students, ngDialog, $timeout) {
    let university;
    if ($scope.ngDialogData != undefined) {
        if ($scope.ngDialogData.university != undefined) {
            university = $scope.ngDialogData.university;
        }
    }

    $scope.university = university;

    $scope.createDialog = function() {
        ngDialog.close();
        ngDialog.open({ template: 'partials/modals/signup.html', controller: 'AccountCtrl', className: 'ngdialog-theme-default' });
    }

    $scope.close = function() {
        $timeout.cancel($rootScope.accountSuggestion);
        ngDialog.close();
    }

    // Redirect
    let redirectUrl;
    try {
        if ($scope.ngDialogData.redirectUrl != null) {
            redirectUrl = $scope.ngDialogData.redirectUrl;
            console.log(redirectUrl + '1111111');
        }
    } catch (e) {
        redirectUrl = "/home/timeline";
    }

    // Messages
    $scope.loginMessageBox = false;
    $scope.createMessageBox = false;
    $scope.resetPasswordSuccess = false;

    $scope.forgotPassword = function() {
        ngDialog.open({ template: 'partials/modals/resetone.html', className: 'ngdialog-theme-default', controller: 'AccountCtrl' });
    }

    $scope.resetPasswordStepOne = function() {
        let payload = { email: $scope.resetpasswordEmail, type: "student" }
        Students.resetPasswordStepOne(payload).success(function(res) {
            if (res.success) {
                $location.path('/reset/password?tokenOne=' + res.tokenOne + '&email=' + $scope.resetpasswordEmail);
                $scope.resetPasswordSuccess = true;

            }
        });
    }

    $scope.login = function() {
        let login = {
            email: $scope.loginEmail,
            password: $scope.loginPassword
        };

        validateCreateForms(login, "login").then(function(boolean) {
            Students.login(login).then(function(res) {
                let success = res.data.success;
                let token = res.data.token;

                if (success) {
                    $localStorage.token = token;
                    $localStorage.logged = true;
                    $rootScope.logged = true;

                    $rootScope.$applyAsync();
                    ngDialog.close();

                    if (redirectUrl.length > 0) {
                        $location.path(redirectUrl)
                    } else {
                        $route.reload();
                    }
                } else {
                    let statusCode = res.data.status;
                    if (statusCode == 5000) {
                        $scope.loginMessageBox = true;
                        $scope.loginMessage = "Email não existe.";
                    } else if (statusCode == 5001) {
                        $scope.loginMessageBox = true;
                        $scope.loginMessage = "Senha esta errada.";
                    } else {
                        $scope.loginMessageBox = false;
                    }
                }
            }).catch(function(e) {
                console.log(e);
            });
        }).catch(function(e) {
            if (e == "EMAILINVALIDATED") {
                console.log("invalid email")
                $scope.loginMessage = "Please, type a valid email.";
                $scope.loginMessageBox = true;
            } else if (e == "PASSWORDEMPTY") {
                $scope.loginMessage = "Please, type a password.";
                $scope.loginMessageBox = true;
            } else {
                $scope.loginMessage = "";
                $scope.loginMessageBox = false;
            }
        });
    };

    $scope.create = function() {
        let create = {
            email: $scope.createEmail,
            username: $scope.createUsername,
            password: $scope.createPassword,
            name: $scope.createName,
            passwordConfirm: $scope.createPasswordConfirm
        };

        validateCreateForms(create, "create").then(function(boolean) {
            Students.createAccount(create).then(function(res) {
                let success = res.data.success;
                let token = res.data.token;

                if (success) {
                    $localStorage.token = token;
                    $localStorage.logged = true;
                    $rootScope.logged = true;

                    $rootScope.$applyAsync();
                    if ($location.path().search("landing") == -1) {
                        $location.path('/onboarding/signup')
                        ngDialog.close();
                    } else {
                        ngDialog.close();
                    }

                    if (redirectUrl.length > 0) {
                        $location.path("/onboarding/signup")
                    } else {
                        $route.reload();
                    }
                } else {
                    let statusCode = res.data.status;
                    if (statusCode == 5002) {
                        $scope.createMessageBox = true;
                        $scope.createMessage = "Email já cadastrado.";
                    } else if (statusCode == 5003) {
                        $scope.createMessageBox = true;
                        $scope.createMessage = "xxx.";
                    } else {
                        $scope.createMessageBox = false;
                    }
                }
            }).catch(function(e) {
                console.log(e);
            });

        }).catch(function(e) {
            if (e == "EMAILINVALIDATED") {
                $scope.createMessage = "Por favor, escreva um email válido.";
                $scope.createMessageBox = true;
            } else if (e == "NAMEINVALIDATED") {
                $scope.createMessage = "Por favor, escreva um nome com mais de dois caracteres.";
                $scope.createMessageBox = true;
            } else if (e == "PASSWORDNOTMATCH") {
                $scope.createMessage = "As senhas precisam ser iguais. Digite novamente";
                $scope.createMessageBox = true;
            } else if (e == "PASSWORDLESSTHANSIX") {
                $scope.createMessage = "Por favor, a senha deve ter no mínimo 6 caracteres.";
                $scope.createMessageBox = true;
            } else {
                $scope.createMessage = "";
                $scope.createMessageBox = false;
            }
        });
    };

    function validateCreateForms(data, type) {
        let passwordValidated = false;
        let nameValidated = false;
        let emailValidated = false;

        // FIX THIS PATTERN, DONT ACCEPT @WELOVE.EDUCATION
        /* reg ex */
        let emailPattern = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
        return new Promise(function(resolve, reject) {
            let password = new String(data.password).valueOf();
            let passwordConfirm = new String(data.passwordConfirm).valueOf();

            if (type == "create") {
                if (password == passwordConfirm) {
                    passwordValidated = true;
                } else {
                    passwordValidated = false;
                    reject("PASSWORDNOTMATCH");
                }

                if (password.length > 5) {
                    passwordValidated = true;
                } else {
                    passwordValidated = true;
                    reject("PASSWORDLESSTHANSIX");
                }

                if (data.name != undefined) {
                    if (data.name.length > 2) {
                        nameValidated = true;
                    } else {
                        reject("NAMEINVALIDATED");
                    }
                }

                if (data.username != undefined) {
                    if (data.name.length > 1) {
                        nameValidated = true;
                    } else {
                        reject("USERNAMEINVALIDATED");
                    }
                }
            } else if (type == "login") {
                if (data.password != undefined) {
                    if (password.length > 0) {
                        passwordValidated = true;
                    } else {
                        reject("PASSWORDEMPTY");
                    }
                } else {
                    reject("PASSWORDEMPTY");
                }

            } else {
                console.log("error on validateCreateForms")
            }

            if (emailPattern.test(data.email)) {
                emailValidated = true;
            } else {
                reject("EMAILINVALIDATED");
            }

            if (type == "create") {
                if (nameValidated && emailValidated && passwordValidated) {
                    resolve(true);
                }
            } else {
                if (emailValidated && passwordValidated) {
                    resolve(true);
                }
            }
        });
    }
}])

/* home courses */
.controller('HomeCoursesCtrl', ['Knowledge', 'User', 'University', '$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', '$timeout', 'Courses', '$filter', function(Knowledge, User, University, $rootScope, $scope, $location, $route, $localStorage, Students, ngDialog, $timeout, Courses, $filter) {
    $scope.universities = 0;
    University.getUniversitiesByAdminMembers().success(function(res) {
        if (res.success) {
            $scope.universities = res.data.length;
        }
    });

    Courses.getAll().success(function(res) {
        $scope.courses = res.data;
    });

    Knowledge.getAllPaginated().success(function(res) {
        $scope.knowledge = res.data.docs;
    });

    $scope.textFilter = function(text) {
        return $filter('limitHtml')(text, 350, '...')
    }
}])

/* home - topic */
.controller('TopicMenuCtrl', ['$rootScope', '$scope', '$location', 'University', 'ngDialog', 'News', '$localStorage', 'Knowledge', function($rootScope, $scope, $location, University, ngDialog, News, $localStorage, Knowledge) {
    $scope.subscribe = function(knowledgeId) {
        Knowledge.subscribe(knowledgeId).success(function(res) {
            let success = res.success;
        });
    }
}])

.controller('HomeTopicCtrl', ['$rootScope', '$scope', '$location', 'University', 'ngDialog', 'News', '$localStorage', 'Knowledge', function($rootScope, $scope, $location, University, ngDialog, News, $localStorage, Knowledge) {
    Knowledge.getAllPaginated().success(function(res) {
        let data = res.data;
        let success = res.success;
        let docs = data.docs;

        $scope.knowledges = docs;
    });
}])

.controller('HomeTopicUrlCtrl', ['$rootScope', '$scope', '$location', 'University', 'ngDialog', 'News', '$localStorage', 'Forum', 'Knowledge', '$route', function($rootScope, $scope, $location, University, ngDialog, News, $localStorage, Forum, Knowledge, $route) {
    $scope.page = 1;
    $scope.pages = 1;
    let knowledgeUrl = $route.current.params.url;

    /* Load Knowledge */
    Knowledge.getByUrl(knowledgeUrl).success(function(res) {
        $scope.knowledge = res.data;
    });

    $scope.forumPosts = [];
    Knowledge.getAllPostsByUrlPaginated(knowledgeUrl).success(function(res) {
        $scope.forumPosts = res.data.docs;
        $scope.pages = res.data.pages;
    });

    $scope.busy = false;
    $scope.nextPage = function() {
        $scope.page = $scope.page + 1;
        $scope.busy = true;
        Knowledge.getAllPostsByUrlPaginated(knowledgeUrl).success(function(res) {
            let forumPosts = res.data.docs;
            $scope.forumPosts = $scope.forumPosts.concat(forumPosts);
            $scope.busy = false;
        });
    };
}])

.controller('HomeTopicUrlAcademiaCtrl', ['$rootScope', '$scope', '$location', 'University', 'ngDialog', 'News', '$localStorage', 'Forum', 'Knowledge', '$route', function($rootScope, $scope, $location, University, ngDialog, News, $localStorage, Forum, Knowledge, $route) {
    let knowledgeUrl = $route.current.params.url;

    /* Load Knowledge */
    Knowledge.getByUrl(knowledgeUrl).success(function(res) {
        $scope.knowledge = res.data;
    });
}])

.controller('HomeTopicUrlPostsCtrl', ['$rootScope', '$scope', '$location', 'University', 'ngDialog', 'News', '$localStorage', 'Forum', 'Knowledge', '$route', function($rootScope, $scope, $location, University, ngDialog, News, $localStorage, Forum, Knowledge, $route) {
    let knowledgeUrl = $route.current.params.url;
    $scope.forumPosts = [];
    $scope.page = 1;
    $scope.pages = 1;

    if ($location.search().page != undefined) {
        $scope.page = $location.search().page;
    }

    /* Load Knowledge */
    Knowledge.getByUrl(knowledgeUrl).success(function(res) {
        $scope.knowledge = res.data;
    });

    Knowledge.getAllPostsByUrlPaginated(knowledgeUrl, $scope.page).success(function(res) {
        let forumPostsRequested = res.data.docs;
        $scope.page = Number(res.data.page);
        $scope.pages = res.data.pages;
        $scope.forumPosts = res.data.docs;
    });

    $scope.range = function(min, max, step) {
        step = step || 1;
        var input = [];
        for (var i = min; i <= max; i += step) {
            input.push(i);
        }
        return input;
    };
}])

.controller('HomeTopicUrlCoursesCtrl', ['$rootScope', '$scope', '$location', 'University', 'ngDialog', 'News', '$localStorage', 'Forum', 'Knowledge', '$route', function($rootScope, $scope, $location, University, ngDialog, News, $localStorage, Forum, Knowledge, $route) {
    let knowledgeUrl = $route.current.params.url;

    /* Load Knowledge */
    Knowledge.getByUrl(knowledgeUrl).success(function(res) {
        $scope.knowledge = res.data;
    });

    Knowledge.getAllPostsByUrlPaginated(knowledgeUrl).success(function(res) {
        $scope.forumPosts = res.data.docs;
    });
}])

.controller('HomeTopicUrlOpiniaoCtrl', ['$rootScope', '$scope', '$location', 'University', 'ngDialog', 'News', '$localStorage', 'Forum', 'Knowledge', '$route', function($rootScope, $scope, $location, University, ngDialog, News, $localStorage, Forum, Knowledge, $route) {
    let knowledgeUrl = $route.current.params.url;

    /* Load Knowledge */
    Knowledge.getByUrl(knowledgeUrl).success(function(res) {
        $scope.knowledge = res.data;

        if ($scope.knowledge.sections.length > 0) {
            let sectionId = $scope.knowledge.sections[0].sectionId;
            News.getNewsBySection(sectionId).success(function(res) {
                $scope.news = res.data;
            });
        }
    });

    Knowledge.getAllPostsByUrlPaginated(knowledgeUrl).success(function(res) {
        $scope.forumPosts = res.data.docs;
    });
}])

/* home - noticias */
.controller('HomeNoticiasCtrl', ['$rootScope', '$scope', '$location', 'University', 'ngDialog', 'News', '$localStorage', function($rootScope, $scope, $location, University, ngDialog, News, $localStorage) {
    $scope.sectionTitle = "em alta";
    let section = "trend";

    News.getAllSections().success(function(res) {
        $scope.sections = res.data;
    });

    News.getAllTrends().success(function(res) {
        $scope.news = res.data;
    });

    $scope.newsLoadSection = function(id, title) {
        if (id == "trend") {
            News.getAllTrends().success(function(res) {
                $scope.sectionTitle = "em alta";
                $scope.news = res.data;
            });
        } else {
            News.getNewsBySection(id, title).success(function(res) {
                $scope.sectionTitle = "sobre " + title;
                $scope.news = res.data.docs;
            });
        }
    }

    $scope.vote = function(newsId, sectionId) {
        if ($localStorage.token != undefined || $localStorage.token != null) {
            News.vote(newsId).success(function(res) {
                let news = res.data;
                if (res.success) {
                    if (section == "trend") {
                        News.getAllTrends().success(function(res) {
                            $scope.news = res.data;
                        });
                    } else {
                        News.getNewsBySection(news.sectionId).success(function(res) {
                            $scope.news = res.data;
                        });
                    }
                } else {}
            });
        } else {
            ngDialog.open({ template: 'partials/modals/login.html', controller: 'AccountCtrl', className: 'ngdialog-theme-default' });
        }
    }

    $scope.newsOpen = function(id, news) {
        ngDialog.open({ template: 'partials/modals/news.html', controller: 'NewsByIdCtrl', className: 'ngdialog-theme-default modal-news', data: { news: news } });
    };
}])

.controller('NewsByIdCtrl', ['$rootScope', '$scope', '$location', 'University', 'ngDialog', 'News', '$localStorage', function($rootScope, $scope, $location, University, ngDialog, News, $localStorage) {
    let news = $scope.ngDialogData.news;
    $scope.news = news;

    $scope.vote = function() {
        if ($localStorage.token != undefined || $localStorage.token != null) {
            News.vote(news._id).success(function(res) {
                if (res.success) {
                    $scope.news = res.data;
                } else {}
            });
        } else {
            ngDialog.open({ template: 'partials/modals/login.html', controller: 'AccountCtrl', className: 'ngdialog-theme-default' });
        }
    }

    $scope.writeComment = function() {
        let data = { text: $scope.text };
        if ($localStorage.token != undefined || $localStorage.token != null) {
            if (data.text.length > 0) {
                News.writeComment(news._id, data).success(function(res) {
                    if (res.success) {
                        $scope.news = res.data;
                        $scope.text = "";
                    } else {}
                });
            }
        } else {
            ngDialog.open({ template: 'partials/modals/login.html', controller: 'AccountCtrl', className: 'ngdialog-theme-default' });
        }
    }
}])

/* home - universidades */
.controller('HomeUserUniversidadesCtrl', ['$rootScope', '$scope', '$location', 'University', 'Knowledge', 'User', function($rootScope, $scope, $location, University, Knowledge, User) {
    $scope.activeSection = 'seguindo';

    University.getUniversitiesByOwnerId(User.getId()).success(function(res) {
        if (res.success) {
            $scope.universitiesOwner = res.data;
        }
    });
}])

.directive('universityuserrow', ['University', 'Students', '$filter', '$sce', '$location', function(University, Students, $filter, $sce, $location) {
    return {
        restrict: 'E',
        templateUrl: '../../partials/directive/universityuserrow.html',
        replace: true,
        scope: true,
        link: function(scope, element, attr) {
            let universityId = attr.uid;

            scope.openUniversity = function(url) {
                $location.path('/a/' + url)
            }

            if (University.isStoredLocal(universityId)) {
                let universityStorage = University.retrieveStorage(universityId);
                scope.university = universityStorage[universityId];
            } else {
                University.getUniversityById(universityId).success(function(res) {
                    scope.university = res.data;
                    University.storeLocal(scope.university);
                });
            }
        }
    }
}])

.controller('HomeUniversidadesCtrl', ['$rootScope', '$scope', '$location', 'University', 'Knowledge', function($rootScope, $scope, $location, University, Knowledge) {
    Knowledge.getAllPaginated().success(function(res) {
        let success = res.success;
        let data = res.data;
        let docs = data.docs;
        $scope.knowledges = docs;

    });

    University.getUniversities().then(function(res) {
        $scope.universities = res.data.data;
    });
}])

.controller('HomeJobsCategoryCtrl', ['$rootScope', '$scope', '$location', 'ngDialog', function($rootScope, $scope, $location, ngDialog) {
    $scope.jobListingOpen = function() {
        ngDialog.open({ template: 'partials/jobmodal.html', className: 'ngdialog-theme-default jobmodal' });
    };
}])

/* reset */
.controller('ResetPasswordCtrl', ['$rootScope', '$scope', '$location', 'Students', function($rootScope, $scope, $location, Students) {
    let tokenOne = $location.search().tokenOne;
    let email = $location.search().email;
    let tokenTwo;
    $scope.flowSuccess = false;

    if (tokenOne != undefined && email != undefined) {
        let payload = { tokenOne: tokenOne, email: email, type: "student" };

        // Start Step 2
        Students.resetPasswordStepTwo(payload).success(function(res) {
            if (res.success) {
                tokenTwo = res.tokenTwo;
            }
        })
    } else {}

    $scope.stepThree = function() {
        let payload = {
            newpassword: $scope.password,
            tokenTwo: tokenTwo,
            type: "student"
        };

        // Start Step 2
        Students.resetPasswordStepThree(payload).success(function(res) {
            if (res.success) {
                $scope.flowSuccess = true;
            } else {}
        });
    }
}])

.controller('ResetPasswordNewCtrl', ['$rootScope', '$scope', '$location', function($rootScope, $scope, $location) {

}])

/* academia */
.controller('AcademiaCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', function($rootScope, $scope, $location, $route, University) {
    let universityUrl = $route.current.params.academiaName;
    University.getUniversity(universityUrl).then(function(res) {
        $scope.university = res.data.data;
    });
    $location.path("/a/" + universityUrl + "/forum");
}])

.controller('AcademiaChatCtrl', ['$rootScope', '$scope', '$location', function($rootScope, $scope, $location) {

}])

.controller('AcademiaMenu', ['$rootScope', '$scope', '$location', '$route', 'University', function($rootScope, $scope, $location, $route, University) {
    let controllerActive = $route.current.$$route.controller;
    let universityUrl = $route.current.params.academiaName;
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
    } else {}

    // Finish
    $scope.subscribe = function() {
        University.subscribeOnUniversity().then(function(res) {});
    };
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

.controller('AcademiaJobsCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'ngDialog', function($rootScope, $scope, $location, $route, University, ngDialog) {
    let universityUrl = $route.current.params.academiaName;
    University.getUniversity(universityUrl).then(function(res) {
        $scope.university = res.data.data;

    });

    $scope.clickToOpen = function() {
        ngDialog.open({ template: 'partials/jobmodal.html', className: 'ngdialog-theme-default jobmodal' });
    };
}])

.controller('AcademiaStatusCtrl', ['$rootScope', '$scope', '$route', 'University', '$location', 'jwtHelper', '$localStorage', function($rootScope, $scope, $route, University, $location, jwtHelper, $localStorage) {
    let universityUrl = $route.current.params.academiaName;
    var studentId;

    if ($localStorage.token != undefined && $localStorage.token != null) {
        studentId = jwtHelper.decodeToken($localStorage.token)._id;
    }

    let university;

    /* load information */
    University.getUniversity(universityUrl).then(function(res) {
        university = res.data.data;
        $scope.university = res.data.data;
    });

    /* verify if user is registered on university */
    let userMembersLocation = function userMembersLocation(array) {
        function findStudentId(sId) {
            return sId.accountId = studentId;
        }

        let studentIdMembersLocation = array.findIndex(findStudentId);
        return studentIdMembersLocation;
    }

    let userSubscribed = $scope.userSubscribed = function userSubscribed(array) {
        let studentIdMembersLocation = userMembersLocation(array);
        if (studentIdMembersLocation != -1) {
            return true;
        } else {
            return false;
        }
    };

    /* subscribe */
    $scope.subscribe = function() {
        // Check if user is logged
        University.subscribeOnUniversity(universityUrl).then(function(res) {
            if (userSubscribed($scope.university.members)) {
                let studentIdMembersLocation = userMembersLocation($scope.university.members);
                $scope.university.members.splice(studentIdMembersLocation, 1);
            } else {
                $scope.university.members.push({ accountId: studentId });
            }
        });
    };
}])

/* university plan dialog */
.controller('UniversityPlanCtrl', ['$rootScope', '$scope', '$location', '$window', 'ngDialog', function($rootScope, $scope, $location, $window, ngDialog) {
    let ADVANCED_PRICE_YEARLY = 209,
        ADVANCED_PRICE_MONTHLY = 19;
    let CORPORATION_PRICE_YEARLY = 539,
        CORPORATION_PRICE_MONTHLY = 49;

    $scope.currentPlan = "basic"; // ----> check university current plan subscription
    $scope.buttonLabel = "Buy Plan";
    $scope.disableButton = false;

    $scope.planType = "essential";
    $scope.billingInterval = "yearly";
    $scope.planAmountYearly = 0;
    $scope.planAmountMonthly = 0;

    // Perform checking of plan on load
    checkPlanSelected($scope.currentPlan);

    // Function that will redirect the user to the pricing page
    $scope.gotopricing = function() {
        $location.path('/ensinar/preco');
    }

    // Function that selects plan type ("basic", "pro", "team")
    $scope.selectPlan = function(plan) {
        if (plan === "essential") {
            $scope.planType = "essential";
            $scope.planAmountYearly = 0;
            $scope.planAmountMonthly = 0;
        } else if (plan === "advanced") {
            $scope.planType = "advanced";
            $scope.planAmountYearly = ADVANCED_PRICE_YEARLY;
            $scope.planAmountMonthly = ADVANCED_PRICE_MONTHLY;
        } else {
            $scope.planType = "corporation";
            $scope.planAmountYearly = CORPORATION_PRICE_YEARLY;
            $scope.planAmountMonthly = CORPORATION_PRICE_MONTHLY;
        }
        checkPlanSelected(plan);
    }

    // Function that selects plan billing interval ("monthly", "yearly")
    $scope.selectBillingInterval = function(interval) {
        console.log("selecting plan billing interval: ", interval);
        if (interval === "yearly") {
            $scope.billingInterval = "yearly";
        } else {
            $scope.billingInterval = "monthly";
        }
    }

    // Function that will open the card dialog to continue payment process for the selected plan
    $scope.openCardDialog = function() {
        ngDialog.open({
            template: 'partials/modals/payments.html',
            controller: 'PaymentsCtrl',
            className: 'ngdialog-theme-default',
            data: {
                flow: "addCard",
                page: "cardAdd",
                plan: {
                    name: "",
                    amount: "0",
                    currentcy: "R$"
                }
            }
        });
    }

    // Helper function to check if the selected plan is equal to the university current plan
    // if equal -> disable the button, change label to THIS IS YOUR CURRENT PLAN
    // PURPOSE to avoid opening of the Add card dialog
    function checkPlanSelected(plan) {
        if ($scope.currentPlan === plan) {
            $scope.buttonLabel = "This is your current plan";
            $scope.activateButton = true;
        } else {
            $scope.buttonLabel = "Buy Plan";
            $scope.activateButton = false;
        }
    }
}])

/* messenger */
.controller('MessengerCtrl', ['$rootScope', '$scope', '$location', function($rootScope, $scope, $location) {
    let tc = {};

    $scope.connect = function() {
        connectClientWithUsername();
    }

    function connectClientWithUsername() {
        var usernameText = "test";
        tc.username = usernameText;
        fetchAccessToken(tc.username, connectMessagingClient);
    }

    function connectMessagingClient(token) {
        // Initialize the IP messaging client
        tc.messagingClient = new Twilio.Chat.Client(token);
        tc.messagingClient.initialize()
            .then(function() {
                updateConnectedUI();
                tc.loadChannelList(tc.joinGeneralChannel);
                tc.messagingClient.on('channelAdded', $.throttle(tc.loadChannelList));
                tc.messagingClient.on('channelRemoved', $.throttle(tc.loadChannelList));
                tc.messagingClient.on('tokenExpired', refreshToken);
            });
    }

    tc.joinGeneralChannel = function() {
        if (!tc.generalChannel) {
            // If it doesn't exist, let's create it
            tc.messagingClient.createChannel({
                uniqueName: GENERAL_CHANNEL_UNIQUE_NAME,
                friendlyName: GENERAL_CHANNEL_NAME
            }).then(function(channel) {
                tc.generalChannel = channel;
                tc.loadChannelList(tc.joinGeneralChannel);
            });
        } else {
            setupChannel(tc.generalChannel);
        }
    };

    function fetchAccessToken(username, handler) {
        $.post('https://educationalcommunity-classroom.herokuapp.com/', { identity: username, device: 'browser' }, null, 'json')
            .done(function(response) {})
            .fail(function(error) {
                console.log('Failed to fetch the Access Token with error: ' + error);
                console.log("tey");
            });
    }
}])

.controller('MessengerMenuCtrl', ['$rootScope', '$scope', '$location', function($rootScope, $scope, $location) {
    $rootScope.messengerMenuClass = "col-sm-4 col-md-3 col-lg-2 messenger-menu";
}])

/* end messenger */
.controller('HeaderCtrl', ['$rootScope', '$scope', '$location', '$localStorage', 'jwtHelper', 'Search', 'Students', '$route', 'ngDialog', '$timeout', 'Chat', '$translate', function($rootScope, $scope, $location, $localStorage, jwtHelper, Search, Students, $route, ngDialog, $timeout, Chat, $translate) {
    /* header variables */
    let logged = $rootScope.logged;
    $scope.whitelabel = false;
    $scope.searchBarDisplay = false;

    /* get selected language from the localstorage*/
    $scope.selectedLanguage = $localStorage.setLanguage

    /* function that change the language */
    $scope.changeLanguage = function(langKey) {
        $translate.use(langKey);

        // set selected language to localstorage
        $localStorage.setLanguage = langKey
        $scope.selectedLanguage = langKey
    };

    // start - WHITELABEL IMPLEMENTATION

    // #1 = If ?wl=1, then
    if ($location.search().wl == 1) {
        console.log("IS WHITELABELLLLLLL REQUEST!!!!!!!!!!!!!!!!!!!");
        var universityUrl = $routeParams.academiaName;
        console.log("university url: ")
        console.log(universityUrl)

        // #2.1 = Load University

        if (University.isStoredLocal(universityUrl)) {
            // #2 =  replace “Universidade”/”College”/”Universidad” logo for University custom logo
            // #3 = Remove Universidades and Explorar from Tab
            let universityStorage = University.retrieveStorage(universityUrl);
            $scope.university = universityStorage[universityUrl];
            if ($scope.university.whitelabel == true) {
                $scope.whitelabel = true;
            }
            console.log("universit111111111111111y: ")
            console.log($scope.university);
        } else {
            // #2 =  replace “Universidade”/”College”/”Universidad” logo for University custom logo
            // #3 = Remove Universidades and Explorar from Tab

            University.getUniversity(universityUrl).then(function(res) {
                console.log("universit22222222222222y: ")
                console.log(res.data.data)
                $scope.university = res.data.data;
                if ($scope.university.whitelabel == true) {
                    $scope.whitelabel = true;
                }
                University.storeLocal($scope.university);
            });
        }
    }

    // end - WHITELABEL IMPLEMENTATION

    /* functions */
    $scope.searchBarToggle = function() {
        if ($scope.searchBarDisplay) {
            $scope.searchBarDisplay = false;
        } else {
            $scope.searchBarDisplay = true;
        }
    }

    $scope.login = function() {
        $timeout.cancel($rootScope.accountSuggestion);
        ngDialog.open({ template: 'partials/modals/login.html', controller: 'AccountCtrl', className: 'ngdialog-theme-default' });
    }

    $scope.signup = function() {
        $timeout.cancel($rootScope.accountSuggestion);
        ngDialog.open({ template: 'partials/modals/signup.html', controller: 'AccountCtrl', className: 'ngdialog-theme-default' });
    }

    $scope.homeCheck = function() {
        if (url.$$route.originalPath.indexOf('/home') != -1) {
            return true
        } else {
            return false
        }
    }

    // Class
    $scope.filterGly = "glyphicon glyphicon-triangle-bottom";

    // Show / Hide Filter
    $scope.messengerMenuMobileDisplay = false;

    /* Student informations */
    $scope.userImage = "img/user/user.png";
    $scope.user = {};

    if (logged) {
        let studentId = jwtHelper.decodeToken($localStorage.token)._id;

        Students.getStudentById(studentId).then(function(res) {
            let data = res.data.data;
            $rootScope.user = data;
            $scope.user = data;

            $rootScope.$broadcast("studentInformationParsed");

            if (data.imageUrl != undefined && data.imageUrl != null) {
                $scope.userImage = data.imageUrl;
            }

            /* chat */
            if ($localStorage.tokenTwilio != undefined) {} else {
                // Request token from API
                let fingertips;
                new Fingerprint2().get(function(result, components) {
                    var info = {
                        fingerprint: result
                    };

                    processFingerprint(info);
                    Chat.getTwilioToken(info).success(function(res) {
                        let token = res.token;
                        $localStorage.tokenTwilio = res.token;
                    })
                });

                function refreshToken() {
                    fetchAccessToken(setNewToken);
                }

                function setNewToken(tokenResponse) {
                    accessManager.updateToken(tokenResponse.token);
                }

                function processFingerprint(data) {
                    //alert(data.fingerprint);
                }
            }
        }).catch(function(e) {});
    }
    /* end Search */

    /* home header selected option */
    let url = $route.current;
    let originalPath = url.$$route.originalPath;

    $scope.originalPath = originalPath;

    /* Functions */
    let brand = $("#logomaster");
    let logo = $("#logo");
    let logoIcon = $("#logoIcon");
    let brandArrow = $(".navbar-top #logomaster span i");
    let navbarMobile = $(".navbar-mobile");
    let menuRight = $("nav .navbar-top .menu-right");
    let searchButton = $("#searchButtonMobile");
    let searchTextInput = $(".navbar-top .menu-right .form-group input");

    /* bool */
    let navbarMobileOpen = false;
    let navbarMobileSearchOpen = false;
    $scope.navbarMobileOpen = navbarMobileOpen;

    /* open/close menu mobile */
    brand.click(function() {
        let width = $(window).width();
        console.log("click")
        if (width <= 768) {
            if (navbarMobileOpen) {
                $scope.navbarMobileOpen = false;
                navbarMobile.css("display", "none");
                brandArrow.attr("class", "fas fa-angle-down");
                navbarMobileOpen = false;
            } else {
                $scope.navbarMobileOpen = true;
                navbarMobile.css("display", "block");
                brandArrow.attr("class", "fas fa-angle-up");
                navbarMobileOpen = true;
            }
        } else {
            if (logged) {
                window.location.href = '/home/timeline'
            } else {
                window.location.href = '/home'
            }
        }
    });
    /* end open/close menu mobile */

    /* open/close search */
    searchButton.click(function() {
        logo.css("display", "none");
        logoIcon.css("display", "inline-block");
        $("#searchButtonMobile").css("display", "none");
        menuRight.addClass("expand");
        $("nav .navbar-top .menu-right .search .form-group").css("display", "inline-block");
        searchTextInput.css("display", "inline-block");
    });
    /* end open/close search */

    /* menu profile */
    let profileMenu = $("#profileMenu");
    let profileExpanded = $(".profile-expanded");

    let profileExpandedOpen = false;
    profileMenu.hover(function() {
        profileExpanded.css("display", "block");
        profileExpandedOpen = true;
    });

    $(window).click(function() {
        if (profileExpandedOpen) {
            profileExpanded.css("display", "none");
        }
    });

    /* language menu */
    let languageMenu = $("#languageMenu");
    let languageExpanded = $(".language-expanded");
    let languageExpandedOpen = false;

    languageMenu.hover(function() {
        languageExpanded.css("display", "block");
        languageExpandedOpen = true;
    });

    $(window).click(function() {
        if (languageExpandedOpen) {
            languageExpanded.css("display", "none");
        }
    });

    $scope.playAudio = function() {
        var audio = new Audio('sounds/cursorHover.wav');
        audio.play();
    };
}])

.controller('FooterCtrl', ['$rootScope', '$scope', '$location', function($rootScope, $scope, $location) {}])

.controller('SearchCtrl', ['$rootScope', '$scope', '$location', 'Search', '$localStorage', 'jwtHelper', 'Students', function($rootScope, $scope, $location, Search, $localStorage, jwtHelper, Students) {
    $scope.displayMobileMenu = function() {
        if (mobileAndTabletCheck() || $(window).width() < 768) {
            if ($scope.showMobileMenu) {
                $scope.showMobileMenu = false;
            } else {
                $scope.showMobileMenu = true;
            }
        } else {
            $location.path("/home");
        }
    };

    function mobileAndTabletCheck() {
        var check = false;
        (function(a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
        return check;
    };

    $scope.userImage = "img/user/user.png";
    $scope.user = {};

    /* header variables */
    let logged = $scope.logged = $localStorage.logged;

    //imageUrl
    if (logged) {
        let studentId = jwtHelper.decodeToken($localStorage.token)._id;
        Students.getStudentById(studentId).then(function(res) {
            let data = res.data.data;
            $scope.user = data;
            if (data.imageUrl != undefined && data.imageUrl != null) {
                $scope.userImage = data.imageUrl;
            }
        }).catch(function(e) {});
    }

    // Class
    $scope.filterClass = "content-bar search-filters-col hidden-sm-down col-sm-3";
    $scope.filterGly = "glyphicon glyphicon-triangle-bottom";

    // Show / Hide Filter
    $scope.filterMobileDisplay = false;

    $scope.filterMobile = function() {
        if ($scope.filterMobileDisplay) {
            $scope.filterMobileDisplay = false;
            $scope.filterClass = "content-bar search-filters-col hidden-sm-down col-sm-3";
            $scope.filterGly = "glyphicon glyphicon-triangle-bottom";
        } else {
            $scope.filterMobileDisplay = true;
            $scope.filterClass = "content-bar search-filters-col hidden-sm-down col-sm-3 search-filter-show";
            $scope.filterGly = "glyphicon glyphicon-triangle-top";
        }
    };

    // Handle with query
    let query = $location.search().query;
    let resultDisplay = $location.search().result;

    $scope.searchQuery = query;
    $scope.$watch("searchQuery", function(newValue, oldValue) {
        if ($scope.searchQuery.length > 0) {
            $scope.searchSuggestions = true;

            Search.all(newValue).then(function(res) {
                let data = res.data.data;
                $scope.results = data;
            });
        } else {
            $scope.searchSuggestions = false;
        }
    });

    if (resultDisplay) {
        $scope.searchSuggestions = false;
    }
}])

.controller('DashboardJobsManageMyListingsCtrl', ['$rootScope', '$scope', '$location', function($rootScope, $scope, $location) {

}])

.controller('DashboardSmpManageIwantCtrl', ['$rootScope', '$scope', '$location', 'SocialMarketPlace', 'jwtHelper', '$localStorage', function($rootScope, $scope, $location, SocialMarketPlace, jwtHelper, $localStorage) {
    let studentId = jwtHelper.decodeToken($localStorage.token)._id;
    SocialMarketPlace.getListingsByAccountId(studentId).then(function(res) {
        let listings = res.data.data;
        $scope.listings = listings;
    });
}])

.controller('DashboardSmpManageListingStatsCtrl', ['$rootScope', '$scope', '$location', function($rootScope, $scope, $location) {

}])

.controller('DashboardSmpManageListingEditCtrl', ['$rootScope', '$scope', '$location', '', '$timeout', 'Search', 'SocialMarketPlace', '$route', 'University', function($rootScope, $scope, $location, Upload, $timeout, Search, SocialMarketPlace, $route, University) {
    var listing;
    $scope.universitySearch = [];
    $scope.pictures = [];

    /* Verification */
    $scope.titleOk = false;
    $scope.descriptionOk = false;
    $scope.priceOk = false;
    $scope.universityOk = false;
    $scope.universitySelected = "";
    $scope.universityId = "";
    $scope.hashtag = "";

    /* Load Listing */
    let listingId = $route.current.params.id;

    SocialMarketPlace.getListingById(listingId).then(function(res) {
        let success = res.data.success;
        if (success) {
            listing = res.data.data;

            $scope.listing = listing;

            $scope.title = listing.title;
            $scope.titleOk = true;

            $scope.description = listing.description;
            $scope.descriptionOk = true;

            $scope.price = listing.price;
            $scope.priceOk = true;

            listing.pictures.forEach(function(e, idx) {
                $scope.pictures.push(e.url);
                $scope.filesListing.push(e);
            });

            listing.hashtags.forEach(function(e, idx, a) {
                if (a.length == idx + 1) {
                    $scope.hashtag += e.text;
                } else {
                    $scope.hashtag += e.text + " ";
                }
            });

            University.getUniversityById(listing.universityId).then(function(res) {
                let success = res.data.success;

                if (success) {
                    let university = res.data.data;

                    $scope.universityId = university._id;
                    $scope.university = university.name;
                    $scope.universitySelected = university.name;
                    $scope.universityOk = true;
                }
            });
        } else {}
    });

    /* Watch */
    $scope.$watch("university", function(newValue, oldValue) {
        if ($scope.universitySelected != newValue && newValue.length > 2) {
            Search.all(newValue).then(function(res) {
                let results = res.data.data;
                $scope.universitySearch = results;
            });
        }

        if ($scope.universitySelected != newValue) {
            $scope.universityOk = false;
        }
    });

    $scope.$watch("title", function(newValue, oldValue) {
        if (newValue != undefined) {
            if (newValue.length > 1) {
                $scope.titleOk = true;
            } else {
                $scope.titleOk = false;
            }
        }
    });

    $scope.$watch("description", function(newValue, oldValue) {
        if (newValue != undefined) {
            if (newValue.length > 1) {
                $scope.descriptionOk = true;
            } else {
                $scope.descriptionOk = false;
            }
        }
    });

    $scope.$watch("price", function(newValue, oldValue) {
        // Check if just number
        let exp = /^[0-9.,]+$/;
        var patt = new RegExp(exp);
        var res = patt.test(newValue);

        if (newValue != undefined) {
            if (res) {
                $scope.priceOk = true;
            } else {
                $scope.priceOk = false;
            }
        }
    });

    $scope.$watch('files', function() {
        $scope.upload($scope.files);
    });

    $scope.$watch('file', function() {
        if ($scope.file != null) {
            $scope.files = [$scope.file];
        }
    });

    $scope.log = '';

    /* Upload */
    $scope.filesListing = [];
    $scope.imageUploading = false;

    function addIntoUploadImages(res, list) {
        let img = res.data.data[0];
        $scope.pictures.push(img.path);
        $scope.filesListing.push(img);
    };

    $scope.upload = function(files) {
        if (files && files.length) {
            $scope.imageUploading = true;
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                if (!file.$error) {
                    Upload.upload({
                        url: 'http://localhost:900/images',
                        data: {
                            username: $scope.username,
                            file: file
                        }
                    }).then(function(resp) {
                        $timeout(function() {
                            $scope.log = 'file: ' +
                                resp.config.data.file.name +
                                ', Response: ' + JSON.stringify(resp.data) +
                                '\n' + $scope.log;
                        });
                        addIntoUploadImages(resp, listing);
                        $scope.imageUploading = false;
                    }, null, function(evt) {

                        let progressPercentage = parseInt(100.0 *
                            evt.loaded / evt.total);

                        $scope.log = 'progress: ' + progressPercentage +
                            '% ' + evt.config.data.file.name + '\n' +
                            $scope.log;
                    });
                }
            }
        }
    };

    /* Button */
    $scope.updateListing = function() {
        var listingUpdate = {
            id: listing._id,
            title: $scope.title,
            pictures: $scope.pictures,
            description: $scope.description,
            price: $scope.price,
            hashtags: $scope.hashtag.split(" "),
            universityId: $scope.universityId

        };

        SocialMarketPlace.update(listingUpdate).then(function(res) {
            let success = res.data.success;
            if (success) {
                let listing = res.data.data;
                $scope.listing = listing;

            } else {}
        });
    }

    function removeImage(index) {
        let idx = listing.pictures.indexOf($scope.filesListing[index].url);
        $scope.pictures.splice(idx, 1);
        $scope.filesListing.splice(index, 1);
    }

    $scope.removeImage = function(index) {
        removeImage(index);
    }

    $scope.selectUniversity = function(university) {
        $scope.university = university._source.name;
        $scope.universityId = university._id;
        $scope.universitySearch = [];
        $scope.universitySelected = university._source.name;
        $scope.universityOk = true;
    };
}])

.controller('DashboardCtrl', ['$rootScope', '$scope', '$location', '$localStorage', function($rootScope, $scope, $location, $localStorage) {

}])

.controller('DashboardMenuCtrl', ['$rootScope', '$scope', '$location', function($rootScope, $scope, $location) {

}])

.controller('DashboardSmpCreateCtrl', ['$rootScope', '$scope', '$location', 'Upload', '$timeout', 'Search', 'SocialMarketPlace', '$route', function($rootScope, $scope, $location, Upload, $timeout, Search, SocialMarketPlace, $route) {
    $scope.universitySearch = [];
    $scope.pictures = [];

    // Social Marketplace create listing
    var listing = {
        title: $scope.title,
        pictures: [],
        description: $scope.description,
        price: $scope.price,
        tags: [],
        university: ""
    };

    /* Verification */
    $scope.titleOk = false;
    $scope.descriptionOk = false;
    $scope.priceOk = false;
    $scope.universityOk = false;
    $scope.universitySelected = "";
    $scope.universityId = "";

    /* Watch */
    $scope.$watch("university", function(newValue, oldValue) {
        if ($scope.universitySelected != newValue && newValue.length > 2) {
            Search.all(newValue).then(function(res) {
                let results = res.data.data;
                $scope.universitySearch = results;
            });
        }

        if ($scope.universitySelected != newValue) {
            $scope.universityOk = false;
        }
    });

    $scope.$watch("title", function(newValue, oldValue) {
        if (newValue != undefined) {
            if (newValue.length > 1) {
                $scope.titleOk = true;
            } else {
                $scope.titleOk = false;
            }
        }
    });

    $scope.$watch("description", function(newValue, oldValue) {
        if (newValue != undefined) {
            if (newValue.length > 1) {
                $scope.descriptionOk = true;
            } else {
                $scope.descriptionOk = false;
            }
        }
    });

    $scope.$watch("price", function(newValue, oldValue) {
        // Check if just number
        let exp = /^[0-9.,]+$/;
        var patt = new RegExp(exp);
        var res = patt.test(newValue);

        if (newValue != undefined) {
            if (newValue.length > 1 && res) {
                $scope.priceOk = true;
            } else {
                $scope.priceOk = false;
            }
        }
    });

    $scope.$watch('files', function() {
        $scope.upload($scope.files);
    });

    $scope.$watch('file', function() {
        if ($scope.file != null) {
            $scope.files = [$scope.file];
        }
    });

    $scope.log = '';

    /* Upload */
    $scope.filesListing = [];
    $scope.imageUploading = false;

    function addIntoUploadImages(res, list) {
        let img = res.data.data[0];
        $scope.pictures.push(img.path);
        $scope.filesListing.push(img);
    };

    $scope.upload = function(files) {
        if (files && files.length) {
            $scope.imageUploading = true;
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                if (!file.$error) {
                    Upload.upload({
                        url: 'http://api.universida.de//images/smp',
                        data: {
                            username: $scope.username,
                            file: file
                        }
                    }).then(function(resp) {
                        $timeout(function() {
                            $scope.log = 'file: ' +
                                resp.config.data.file.name +
                                ', Response: ' + JSON.stringify(resp.data) +
                                '\n' + $scope.log;
                        });

                        addIntoUploadImages(resp, listing);
                        $scope.imageUploading = false;
                    }, null, function(evt) {
                        let progressPercentage = parseInt(100.0 *
                            evt.loaded / evt.total);

                        $scope.log = 'progress: ' + progressPercentage +
                            '% ' + evt.config.data.file.name + '\n' +
                            $scope.log;
                    });
                }
            }
        }
    };

    /* Button */
    $scope.createListing = function() {
        var listing = {
            title: $scope.title,
            pictures: $scope.pictures,
            description: $scope.description,
            price: $scope.price,
            hashtags: $scope.hashtag.split(" "),
            universityId: $scope.universityId

        };

        // Hashtags are uploaded as an array
        SocialMarketPlace.create(listing).then(function(res) {
            let listing = res.data.data;
            $location.path('/smp/listing/id/' + listing._id);
        });
    }

    function removeImage(index) {
        let idx = listing.pictures.indexOf($scope.filesListing[index].path);
        $scope.pictures.splice(idx, 1);
        $scope.filesListing.splice(index, 1);
    }

    $scope.removeImage = function(index) {
        removeImage(index);
    }

    $scope.selectUniversity = function(university) {
        $scope.university = university._source.name;
        $scope.universityId = university._id;
        $scope.universitySearch = [];
        $scope.universitySelected = university._source.name;
        $scope.universityOk = true;
    };
}])

.controller('DashboardSmpManageCtrl', ['$rootScope', '$scope', '$location', 'SocialMarketPlace', 'jwtHelper', '$localStorage', function($rootScope, $scope, $location, SocialMarketPlace, jwtHelper, $localStorage) {
    let studentId = jwtHelper.decodeToken($localStorage.token)._id;
    SocialMarketPlace.getListingsByAccountId(studentId).then(function(res) {
        let listings = res.data.data;
        $scope.listings = listings;
    });
}])

.controller('SmpListingCtrl', ['$rootScope', '$scope', '$location', '$route', 'SocialMarketPlace', 'University', 'Students', 'ngDialog', 'jwtHelper', '$localStorage', function($rootScope, $scope, $location, $route, SocialMarketPlace, University, Students, ngDialog, jwtHelper, $localStorage) {
    // Id
    let listingId = $route.current.params.id;
    let studentId = jwtHelper.decodeToken($localStorage.token)._id;
    $scope.pictureMain = "";

    SocialMarketPlace.getListingById(listingId).then(function(res) {
        $scope.listing = res.data.data;

        if ($scope.listing.pictures[0] == undefined || $scope.listing.pictures[0].url == "") {
            $scope.pictureMain = "/img/misc/noimage.jpg";
        } else {
            $scope.pictureMain = res.data.data.pictures[0].url;
        }

        if ($scope.listing.accountId == studentId) {
            $scope.listingOwner = true;
        }

        $scope.listing.want.forEach(function(e, idx) {
            if (e.accountId == studentId) {
                $scope.listingWants = true;
            }
        });

        // Load University information
        if ($scope.listing.universityId != undefined) {
            University.getUniversityById($scope.listing.universityId).then(function(res) {
                $scope.university = res.data.data;
            });
        }

        Students.getStudentById($scope.listing.accountId).then(function(res) {
            console.log("response student: ");
            console.log(res);
            $scope.student = res.data.data;
        });
    });

    /* Display Image */
    $scope.pictureSelected = "/t";
    $scope.pictureSelect = function(idx) {
        $scope.pictureSelected = $scope.listing.pictures[idx].url;
        ngDialog.open({ template: 'templateId', className: 'ngdialog-theme-default ngdialog-theme-smp', scope: $scope });
    };

    /* want */
    $scope.listingOwner = false;
    $scope.listingWants = false;

    $scope.want = function() {
        SocialMarketPlace.want(listingId).then(function(res) {
            let listing = res.data.data;

            if ($scope.listingWants) {
                $scope.listingWants = false;
            } else {
                $scope.listingWants = true;
            }

            if (listing != undefined) {
                $scope.listing.want = listing.want;
            }
        });
    }
}])

.controller('ProfileCtrl', ['$rootScope', '$scope', '$location', '$localStorage', 'jwtHelper', 'Students', 'University', 'Forum', function($rootScope, $scope, $location, $localStorage, jwtHelper, Students, University, Forum) {
    /* premium */
    let studentId;

    if ($localStorage.token != undefined && $localStorage.token != null) {
        studentId = jwtHelper.decodeToken($localStorage.token)._id;
    } else {
        $location.path("/");
    }

    $scope.short = "", $scope.text = "";
    $scope.activeSection = 'conhecimento';

    Students.getStudentById(studentId).success(function(res) {
        let success = res.success;
        let data = res.data;

        if (success) {
            $scope.student = res.data;
            let universityUrl = $scope.student._id;

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
                    console.log("error while loading university")
                }
            });
        }
    });

    $scope.editProfile = () => {
        $location.path("/perfil/editar")
    }
}])

.controller('ProfileEditCtrl', ['$rootScope', '$scope', '$location', '$localStorage', '$timeout', 'Upload', 'jwtHelper', 'Students', 'University', 'Forum', function($rootScope, $scope, $location, $localStorage, $timeout, Upload, jwtHelper, Students, University, Forum) {
    let studentId;

    if ($localStorage.token != undefined && $localStorage.token != null) {
        studentId = jwtHelper.decodeToken($localStorage.token)._id;
    } else {
        $location.path("/");
    }

    $scope.bio = "", $scope.pwd = "", $scope.name = "", $scope.rpwd = "";
    $scope.activeSection = 'conhecimento';

    // get student info by id
    Students.getStudentById(studentId).success(function(res) {
        let success = res.success;

        if (success) {
            $scope.student = res.data;
            $scope.name = res.data.name;

            let universityUrl = $scope.student._id;
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
                    console.log("error while loading university")
                }
            });
        }
    });

    // save changed info to the db
    $scope.save = function() {
        let imageUrl = $("#file").attr("value");
        console.log("IMGURL", imageUrl)

        if ($scope.pwd !== $scope.rpwd) {
            alert("Password not matched");
            return;
        }

        let payload = {
            name: $scope.name,
            username: $scope.student.username,
            bioLong: $scope.student.bioLong,
            bioShort: $scope.bio,
            password: $scope.pwd,
            imageUrl: imageUrl == undefined ? $scope.student.imageUrl : imageUrl
        }

        if ($scope.pwd.length === 0) delete payload.password;
        Students.update(studentId, payload).success(function(res) {
            let success = res.success;
            let data = res.data;

            if (success) {
                alert("Profile successully updated");
            }
        });
    }
}])

.controller('ProfileByUsernameCtrl', ['$rootScope', '$scope', '$location', '$localStorage', 'jwtHelper', 'Students', '$route', function($rootScope, $scope, $location, $localStorage, jwtHelper, Students, $route) {
    let studentUsername = $route.current.params.studentUsername;
    Students.getStudentByUsername(studentUsername).success(function(res) {
        let success = res.success;
        let data = res.data;

        if (success) {
            $scope.student = res.data;
        }
    });
}])

.controller('IndexCtrl', ['$rootScope', '$scope', '$location', '$localStorage', '$route', function($rootScope, $scope, $location, $localStorage, $route) {
    // If isn't the first visit, redirects to home
    if ($localStorage.logged) {
        $location.path("/home/timeline");
    } else {
        let universityUrl = $route.current.params.academiaName;
        let roomSID = $route.current.params.roomSID;
        let accountSid = $route.current.params.accountSid;
        let redirectUrl;
        if (universityUrl != null && roomSID != null && accountSid != null) {
            redirectUrl = $route.params.url;
        } else
            redirectUrl = "/home/explore";
        $location.path(redirectUrl);
    }
    $localStorage.indexVisited = true;
}])

.controller('HomeCreateCtrl', ['$rootScope', '$scope', '$location', '$localStorage', function($rootScope, $scope, $location, $localStorage) {

}])

.controller('HomeCtrl', ['$rootScope', '$scope', 'ngDialog', 'University', 'Knowledge', 'Courses', function($rootScope, $scope, ngDialog, University, Knowledge, Courses) {
    $scope.showMobileMenu = false;
    $scope.universities = [];

    Courses.getAll().success(function(res) {
        $scope.courses = res.data;
    });

    /* */
    Knowledge.getAllPaginated().success(function(res) {
        let success = res.success;
        let data = res.data;
        let docs = data.docs;

        $scope.knowledges = docs;
    });

    University.getUniversities().then(function(res) {
        $scope.universities = res.data.data;
    });

    $scope.signup = function() {
        ngDialog.open({ template: 'partials/modals/signup.html', controller: 'AccountCtrl', className: 'ngdialog-theme-default' });
    }

    $scope.createUniversityRedirect = function() {
        let logged = $rootScope.logged;
        let redirectUrl = "/dashboard/a/create";

        if (logged) {
            $location.path(redirectUrl);
        } else {
            ngDialog.open({ template: 'partials/modals/login.html', controller: 'AccountCtrl', className: 'ngdialog-theme-default', data: { redirectUrl: redirectUrl } });
        }
    }

    $scope.studentProExplore = function() {
        ngDialog.open({ template: 'partials/modals/studentpro.html', className: 'ngdialog-theme-default ngdialog-student-pro', controller: 'StudentProExploreCtrl' });
    };

    University.getUniversities().then(function(res) {
        $scope.universities = res.data.data;
    });

    /* swipe */
    $scope.onTransitionStart = function(swiper) {}

    /* */
    Knowledge.getAllPostsByUrlPaginated("esportes").success(function(res) {
        $scope.forumPosts = res.data.docs;
        $scope.pages = res.data.pages;
    });
}])

/* Business */
.controller('BusinessIndexCtrl', ['$rootScope', '$scope', '$location', function($rootScope, $scope, $location) {

}])

.controller('BusinessSigninCtrl', ['$rootScope', '$scope', '$location', function($rootScope, $scope, $location) {

}])

.controller('BusinessRegisterCtrl', ['$rootScope', '$scope', '$location', function($rootScope, $scope, $location) {

}])

.directive('studentinfooption', ['University', 'Students', function(University, Students) {
    return {
        restrict: 'AE',
        templateUrl: '../partials/courses/directive/studentinfooption.html',
        replace: true,
        scope: true,
        link: function(scope, element, attr) {
            let accountId = attr.sid;
            scope.userImage = "img/user/user.png";

            // Get Account information
            Students.getStudentById(accountId).then(function(res) {
                let user = res.data.data;

                scope.user = user;
                if (user.imageUrl != undefined && user.imageUrl != null) {
                    scope.userImage = data.imageUrl;
                }
            });
        }
    }
}])

.directive('forumpostanswer', ['University', 'Students', function(University, Students) {
    return {
        restrict: 'E',
        templateUrl: '../partials/forumpostanswertemplate.html',
        replace: true,
        scope: true,
        link: function(scope, element, attr) {
            let answer = JSON.parse(attr.a);
            let postId = attr.p;
            let universityId = attr.u;
            scope.answer = answer;
            let studentId = answer.accountId;
            scope.userImage = "img/user/user.png";

            // Get Account information
            Students.getStudentById(answer.accountId).then(function(res) {
                let user = res.data.data;
                scope.user = user;

                if (user.imageUrl != undefined && user.imageUrl != null) {
                    scope.userImage = data.imageUrl;
                }
            });

            // Votes
            scope.votesCount = answer.votesCount;

            // Up vote
            scope.upvoteForumPostAnswer = function() {
                University.upvoteForumPostAnswer(universityId, postId, answer._id).then(function(res) {
                    if (res.data.success) {
                        scope.votesCount += 1;
                    }
                });
            };

            // Down vote
            scope.downvoteForumPostAnswer = function() {
                University.downvoteForumPostAnswer(universityId, postId, answer._id).then(function(res) {
                    if (res.data.success) {
                        scope.votesCount -= 1;
                    }
                });
            };
        }
    }
}])

.directive('accountsmpreview', ['Students', function(Students) {
    return {
        restrict: 'AE',
        template: "<img src='{{picture}}' />",
        replace: true,
        scope: true,
        link: function(scope, element, attr) {
            let viewer = JSON.parse(attr.v);

            Students.getStudentById(viewer.accountId).then(function(res) {
                let account = res.data.data;

                if (account.imageUrl != undefined) {
                    scope.picture = account.imageUrl;
                } else {
                    scope.picture = "/img/user/user.png";
                }
            });
        }
    }
}])

.directive('coursehomebox', ['SocialMarketPlace', function(SocialMarketPlace) {
    return {
        restrict: 'AE',
        templateUrl: '../partials/directive/coursehomebox.html',
        replace: true,
        scope: true,
        link: function(scope, element, attr) {
            // let course = JSON.parse(attr.c);
            scope.course = attr.c;
        }
    }
}])

.directive('smplisting', ['SocialMarketPlace', function(SocialMarketPlace) {
    return {
        restrict: 'AE',
        templateUrl: '../partials/smpposttemplate.html',
        replace: true,
        scope: true,
        link: function(scope, element, attr) {
            let listing = JSON.parse(attr.l);
            scope.listing = listing;
            SocialMarketPlace.getListingById(listing._id).then(function(res) {
                let smppost = res.data.data;

                if (smppost.pictures[0].url == "" || smppost.pictures[0].url == undefined) {
                    scope.picture = "/img/misc/noimage.jpg";
                } else {
                    scope.picture = smppost.pictures[0].url;
                }
            });
        }
    }
}])

.filter('to_trusted', ['$sce', function($sce) {
    return function(text) {
        return $sce.trustAsHtml(text);
    };
}])

.directive('studentinfosmall', ['University', 'Students', '$filter', '$sce', '$location', function(University, Students, $filter, $sce, $location) {
    return {
        restrict: 'EA',
        templateUrl: '../../partials/courses/directive/studentinfosmall.html',
        replace: true,
        scope: true,
        link: function(scope, element, attr) {
            let studentId = attr.sid;
            Students.getStudentById(studentId).success(function(res) {
                scope.student = res.data;
            });
        }
    }
}])

.directive('ballmenu', ['University', 'Students', '$filter', '$sce', '$location', function(University, Students, $filter, $sce, $location) {
    return {
        restrict: 'E',
        templateUrl: '../../partials/directive/menu/ballmenu.html',
        replace: true,
        scope: true,
        link: function(scope, element, attr) {}
    }
}])

.directive('modulecontentcard', ['Courses', function(Courses) {
    return {
        restrict: 'AE',
        templateUrl: '../partials/directive/modulecontentcard.html',
        replace: true,
        scope: true,
        link: function(scope, element, attr) {
            let modulecontent = JSON.parse(attr.mc);
            if (!modulecontent.accountId) {
                Courses.getContentModuleById(modulecontent.modelId).then(function(res) {
                    scope.modulecontent = res.data.data;

                });
            } else
                scope.modulecontent = modulecontent;
        }
    }
}])

.directive('coursemodulecontent', ['Courses', function(Courses) {
    return {
        restrict: 'AE',
        templateUrl: '../partials/directive/coursemodulecontent.html',
        link: function(scope, element, attr) {
            scope.courseid = attr.courseid
            let modulecontent = JSON.parse(attr.mc);

            let id = [];
            for (let i = 0; i < modulecontent.length; i++) {
                id.push(modulecontent[i]['modelId']);
            }

            Courses.getContentModulesByIdmultiple(id).then(function(res) {
                scope.modulecontent = res.data.data;
            });
        }
    }
}])

.directive('coursemodulecontentmoduloview', ['$window', '$cookies', 'Courses', '$location', 'User', '$localStorage', function($window, $cookies, Courses, $location, User, $localStorage) {
    return {
        restrict: 'AE',
        replace: true,
        templateUrl: '../partials/directive/coursemodulecontentmoduloview.html',
        link: function(scope, element, attr) {
            scope.courseid = attr.courseid
            scope.count = attr.in
            scope.moduleid = JSON.parse(attr.moduleid)._id;

            let module = JSON.parse(attr.module);
            let user_id = User.getId();

            let contentViewed = [];
            let viewers = [];
            //let viewers = module.viewers;

            // 1 - CREATE A LIST WITH ALL CONTENT THIS USER SAW
            // for (let vdx = 0; vdx < viewers.length; vdx++) {
            //
            //     let view = viewers[vdx].contentId;
            //     let accountId = viewers[vdx].accountId;
            //
            //     if (contentViewed.indexOf(view) == -1 && accountId == user_id) {
            //         contentViewed.push(view);
            //     }
            // }

            let mContents = module.moduleId.content;

            // Loop tru each module contents
            for (let i = 0; i < mContents.length; i++) {
                let contentViewers = mContents[i].viewers; // array containg user's accountId
                let view = mContents[i].modelId; // id of the content

                // Loop thru each content viewers
                for (let x = 0; x < contentViewers.length; x++) {
                    let accountId = contentViewers[x].accountId;
                    viewers.push(contentViewers[x]);

                    // Check if user id matches viewers.accountId
                    if (contentViewed.indexOf(view) == -1 && accountId == user_id) {
                        contentViewed.push(view);
                    }
                }
            }
            let modulecontent = JSON.parse(attr.mc);

            let id = [];
            // Replace modulecontent with mContents
            for (let i = 0; i < modulecontent.length; i++) {
                if (mContents[i]['modelId']) {
                    id.push(mContents[i]['modelId'])
                }
            }

            // Tem que append por ID
            // Carrega o modelId e adiciona as infos (titulo e tals)
            Courses.getContentModulesByIdmultiple(id).then(function(res) {
                let modulecontentMC = res.data.data;
                let moduleContentWithViews = []

                // 2 - ADD READ TRUE TO THOSE MODULECONTENT READED
                if (viewers.length > 0) {
                    for (let x = 0; x < modulecontentMC.length; x++) {
                        modulecontentMC[x].module_id = scope.moduleid;

                        // attached order field from modulecontent
                        for (let i = 0; i < mContents.length; i++) {
                            if (mContents[i].modelId == modulecontentMC[x]._id) {
                                modulecontentMC[x].order = modulecontent[i].order
                            }
                        }

                        if (contentViewed.indexOf(modulecontentMC[x]._id) == -1) {
                            modulecontentMC[x].viewed = false;
                        } else {
                            modulecontentMC[x].viewed = true;
                        }
                        moduleContentWithViews.push(modulecontentMC[x])
                            // if ($localStorage.estudarModulos.indexOf(modulecontentMC[x]) == -1) {
                            //   $localStorage.estudarModulos.push(modulecontentMC[x])
                            //
                            //   // if ($localStorage.estudarModulos.length > 1) {
                            //   //   $localStorage.estudarModulos = $localStorage.estudarModulos.sort(function(a, b) {
                            //   //      return a.order - b.order;
                            //   //   });
                            //   // }
                            // }

                    }

                    // sort based on order value
                    moduleContentWithViews = moduleContentWithViews.sort(function(a, b) {
                        return a.order - b.order;
                    });

                    scope.modulecontent = moduleContentWithViews;

                    for (let i = 0; i < moduleContentWithViews.length; i++) {
                        $localStorage.estudarModulos.push(moduleContentWithViews[i])
                    }

                } else {
                    // attached order field from modulecontent
                    for (let x = 0; x < modulecontentMC.length; x++) {
                        for (let i = 0; i < mContents.length; i++) {
                            if (mContents[i].modelId == modulecontentMC[x]._id) {
                                modulecontentMC[x].order = modulecontent[i].order
                            }
                        }
                    }

                    let moduleContentSorted = modulecontentMC.sort(function(a, b) {
                        return a.order - b.order;
                    });

                    scope.modulecontent = moduleContentSorted;
                    $localStorage.estudarModulos.push(moduleContentSorted)
                }
            });

            // START openContent
            scope.openContent = function(course, contentType, type_id, model_id, moduleid) {
                $localStorage.showControlButton = true;
                $localStorage.viewRequest = "course_menu";

                // Insert student id to the course module content viewers array
                Courses.updateViewers(scope.moduleid, type_id).then(function(res) {
                    // Save or update cookies for the currently viewed course module content
                    let userId = User.getId();
                    let cId = "course_" + course + "_" + userId;
                    let courseCookie = {
                        "module_id": moduleid,
                        "content_id": type_id,
                        "type": contentType,
                        "post_id": model_id,
                        "quizresult": false
                    }
                    $localStorage.showInitiarCursoButton = false;
                    $cookies.putObject(cId, courseCookie);

                    $window.location.href = "/cursos/id/" + course + "/estudar";
                })
            }
        }
    }
}])

.directive('coursemodulecontentmodulo', ['$window', 'Courses', '$cookies', '$location', '$localStorage', 'User', function($window, Courses, $cookies, $location, $localStorage, User) {
    return {
        restrict: 'AE',
        templateUrl: '../partials/directive/coursemodulecontentmodulo.html',
        link: function(scope, element, attr) {
            let modulecontent = JSON.parse(attr.mc);
            scope.moduleid = JSON.parse(attr.moduleid)._id;
            scope.courseid = attr.courseid
            let id = [];

            for (let i = 0; i < modulecontent.length; i++) {
                if (modulecontent[i]['modelId']) {
                    id.push(modulecontent[i]['modelId'])
                }
            }

            let moduleContentSort = []
            Courses.getContentModulesByIdmultiple(id).then(function(res) {
                let moduleContentResponse = res.data.data;

                for (let a = 0; a < moduleContentResponse.length; a++) {
                    let moduleContentWeb = moduleContentResponse[a];
                    for (let x = 0; x < modulecontent.length; x++) {
                        let moduleContentJson = modulecontent[x];
                        if (moduleContentJson.modelId == moduleContentWeb._id) {
                            moduleContentWeb.order = moduleContentJson.order;
                            moduleContentSort.push(moduleContentWeb);
                        }
                    }
                }
                scope.modulecontent = moduleContentSort;
            });

            scope.openContent = function(course, type, type_id, post_id, moduleid) {
                $localStorage.showControlButton = true
                $localStorage.viewRequest = "course_menu"

                // Insert student id to the course module content viewers array
                Courses.updateViewers(moduleid, type_id).then(function(res) {
                    // Save or update cookies for the currently viewed course module content
                    let userId = User.getId();
                    let cId = "course_" + course + "_" + userId;
                    let courseCookie = {
                        "module_id": moduleid,
                        "content_id": type_id,
                        "type": type,
                        "post_id": post_id,
                        "quizresult": false
                    }
                    $localStorage.showInitiarCursoButton = false;
                    $cookies.putObject(cId, courseCookie);
                    $window.location.href = '/cursos/id/' + course + '/estudar';
                })
            }
        }
    }
}])

.directive('autoFocus', function($timeout) {
    return {
        restrict: 'AC',
        link: function(_scope, _element) {
            $timeout(function() {
                _element[0].focus();
            }, 0);
        }
    };
});