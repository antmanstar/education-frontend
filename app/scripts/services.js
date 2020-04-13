'use strict';
angular.module('netbase')
  //35.229.52.103

  .factory('TimelineNew', ['$http', '$localStorage', function($http, $localStorage) {

    //var baseUrl = "https://api.universida.de/search";
    //var baseUrl = "https://educationalcommunity-uni.herokuapp.com";
    // var baseUrl = "http://api.universida.de/university"
    var baseUrl = "http://ec2-3-94-4-199.compute-1.amazonaws.com:8080";

    return {

      getTimelineAll: function(studentId, page) {

        var url = '/timeline';
        console.log($localStorage.token)

        return $http({
          method: 'GET',
          url: baseUrl + url,
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'x-access-token': $localStorage.token
          }});

      },

      getTimelineRePostCount: function(modelId) {

        var url = '/timeline/repost/count?modelId='+modelId;
        console.log($localStorage.token)

        return $http({
          method: 'GET',
          url: baseUrl + url,
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'x-access-token': $localStorage.token
          }});

      }

    }

  }])

  .factory('Timeline', ['$http', '$localStorage', function($http, $localStorage) {

    //var baseUrl = "https://api.universida.de/search";
    var baseUrl = "https://educationalcommunity-uni.herokuapp.com";
    //var baseUrl = "http://192.168.1.7:9003"

    return {

      getTimelineActivityByStudentId: function(studentId, page) {

        var url = '/university/student/' + studentId + '/timeline?page=' + page;

        console.log($localStorage.token)

        return $http({
          method: 'GET',
          url: baseUrl + url,
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'x-access-token': $localStorage.token
          }});

      },

      getTimelineByStudentId: function(studentId, page) {

        var url = '/university/student/' + studentId + '/timeline?page=' + page;

        console.log($localStorage.token)

        return $http({
          method: 'GET',
          url: baseUrl + url,
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'x-access-token': $localStorage.token
          }});

      }

    }

  }])

  .factory('PokerHands', ['$http', '$localStorage', function($http, $localStorage) {

      var baseUrl = "https://educationalcommunity-uni.herokuapp.com";
      //var baseUrl = "http://localhost:9003";

      return {

        getAll: function() {

          var url = '/pokerhands/all';

          return $http.get(baseUrl + url);

        },

        getById: function(id) {

          var url = '/pokerhands/id/' + id;

          return $http({
            method: 'GET',
            url: baseUrl + url,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'x-access-token': $localStorage.token
          }})

        },

        answer: function(id, data) {

          let url = "https://educationalcommunity-uni.herokuapp.com/pokerhands/id/" + id + "/answer";

          return $http({
            method: 'POST',
            data : data,
            url: url,
            transformRequest: function(obj) {
                var str = [];
                for(var p in obj)
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }});

        },

        create: function(data) {

          let url = "https://educationalcommunity-uni.herokuapp.com/pokerhands/create";

          return $http({
            method: 'POST',
            data : data,
            url: url,
            transformRequest: function(obj) {
                var str = [];
                for(var p in obj)
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }});

        },

        animateHand: function(handtext) {

          let url = "https://educationalcommunity-uni.herokuapp.com/pokerhands/embed/create";

          return $http({
            method: 'POST',
            data : { raw : handtext, embed : true },
            url: url,
            transformRequest: function(obj) {
                var str = [];
                for(var p in obj)
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }});

        }

      }

    }])

  .factory('Chat', ['$http', '$localStorage', function($http, $localStorage) {

      //var baseUrl = "";
      var baseUrl = "http://localhost:6969";

      return {

        getUniversityChannels: function(universityId) {

          let url = "/chat/channel/university/" + universityId;

          return $http.get(baseUrl + url);

        },

        getTwilioToken: function(payload) {

          let url = "/chat/token/device/" + payload.deviceID;

          return $http({
            method: 'GET',
            url: baseUrl + url,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'x-access-token': $localStorage.token
          }});

        }

      }

    }])

  .factory('Playlist', ['$http', function($http) {

      var baseUrl = "https://educationalcommunity-uni.herokuapp.com/university";
      //var baseUrl = "https://api.universida.de/university";
      //var baseUrl = "http://192.168.1.7:9003/university";
      /*

      router.get('/id/:id/playlist', university_controller.getAllPlaylistByUniversityId)

      router.get('/playlist/id/:id', university_controller.getPlaylistById)

      */

      return {

        getPlaylistById: function(playlistId) {

          var url = '/playlist/id/' + playlistId;

          return $http.get(baseUrl + url);

        },

        getAllPlaylistByUniversityId: function(universityId) {

          var url = '/id/' + universityId + '/playlist/';

          return $http.get(baseUrl + url);

        },

        create: function(data) {

          var url = '/playlist';

          return $http({
            method: 'POST',
            data : data,
            url: baseUrl + url,
            transformRequest: function(obj) {
                var str = [];
                for(var p in obj)
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }});

        }

      }

    }])

  .factory('Forum', ['$http', '$localStorage', function($http, $localStorage) {

      var baseUrl = "https://educationalcommunity-uni.herokuapp.com/university";
      //var baseUrl = "https://api.universida.de/university";
      //var baseUrl = "http://192.168.1.7:9003/university";

      return {

        getAllOwnerForumPost: function(universityId) {

          var url = '/id/' + universityId + '/forum/owner';

          return $http.get(baseUrl + url);

        },

        getForumPostById: function(id, universityId) {

          var url = '/id/' + universityId + '/forum/post/id/' + id;

          return $http({
            method: 'GET',
            url: baseUrl + url,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'x-access-token': $localStorage.token
            }});

        },

        getForumPostsByCategoryId : function(id, categoryId, page) {

          var url = '/id/' + id + '/categories/id/' + categoryId + '/posts' + "?page=" + page;

          return $http.get(baseUrl + url);

        },

        postAnswerByForumPostId: function(id, answer) {

          var url = '/forum/post/id/' + id + "/answer";

          return $http({
            method: 'POST',
            url: baseUrl + url,
            data : answer,
            transformRequest: function(obj) {
                var str = [];
                for(var p in obj)
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }});

        },

        getCategoriesByUniversityId: function(universityId, data) {

          var url = '/id/' + universityId + '/categories';

          return $http.get(baseUrl + url);

        },

        createCategory: function(universityId, data) {

          var url = '/id/' + universityId + '/category/';

          return $http({
            method: 'POST',
            url: baseUrl + url,
            data : data,
            transformRequest: function(obj) {
                var str = [];
                for(var p in obj)
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }});

        }

      }

    }])

  .factory('University', ['$http', '$localStorage', function($http, $localStorage) {

      var baseUrl = "https://educationalcommunity-uni.herokuapp.com/university";
      //var baseUrl = "https://api.universida.de/university";
      //var baseUrl = "http://192.168.1.7:9003/university";

      return {

        storeLocal: function(university) {
          //$localStorage.studentsStorage = {}
          if ($localStorage.universityStorage == undefined) {
            $localStorage.universityStorage = {};
          }

          let ts = Math.round((new Date()).getTime() / 1000);

          university.updated = ts;

          $localStorage.universityStorage[university._id] = university;
          $localStorage.universityStorage[university.url] = university;

        },

        isStoredLocal: function(query) {

          let ts = Math.round((new Date()).getTime() / 1000);

          if ($localStorage.universityStorage == undefined) {
            $localStorage.universityStorage = {};
          }

          let university = $localStorage.universityStorage;

          // check timestamp, 3hr updates

          if (query in university) {

            let lastUpdate = university[query].updated;

            if (lastUpdate + (3600 * 2) < ts) {
              return true;
            } else {
              return false;
            }

          } else {
            return false;
          }


        },

        retrieveStorage: function() {

          return $localStorage.universityStorage;

        },

        create: function(data) {

          var url = '/';

          return $http({
            method: 'POST',
            data : data,
            url: baseUrl + url,
            transformRequest: function(obj) {
                var str = [];
                for(var p in obj)
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }});

        },

        update: function(id, data) {

          var url = '/id/' + id;

          return $http({
            method: 'PUT',
            data : data,
            url: baseUrl + url,
            transformRequest: function(obj) {
                var str = [];
                for(var p in obj)
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }});

        },
        getUniversitiesByAdminMembers: function() {

          var url = '/owner/members/university';

          return $http.get(baseUrl + url);

        },
        getUniversitiesByOwnerId: function(id) {

          var url = '/ownerid/' + id;

          return $http.get(baseUrl + url);

        },

        getUniversities: function() {

          var url = '/';

          return $http.get(baseUrl + url);

        },

        getAllUniversities: function() {

          var url = '/all';

          return $http.get(baseUrl + url);

        },

        getUniversityById: function(universityId) {

          var url = '/id/' + universityId;

          return $http.get(baseUrl + url);

        },

        getUniversity: function(universityUrl) {

          var url = '/url/' + universityUrl;

          return $http.get(baseUrl + url);

        },

        getUniversityForumPosts: function(universityId, page) {

          var url = "/id/" + universityId + "/forum" + "?page=" + page;

          return $http({
            method: 'GET',
            url: baseUrl + url,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'x-access-token': $localStorage.token
            }});

        },

        subscribeOnUniversity: function(universityUrl) {

          var url = '/url/' + universityUrl + "/subscribe";

          return $http({
            method: 'POST',
            url: baseUrl + url,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }});

        },

        createForumPostTimeline: function(data) {

          var url = '/timeline/forumpost';

          return $http({
            method: 'POST',
            data: data,
            url: "http://ec2-3-94-4-199.compute-1.amazonaws.com:8080" + url,
            transformRequest: function(obj) {
                var str = [];
                for(var p in obj)
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            },
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'x-access-token': $localStorage.token
            }});

        },

        createForumPost: function(universityId, data) {

          var url = '/id/' + universityId + '/forum';

          return $http({
            method: 'POST',
            data: data,
            url: baseUrl + url,
            transformRequest: function(obj) {
                var str = [];
                for(var p in obj)
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }});

        },

        updateForumPost: function(universityId, postId, data) {

          var url = '/id/' + universityId + '/forum/post/id/' + postId;

          return $http({
            method: 'PUT',
            data: data,
            url: baseUrl + url,
            transformRequest: function(obj) {
                var str = [];
                for(var p in obj)
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }});

        },

        upvoteForumPost: function(universityId, postId) {

          var url = '/id/' + universityId + '/forum/post/id/' + postId + '/vote/up';

          return $http({
            method: 'POST',
            url: baseUrl + url,
            transformRequest: function(obj) {
                var str = [];
                for(var p in obj)
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }});

        },

        downvoteForumPost: function(universityId, postId) {

          var url = '/id/' + universityId + '/forum/post/id/' + postId + '/vote/down';

          return $http({
            method: 'POST',
            url: baseUrl + url,
            transformRequest: function(obj) {
                var str = [];
                for(var p in obj)
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }});

        },

        upvoteForumPostAnswer: function(universityId, postId, answerId) {

          var url = "/id/" + universityId + "/forum/post/id/" + postId + "/answer/id/" + answerId + "/vote/up";

          return $http({
            method: 'PUT',
            url: baseUrl + url,
            transformRequest: function(obj) {
                var str = [];
                for(var p in obj)
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }});

        },

        downvoteForumPostAnswer: function(universityId, postId, answerId) {

          var url = "/id/" + universityId + "/forum/post/id/" + postId + "/answer/id/" + answerId + "/vote/down";

          return $http({
            method: 'PUT',
            url: baseUrl + url,
            transformRequest: function(obj) {
                var str = [];
                for(var p in obj)
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }});

        },

        setMemberPrivilege: function(universityId, accountId, data) {

          var url = '/id/' + universityId + '/member/' + accountId;

          return $http({
            method: 'PUT',
            data: data,
            url: baseUrl + url,
            transformRequest: function(obj) {
                var str = [];
                for(var p in obj)
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }});

        },

        createPlan: function(universityId, data) {

          var url = '/id/' + universityId + '/premium/plan';

          return $http({
            method: 'POST',
            data : data,
            url: baseUrl + url,
            transformRequest: function(obj) {
                var str = [];
                for(var p in obj)
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }});

        },

        updatePlan: function(universityId, data) {

          var url = '/id/' + universityId + '/premium/plan/' + data.stripeId;

          return $http({
            method: 'PUT',
            data : data,
            url: baseUrl + url,
            transformRequest: function(obj) {
                var str = [];
                for(var p in obj)
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }});

        }

      }

    }])

  .factory('Classroom', ['$http', '$localStorage', function($http, $localStorage) {

		console.log('here entered.');
		return {
			getAllClassroomsByUniversity_J: function(url) {
				return new Promise((resolve, reject) => {
					let token = $localStorage.token;
					console.log('loacl storage token');
					console.log(token);
					/*
					var req = {
						method: 'GET',
						url: url,
						headers: {
							'x-access-token': token,
							'query': token
						},
						params: {token: token },
					}

					var result = Array();

					$http(req).then((res) => {
						var i;
						console.log('hahhee we we we we ');
						console.log(res);
						for(i = 0; i < res.data.data.length; i++) {
							let classRoom = res.data.data[i];
							result.push(classRoom);
						}
						console.log(result);
						resolve(result);
					});
					*/
					var req = {
						token: token,
					}

					var result = Array();

					$http.get(url + "?token=" + token).then((res) => {
						var i;
						console.log('hahhee we we we we ');
						console.log(res);
						for(i = 0; i < res.data.data.length; i++) {
							let classRoom = res.data.data[i];
							result.push(classRoom);
						}
						console.log(result);
						resolve(result);
          });

				});
      },
      getAllClassroomsByUniversity: function(url) {

					let token = $localStorage.token;
					console.log('loacl storage token');
					console.log(token);
          return $http.get(url + "?token=" + token);
			},
			createNewClassroom: function(url, title){
				return new Promise((resolve, reject) => {
					let token = $localStorage.token;
					var req = {
						method: 'POST',
						url: url,
						headers: {
							'x-access-token': token,
						},
						params: {
							token: token,
							title: title,
						},
						body: {
							title: title,
						}
					}
					$http(req).then((res) => {
						console.log('create success');
						console.log(res);
						if(res.data.success == true){
							resolve(res.data);
						}
						else {
							reject('err');
						}
					});
				});
			},
			joinClassroom: function(url) {
				return new Promise((resolve, reject) => {
					let token = $localStorage.token;

					var req = {
						method: 'POST',
						url: url,
						headers: {
							'x-access-token': token,
						},
						params: { token: token }
					}
					$http(req).then((res) => {
						console.log(res);
						if(res.data.success){
							resolve(res.data.data);
						}
						else {
							reject('err');
						}
					});
				});
			},
			getAccessToken: function(url) {
				return new Promise((resolve, reject) => {
					let token = $localStorage.token;
					var req = {
						method: 'GET',
						url: url,
						headers: {
							'Access-Control-Allow-Origin': '*',
							'x-access-token': token,
						},
						params: { token: token }
					}
					$http(req).then((res) => {
						console.log(res);
						if(res.data.success){
							resolve(res.data.token);
						}
						else {
							reject('err');
						}
					});
				})
			}
		}
    }])

  .factory('Students', ['$http', '$localStorage', function($http, $localStorage) {

      //var baseUrl = "https://api.universida.de/accounts/students";
      var baseUrl = "https://educationalcommunity-accounts.herokuapp.com/accounts/students";
      //var baseUrl = "http://localhost:8000/accounts/students";

      return {

        storeLocal: function(student) {
          //$localStorage.studentsStorage = {}
          if ($localStorage.studentsStorage == undefined) {
            $localStorage.studentsStorage = {};
          }

          $localStorage.studentsStorage[student._id] = student;

        },

        isStoredLocal: function(studentId) {

          // check if it's stored local

          if ($localStorage.studentsStorage == undefined) {
            $localStorage.studentsStorage = {};
          }

          let storage = $localStorage.studentsStorage;

          if (studentId in storage) {
            return true;
          } else {
            return false;
          }

        },

        retrieveStorage: function() {

          return $localStorage.studentsStorage;

        },

        update: function(accountId, data) {

          var url = "/id/" + accountId + "/update";

          return $http({
            method: 'PUT',
            url: baseUrl + url,
            data : data,
            transformRequest: function(obj) {
                var str = [];
                for(var p in obj)
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }});

        },

        getCards: function(userId) {

          var url = '/id/' + userId + "/cards";

          return $http({
            method: 'GET',
            url: baseUrl + url,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'x-access-token': $localStorage.token
            }});

        },

        resetPasswordStepThree: function(data) {

          let url = "/forgot/newpassword/token";

          return $http({
            method: 'PUT',
            url: baseUrl + url,
            data : data,
            transformRequest: function(obj) {
                var str = [];
                for(var p in obj)
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }});

        },

        resetPasswordStepOne: function(data) {

          let url = "/forgot";

          return $http({
            method: 'POST',
            url: baseUrl + url,
            data : data,
            transformRequest: function(obj) {
                var str = [];
                for(var p in obj)
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }});

        },

        resetPasswordStepTwo: function(data) {

          let url = "/forgot/newpassword";

          return $http({
            method: 'PUT',
            url: baseUrl + url,
            data : data,
            transformRequest: function(obj) {
                var str = [];
                for(var p in obj)
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }});

        },

        postCards: function(userId, data) {

          var url = '/id/' + userId + "/cards";

          return $http({
            method: 'POST',
            url: baseUrl + url,
            data : data,
            transformRequest: function(obj) {
                var str = [];
                for(var p in obj)
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }});

        },

        login: function(data) {

          var url = '/authenticate/';

          return $http({
            method: 'POST',
            url: baseUrl + url,
            data : data,
            transformRequest: function(obj) {
                var str = [];
                for(var p in obj)
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }});

        },

        createAccount: function(data) {

          var url = '/create/';

          data.language = "PT";

          return $http({
            method: 'POST',
            url: baseUrl + url,
            data : data,
            transformRequest: function(obj) {
                var str = [];
                for(var p in obj)
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }});

        },

        getStudentById: function(id) {

          var url = '/id/' + id;

          return $http.get(baseUrl + url);

        },

        getStudentById_J: function(id) {
          var url = '/id/' + id;
          return new Promise((resolve, reject) => {
            $http.get(baseUrl + url).then((res) => {
              console.log('here000000000000');
              console.log(res);
              resolve(res.data.data);
            })
            .catch((err) => {
              reject(err);
            });
          });
        },

        getStudentByUsername: function(id) {

          var url = '/username/' + id;

          return $http.get(baseUrl + url);

        }

      }

    }])

  .factory('Search', ['$http', function($http) {

      //var baseUrl = "https://api.universida.de/search";
      var baseUrl = "https://network-search-prod.herokuapp.com/search";

      return {

        all: function(query) {

          var url = '/all?q=' + query;

          return $http.get(baseUrl + url);

        }

      }

    }])

  .factory('Knowledge', ['$http', '$localStorage', function($http, $localStorage) {

      //var baseUrl = "https://api.universida.de/search";
      //var baseUrl = "http://192.168.1.7:9003/knowledge";
      var baseUrl = "https://educationalcommunity-uni.herokuapp.com/knowledge";

      return {

        getAllPaginated: function(query) {

          // do paginated here

          var url = '/all';

          return $http.get(baseUrl + url);

        },

        getById: function(id) {

          // do paginated here

          var url = '/id/' + id;

          return $http.get(baseUrl + url);

        },

        getByUrl: function(urlArg) {

          // do paginated here

          var url = '/url/' + urlArg;

          return $http.get(baseUrl + url);

        },

        getAllPostsByIdPaginated: function(id) {

          // do paginated here

          var url = '/id/' + id + '/posts';

          return $http.get(baseUrl + url);

        },

        getAllPostsByUrlPaginated: function(id, page) {

          // do paginated here

          var url = '/url/' + id + '/posts' + "?page=" + page;

          return $http.get(baseUrl + url);

        },

        subscribe: function(knowledgeId) {

          // do paginated here

          var url = '/id/' + knowledgeId + "/subscribe";

          return $http({
            method: 'POST',
            url: baseUrl + url,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'x-access-token': $localStorage.token
            }});

        }

      }

    }])

  .factory('Videos', ['$http', function($http) {

      var baseUrl = "https://educationalcommunity-uni.herokuapp.com/university";
      //var baseUrl = "http://192.168.1.7:9003/university";

      return {

        progress: function(payload, videoid) {

          var url = '/video/id/' + videoid + "/progress";

          return $http({
            method: 'PUT',
            url: baseUrl + url,
            data : payload,
            transformRequest: function(obj) {
                var str = [];
                for(var p in obj)
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }});

        },

        getById: function(id) {

          var url = "/video/id/" + id;

          return $http.get(baseUrl + url);

        },

        create: function(payload) {

          var url = '/video';

          return $http({
            method: 'POST',
            url: baseUrl + url,
            data : payload,
            transformRequest: function(obj) {
                var str = [];
                for(var p in obj)
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }});

        },

        parse: function(youtubeId, type) {

          if (type == 'yt') {

            var ytApiKey = "AIzaSyBO5oxAd6H-Au_lPyQiV2QU-7vCL_Li3GY";
            var url = "https://www.googleapis.com/youtube/v3/videos?part=snippet&id=" + youtubeId + "&key=" + ytApiKey

          }

          console.log(url)

          return $http.get(url);

        }

      }

    }])

  .factory('SocialMarketPlace', ['$http', '$localStorage', 'jwtHelper', function($http, $localStorage, jwtHelper) {

      //var baseUrl = "https://api.universida.de/listing";
      var baseUrl = "https://network-socialmarketplace-prod.herokuapp.com/listing";

      return {

        create: function(data) {

          var url = "/";

          return $http({
            method: 'POST',
            url: baseUrl + url,
            data : data,
            transformRequest: function(obj) {
                var str = [];
                for(var p in obj)
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            },
            contentType: 'application/json',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }});

        },

        update: function(data) {

          var url = "/id/" + data.id;

          return $http({
            method: 'PUT',
            url: baseUrl + url,
            data : data,
            transformRequest: function(obj) {
                var str = [];
                for(var p in obj)
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            },
            contentType: 'application/json',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }});

        },

        getListingById: function(id) {

          var url = '/id/' + id;

          return $http.get(baseUrl + url);

        },

        getListingsByUniversity: function(universityId) {

          var url = '/university/id/' + universityId;

          return $http.get(baseUrl + url);

        },

        want: function(id) {

          var url = '/id/' + id + '/want';

          return $http({
            method: 'POST',
            url: baseUrl + url,
            transformRequest: function(obj) {
                var str = [];
                for(var p in obj)
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            },
            contentType: 'application/json',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }});

        },

        getListingsByAccountId: function(id) {

          var url = '/accounts/id/' + id + '/listings';

          return $http.get(baseUrl + url);

        }

      }

    }])

  .factory('Uploads', ['$http', function($http) {

      var baseUrl = "http://35.229.52.103:9007/images/college";

      return {

        upload : function(file) {

         var url = baseUrl;

         var fd = new FormData();
         fd.append('files', file);

         return $http.post(url, fd, {
             transformRequest: angular.identity,
             headers: {'Content-Type': undefined}
         });

        }

      }

    }])

  .factory("User", ['$localStorage', 'jwtHelper', function($localStorage, jwtHelper) {

      return {

        getId : function() {

          return jwtHelper.decodeToken($localStorage.token)._id;

        }

      }

    }])

  .factory('Payments', ['$http', function($http) {

      //var baseUrl = "https://api.universida.de/search";

      var baseUrl = "https://educationalcommunity-pay.herokuapp.com/payments";
      //var baseUrl = "http://192.168.1.7:9004/payments";

      return {

        subscription: function(data) {

          var url = '/subscription';

          return $http({
            method: 'POST',
            url: baseUrl + url,
            data : data,
            transformRequest: function(obj) {
                var str = [];
                for(var p in obj)
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }});

        },

        subscribePro: function(interval) {

          var url = '/subscription/pro';

          let data = { interval : interval };

          return $http({
            method: 'POST',
            url: baseUrl + url,
            data : data,
            transformRequest: function(obj) {
                var str = [];
                for(var p in obj)
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }});

        },
        coursePayment: function(data) {

          var url = '/course';

          return $http({
            method: 'POST',
            url: baseUrl + url, // for now base url is localhost
            data : data,
            headers: {
                'Content-Type': 'application/json'
            }});
        },
      
        getAllOrders: function(id) {

          var url = '/students/id/' + id + '/orders';

          return $http.get(baseUrl + url);

        }

      }


    }])

  .factory('News', ['$http', function($http) {

      //var baseUrl = "https://api.universida.de/search";

      var baseUrl = "https://network-news-prod.herokuapp.com";

      //var baseUrl = "http://192.168.1.7:8888";
      //var baseUrl = "http://192.168.1.7:9004";

      return {

        getAllSections: function() {

          var url = '/news/section';

          return $http.get(baseUrl + url);

        },

        getAllTrends: function() {

          var url = '/news/trends';

          return $http.get(baseUrl + url);

        },

        getNewsBySection: function(id) {

          ///section/id/:id/news

          var url = '/news/section/id/' + id + '/news';

          return $http.get(baseUrl + url);

        },

        writeComment: function(id, data) {

          var url = '/news/id/' + id + '/comment';

          return $http({
            method: 'POST',
            url: baseUrl + url,
            data : data,
            transformRequest: function(obj) {
                var str = [];
                for(var p in obj)
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }});

        },

        vote: function(id) {

          var url = '/news/id/' + id + '/vote';

          return $http({
            method: 'POST',
            url: baseUrl + url,
            transformRequest: function(obj) {
                var str = [];
                for(var p in obj)
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }});

        },

        voteCommentById: function(newsId, commentId) {

          var url = '/news/id/' + newsId + '/comment/' + commentId + '/vote';

          return $http({
            method: 'PUT',
            url: baseUrl + url,
            transformRequest: function(obj) {
                var str = [];
                for(var p in obj)
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }});

        }

      }

    }])

  .factory('Sales', ['$http', function($http) {

      //var baseUrl = "https://api.universida.de/search";

      var baseUrl = "https://educationalcommunity-pay.herokuapp.com";
      //var baseUrl = "http://192.168.1.7:9004";

      return {

        reports: function(id) {

          var url = '/payments/sales/universityid/' + id;

          return $http.get(baseUrl + url);

        },

        reportsByDate: function(id, y, m, d) {

          var url = '/payments/sales/universityid/' + id + "/year/" + y + "/month/" + m + "/day/" + d;

          return $http.get(baseUrl + url);

        }

      }

    }])

  .factory('Courses', ['$http', '$localStorage', function($http, $localStorage) {

      //var baseUrl = "https://api.universida.de/search";

      //var baseUrl = "https://educationalcommunity-pay.herokuapp.com";
      var baseUrl = "https://educationalcommunity-courses.herokuapp.com/courses";
      // var baseUrl="http://localhost:9000/courses"
      return {

        getAll: function(id) {

          let url = "/all";

          return $http.get(baseUrl + url);

        },
   
        getById: function(id) {

          let url = "/id/" + id;

          return $http.get(baseUrl + url);

        },
        getContentModulesByIdmultiple: function(post) {

          let url = "/module/content/all/id";
          return $http({
            method: 'POST',
            data: {id:post},
            url: baseUrl + url,
            transformRequest: function(obj) {
                var str = [];
                for(var p in obj)
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }});
         },
        create: function(data) {

          var url = '/create' ;

          return $http({
            method: 'POST',
            data: data,
            url: baseUrl + url,
            transformRequest: function(obj) {
                var str = [];
                for(var p in obj)
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }});

        },
        getTimeline: function(id) {

          let url = "/module/get/timeline/" + id;

          return $http.get(baseUrl + url);

        },
        insertTimeline: function(id, data) {

          var url = '/module/create/timeline/' + id;

          return $http({
            method: 'POST',
            data: data,
            url: baseUrl + url,
            transformRequest: function(obj) {
                var str = [];
                for(var p in obj)
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }});

        },
        updateModuleById: function(id, data) {

          var url = '/module/id/' + id;

          return $http({
            method: 'PUT',
            data: data,
            url: baseUrl + url,
            transformRequest: function(obj) {
                var str = [];
                for(var p in obj)
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }});

        },

        createModule: function(data) {

          var url = '/module/create' ;

          return $http({
            method: 'POST',
            data: data,
            url: baseUrl + url,
            transformRequest: function(obj) {
                var str = [];
                for(var p in obj)
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }});

        },

        createContentModule: function(data) {

          var url = '/module/content/create' ;

          return $http({
            method: 'POST',
            data: data,
            url: baseUrl + url,
            transformRequest: function(obj) {
                var str = [];
                for(var p in obj)
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }});

        },

        getContentModulesByAccount: function() {

          var url = '/module/content/owner';

          return $http({
            method: 'GET',
            url: baseUrl + url,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'x-access-token': $localStorage.token
          }})

        },

        getCoursesByAccount: function(universityId) {

          var url = '/owner';

          return $http({
            method: 'GET',
            url: baseUrl + url,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'x-access-token': $localStorage.token
          }})

        },

        getModuleById: function(id) {

          let url = "/module/id/" + id;

          return $http.get(baseUrl + url);

        },
        
        getModulesByAccount: function() {

          var url = '/module/owner';

          return $http({
            method: 'GET',
            url: baseUrl + url,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'x-access-token': $localStorage.token
          }})

        },
        getContentModuleBymodelId: function(id) {

          let url = "/module/content/BymodelId/" + id;

          return $http.get(baseUrl + url);

        },
        getContentModuleById: function(id) {

          let url = "/module/content/id/" + id;

          return $http.get(baseUrl + url);

        },

        payment: function(courseId, data ) {

          var url = '/payment/' + courseId;

          return $http({
            method: 'PUT',
            url: baseUrl + url,
            data : data,
            headers: {
                'Content-Type': 'application/json'
            }});
        },

      }

    }])


;
