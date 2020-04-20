'use strict';

/* Controllers */

angular.module('netbase')

.controller('HomePersonalClassroom', ['$rootScope', '$scope', '$location', '$route', 'University', 'Classroom', 'Students', 'ngDialog', 'jwtHelper', '$localStorage', '$window', function($rootScope, $scope, $location, $route, University, Classroom, Students, ngDialog, jwtHelper, $localStorage, $window) {

    let studentId = jwtHelper.decodeToken($localStorage.token)._id;
    $scope.studentId = studentId;

    let universityUrl = studentId;

    $scope.administrator = [];
    $scope.participants = [];

    $scope.selectedOne = false;

    //$scope.currentLocalParticipant = null;
    $scope.currentVideoRoom = null;
    $scope.wholeClassroomList = [];
    $scope.localParticipantUserName = "";
    $scope.showingParticipants = [];
    $scope.shareScreenCaption = "Share Screen";
    $scope.confirmDelete = false;
    //console.log($route);
    //console.log("$$$$$$$$$");
    //console.log(Twilio.Video);
    //console.log("$$$$$$$$$");
    var video = Twilio.Video;
    var localVideo = Twilio.createLocalTracks;
    console.log('here local video');
    console.log(localVideo);

    $scope.classroomViewMode = false;

    //var baseUrl = "http://localhost:9000"; //Back-end server base url
    //var baseUrl = "http://localhost:9001"; //Back-end server base url
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
        //$scope.isMobile();
    });

    /****************** Mobile / Web **************************/

    $scope.isMobile = function() {
        var check = false;
        (function(a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
        $scope.classroomViewMode = check;
        return check;
    }

    // $scope.maxHeight = function() {
    //     if ($scope.classroomViewMode == true)
    //         return { "max-height": '500px' }
    //     else return { 'max-height': '600px' }
    // }

    $scope.maxHeight = {
        "max-height": '500px'
    }

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
        ngDialog.open({ controller: 'HomePersonalClassroom', template: 'partials/modals/classroom_modal.html', className: 'ngdialog-theme-default' });
    };

    $scope.confirmCreateClassroom = function() {
        let studentId;

        let token = $localStorage.token;
        let title = $scope.addingClassroom.uniqueName ? $scope.addingClassroom.uniqueName : '';
        //let url = '/classroom/university/' + $scope.university._id + '/room/' + title;
        let url = '/classroom/university/';

        if ($localStorage.token != undefined && $localStorage.token != null) {
            studentId = jwtHelper.decodeToken($localStorage.token)._id;
        }
        console.log("here studentId" + studentId);
        console.log('here university');
        console.log($scope.university);
        var i;
        var privilege = 0;
        for (i = 0; i < $scope.university.members.length; i++) {
            var member = $scope.university.members[i];
            if (studentId != undefined && member.accountId == studentId) {
                privilege = member.privilege; break;
            }
        }
        Classroom.createNewClassroom(baseUrl + url, title, privilege, $scope.university._id).then((data) => {
            //$scope.getAllClassrooms();
            let newClassroom = data.data;
            console.log("new classroom: ")
            console.log(data)
            let url = '/classroom/university/' + $scope.university._id + '/all'
            Classroom.getAllClassroomsByUniversity(baseUrl + url).then((data) => {
                $scope.wholeClassroomList = data;
                console.log('Classroom.getAllClassrooms');
                console.log($scope.wholeClassroomList);
                let text = "/a/university/" + universityUrl + "/roomid/" + newClassroom.id + "/accountid/" + newClassroom.sid + "/roomname/" + $scope.addingClassroom.uniqueName + "/";
                console.log("text")
                //$location.path(text);
                $route.reload();
            });
            ngDialog.close();
        })
        .catch((err) => {

            ngDialog.close();
            ngDialog.open({ template: 'partials/modals/classroom_alert_modal.html', controller: "AcademiaClassroomsAlertCtrl", className: 'ngdialog-theme-default classroom-alert-modal', data: {type: "ERROR", msg: err}});

        });
    }

    $scope.copyLink = function(classroom) {
        let text = domain + "/a/university/" + universityUrl + "/roomid/" + classroom.roomSID + "/accountid/" + classroom.accountSid + "/roomname/" + classroom.uniqueName + "/";
        /*if (navigator.clipboard != undefined) {//Chrome
            navigator.clipboard.writeText(text).then(function() {
                ngDialog.open({ template: 'partials/modals/classroom_alert_modal.html', controller: "AcademiaClassroomsAlertCtrl", className: 'ngdialog-theme-default classroom-alert-modal', data: {type: "Universidade", msg: 'Copied link to clipboard'}});
            }, function(err) {
                ngDialog.open({ template: 'partials/modals/classroom_alert_modal.html', controller: "AcademiaClassroomsAlertCtrl", className: 'ngdialog-theme-default classroom-alert-modal', data: {type: "ERROR", msg: 'Could not copy link to the clipboard '}});
            });
        }
        else if(window.clipboardData) { // Internet Explorer
            window.clipboardData.setData("Text", text);
        }*/

        Clipboard.copy(text);
        ngDialog.open({ template: 'partials/modals/classroom_alert_modal.html', controller: "AcademiaClassroomsAlertCtrl", className: 'ngdialog-theme-default classroom-alert-modal', data: {type: "Universidade", msg: 'Copied link to clipboard'}});
    }

    $scope.joinClassroom = function(classroom) {

      let text = domain + "/a/university/" + universityUrl + "/roomid/" + classroom.roomSID + "/accountid/" + classroom.accountSid + "/roomname/" + classroom.uniqueName + "/";
      window.open(text);

    }

    $scope.deleteClassroom = function(classroom) {
        $rootScope.deleteRoom = classroom;
        console.log('deleteroom');
        console.log(classroom);
        ngDialog.open({ template: 'partials/modals/classroom_confirm_delete_modal.html', controller: "AcademiaClassroomsCtrl", className: 'ngdialog-theme-default classroom-alert-modal'});
    }

    $scope.confirmDelete = function() {
        let token = $localStorage.token;

        console.log('here university');
        console.log($scope.university);
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
                privilege = member.privilege; break;
            }
        }
        privilege = 99;
        console.log('delete classroom');
        console.log($rootScope.deleteRoom);
        var roomId = $rootScope.deleteRoom.roomSID;
        Classroom.deleteClassroom(baseUrl + url, roomId, privilege).then((data) => {
            //$scope.getAllClassrooms();
            let url = '/classroom/university/' + $scope.university._id + '/all';
            Classroom.getAllClassroomsByUniversity(baseUrl + url).then((data) => {
                ngDialog.close();
                $scope.wholeClassroomList = data;
                console.log('Classroom.getAllClassrooms');
                console.log($scope.wholeClassroomList);
                $route.reload();
            });
        })
        .catch((err) => {

            ngDialog.close();
            ngDialog.open({ template: 'partials/modals/classroom_alert_modal.html', controller: "AcademiaClassroomsAlertCtrl", className: 'ngdialog-theme-default classroom-alert-modal', data: {type: "ERROR", msg: err}});

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

      console.log("ORIGINAL PATHHHHHH")
      console.log(originalPath)

      scope.originalPath = originalPath;

      scope.actionMenu = false;

      scope.actionMenuToggle = function() {

        console.log("Open action menu")

        if (scope.actionMenu) {
          scope.actionMenu = false;
        } else {
          scope.actionMenu = true;
        }

      }

    }
    //END Courses.getModuleById()

  }
}])

.controller('FooterCtrl', ['$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', 'Courses', 'University', 'Playlist', 'Forum', 'User', '$window', function($rootScope, $scope, $location, $route, $localStorage, Students, ngDialog, Courses, University, Playlist, Forum, User, $window) {

  console.log("Fooooterr");

  let url = $route.current;
  let originalPath = url.$$route.originalPath;

  console.log("ORIGINAL PATHHHHHH")
  console.log(originalPath)

  $scope.originalPath = originalPath;

}])

.controller('HomeExploreCtrl', ['$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', 'Courses', 'University', 'Playlist', 'Forum', 'User', '$window', 'Knowledge', function($rootScope, $scope, $location, $route, $localStorage, Students, ngDialog, Courses, University, Playlist, Forum, User, $window, Knowledge) {

  let id = $route.current.params.videoid;

  $scope.courseId = id;

  let url = $route.current;
  let originalPath = url.$$route.originalPath;

  $scope.originalPath = originalPath;

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
    console.log(res);
    $scope.courses = res.data;

  });

  /* */
  $scope.actionMenuDisplay = false;

  $scope.open = function() {

    if ($scope.actionMenuDisplay) {
      $scope.actionMenuDisplay = false;
    } else {
      $scope.actionMenuDisplay = true;
    }

  }
  /* */


  /* LEARNING TAB */
  $scope.learningTabActive = 'paths';


}])

/* course module */

.controller('CoursesDashboardMenuCtrl', ['$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', 'Courses', 'University', 'Playlist', 'Forum', 'User', '$window', function($rootScope, $scope, $location, $route, $localStorage, Students, ngDialog, Courses, University, Playlist, Forum, User, $window) {

  //let id = $route.current.params.videoid;
  let id = $route.current.params.id;
  //if(!$attrs.model)  $scope.courseId=id; else $scope.courseId=$attrs

  $scope.courseId = id;
  $rootScope.courseId = id;
  let url = $route.current;
  let originalPath = url.$$route.originalPath;

  $scope.originalPath = originalPath;

  $scope.estudar = function() {
    console.log("opaaa")
    $window.open('/cursos/id/' + id + '/estudar', "popup", "width=1500,height=700,left=100,top=150");
  }

}])
.controller('CoursesCreateContentCtrl', ['$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', 'Courses',
function($rootScope, $scope, $location, $route, $localStorage, Students, ngDialog, Courses) {
  $scope.moduleId = $scope.ngDialogData.moduleId;
  console.log('$scope', $scope.moduleId);
    alert("ananth")
}])
.controller('CoursesCreatePageCtrl', ['$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', 'Courses', function($rootScope, $scope, $location, $route, $localStorage, Students, ngDialog, Courses) {

}])

.controller('CoursesEstudarCtrl', ['$cookies','User','$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', 'Courses', 'University', 'Playlist', 'Forum', 'User',function($cookies,User,$rootScope, $scope, $location, $route, $localStorage, Students, ngDialog, Courses, University, Playlist, Forum, Users) {
  let id = $route.current.params.id;

   $scope.courseId=id;
   $scope.access=false;

   let type=$cookies.get("type");
   let cid=$cookies.get("content_id");
   let post_id=$cookies.get("post_id");
   var url="/cursos/id/";
   $scope.type=type;

   $scope.cid=cid;
   $scope.post_id=post_id;
   $scope.id=id;
   $rootScope.$emit('childEmit', $scope.cid);
   if(type=="videos")
     url=url+"watch/videos/"
   else if(type=="document")
     url=url+"view/document/"
   else
     url=url+"test/quiz/"
   $scope.url=url+$scope.courseId+"/"+cid+"/"+post_id
   Courses.getById(id).success(function(msg){
     $scope.course=msg.data;
     if(msg.data.free==true) $scope.access=true;
     let mem=msg.data.members;
     if(mem.indexOf(User.getId())>=0)
     $scope.access=true;
     if($scope.access==false)
     $location.path('/cursos/id/'+res.data._id);

   },function error(response) {
     $location.path('/home/cursos');
   })
}])
.controller('CoursesEstudarTypeDocumentCtrl', ['Courses','$rootScope', '$scope', '$location', '$route', 'University', 'Videos', '$sce', 'User', 'Forum', 'Students', 'ngDialog', '$localStorage', 'jwtHelper', function(Courses,$rootScope, $scope, $location, $route, University, Videos, $sce, User, Forum, Students, ngDialog, $localStorage, jwtHelper) {


  //let id = $route.current.params.id;
  let id=$scope.id;
   $scope.courseId=id;
   $scope.access=false;
   Courses.getById(id).success(function(msg){
     console.log(msg)
     $scope.course=msg.data;
     if(msg.data.free==true) $scope.access=true;
     let mem=msg.data.members;
     if(mem.indexOf(User.getId())>=0)
     $scope.access=true;
     if($scope.access==false)
       $location.path('/cursos/id/'+res.data._id);
   },function error(response) {
     $location.path('/home/cursos');
   })
  //let videoId = $route.current.params.videoid;
  let videoId=$scope.cid;
  //let post_id = $route.current.params.post_id;
  let post_id= $scope.post_id;
  console.log("HELLLOOOOOOOO")

  //let player = angular.element(element.find("video")[0]).get(0);

  let viewers = {};

  let logged = $rootScope.logged;

  Courses.getContentModuleById(videoId).success(function(res) {

      $scope.contentData=res.data;

    Forum.getForumPostById(post_id,$scope.contentData.universityId).success(function(res) {

          let status = res.status;

          if (status == 90010) {

            //$location.path('/home');

          } else {

            $scope.video = res.data;

            console.log($scope.video)

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
                      //

                    }
                    //END for

                  }
                  //END viewers

                }
                //END logged

              }
              //END indexOf('mp4')

            }
            //END $scope.video

          }

              // FIX

              let payload = { timeWatched : timeWatched };

              Courses.progress(payload, videoId).success(function(res) {

                console.log("time viewed updated")
                console.log(res);

              });
              //END update progress

      });
      //END pages Forum.getById

    });
    //END getContentModuleById

}])
.controller('CoursesQuizResultCtrl', ['Courses','$rootScope', '$scope', '$location', '$route', 'University', 'Videos', '$sce', 'User', 'Forum', 'Students', 'ngDialog', '$localStorage', 'jwtHelper', function(Courses,$rootScope, $scope, $location, $route, University, Videos, $sce, User, Forum, Students, ngDialog, $localStorage, jwtHelper) {
   let qid = $route.current.params.qid;
   let uid = $route.current.params.uid;
   let rid = $route.current.params.rid;
   Courses.getquizResult(qid,uid,rid).success(function(msg){
   if(msg.status==1) {$scope.view=1;
   $scope.first=msg.first;
   $scope.data=msg.data;
   $scope.correct=msg.first.resultsView.find(x=>(x.ans_status));
   $scope.cor=0;
   if($scope.correct) $scope.cor=$scope.correct.length;
   }else $scope.view=0;
   $scope.showresultPreview=function()
   {
     ngDialog.open({
      template: 'partials/courses/quiz/quizPreview.html',
      controller: 'CoursesQuizResultViewCtrl',
      className: 'ngdialog-theme-default',
      data : {title:$scope.data.title, "questions" : $scope.data.questions,result:$scope.first },
      closeByNavigation: true,
      width: '70%',

    });
   }
   }).error(function(msg){
     console.log(msg)
   })
 }])
.controller('CoursesQuizResultViewCtrl', ['Courses','$rootScope', '$scope', '$location', '$route', 'University', 'Videos', '$sce', 'User', 'Forum', 'Students', 'ngDialog', '$localStorage', 'jwtHelper', function(Courses,$rootScope, $scope, $location, $route, University, Videos, $sce, User, Forum, Students, ngDialog, $localStorage, jwtHelper) {
   $scope.questions=$scope.ngDialogData.questions;
   $scope.result=$scope.ngDialogData.result;
   $scope.title=$scope.ngDialogData.title;
   $scope.indexQ=0;
   $scope.question={}
   $scope.showQuestion=function(index){
    $scope.question=$scope.questions[index]
    $scope.res=$scope.result.resultsView.find(x=>x.ques_id==$scope.question.qes_id)
   $scope.cor=5;
   if($scope.res.answer==$scope.view_ans) $scope.cor=$scope.ques_id;
   }
   $scope.showQuestion($scope.indexQ);
   $scope.showNext=function()
   {
     if(parseInt($scope.indexQ+1)<$scope.questions.length){
     $scope.indexQ++;
     $scope.showQuestion($scope.indexQ);
     }
      else
      alert("Click Prev")
   }
   $scope.showPrev=function()
   {
     if($scope.indexQ>0){
     $scope.indexQ--;
     $scope.showQuestion($scope.indexQ);
      }
      else
      alert("Click Next")
   }
 }])
.controller('CoursesEstudarTypeQuizCtrl', ['Courses','$rootScope', '$scope', '$location', '$route', 'University', 'Videos', '$sce', 'User', 'Forum', 'Students', 'ngDialog', '$localStorage', 'jwtHelper', function(Courses,$rootScope, $scope, $location, $route, University, Videos, $sce, User, Forum, Students, ngDialog, $localStorage, jwtHelper) {

  //let id = $route.current.params.id;
  let id=$scope.id;
   $scope.courseId=id;
   $scope.access=false;
   Courses.getById(id).success(function(msg){
     console.log(msg)
     $scope.course=msg.data;
     if(msg.data.free==true) $scope.access=true;
     let mem=msg.data.members;
     if(mem.indexOf(User.getId())>=0)
     $scope.access=true;
     if($scope.access==false)
       $location.path('/cursos/id/'+res.data._id);
   },function error(response) {
     $location.path('/home/cursos');
   })
  //let videoId = $route.current.params.videoid;
  let videoId=$scope.cid;
  //let post_id = $route.current.params.post_id;
  let post_id= $scope.post_id;
  console.log("HELLLOOOOOOOO")

  //let player = angular.element(element.find("video")[0]).get(0);

  let viewers = {};

  let logged = $rootScope.logged;
  $scope.quesNo = 0;
  $scope.quesArr = [];
  $scope.quizResult = [];
  $scope.questionIndex=1;
  $scope.finalquestion=false;
  Courses.getQuestionsByQuizId(videoId).success(function(res) {
      if(res.success) {
      $scope.contentData=res.data;
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
    console.log('select option', optionNumber);

    $scope.selectedOption = optionNumber;

    $scope.clearSelectionColor();

    let selection = document.getElementById('op'+optionNumber);
    selection.style.backgroundColor = '#a6e1f3';

  }
  $scope.saveQuizSubmit= function(descriptiveAnswer)
  {

    $scope.descriptiveAnswer=descriptiveAnswer;

    if(!$scope.selectedOption && !$scope.descriptiveAnswer)
    {
      alert("answer  your questions")
    }
    else
    {
      let data={}
      if($scope.question.title_type == 'mcq') {
      data = {
        ques_id: $scope.question.qes_id,
        answer: $scope.selectedOption
      }
    }else if($scope.question.title_type == 'descriptive') {
      data = {
        ques_id: $scope.question.qes_id,
        answer: $scope.descriptiveAnswer
      }
    }
    $scope.quizResult[$scope.quesNo]=data
      let formData={
        quiz_id:videoId,
        answers:$scope.quizResult
      }
      Courses.saveQuizResult(formData).success(function(msg)
      {
        let res=msg.data;
        $location.path("/quiz-result/"+res._id+"/"+res.quiz_id+"/"+res.user)
      }).error(function(msg){
        alert("try again")
      })
    }
  }
 $scope.nextQues = function() {
    $scope.questionIndex=parseInt($scope.quesNo+1)
    if($scope.quesArr.length>$scope.questionIndex){
    console.log('next ques '+' '+$scope.questionIndex);
    let data = {};

    if($scope.question.title_type == 'mcq') {
      data = {
        ques_id: $scope.question.qes_id,
        answer: $scope.selectedOption
      }
    }else if($scope.question.title_type == 'descriptive') {
      data = {
        ques_id: $scope.question.qes_id,
        answer: $scope.descriptiveAnswer
      }
    }

    $scope.quizResult[$scope.quesNo]=data;

    console.log('quiz result', $scope.quizResult);


    // clear color of all option
    $scope.clearSelectionColor();

    let  openAgain=$scope.quizResult[$scope.questionIndex];
    if(openAgain)
    {
    $scope.selectedOption=openAgain.answer
    $scope.descriptiveAnswer=openAgain.answer
    }
    else
    {
    // uncheck from selected checkbox
    $scope.selectedOption = undefined;

    // reset descriptive answer
    $scope.descriptiveAnswer = undefined;
    }
    // increase question number


    $scope.quesNo++;
     if($scope.quesArr.length==parseInt($scope.quesNo+1))
      $scope.finalquestion=true
     else
       $scope.finalquestion=false;
    // reset question variable with next question in quesArr
    $scope.question = $scope.quesArr[$scope.quesNo];
    }

  }

  $scope.prevQues = function() {
    $scope.questionIndex=parseInt($scope.quesNo-1)
    if($scope.quesArr.length>$scope.questionIndex && $scope.questionIndex>=0){
    console.log('next ques '+' '+$scope.questionIndex);
    $scope.quesNo--;
    $scope.question = $scope.quesArr[$scope.quesNo];
    let data = $scope.quizResult[$scope.quesNo];

    if($scope.question.title_type == 'mcq') {
      $scope.selectOption(data.answer)

    }else if($scope.question.title_type == 'descriptive') {

        $scope.descriptiveAnswer=data.answer
      }
     $scope.quizResult[$scope.quesNo]=data

    console.log('quiz result', $scope.quizResult);


    // clear color of all option
    $scope.clearSelectionColor();
    // uncheck from selected checkbox
    //$scope.selectedOption = undefined;

    // reset descriptive answer
    //$scope.descriptiveAnswer = undefined;

    // increase question number



     $scope.finalquestion=false;
    // reset question variable with next question in quesArr
    //$scope.question = $scope.quesArr[$scope.quesNo];
    }
  }
}])
.controller('CoursesEstudarTypeVideoIdCtrl', ['$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', 'Courses', 'University', 'Playlist', 'Forum', 'User', function($rootScope, $scope, $location, $route, $localStorage, Students, ngDialog, Courses, University, Playlist, Forum, User) {
   let id = $route.current.params.id;
   $scope.courseId=id;
   $scope.access=false;
   Courses.getById(id).success(function(msg){
     $scope.course=msg.data;
     if(msg.data.free==true) $scope.access=true;
     let mem=msg.data.members;
     if(mem.indexOf(User.getId())>=0)
     $scope.access=true;
     if($scope.access==false)
       $location.path('/cursos/id/'+res.data._id);
   },function error(response) {
     $location.path('/home/cursos');
   })
}])


.controller('CoursesByIdDashboardModuloCtrl', ['$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', 'Courses', 'University', 'Playlist', 'Forum', 'User', function($rootScope, $scope, $location, $route, $localStorage, Students, ngDialog, Courses, University, Playlist, Forum, User) {
   let id = $route.current.params.id;
   $scope.courseId=id;
   $scope.access=false;
   Courses.getById(id).success(function(msg){
     $scope.course=msg.data;
     if(msg.data.free==true) $scope.access=true;
     let mem=msg.data.members;
     if(mem.indexOf(User.getId())>=0)
     $scope.access=true;
     if($scope.access==false)
       $location.path('/cursos/id/'+res.data._id);
   },function error(response) {
     $location.path('/home/cursos');
   })
}])

.controller('CoursesEstudarCtrl', ['$cookies','User','$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', 'Courses', 'University', 'Playlist', 'Forum', 'User',function($cookies,User,$rootScope, $scope, $location, $route, $localStorage, Students, ngDialog, Courses, University, Playlist, Forum, Users) {
  let id = $route.current.params.id;

   $scope.courseId=id;
   $scope.access=false;

   let type=$cookies.get("type");
   let cid=$cookies.get("content_id");
   let post_id=$cookies.get("post_id");
   var url="/cursos/id/";

   if(type=="videos")
     url=url+"watch/videos/"
   else if(type=="document")
     url=url+"view/document/"
   else
     url=url+"test/quiz/"
   $scope.url=url+$scope.courseId+"/"+cid+"/"+post_id
   Courses.getById(id).success(function(msg){
     $scope.course=msg.data;
     if(msg.data.free==true) $scope.access=true;
     let mem=msg.data.members;
     if(mem.indexOf(User.getId())>=0)
     $scope.access=true;
     if($scope.access==false)
     $location.path('/cursos/id/'+res.data._id);

   },function error(response) {
     $location.path('/home/cursos');
   })
}])

.controller('CoursesByIdDashboardCtrl', ['$document','$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', 'Courses', 'University', 'Playlist', 'Forum', 'User', function($document,$rootScope, $scope, $location, $route, $localStorage, Students, ngDialog, Courses, University, Playlist, Forum, User) {
   let id = $route.current.params.id;
   $scope.courseId=id;
   $scope.access=false;

   $scope.timelines=[];
   $scope.course={}
   Courses.getById(id).success(function(msg){
     if(msg.data.free==true) $scope.access=true;
     let mem=msg.data.members;
     if(mem.indexOf(User.getId())>=0)
     $scope.access=true;
     if($scope.access==false)
       $location.path('/cursos/id/'+res.data._id);
       $scope.course=msg.data;
        $scope.get();
   },function error(response) {
     $location.path('/home/cursos');
   })
   $scope.get= function()
   {
     Courses.getTimeline($scope.courseId).success(function(res){
          $scope.timelines=res.data;
     }).error(function(msg){

            alert("request alert")
     })
   }

   $scope.save= function(dd)
   {
     //$scope.description=angular.element('#trix-input-1').val()

     Courses.insertTimeline($scope.courseId,{description:dd}).success(function(res){
          $scope.timelines.unshift(res.data)
          angular.element(
                   $document[0].querySelector('trix-editor')).find("div").html('');

     }).error(function(msg){
        alert("request alert")
     })
   }
}])

.controller('CoursesContentCreateCtrl', ['Videos','$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', 'Courses', 'University', 'Playlist', 'Forum', 'User', function(Videos,$rootScope, $scope, $location, $route, $localStorage, Students, ngDialog, Courses, University, Playlist, Forum, User) {

  $scope.page = 'universitySelect';

  let universityId;

  console.log($scope.ngDialogData);



}])

.controller('CoursesModulosByIdCtrl', ['$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', 'Courses', function($rootScope, $scope, $location, $route, $localStorage, Students, ngDialog, Courses) {

  $scope.page = false;

  $scope.activeSection = "modulos";

  let moduleId = $route.current.params.id;

  /* */

  //ngDialog.open({ template: 'partials/courses/modals/contentcreate.html', controller: 'CoursesContentCreateCtrl', className: 'ngdialog-theme-default' });

  $scope.conteudocriar = function() {
alert('f')
    ngDialog.open({
      template: 'partials/courses/modals/createContent.html',
      controller: 'CoursesCreateContentCtrl',
      className: 'ngdialog-theme-default',
      data : { "universityId" : "fdasdfa" },
      closeByNavigation: true,
      width: '70%',
      data: {
        moduleId: moduleId
      }
    });
  }
 $scope.openDeletePopup = function() {
    console.log('delete module', moduleId);

    ngDialog.open({
      template: 'deleteModulePopup',
      controller: 'CoursesModulosByIdCtrl',
      width: '50%',
      height: '40%',
      className: 'ngdialog-theme-default'
    });
  }

  $scope.deleteModule = function() {
    console.log('delete course', moduleId);
    $scope.deleteLoading = true;

    Courses.deleteModuleById(moduleId).success(function(res) {
      console.log('delete module res', res);

      if(res.success) {
        $scope.deleteLoading = false;
        ngDialog.close();
        $location.path('/cursos/suite/modulos');
      }
    });


  }

  $scope.closePopup = function() {
    console.log('close');
    ngDialog.close();
  }
  /* save order id */

  $scope.saveModule = function() {

    let neworder = [];

    for (let idx = 0; idx < $scope.module.content.length; idx++) {
      let content = { order : idx, modelId : $scope.module.content[idx]._id };
      neworder.push(content)
    }

    console.log(neworder)

    let formdata = {
      corder : JSON.stringify(neworder)
    };

    Courses.updateModuleById(moduleId, formdata).success(function(res) {

      console.log(res)

      if (res.success) {

        alert("success while updating")

        $scope.modules = res.data;

      }

    });
    //END Courses.getCoursesByAccount()

  }

  /* */
  $scope.dragControlListeners = {
    itemMoved: function (event) {
      console.log("item moved")
      console.log(event)
      $scope.moduleNewOrder = event.dest.sortableScope.modelValue;
    },
    orderChanged: function(event) {
      console.log("order changed")
    },
    containment: '#board1',
    containerPositioning : 'relative'
  };

  $scope.dragControlListeners1 = {
    containment: '#board2',
    orderChanged: function(event) {

      console.log("order changed 2 ")
      console.log(event)

    },
    itemMoved: function (event) {
      console.log("item moved 2")
      console.log(event)
    },
    allowDuplicates: true,
    containerPositioning : 'relative'
  };

  Courses.getModuleById(moduleId).success(function(res) {

    console.log(res)

    if (res.success) {

      $scope.module = res.data;

    }

  });
  //END Courses.getCoursesByAccount()

  Courses.getContentModulesByAccount().success(function(res) {

    console.log(res)

    if (res.success) {

      $scope.modulesByAccount = res.data;
      //$location.path('/cursos/suite');

    }

  });
  //END Courses.getCoursesByAccount()

}])

.controller('CoursesModulosCtrl', ['$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', 'Courses', function($rootScope, $scope, $location, $route, $localStorage, Students, ngDialog, Courses) {

  $scope.page = false;

  $scope.activeSection = "modulos";

  Courses.getModulesByAccount().success(function(res) {

    console.log(res)

    if (res.success) {

      $scope.modules = res.data;
      //$location.path('/cursos/suite');

    }

  });
  //END Courses.getCoursesByAccount()
  $scope.updateModule = function(moduleData) {
    console.log('module data', moduleData);

    ngDialog.open({ template: 'partials/courses/modals/updateModule.html',data:{moduleData: moduleData}, controller: 'CoursesUpdateModuleCtrl', className: 'ngdialog-theme-default' });
  }
}])
.controller('CoursesModulossingleCtrl', ['$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', 'Courses', function($rootScope, $scope, $location, $route, $localStorage, Students, ngDialog, Courses) {

  $scope.page = false;

  $scope.activeSection = "modulos";

  let id = $route.current.params.id;
  Courses.getById(id).success(function(res) {

    console.log(res)

    if (res.success) {

      $scope.modules = res.data;
      //$location.path('/cursos/suite');

    }

  });
  //END Courses.getCoursesByAccount()

}])
.controller('CoursesContentModulosCtrl', ['$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', 'Courses', function($rootScope, $scope, $location, $route, $localStorage, Students, ngDialog, Courses) {

  $scope.page = false;

  $scope.activeSection = "content";
  $scope.conteudocriar = function() {
    ngDialog.open({width: '70%', template: 'partials/courses/modals/createContent.html', controller: 'CoursesContentCreateCtrl', className: 'ngdialog-theme-default', data : { "universityId" : "fdasdfa" } });
  }
  Courses.getContentModulesByAccount().success(function(res) {

    console.log(res)

    if (res.success) {

      $scope.modulesByAccount = res.data;
      console.log(res.data)
      //$location.path('/cursos/suite');

    }

  });
  //END Courses.getCoursesByAccount()
  $scope.updateContent = function(contentData) {
    console.log('content data', contentData);
    if(contentData.contentType == 'page') {
      $location.path("/cursos/suite/editPage/"+contentData._id)
    }
    if(contentData.contentType == 'quiz') {
      console.log('quiz');

      localStorage.setItem('updateQuizData', JSON.stringify(contentData));
      $location.path('/cursos/suite/updateQuiz/'+ contentData._id);
    }
  }
  $scope.openDeletePopup = function(contentId) {
    console.log('delete content', contentId);
    $scope.contentId = contentId;


    ngDialog.open({
      template: 'deleteContentPopup',
      controller: 'CoursesContentModulosCtrl',
      data: {contentId: contentId},
      width: '50%',
      height: '40%',
      className: 'ngdialog-theme-default'
    });
  }
$scope.deleteContent = function() {
    let contentId = $scope.ngDialogData.contentId;
    console.log('delete content', contentId);
    $scope.deleteLoading = true;
    Courses.deleteContentById(contentId).success(function(res) {
      console.log('delete content res', res);

      if(res.success) {
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


}])

.controller('CoursesOwnerCtrl', ['$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', 'Courses', function($rootScope, $scope, $location, $route, $localStorage, Students, ngDialog, Courses) {

  $scope.page = false;

  $scope.activeSection = "owner";
  $scope.moduleCreate = function(id) {

    ngDialog.open({ template: 'partials/courses/modals/modulecreate.html',data:{id:id}, controller: 'CoursesModulosCriarCtrl', className: 'ngdialog-theme-default' });
  }
   $scope.addInstructors = function(universityId, courseId,members) {
    console.log('add instructor', universityId);
    console.log('add courseid', courseId);


    ngDialog.open({ template: 'partials/courses/modals/addInstructors.html',data:{universityId: universityId, courseId: courseId,members:members}, controller: 'CoursesAddInstructorsCtrl', className: 'ngdialog-theme-default' });

  }

  $scope.editCourse = function(courseData) {
    console.log('add courseid', courseData);

    ngDialog.open({ template: 'partials/courses/modals/updateCourse.html',data:{courseData: courseData}, controller: 'CoursesUpdateCtrl', className: 'ngdialog-theme-default' });

  }
  $scope.openDeletePopup = function(courseId) {
    console.log('delete course', courseId);

    ngDialog.open({
      template: 'deleteCoursePopup',
      controller: 'CoursesOwnerCtrl',
      data: {courseId: courseId},
      width: '50%',
      height: '40%',
      className: 'ngdialog-theme-default'
    });

  }

  $scope.deleteCourse = function() {
    let courseId = $scope.ngDialogData.courseId
    console.log('delete course', courseId);
    $scope.deleteLoading = true;

    Courses.deleteCourseById(courseId).success(function(res) {
      console.log('delete course res', res);

      if(res.success) {
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
  Courses.getCoursesByAccount().success(function(res) {

    console.log(res)

    if (res.success) {

      $scope.courses = res.data;
      //$location.path('/cursos/suite');

    }

  });
  //END Courses.getCoursesByAccount()

}])
.controller('CoursesAddInstructorsCtrl', ['$rootScope', '$scope', '$location', '$route', '$localStorage', 'ngDialog', 'Courses', 'University', function($rootScope, $scope, $location, $route, $localStorage, ngDialog, Courses, University) {

  let universityId = $scope.ngDialogData.universityId;
  let courseId = $scope.ngDialogData.courseId;
  $scope.selectedMember=$scope.ngDialogData.members
  if(!$scope.selectedMember) $scope.selectedMember=[];
  console.log($scope.selectedMember);

  University.getUniversityById(universityId).success(function(res) {

    console.log('university res', res)

    if (res.success) {

      $scope.university = res.data;

    }
  });
  $scope.pushMembers=function(mem,t)
  {
    //$scope.selectedMember.inArray(mem);
    let inn=$scope.selectedMember.indexOf(mem);
    if(inn<0)
    $scope.selectedMember.push(mem)
    else
    {
      $scope.selectedMember.splice(inn,1)
    }
  }
  $scope.save = function() {

    if($scope.selectedMember != undefined && $scope.selectedMember.length>0) {
      Courses.addInstructor(courseId, $scope.selectedMember).success(function(res) {
        console.log('instructor res', res);

        if(res.success) {
          ngDialog.close();
        }

      });
    }
  }

}])

.controller('CoursesUpdateCtrl', ['$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', 'Courses', 'Knowledge', function($rootScope, $scope, $location, $route, $localStorage, Students, ngDialog, Courses, Knowledge) {
  console.log('update course controller');
  $scope.courseData = $scope.ngDialogData.courseData;

  console.log('cData', $scope.courseData);

  $scope.title = $scope.courseData.title;

  $scope.selectedKnowledge = $scope.courseData.knowledgeId;

  if($scope.courseData.free == false){
    $scope.free = false;
    $scope.preco = $scope.courseData.price;
  } else {
    $scope.free = true;
  }

  $scope.description = $scope.courseData.description;

  Knowledge.getAllPaginated().success(function(res){
    console.log('knowledge res', res);

    if(res.success){
      $scope.knowledge = res.data.docs;
    }
  });

  $scope.updateCourse = function() {
    let formdata = {
      title : $scope.title,
      description : $scope.description,
      knowledgeId: $scope.selectedKnowledge,
      // university: $scope.courseData.university
    };

    if ($scope.free == undefined) {
      console.log("error, undefined")
      error = true;
    } else {
      formdata.free = $scope.free;
    }

    if ($scope.free == false) {
      formdata.price = $scope.preco;
    }

    console.log('updated data', formdata);

    Courses.updateCourse($scope.courseData._id, formdata).success(function(res) {
      console.log('update course res', res);

      if(res.success == true) {
        ngDialog.close();
        $route.reload();
      }
    });

  }

}])

.controller('CoursesUpdateModuleCtrl', ['$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', 'Courses', function($rootScope, $scope, $location, $route, $localStorage, Students, ngDialog, Courses) {
  console.log('update module controller');
  $scope.moduleData = $scope.ngDialogData.moduleData;

  console.log('mData', $scope.moduleData);

  $scope.title = $scope.moduleData.title;
  $scope.duration = $scope.moduleData.duration;
  $scope.goal = $scope.moduleData.goal;
  $scope.description = $scope.moduleData.description;

  $scope.updateModule = function() {
    let formData = {
      title: $scope.title,
      description: $scope.description,
      goal: $scope.goal,
      duration: $scope.duration
    }

    console.log('updated data', formData, $scope.moduleData._id);

    Courses.updateModule($scope.moduleData._id, formData).success(function(res) {
      console.log('module update res', res);

      if(res.success == true) {
        ngDialog.close();
        $route.reload();
      }
    });
  }

}])
.controller('CoursesEditPageCtrl', ['$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', 'Courses', function($rootScope, $scope, $location, $route, $localStorage, Students, ngDialog, Courses) {
  let id=$route.current.params.id;
  $scope.activeSection = "createPage";
  $scope.idd='';
  Courses.getContentModuleById(id).success(function(res){
  $scope.tinymceModel = res.data.text
  $scope.title=res.data.title;
  $scope.idd=res.data.moduleId;
  $scope.tinymceOptions = {
  file_picker_types: 'file image media',
  tinydrive_token_provider: function (success, failure) {
     Courses.fileUploadUrl().success(function(msg){


     success({ token: msg.token });
     })
     // failure('Could not create a jwt token')
  },
  tinydrive_google_drive_key:"carbisa-document-upload@carbisa.iam.gserviceaccount.com",
  tinydrive_google_drive_client_id:'102507978919142111240',
  plugins: 'print preview powerpaste casechange importcss tinydrive searchreplace autolink autosave save directionality advcode visualblocks visualchars fullscreen image link media mediaembed  codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists checklist wordcount tinymcespellchecker a11ychecker textpattern noneditable help formatpainter pageembed charmap mentions quickbars linkchecker emoticons advtable',
  toolbar: 'insertfile|undo redo | bold italic | alignleft aligncenter alignright | code|styleselect|outdent indent|link image'
  };
  }).error(function(msg){
     alert("Error")
     $location.path("/home/cursos")
  })



  $scope.saveContent = function() {

     Courses.savePage({text:$scope.tinymceModel,contentType:'page',title:$scope.title},id).
     success(function(res){
         $location.path("/cursos/suite/content")
     }).error(function(er){
        alert(er)
     })
  };


}])
.controller('CoursesCreatePageCtrl', ['$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', 'Courses', function($rootScope, $scope, $location, $route, $localStorage, Students, ngDialog, Courses) {
  $scope.activeSection = "createPage";
  $scope.tinymceModel = 'Initial content';



  $scope.saveContent = function() {

     Courses.createPage({text:$scope.tinymceModel,contentType:'page',title:$scope.title,moduleId:$route.current.params.id}).
     success(function(res){
         $location.path("/cursos/suite/modulos/id/"+$route.current.params.id)
     }).error(function(er){
        alert(er)
     })
  };

  $scope.tinymceOptions = {
  file_picker_types: 'file image media',
  tinydrive_token_provider: function (success, failure) {
     Courses.fileUploadUrl().success(function(msg){


     success({ token: msg.token });
     })
     // failure('Could not create a jwt token')
  },
  tinydrive_google_drive_key:"carbisa-document-upload@carbisa.iam.gserviceaccount.com",
  tinydrive_google_drive_client_id:'102507978919142111240',
  plugins: 'print preview powerpaste casechange importcss tinydrive searchreplace autolink autosave save directionality advcode visualblocks visualchars fullscreen image link media mediaembed  codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists checklist wordcount tinymcespellchecker a11ychecker textpattern noneditable help formatpainter pageembed charmap mentions quickbars linkchecker emoticons advtable',
  toolbar: 'insertfile|undo redo | bold italic | alignleft aligncenter alignright | code|styleselect|outdent indent|link image'
  };
}])

.controller('CoursesCreateQuizCtrl', ['$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', 'Courses', function($rootScope, $scope, $location, $route, $localStorage, Students, ngDialog, Courses) {
  $scope.activeSection = "createQuiz";
  $scope.quesArr = [];
  $scope.quesNumber = 0;
  $scope.q = null;

  let moduleId = $route.current.params.id;

  console.log('moduleId', moduleId);

  $scope.createQuiz = function() {
    console.log('create quiz valid', $scope.createQuizForm.$valid);
    console.log('description valid', ($scope.quizDescription != undefined && $scope.quizDescription != ''));


    if(($scope.quizDescription != undefined && $scope.quizDescription != '') && $scope.createQuizForm.$valid) {
      $scope.createQuizLoading = true;

      let data = {
        modleId: moduleId,
        title: $scope.quizTitle,
        contentType: 'quiz',
        description: $scope.quizDescription
      }
      console.log('quiz data', data);

      Courses.createQuiz(data).success(function(res){
        console.log('create quiz res', res);
        if(res.success) {
          $scope.createQuizLoading = false;
          $scope.addQuestions = true;
          console.log('quiz id created', res.data._id);
          $scope.contentId = res.data._id;
        }

      });
    }
  }

  $scope.selectType = function(type, index) {
    console.log('selectType', type, index);

    if(type == 'mcq'){
      console.log('mcq part');

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
      console.log('descriptive part');

      // $scope.
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
    console.log('add new question valid', $scope.quizForm.$valid);

    // console.log('form valid', $scope.quizForm.$valid);
    $scope.showSelection = "true"

    if($scope.quizForm.$valid) {
      console.log('add question');
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

      $scope.$evalAsync(function(){

        $scope.quesArr.push(q);

        console.log('array', $scope.quesArr);
      })
    }
  }

  $scope.saveQuiz = function() {
    console.log('save valid', $scope.quizForm.$valid);

    if($scope.quizForm.$valid) {
      $scope.addQuesLoading = true;

      console.log('final questions', $scope.quesArr);

      let quesData = {
        data: $scope.quesArr
      }

      Courses.addQuizQuestions($scope.contentId, quesData).success(function(res){
        console.log('ques api res', res);

        if(res.success) {
          $scope.addQuesLoading = false;
          $location.path('/cursos/suite/content');
        }
      });
    }
  }
}])
.controller('CoursesUpdateQuizCtrl', ['$sce','User','$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', 'Courses', function($sce,User,$rootScope, $scope, $location, $route, $localStorage, Students, ngDialog, Courses) {

  $scope.quizData = JSON.parse(localStorage.getItem('updateQuizData'));

  $scope.quizTitle = $scope.quizData.title;
  $scope.quizDescription = $scope.quizData.description;

  $scope.updateQuiz = function() {
    console.log('update quiz title', );

    if(($scope.quizDescription != undefined && $scope.quizDescription != '') && $scope.createQuizForm.$valid) {
      $scope.createQuizLoading = true;

      let data = {
        title: $scope.quizTitle,
        description: $scope.quizDescription
      }
      console.log('updated quiz data', data);

      Courses.updateQuiz($scope.quizData._id, data).success(function(res){
        console.log('create quiz res', res);
        if(res.success) {
          $scope.createQuizLoading = false;
          $scope.addQuestions = true;
          console.log('quiz id created', res.data._id);
          // $scope.contentId = res.data._id;

          for(let i=0; i < $scope.quizData.questions.length; i++) {
            $scope.quizData.questions[i]['ques_options'] = $scope.quizData.questions[i]['qes_options'];
            delete $scope.quizData.questions[i]['qes_options'];
            $scope.quizData.questions[i].answer = $scope.quizData.answers[i].answer;
          }

          $scope.quesArr = $scope.quizData;
          console.log('quiz data fetch', $scope.quizData);

        }

      });
    }
  }


  $scope.selectType = function(type, index) {
    console.log('selectType', type, index);

    if(type == 'mcq'){
      console.log('mcq part');

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
      console.log('descriptive part');

      // $scope.
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
    console.log('add new question valid', $scope.quizForm.$valid);

    // console.log('form valid', $scope.quizForm.$valid);
    $scope.showSelection = "true"

    if($scope.quizForm.$valid) {
      console.log('add question');
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

      $scope.$evalAsync(function(){

        $scope.quesArr.questions.push(q);

        console.log('array', $scope.quesArr.questions);
      })
    }
  }

  $scope.saveQuiz = function() {
    console.log('save valid', $scope.quizForm.$valid);

    if($scope.quizForm.$valid) {
      $scope.addQuesLoading = true;

      console.log('final questions', $scope.quesArr.questions);

      let quesData = {
        data: $scope.quesArr.questions
      }

      Courses.addQuizQuestions($scope.quizData._id, quesData).success(function(res){
        console.log('ques api res', res);

        if(res.success) {
          $scope.addQuesLoading = false;
          $location.path('/cursos/suite/content');
        }
      });
    }
  }

}])

.controller('CoursesByIdCtrl', ['$sce','User','$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', 'Courses', function($sce,User,$rootScope, $scope, $location, $route, $localStorage, Students, ngDialog, Courses) {

  $scope.page = false;

  let id = $route.current.params.id;

  $scope.activeSection = "comprados";
  $scope.useraccess=false
  Courses.getById(id).success(function(res) {

    console.log('course res', res)

    if (res.success) {

      $scope.course = res.data;
      let mem=res.data.members;
      if(mem.indexOf(User.getId())>=0)
        $scope.useraccess=true;
      $sce.trustAsHtml($scope.course)
      //$location.path('/cursos/suite');

    }

  });
  //END Courses.getCoursesByAccount()

  $scope.openPaymentDialog = function() {
    let plan = { amount : $scope.course.price, currency : $scope.course.currency, name : $scope.course.title };

    console.log('open dialog');
      ngDialog.open({
        template: 'partials/courses/modals/payments.html',
        controller: 'CoursesPaymentsCtrl',
        className: 'ngdialog-theme-default',
        closeByDocument: false,
        closeByEscape: false,
        closeByNavigation: true,
        data : { plan : plan, course: $scope.course, accountId: $scope.course.accountId }
      });
  }

}])

.controller('CoursesSuiteIndexCtrl', ['$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', 'Courses', function($rootScope, $scope, $location, $route, $localStorage, Students, ngDialog, Courses) {

  $scope.page = false;

  $scope.activeSection = "comprados";

  Courses.getCoursesByAccount().success(function(res) {

    console.log(res)

    if (res.success) {

      //$scope.courses = res.data;
      //$location.path('/cursos/suite');

    }

  });
  //END Courses.getCoursesByAccount()

}])

.controller('CoursesModulosCriarCtrl', ['$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', 'Courses', function($rootScope, $scope, $location, $route, $localStorage, Students, ngDialog, Courses) {

  $scope.page = false;

  $scope.activeSection = "modulos";

  $scope.criar = function() {

    /* */
    let error = false;
    /* */

    let formdata = {
      title : $scope.title,
      duration : $scope.duration,
      description : $scope.description,
      goal : $scope.goal,
      course_id:$scope.ngDialogData.id
    };

    console.log(formdata);

    Courses.createModule(formdata).success(function(res) {

      console.log(res)

      if (res.success) {

        ngDialog.close();
        $location.path('/cursos/suite/modulos');

      }

    });
      //END Courses.create()

    }
    //END $scope.criar

}])

.controller('CoursesCriarCtrl', ['$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', 'Courses', 'Knowledge', function($rootScope, $scope, $location, $route, $localStorage, Students, ngDialog, Courses, Knowledge) {
  $scope.universityId = $scope.ngDialogData.universityId;
  $scope.page = false;
  Knowledge.getAllPaginated().success(function(res){
    if(res.success){
      $scope.knowledge = res.data.docs;
    }
  });
  $scope.criar = function() {

    /* */
    let error = false;
    /* */

    let formdata = {
      title : $scope.title,
      description : $scope.description,
      currency : $scope.currency,
      // currency : $scope.currency,
      knowledgeId: $scope.selectedKnowledge,
      university: $scope.universityId
    };

    if ($scope.free == undefined) {
      console.log("error, undefined")
      error = true;
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

    console.log(formdata);

    Courses.create(formdata).success(function(res) {

      console.log(res)

      if (res.success) {

        ngDialog.close();
       $location.path('/cursos/suite/owner')

      }

    });
    //END Courses.create()

  }
  //END $scope.criar

}])

.controller('CoursesNavBarCtrl', ['$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', 'Payments', function($rootScope, $scope, $location, $route, $localStorage, Students, ngDialog, Payments) {

  $scope.page = false;

  let url = $route.current;
  let originalPath = url.$$route.originalPath;

  $scope.originalPath = originalPath;

  console.log("hello courses nav")

  $scope.coursesCreate = function(universityId) {

    ngDialog.open({ template: 'partials/courses/modals/coursecreate.html', controller: 'CoursesCriarCtrl', className: 'ngdialog-theme-default',data: { universityId: universityId}, closeByNavigation: true });
  }


}])
/* */

.controller('StudentProExploreCtrl', ['$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', 'Payments', function($rootScope, $scope, $location, $route, $localStorage, Students, ngDialog, Payments) {

  $scope.step = "exhibition";

  $scope.subscribePro = function() {

    // Check if user has card registered

    let plan = { amount : "11988", currency : 'brl', name : "Estudante Pro" }

    if ($localStorage.token != undefined || $localStorage.token != null) {
      ngDialog.open({ template: 'partials/modals/payments.html', controller: 'PaymentsCtrl', className: 'ngdialog-theme-default', data : { flow : "order", page : "order", purchaseType : "proAnnual", plan : plan } });
    } else {
      ngDialog.open({ template: 'partials/modals/login.html', controller: 'AccountCtrl', className: 'ngdialog-theme-default' });
    }

  };
  //END $scope.subscribePro

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

  //
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

  console.log($scope.ngDialogData);

  try {
    if ($scope.ngDialogData.redirectUrl != null) {
      redirectUrl = $scope.ngDialogData.redirectUrl;
      console.log(redirectUrl + '1111111');
    }
  } catch(e) {
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

    let payload = {email: $scope.resetpasswordEmail, type: "student"}

    Students.resetPasswordStepOne(payload).success(function(res) {

      if (res.success) {

        $location.path('/reset/password?tokenOne=' + res.tokenOne + '&email=' + $scope.resetpasswordEmail);
        $scope.resetPasswordSuccess = true;

      }

    });

  }

  $scope.login = function() {

    let login = {
      email : $scope.loginEmail,
      password : $scope.loginPassword
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

          console.log(redirectUrl);
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

        console.log("response error: ");
        console.log(e);

      });

    }).catch(function(e) {

      console.log("Error while signin up the account");
      console.log(e);
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
      email : $scope.createEmail,
      username : $scope.createUsername,
      password : $scope.createPassword,
      name : $scope.createName,
      passwordConfirm : $scope.createPasswordConfirm
    };

    console.log(create);

    validateCreateForms(create, "create").then(function(boolean) {

      Students.createAccount(create).then(function(res) {

        let success = res.data.success;
        let token = res.data.token;

        console.log(res)

        if (success) {

          $localStorage.token = token;
          $localStorage.logged = true;

          $rootScope.logged = true;

          $rootScope.$applyAsync();
          console.log($location.path().search("landing"))
          console.log($location.path())
          if ($location.path().search("landing") == -1) {
            $location.path('/onboarding/signup')
            ngDialog.close();
          } else {
            ngDialog.close();
          }

          // I must change path below to redirectURL

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

        console.log("response: ");
        console.log(e);

      });

    }).catch(function(e) {

      console.log("Error while creating account");
      console.log(e);

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

      if ( emailPattern.test(data.email) ) {
        console.log("email valited")
        emailValidated = true;
      } else {
        console.log("email non validated")
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

.controller('HomeCoursesCtrl', ['Knowledge','User','University','$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', 'ngDialog', '$timeout', 'Courses', '$filter', function(Knowledge,User,University,$rootScope, $scope, $location, $route, $localStorage, Students, ngDialog, $timeout, Courses, $filter) {
  $scope.universities=0;
  University.getUniversitiesByAdminMembers().success(function(res) {
   if (res.success) {

      $scope.universities = res.data.length;
     
    }

  });
Courses.getAll().success(function(res) {

    console.log("response courses: ")
    console.log(res);
    $scope.courses = res.data;

  });
   Knowledge.getAllPaginated().success(function(res){
    console.log('knowledge res', res);
    $scope.knowledge = res.data.docs;
  });
  $scope.textFilter = function(text) {

    return $filter('limitHtml')(text, 350, '...')

  }

}])

/* home - topic */

.controller('TopicMenuCtrl', ['$rootScope', '$scope', '$location', 'University', 'ngDialog', 'News', '$localStorage', 'Knowledge' , function($rootScope, $scope, $location, University, ngDialog, News, $localStorage, Knowledge) {

  $scope.subscribe = function(knowledgeId) {

    console.log(knowledgeId)

    Knowledge.subscribe(knowledgeId).success(function(res) {

      let success = res.success;
      console.log(res)

    });

    //END Knowledge.subscribe()

  }

}])

.controller('HomeTopicCtrl', ['$rootScope', '$scope', '$location', 'University', 'ngDialog', 'News', '$localStorage', 'Knowledge' , function($rootScope, $scope, $location, University, ngDialog, News, $localStorage, Knowledge) {

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

  console.log("politica: ")

  /* Load Knowledge */

  Knowledge.getByUrl(knowledgeUrl).success(function(res) {

    console.log("knowledge: ");
    console.log(res.data);

    $scope.knowledge = res.data;

  });
  //END Knowledge.getByUrl

  $scope.forumPosts = [];

  Knowledge.getAllPostsByUrlPaginated(knowledgeUrl).success(function(res) {

    console.log(res.data.docs)
    $scope.forumPosts = res.data.docs;
    $scope.pages = res.data.pages;

  });
  //END Knowledge.getAllPostsByUrlPaginated

  $scope.busy = false;

  $scope.nextPage = function() {

    $scope.page = $scope.page + 1;

    $scope.busy = true;

    Knowledge.getAllPostsByUrlPaginated(knowledgeUrl).success(function(res) {

      let forumPosts = res.data.docs;

      console.log(res.data)

      $scope.forumPosts = $scope.forumPosts.concat(forumPosts);

      console.log($scope.forumPosts)

      $scope.busy = false;

    });
    //END Timeline

  };

}])

.controller('HomeTopicUrlAcademiaCtrl', ['$rootScope', '$scope', '$location', 'University', 'ngDialog', 'News', '$localStorage', 'Forum', 'Knowledge', '$route', function($rootScope, $scope, $location, University, ngDialog, News, $localStorage, Forum, Knowledge, $route) {

  let knowledgeUrl = $route.current.params.url;

  console.log("politica: ")

  /* Load Knowledge */

  Knowledge.getByUrl(knowledgeUrl).success(function(res) {

    console.log("knowledge: ");
    console.log(res.data);

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

    console.log("knowledge: ");
    console.log(res.data);

    $scope.knowledge = res.data;

  });

  Knowledge.getAllPostsByUrlPaginated(knowledgeUrl, $scope.page).success(function(res) {

    console.log(res.data.pages)

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

    console.log("knowledge: ");
    console.log(res.data);

    $scope.knowledge = res.data;

  });
  // END Knowledge.getByUrl

  Knowledge.getAllPostsByUrlPaginated(knowledgeUrl).success(function(res) {

    console.log(res.data.docs)
    $scope.forumPosts = res.data.docs;

  });
  // END Knowledge.getAllPostsByUrlPaginated


}])

.controller('HomeTopicUrlOpiniaoCtrl', ['$rootScope', '$scope', '$location', 'University', 'ngDialog', 'News', '$localStorage', 'Forum', 'Knowledge', '$route', function($rootScope, $scope, $location, University, ngDialog, News, $localStorage, Forum, Knowledge, $route) {

  let knowledgeUrl = $route.current.params.url;

  console.log("opiniao: ")

  /* Load Knowledge */

  Knowledge.getByUrl(knowledgeUrl).success(function(res) {

    console.log("knowledge: ");
    console.log(res.data);

    $scope.knowledge = res.data;

    if ($scope.knowledge.sections.length > 0) {

      let sectionId = $scope.knowledge.sections[0].sectionId;

      News.getNewsBySection(sectionId).success(function(res) {

        console.log("news")
        console.log(res);

        $scope.news = res.data;

      });

    }

  });

  Knowledge.getAllPostsByUrlPaginated(knowledgeUrl).success(function(res) {

    console.log(res.data.docs)
    $scope.forumPosts = res.data.docs;

  });


}])

/* home - noticias */

.controller('HomeNoticiasCtrl', ['$rootScope', '$scope', '$location', 'University', 'ngDialog', 'News', '$localStorage' , function($rootScope, $scope, $location, University, ngDialog, News, $localStorage) {

  $scope.sectionTitle = "em alta";
  let section = "trend";

  News.getAllSections().success(function(res) {

    console.log("sections")
    console.log(res);
    $scope.sections = res.data;

  });

  News.getAllTrends().success(function(res) {

    console.log("news: ")
    console.log(res)
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

              console.log("news: ")
              console.log(res)
              $scope.news = res.data;

            });

          } else {

            News.getNewsBySection(news.sectionId).success(function(res) {

              console.log("news: ")
              console.log(res)
              $scope.news = res.data;

            });
            //END News.getNewsBySection

          }

        } else {

        }

      });

    } else {
      ngDialog.open({ template: 'partials/modals/login.html', controller: 'AccountCtrl', className: 'ngdialog-theme-default' });
    }

  }

  $scope.newsOpen = function(id, news) {
    ngDialog.open({ template: 'partials/modals/news.html', controller: 'NewsByIdCtrl', className: 'ngdialog-theme-default modal-news', data : { news : news } });
  };

}])

.controller('NewsByIdCtrl', ['$rootScope', '$scope', '$location', 'University', 'ngDialog', 'News', '$localStorage' , function($rootScope, $scope, $location, University, ngDialog, News, $localStorage) {

  console.log("news by id!!!")

  let news = $scope.ngDialogData.news;

  $scope.news = news;

  $scope.vote = function() {

    if ($localStorage.token != undefined || $localStorage.token != null) {

      News.vote(news._id).success(function(res) {

        console.log(res);

        if (res.success) {
          $scope.news = res.data;
        } else {

        }

      });

    } else {
      ngDialog.open({ template: 'partials/modals/login.html', controller: 'AccountCtrl', className: 'ngdialog-theme-default' });
    }

  }

  $scope.writeComment = function() {

    let data = { text : $scope.text };

    if ($localStorage.token != undefined || $localStorage.token != null) {

      if (data.text.length > 0) {

        News.writeComment(news._id, data).success(function(res) {

          console.log("writing comment: ")
          console.log(res);

          if (res.success) {
            $scope.news = res.data;
            $scope.text = "";
          } else {

          }

        });
        //END News.writeComment

      }
      //END data.text.length

    } else {
      ngDialog.open({ template: 'partials/modals/login.html', controller: 'AccountCtrl', className: 'ngdialog-theme-default' });
    }

  }

}])

/* home - universidades */
.controller('HomeUserUniversidadesCtrl', ['$rootScope', '$scope', '$location', 'University', 'Knowledge' , function($rootScope, $scope, $location, University, Knowledge) {

  $scope.activeSection = 'seguindo';

  /* */

  University.getUniversities().then(function(res) {

    console.log(res);

    $scope.universities = res.data.data;

  });

  /* */


}])

.directive('universityuserrow', ['University', 'Students', '$filter', '$sce', '$location', function(University, Students, $filter, $sce, $location) {
  return {
    restrict: 'E',
    templateUrl:  '../../partials/directive/universityuserrow.html',
    replace: true,
    scope: true,
    link: function(scope, element, attr) {

      let universityId = attr.uid;

      scope.openUniversity = function(url) {
        console.log("open universityyyyy: ")
        console.log(url)
        $location.path('/a/' + url)
      }

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

.controller('HomeUniversidadesCtrl', ['$rootScope', '$scope', '$location', 'University', 'Knowledge' , function($rootScope, $scope, $location, University, Knowledge) {

  Knowledge.getAllPaginated().success(function(res) {

    console.log("knowledge: ")
    console.log(res);
    let success = res.success;
    let data = res.data;
    let docs = data.docs;
    console.log(docs)
    $scope.knowledges = docs;

  });

  University.getUniversities().then(function(res) {

    console.log(res);

    $scope.universities = res.data.data;

  });

}])

.controller('HomeJobsCategoryCtrl', ['$rootScope', '$scope', '$location', 'ngDialog', function($rootScope, $scope, $location, ngDialog) {

  $scope.jobListingOpen = function () {
    ngDialog.open({ template: 'partials/jobmodal.html', className: 'ngdialog-theme-default jobmodal' });
  };

}])

/* reset */

.controller('ResetPasswordCtrl', ['$rootScope', '$scope', '$location', 'Students' , function($rootScope, $scope, $location, Students) {

  let tokenOne = $location.search().tokenOne;
  let email = $location.search().email;

  let tokenTwo;

  $scope.flowSuccess = false;

  if (tokenOne != undefined && email != undefined) {

    let payload = { tokenOne: tokenOne, email : email, type : "student" };

    // Start Step 2
    Students.resetPasswordStepTwo(payload).success(function(res) {

      console.log("response step 2: ")
      console.log(res);
      if (res.success) {
        tokenTwo = res.tokenTwo;
      }

    })

  } else {

    // Display error message
    //$location.path("/");

  }

  $scope.stepThree = function() {

    let payload = {
            newpassword: $scope.password,
            tokenTwo: tokenTwo,
            type: "student"
          };

    // Start Step 2
    Students.resetPasswordStepThree(payload).success(function(res) {

      console.log("response step 3: ")
      console.log(res);
      if (res.success) {
        $scope.flowSuccess = true;
      } else {

      }

    });
    //END resetPasswordStepThree

  }
  //END stepThree

}])

.controller('ResetPasswordNewCtrl', ['$rootScope', '$scope', '$location' , function($rootScope, $scope, $location) {



}])

/* academia */

.controller('AcademiaCtrl', ['$rootScope', '$scope', '$location', '$route', 'University' , function($rootScope, $scope, $location, $route, University) {

  let universityUrl = $route.current.params.academiaName;

  University.getUniversity(universityUrl).then(function(res) {

    $scope.university = res.data.data;

  });

  $location.path("/a/" + universityUrl + "/forum");

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

  // Finish

  $scope.subscribe = function() {

    University.subscribeOnUniversity().then(function(res) {



    });

  };

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

.controller('AcademiaStatusCtrl', ['$rootScope', '$scope', '$route', 'University', '$location', 'jwtHelper', '$localStorage', function($rootScope, $scope, $route, University, $location, jwtHelper, $localStorage) {

  let universityUrl = $route.current.params.academiaName;
  //let studentId = jwtHelper.decodeToken($localStorage.token)._id;
  var studentId;

  if ($localStorage.token != undefined && $localStorage.token != null) {
    studentId = jwtHelper.decodeToken($localStorage.token)._id;
  }

  let university;

  /* load information */

  University.getUniversity(universityUrl).then(function(res) {

    console.log(res.data.data);
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

        console.log($scope.university.members);

      } else {

        console.log("user added: ");
        console.log(res);
        $scope.university.members.push({ accountId : studentId });

      }

    });

  };

}])

/* end academia */

/* messenger */
.controller('MessengerCtrl', ['$rootScope', '$scope', '$location' , function($rootScope, $scope, $location) {

  let tc = {};

  $scope.connect = function() {

    console.log("aeeee");

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
    console.log('Attempting to join "general" chat channel...');
    if (!tc.generalChannel) {
      // If it doesn't exist, let's create it
      tc.messagingClient.createChannel({
        uniqueName: GENERAL_CHANNEL_UNIQUE_NAME,
        friendlyName: GENERAL_CHANNEL_NAME
      }).then(function(channel) {
        console.log('Created general channel');
        tc.generalChannel = channel;
        tc.loadChannelList(tc.joinGeneralChannel);
      });
    }
    else {
      console.log('Found general channel:');
      setupChannel(tc.generalChannel);
    }
  };

  function fetchAccessToken(username, handler) {

    $.post('http://localhost:7000/', { identity: username, device: 'browser'}, null, 'json')
      .done(function(response) {

        //handler(response.token);
        console.log("response token: ")
        console.log(response.token)

      })
      .fail(function(error) {

        console.log('Failed to fetch the Access Token with error: ' + error);
        console.log("tey")

      });

  }


}])

.controller('MessengerMenuCtrl', ['$rootScope', '$scope', '$location' , function($rootScope, $scope, $location) {

  $rootScope.messengerMenuClass = "col-sm-4 col-md-3 col-lg-2 messenger-menu";
  //$scope.filterGly = "glyphicon glyphicon-triangle-bottom";

}])

/* end messenger */

.controller('HeaderCtrl', ['$rootScope', '$scope', '$location', '$localStorage', 'jwtHelper', 'Search', 'Students', '$route', 'ngDialog', '$timeout', 'Chat', function($rootScope, $scope, $location, $localStorage, jwtHelper, Search, Students, $route, ngDialog, $timeout, Chat) {

  /* header variables */
  let logged = $rootScope.logged;

  $scope.searchBarDisplay = false;

  /* functions */

  $scope.searchBarToggle = function() {
    if ($scope.searchBarDisplay) {
      $scope.searchBarDisplay = false;
    } else {
      $scope.searchBarDisplay = true;
    }
  }

  $scope.login = function() {
    console.log("login")
    $timeout.cancel($rootScope.accountSuggestion);
    ngDialog.open({ template: 'partials/modals/login.html', controller: 'AccountCtrl', className: 'ngdialog-theme-default' });
  }

  $scope.signup = function() {
    console.log("signup")
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

  //imageUrl
  if (logged) {

    let studentId = jwtHelper.decodeToken($localStorage.token)._id;

    Students.getStudentById(studentId).then(function(res) {

      console.log("header get student by id")
      console.log(res);

      let data = res.data.data;

      $rootScope.user = data;
      $scope.user = data;

      if (data.imageUrl != undefined && data.imageUrl != null) {
        $scope.userImage = data.imageUrl;
      }

      /* chat */

      if ($localStorage.tokenTwilio != undefined) {

        //const chatClient = new Twilio.Chat.Client($localStorage.tokenTwilio);

      } else {

        // Request token from API

        let fingertips;

        new Fingerprint2().get(function(result, components) {
            var info = {
                fingerprint: result
            };

            processFingerprint(info);

            Chat.getTwilioToken(info).success(function(res) {

              console.log(res);

              let token = res.token;

              $localStorage.tokenTwilio = res.token;

              //const chatClient = new Twilio.Chat.Client(token);

              //chatClient.on('tokenExpired', refreshToken);

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

    }).catch(function(e) {

    });

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


}])

.controller('FooterCtrl', ['$rootScope', '$scope', '$location' , function($rootScope, $scope, $location) {



}])

.controller('SearchCtrl', ['$rootScope', '$scope', '$location', 'Search', '$localStorage', 'jwtHelper', 'Students' , function($rootScope, $scope, $location, Search, $localStorage, jwtHelper, Students) {

  $scope.displayMobileMenu = function() {

    if (mobileAndTabletCheck() || $(window).width() < 768 ) {

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
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
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

      console.log("header get student by id")
      console.log(res);

      let data = res.data.data;

      $scope.user = data;

      if (data.imageUrl != undefined && data.imageUrl != null) {
        $scope.userImage = data.imageUrl;
      }

    }).catch(function(e) {

    });

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

        console.log(data);

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

.controller('DashboardJobsManageMyListingsCtrl', ['$rootScope', '$scope', '$location' , function($rootScope, $scope, $location) {



}])

.controller('DashboardSmpManageIwantCtrl', ['$rootScope', '$scope', '$location', 'SocialMarketPlace', 'jwtHelper', '$localStorage' , function($rootScope, $scope, $location, SocialMarketPlace, jwtHelper, $localStorage) {

  let studentId = jwtHelper.decodeToken($localStorage.token)._id;

  SocialMarketPlace.getListingsByAccountId(studentId).then(function(res) {

    let listings = res.data.data;

    $scope.listings = listings;

    console.log(listings);

  });

}])

.controller('DashboardSmpManageListingStatsCtrl', ['$rootScope', '$scope', '$location' , function($rootScope, $scope, $location) {



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

    console.log(res)

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
          console.log(e);
          console.log("finish hashtag");
          $scope.hashtag += e.text;
        } else {
          $scope.hashtag += e.text + " ";
        }

      });

      University.getUniversityById(listing.universityId).then(function(res) {

        console.log("university res: ")
        console.log(res);

        let success = res.data.success;

        if (success) {

          let university = res.data.data;

          $scope.universityId = university._id;
          $scope.university = university.name;
          $scope.universitySelected = university.name;
          $scope.universityOk = true;

        }

      });

      console.log(listing)

    } else {



    }

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

  $scope.$watch('files', function () {
    $scope.upload($scope.files);
  });

  $scope.$watch('file', function () {

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

  $scope.upload = function (files) {
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
                }).then(function (resp) {

                    $timeout(function() {
                        $scope.log = 'file: ' +
                        resp.config.data.file.name +
                        ', Response: ' + JSON.stringify(resp.data) +
                        '\n' + $scope.log;
                    });

                    addIntoUploadImages(resp, listing);

                    $scope.imageUploading = false;

                    console.log(resp);

                }, null, function (evt) {

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

      id : listing._id,
      title : $scope.title,
      pictures : $scope.pictures,
      description : $scope.description,
      price : $scope.price,
      hashtags : $scope.hashtag.split(" "),
      universityId : $scope.universityId

    };

    console.log("listing update: ")
    console.log(listingUpdate);

    SocialMarketPlace.update(listingUpdate).then(function(res) {

      let success = res.data.success;

      if (success) {

        let listing = res.data.data;

        console.log(listing);
        $scope.listing = listing;

      } else {

      }

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

.controller('DashboardCtrl', ['$rootScope', '$scope', '$location', '$localStorage' , function($rootScope, $scope, $location, $localStorage) {

  console.log($localStorage.logged)

}])

.controller('DashboardMenuCtrl', ['$rootScope', '$scope', '$location' , function($rootScope, $scope, $location) {



}])

.controller('DashboardSmpCreateCtrl', ['$rootScope', '$scope', '$location', 'Upload', '$timeout', 'Search', 'SocialMarketPlace', '$route', function($rootScope, $scope, $location, Upload, $timeout, Search, SocialMarketPlace, $route) {

  $scope.universitySearch = [];
  $scope.pictures = [];

  // Social Marketplace create listing
  var listing = {

    title : $scope.title,
    pictures : [],
    description : $scope.description,
    price : $scope.price,
    tags : [],
    university : ""

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

  $scope.$watch('files', function () {
    $scope.upload($scope.files);
  });

  $scope.$watch('file', function () {

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

  $scope.upload = function (files) {
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
                }).then(function (resp) {

                    $timeout(function() {
                        $scope.log = 'file: ' +
                        resp.config.data.file.name +
                        ', Response: ' + JSON.stringify(resp.data) +
                        '\n' + $scope.log;
                    });

                    addIntoUploadImages(resp, listing);

                    $scope.imageUploading = false;

                    console.log(resp);

                }, null, function (evt) {

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

      title : $scope.title,
      pictures : $scope.pictures,
      description : $scope.description,
      price : $scope.price,
      hashtags : $scope.hashtag.split(" "),
      universityId : $scope.universityId

    };

    // Hashtags are uploaded as an array

    console.log(listing);

    SocialMarketPlace.create(listing).then(function(res) {

      console.log("create listing response: ");
      console.log(res);

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

.controller('DashboardSmpManageCtrl', ['$rootScope', '$scope', '$location', 'SocialMarketPlace', 'jwtHelper', '$localStorage' , function($rootScope, $scope, $location, SocialMarketPlace, jwtHelper, $localStorage) {

  let studentId = jwtHelper.decodeToken($localStorage.token)._id;

  SocialMarketPlace.getListingsByAccountId(studentId).then(function(res) {

    let listings = res.data.data;

    $scope.listings = listings;

    console.log(listings);

  });

}])

.controller('SmpListingCtrl', ['$rootScope', '$scope', '$location', '$route', 'SocialMarketPlace', 'University', 'Students', 'ngDialog', 'jwtHelper', '$localStorage' , function($rootScope, $scope, $location, $route, SocialMarketPlace, University, Students, ngDialog, jwtHelper, $localStorage) {

  // Id
  let listingId = $route.current.params.id;

  let studentId = jwtHelper.decodeToken($localStorage.token)._id;

  $scope.pictureMain = "";

  SocialMarketPlace.getListingById(listingId).then(function(res) {

    console.log("response: ");
    console.log(res);
    $scope.listing = res.data.data;

    console.log($scope.listing.pictures)

    if ($scope.listing.pictures[0] == undefined || $scope.listing.pictures[0].url == "") {
      $scope.pictureMain = "/img/misc/noimage.jpg";
    } else {
      $scope.pictureMain = res.data.data.pictures[0].url;
    }

    console.log($scope.listing);

    if ($scope.listing.accountId == studentId) {

      $scope.listingOwner = true;

    }

    $scope.listing.want.forEach(function(e, idx) {

      console.log("inside foreach: ")
      console.log(e.accountId);
      console.log(studentId);

      if (e.accountId == studentId) {
        $scope.listingWants = true;
      }

    });

    // Load Student information

    // Load University information
    if ($scope.listing.universityId != undefined) {

      University.getUniversityById($scope.listing.universityId).then(function(res) {

        console.log("university get: ")
        console.log(res);
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

    ngDialog.open({ template: 'templateId', className: 'ngdialog-theme-default ngdialog-theme-smp', scope : $scope });

  };

  /* want */

  $scope.listingOwner = false;
  $scope.listingWants = false;

  $scope.want = function() {

    SocialMarketPlace.want(listingId).then(function(res) {

      console.log("social marketplace button: ")
      console.log(res);

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

.controller('ProfileCtrl', ['$rootScope', '$scope', '$location', '$localStorage', 'jwtHelper', 'Students', function($rootScope, $scope, $location, $localStorage, jwtHelper, Students) {

  /* premium */
  let studentId;

  if ($localStorage.token != undefined && $localStorage.token != null) {
    studentId = jwtHelper.decodeToken($localStorage.token)._id;
  } else {
    $location.path("/");
  }

  $scope.edit = false;

  $scope.short = "";
  $scope.text = "";

  $scope.activeSection = 'conhecimento'

  Students.getStudentById(studentId).success(function(res) {

    let success = res.success;
    let data = res.data;

    if (success) {

      $scope.student = res.data;

    }

  });
  //END Students.getStudentById

  $scope.savePassword = function() {

    let payload = {
      password : $scope.password
    };

    Students.update(studentId, payload).success(function(res) {

      let success = res.success;
      let data = res.data;

      if (success) {

        alert("Senha atualizada com sucesso");

      }

    });
    //END Students.update

  }

  $scope.saveImage = function() {

    let imageUrl = $("#file").attr("value");

    let payload = {
      imageUrl : imageUrl
    };

    if (imageUrl.length > 0) {

      Students.update(studentId, payload).success(function(res) {

        let success = res.success;
        let data = res.data;

        console.log(res)

        if (success) {

          alert("Imagem salva com sucesso!")

        }

      });
      //END Students.update

    }
    //END length > 0

  }

  $scope.saveBio = function() {

    $scope.edit = false;

    let payload = {
      bioLong : $scope.text,
      bioShort : $scope.short
    };

    console.log("save bio")

    Students.update(studentId, payload).success(function(res) {

      let success = res.success;
      let data = res.data;

      console.log(res)

      if (success) {

        $scope.student = data;
        $scope.short = data.bioShort;
        $scope.text = data.bioLong;

      }

    });
    //END Students.update

  }

  $scope.editBio = function() {

    $scope.edit = true;

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
  //END Students.getStudentById

}])

.controller('IndexCtrl', ['$rootScope', '$scope', '$location', '$localStorage', '$route', function($rootScope, $scope, $location, $localStorage, $route) {

  // If isn't the first visit, redirects to home
  if ($localStorage.logged) {
    //$location.path("/home");
    $location.path("/home/timeline");
  } else {
    let universityUrl = $route.current.params.academiaName;
    let roomSID = $route.current.params.roomSID;
    let accountSid = $route.current.params.accountSid;
    let redirectUrl;
    if(universityUrl != null && roomSID != null && accountSid != null){
      console.log($route.params.url);
      redirectUrl = $route.params.url;
    }
    else
      redirectUrl = "/home/explore";
    $location.path(redirectUrl);
  }

  $localStorage.indexVisited = true;

}])

.controller('HomeCreateCtrl', ['$rootScope', '$scope', '$location', '$localStorage', function($rootScope, $scope, $location, $localStorage) {



}])

.controller('HomeCtrl', ['$rootScope', '$scope', 'ngDialog', 'University', 'Knowledge', 'Courses' , function($rootScope, $scope, ngDialog, University, Knowledge, Courses) {

  $scope.showMobileMenu = false;

  $scope.universities = [];

  Courses.getAll().success(function(res) {

    console.log("response courses: ")
    console.log(res);
    $scope.courses = res.data;

  });

  /* */

  Knowledge.getAllPaginated().success(function(res) {

    console.log("knowledge: ")
    console.log(res);
    let success = res.success;
    let data = res.data;
    let docs = data.docs;
    console.log(docs)
    $scope.knowledges = docs;

  });

  University.getUniversities().then(function(res) {

    $scope.universities = res.data.data;

  });

  $scope.signup = function() {
    console.log("signup")
    ngDialog.open({ template: 'partials/modals/signup.html', controller: 'AccountCtrl', className: 'ngdialog-theme-default' });
  }

  //ngDialog.open({ template: 'partials/modals/studentpro.html',className: 'ngdialog-theme-default ngdialog-student-pro', controller: 'StudentProExploreCtrl' });

  $scope.createUniversityRedirect = function() {

    let logged = $rootScope.logged;

    let redirectUrl = "/dashboard/a/create";

    if (logged) {
      $location.path(redirectUrl);
    } else {
      ngDialog.open({ template: 'partials/modals/login.html', controller: 'AccountCtrl', className: 'ngdialog-theme-default', data : { redirectUrl : redirectUrl } });
    }

  }
  //END $scope.createUniversityRedirect

  $scope.studentProExplore = function () {
    ngDialog.open({ template: 'partials/modals/studentpro.html', className: 'ngdialog-theme-default ngdialog-student-pro', controller: 'StudentProExploreCtrl' });
  };

  University.getUniversities().then(function(res) {

    console.log(res);

    $scope.universities = res.data.data;

  });
  //END University

  /* swipe */
  $scope.onTransitionStart = function(swiper) {
    console.log("transition")
    console.log(swiper.activeIndex)
  }

  /* */
  Knowledge.getAllPostsByUrlPaginated("esportes").success(function(res) {

    console.log(res.data.docs)
    $scope.forumPosts = res.data.docs;
    $scope.pages = res.data.pages;

  });
  //END Knowledge.getAllPostsByUrlPaginated

}])

/* Business */

.controller('BusinessIndexCtrl', ['$rootScope', '$scope', '$location' , function($rootScope, $scope, $location) {



}])

.controller('BusinessSigninCtrl', ['$rootScope', '$scope', '$location' , function($rootScope, $scope, $location) {



}])

.controller('BusinessRegisterCtrl', ['$rootScope', '$scope', '$location' , function($rootScope, $scope, $location) {



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

      console.log("answer: ")
      console.log(answer);

      scope.answer = answer;

      let studentId = answer.accountId;

      scope.userImage = "img/user/user.png";

      // Get Account information
      Students.getStudentById(answer.accountId).then(function(res) {

        console.log("student info: ")
        console.log(res.data)
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

        console.log(universityId)
        console.log(postId)
        console.log(answer._id)

        University.upvoteForumPostAnswer(universityId, postId, answer._id).then(function(res) {

          console.log(res);

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

      console.log("viewer: ");
      console.log(viewer);

      Students.getStudentById(viewer.accountId).then(function(res) {

        console.log("student by id: ")
        console.log(res);
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

      let course = JSON.parse(attr.c);

      scope.course = course;


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

.filter('to_trusted', ['$sce', function($sce){
  return function(text) {
    return $sce.trustAsHtml(text);
  };
}])

.directive('modulecontentcard', ['Courses', function(Courses) {
  return {
    restrict: 'AE',
    templateUrl: '../partials/directive/modulecontentcard.html',
    replace: true,
    scope: true,
    link: function(scope, element, attr) {

      let modulecontent = JSON.parse(attr.mc);
      console.log(modulecontent)
     if(modulecontent.modelId)
      Courses.getContentModuleById(modulecontent.modelId).then(function(res) {

        console.log(res);

        scope.modulecontent = res.data.data;

      });
    else
       scope.modulecontent=modulecontent

    }
    //END Courses.getModuleById()

  }
}])
.directive('coursemodulecontent', ['Courses', function(Courses) {
  return {
    restrict: 'AE',
    templateUrl: '../partials/directive/coursemodulecontent.html',

    link: function(scope, element, attr) {
      scope.courseid=attr.courseid
      let modulecontent = JSON.parse(attr.mc);

      let id=[];
      for(let i=0;i<modulecontent.length;i++)
      {
        //id[]=modulecontent[i]['modelId'];
        id.push(modulecontent[i]['modelId'])
      }

      Courses.getContentModulesByIdmultiple(id).then(function(res) {
          scope.modulecontent =res.data.data;

      });

    }
    //END Courses.getModuleById()

  }
}])
.directive('coursemodulecontentmoduloview', ['$window','$cookies','Courses','$location', function($window,$cookies,Courses,$location) {
  return {
    restrict: 'AE',
    templateUrl: '../partials/directive/coursemodulecontentmoduloview.html',

    link: function(scope, element, attr) {
      scope.courseid=attr.courseid
      scope.count=attr.in
      let modulecontent = JSON.parse(attr.mc);

      let id=[];
      for(let i=0;i<modulecontent.length;i++)
      {
        //id[]=modulecontent[i]['modelId'];
        id.push(modulecontent[i]['modelId'])
      }

      Courses.getContentModulesByIdmultiple(id).then(function(res) {
          scope.modulecontent =res.data.data;

      });
      scope.openContent=function(course,type,type_id,post_id)
      {

        var t='quiz';
        if(type=="video") t="videos";
        if(type=="forumpost") t="document"

        $cookies.put("content_id",type_id)
        $cookies.put("type",type)
        $cookies.put("post_id",post_id)
        $window.location.href="/cursos/id/"+course+"/estudar";

      }
    }
    //END Courses.getModuleById()

  }
}])
.directive('coursemodulecontentmodulo', ['$window','Courses','$cookies','$location', function($window,Courses,$cookies,$location) {
  return {
    restrict: 'AE',
    templateUrl: '../partials/directive/coursemodulecontentmodulo.html',

    link: function(scope, element, attr) {

      let modulecontent = JSON.parse(attr.mc);
      scope.courseid=attr.courseid
      let id=[];
      for(let i=0;i<modulecontent.length;i++)
      {
        //id[]=modulecontent[i]['modelId'];
        id.push(modulecontent[i]['modelId'])
      }
      Courses.getContentModulesByIdmultiple(id).then(function(res) {
          scope.modulecontent =res.data.data;

      });
       scope.openContent=function(course,type,type_id,post_id)
      {
        $cookies.put("content_id",type_id)
        $cookies.put("type",type)
        $cookies.put("post_id",post_id)
        $window.open('/cursos/id/' + course + '/estudar', "_blank", "width=1500,height=700,left=100,top=150");

      }
    }
    //END Courses.getModuleById()

  }
}])
.directive('autoFocus', function($timeout) {
    return {
        restrict: 'AC',
        link: function(_scope, _element) {
            $timeout(function(){
                _element[0].focus();
            }, 0);
        }
    };
})

;
