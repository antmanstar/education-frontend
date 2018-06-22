$(document).ready(function() {

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

    console.log(width);

    if (navbarMobileOpen) {
      navbarMobile.css("display", "none");
      brandArrow.attr("class", "fas fa-angle-down");
      navbarMobileOpen = false;
    } else {
      navbarMobile.css("display", "block");
      brandArrow.attr("class", "fas fa-angle-up");
      navbarMobileOpen = true;
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

});
