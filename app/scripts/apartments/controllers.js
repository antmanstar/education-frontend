'use strict';

/* Controllers */

angular.module('netbase')

.controller('ApartmentsIndexCtrl', ['$rootScope', '$scope', '$location', '$route', 'University', 'Forum', '$sce', '$filter', 'ngDialog', '$window', 'jwtHelper', '$localStorage', function($rootScope, $scope, $location, $route, University, Forum, $sce, $filter, ngDialog, $window, jwtHelper, $localStorage) {

  let universityUrl = $route.current.params.academiaName;
  let studentId = jwtHelper.decodeToken($localStorage.token)._id;

  console.log("hello world")

  /*$scope.studentId = studentId;

  University.getUniversity(universityUrl).then(function(res) {

    $scope.university = res.data.data;
    University.storeLocal($scope.university);
    console.log("university parsed not stored: ")
    console.log($scope.university)

  });

  */

  $scope.slides = ['https://scontent-gru2-1.xx.fbcdn.net/v/t1.0-9/53464682_10213723761385266_3297572080509255680_o.jpg?_nc_cat=110&_nc_oc=AQly-8_DQQapjBGCwvDmoZeNLOh4D4ChB8Ml7FR7PWpByYncRo4aH3M-nVvKEqVvQ2c&_nc_ht=scontent-gru2-1.xx&oh=0a2b4b9601a4e322203d3e6236896a6b&oe=5DB289CD', 'https://scontent-gru2-1.xx.fbcdn.net/v/t1.0-9/54230715_10213723767185411_6217077173707079680_o.jpg?_nc_cat=102&_nc_oc=AQkmMWK21dsspTIIhgUuhofuxpVpQePI4R6yFey9bZ_3Yt7B4pZ_UjPDreJiEvBuVno&_nc_ht=scontent-gru2-1.xx&oh=712ebaf158ef4f12b0b83deebf36b1c2&oe=5DE0D93D', 'https://scontent-gru2-1.xx.fbcdn.net/v/t1.0-9/53509505_10213723819466718_4619978724102635520_o.jpg?_nc_cat=102&_nc_oc=AQkKbUrL00TuqRjpy5MLw_jtryQZqao3GW_kH1PqmDb_j2c49FBPj3co68nAO2k-VHg&_nc_ht=scontent-gru2-1.xx&oh=aee8f5f04f19086a4aef00c0458d427b&oe=5DE8FA44', 'https://scontent-gru2-1.xx.fbcdn.net/v/t1.0-9/53464682_10213723761385266_3297572080509255680_o.jpg?_nc_cat=110&_nc_oc=AQly-8_DQQapjBGCwvDmoZeNLOh4D4ChB8Ml7FR7PWpByYncRo4aH3M-nVvKEqVvQ2c&_nc_ht=scontent-gru2-1.xx&oh=0a2b4b9601a4e322203d3e6236896a6b&oe=5DB289CD', 'https://scontent-gru2-1.xx.fbcdn.net/v/t1.0-9/54230715_10213723767185411_6217077173707079680_o.jpg?_nc_cat=102&_nc_oc=AQkmMWK21dsspTIIhgUuhofuxpVpQePI4R6yFey9bZ_3Yt7B4pZ_UjPDreJiEvBuVno&_nc_ht=scontent-gru2-1.xx&oh=712ebaf158ef4f12b0b83deebf36b1c2&oe=5DE0D93D', 'https://scontent-gru2-1.xx.fbcdn.net/v/t1.0-9/53509505_10213723819466718_4619978724102635520_o.jpg?_nc_cat=102&_nc_oc=AQkKbUrL00TuqRjpy5MLw_jtryQZqao3GW_kH1PqmDb_j2c49FBPj3co68nAO2k-VHg&_nc_ht=scontent-gru2-1.xx&oh=aee8f5f04f19086a4aef00c0458d427b&oe=5DE8FA44']


}])
