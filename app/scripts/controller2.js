'use strict';

/* Controllers */
angular.module('netbase')

.controller('AccountCtrl', ['$rootScope', '$scope', '$location', '$route', '$localStorage', 'Students', function($rootScope, $scope, $location, $route, $localStorage, Students) {
    // Messages
    $scope.loginMessageBox = false;
    $scope.createMessageBox = false;

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

                    $location.path("/home")

                } else {
                    let statusCode = res.data.status;

                    if (statusCode == 5000) {
                        $scope.loginMessageBox = true;
                        $scope.loginMessage = "Email doesn't exists.";
                    } else if (statusCode == 5001) {
                        $scope.loginMessageBox = true;
                        $scope.loginMessage = "Password is wrong.";
                    } else {
                        $scope.loginMessageBox = false;
                    }
                }
            }).catch(function(e) {
                console.log("response error: ");
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
                    $location.path("/home")

                } else {
                    let statusCode = res.data.status;

                    if (statusCode == 5002) {
                        $scope.createMessageBox = true;
                        $scope.createMessage = "Email already registered.";
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
            if (e == "EMAILINVALIDATED") {
                $scope.createMessage = "Please, type a valid email.";
                $scope.createMessageBox = true;
            } else if (e == "NAMEINVALIDATED") {
                $scope.createMessage = "Please, type a name larger than 2 character.";
                $scope.createMessageBox = true;
            } else if (e == "PASSWORDNOTMATCH") {
                $scope.createMessage = "Please, password must match.";
                $scope.createMessageBox = true;
            } else if (e == "PASSWORDLESSTHANSIX") {
                $scope.createMessage = "Please, password contain at least 6 characters.";
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

/* dashboard university feed */
.controller('DashboardUniversityFeedCtrl', ['$rootScope', '$scope', '$location', function($rootScope, $scope, $location) {

}])

/* home - social marketplace */
.controller('HomeSocialMarketPlaceCtrl', ['$rootScope', '$scope', '$location', function($rootScope, $scope, $location) {

}])

.controller('HomeSocialMarketPlaceHashTagCtrl', ['$rootScope', '$scope', '$location', function($rootScope, $scope, $location) {

}])

/* home - universidades */
.controller('HomeUniversidadesCtrl', ['$rootScope', '$scope', '$location', 'University', function($rootScope, $scope, $location, University) {
    console.log("universidades!!!")
}])

/* home - empregos */
.controller('HomeJobsCtrl', ['$rootScope', '$scope', '$location', function($rootScope, $scope, $location) {

}])

.controller('HomeJobsCategoryCtrl', ['$rootScope', '$scope', '$location', 'ngDialog', function($rootScope, $scope, $location, ngDialog) {
    $scope.jobListingOpen = function() {
        ngDialog.open({ template: 'partials/jobmodal.html', className: 'ngdialog-theme-default jobmodal' });
    };
}])

/* reset */
.controller('ResetPasswordCtrl', ['$rootScope', '$scope', '$location', function($rootScope, $scope, $location) {

}])

.controller('ResetPasswordNewCtrl', ['$rootScope', '$scope', '$location', function($rootScope, $scope, $location) {

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
        $.post('http://localhost:7000/', { identity: username, device: 'browser' }, null, 'json')
            .done(function(response) {
                console.log("response token: ")
                console.log(response.token)

            })
            .fail(function(error) {
                console.log('Failed to fetch the Access Token with error: ' + error);
            });
    }
}])

.controller('MessengerMenuCtrl', ['$rootScope', '$scope', '$location', function($rootScope, $scope, $location) {
    $rootScope.messengerMenuClass = "col-sm-4 col-md-3 col-lg-2 messenger-menu";
    //$scope.filterGly = "glyphicon glyphicon-triangle-bottom";
}])

/* end messenger */
.controller('HeaderCtrl', ['$rootScope', '$scope', '$location', '$localStorage', 'jwtHelper', 'Search', 'Students', '$route', 'ngDialog', function($rootScope, $scope, $location, $localStorage, jwtHelper, Search, Students, $route, ngDialog) {
    /* header variables */
    let logged = $scope.logged = $localStorage.logged;

    /* functions */
    $scope.login = function() {
        console.log("login")
        ngDialog.open({ template: 'partials/modals/login.html', controller: 'AccountCtrl', className: 'ngdialog-theme-default' });
    }

    $scope.signup = function() {
        console.log("login")
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
            let data = res.data.data;
            $scope.user = data;

            if (data.imageUrl != undefined && data.imageUrl != null) {
                $scope.userImage = data.imageUrl;
            }
        }).catch(function(e) {});
    }
    /* end Search */

    /* home header selected option */
    let url = $route.current;
    let originalPath = url.$$route.originalPath;
    $scope.originalPath = originalPath;

    /* Functions */
    let brand = $(".navbar-top .brand");
    let logo = $("#logo");
    let logoIcon = $("#logoIcon");
    let brandArrow = $(".navbar-top .brand span i");
    let navbarMobile = $(".navbar-mobile");
    let menuRight = $("nav .navbar-top .menu-right");
    let searchButton = $("#searchButtonMobile");
    let searchTextInput = $(".navbar-top .menu-right .form-group input");

    /* bool */
    let navbarMobileOpen = false;
    let navbarMobileSearchOpen = false;

    /* open/close menu mobile */
    brand.click(function() {
        let width = $(window).width();
        if (width <= 768) {
            if (navbarMobileOpen) {
                navbarMobile.css("display", "none");
                brandArrow.attr("class", "fas fa-angle-down");
                navbarMobileOpen = false;
            } else {
                navbarMobile.css("display", "block");
                brandArrow.attr("class", "fas fa-angle-up");
                navbarMobileOpen = true;
            }
        } else {
            window.location.href = '/home'
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

.controller('FooterCtrl', ['$rootScope', '$scope', '$location', function($rootScope, $scope, $location) {

}])

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

.controller('DashboardSmpManageListingEditCtrl', ['$rootScope', '$scope', '$location', 'Upload', '$timeout', 'Search', 'SocialMarketPlace', '$route', 'University', function($rootScope, $scope, $location, Upload, $timeout, Search, SocialMarketPlace, $route, University) {
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
                        url: 'http://api.universida.de/images/smp',
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
    console.log($localStorage.logged)
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

.controller('ProfileCtrl', ['$rootScope', '$scope', '$location', function($rootScope, $scope, $location) {

}])

.controller('IndexCtrl', ['$rootScope', '$scope', '$location', '$localStorage', function($rootScope, $scope, $location, $localStorage) {
    $scope.search = '';
    $scope.$watch("search", function(newValue, oldValue) {
        if ($scope.search.length > 0) {
            $location.path("/search").search({ query: $scope.search });
        }
    });

    // If isn't the first visit, redirects to home
    if ($localStorage.indexVisited) {
        //$location.path("/home");
    }
    $localStorage.indexVisited = true;
}])

.controller('HomeCtrl', ['$rootScope', '$scope', 'ngDialog', 'University', function($rootScope, $scope, ngDialog, University) {
    $scope.showMobileMenu = false;
    $scope.universities = [];
    $scope.clickToOpen = function() {
        ngDialog.open({ template: 'partials/jobmodal.html', className: 'ngdialog-theme-default jobmodal' });
    };

    University.getUniversities().then(function(res) {
        $scope.universities = res.data.data;
    });
}])

/* Business */
.controller('BusinessIndexCtrl', ['$rootScope', '$scope', '$location', function($rootScope, $scope, $location) {

}])

.controller('BusinessSigninCtrl', ['$rootScope', '$scope', '$location', function($rootScope, $scope, $location) {

}])

.controller('BusinessRegisterCtrl', ['$rootScope', '$scope', '$location', function($rootScope, $scope, $location) {

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

.directive('forumpost', ['University', function(University) {
    return {
        restrict: 'E',
        templateUrl: '../partials/forumposttemplate.html',
        replace: true,
        scope: true,
        link: function(scope, element, attr) {
            let post = JSON.parse(attr.p);
            scope.post = post;
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
            let want = JSON.parse(attr.w);

            Students.getStudentById(want.accountId).then(function(res) {
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