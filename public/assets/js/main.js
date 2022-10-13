"use strict";
let menu, animate;

$(window).on("load", function () {
  $("#loadingdata").show();
});
setTimeout(function () {
  $("#main-wraper-div").css("display", "block");
  $("#loadingdata").hide();
}, 2000);

!(function () {
  let e = document.querySelectorAll("#layout-menu"),
    t =
      (e.forEach(function (e) {
        (menu = new Menu(e, {
          orientation: "vertical",
          closeChildren: !1,
        })),
          window.Helpers.scrollToActive((animate = !1)),
          (window.Helpers.mainMenu = menu);
      }),
      document.querySelectorAll(".layout-menu-toggle"));
  t.forEach((e) => {
    e.addEventListener("click", (e) => {
      e.preventDefault(), window.Helpers.toggleCollapsed();
    });
  });
  if (document.getElementById("layout-menu")) {
    var l = document.getElementById("layout-menu");
    var o = function () {
      Helpers.isSmallScreen() ||
        document.querySelector(".layout-menu-toggle").classList.add("d-block");
    };
    let e = null;
    (l.onmouseenter = function () {
      e = Helpers.isSmallScreen() ? setTimeout(o, 0) : setTimeout(o, 300);
    }),
      (l.onmouseleave = function () {
        document
          .querySelector(".layout-menu-toggle")
          .classList.remove("d-block"),
          clearTimeout(e);
      });
  }
  let n = document.getElementsByClassName("menu-inner"),
    s = document.getElementsByClassName("menu-inner-shadow")[0];
  0 < n.length &&
    s &&
    n[0].addEventListener("ps-scroll-y", function () {
      this.querySelector(".ps__thumb-y").offsetTop
        ? (s.style.display = "block")
        : (s.style.display = "none");
    });

  function c(e) {
    "show.bs.collapse" == e.type || "show.bs.collapse" == e.type
      ? e.target.closest(".accordion-item").classList.add("active")
      : e.target.closest(".accordion-item").classList.remove("active");
  }
  const i = [].slice.call(
      document.querySelectorAll('[data-bs-toggle="tooltip"]')
    ),
    a =
      (i.map(function (e) {
        return new bootstrap.Tooltip(e);
      }),
      [].slice.call(document.querySelectorAll(".accordion")));
  a.map(function (e) {
    e.addEventListener("show.bs.collapse", c),
      e.addEventListener("hide.bs.collapse", c);
  });
  window.Helpers.setAutoUpdate(!0),
    window.Helpers.initPasswordToggle(),
    window.Helpers.initSpeechToText(),
    window.Helpers.isSmallScreen() || window.Helpers.setCollapsed(!0, !1);
})();

jQuery(document).ready(function ($) {
  var path = window.location.href; // because the 'href' property of the DOM element is the absolute path
  // alert(path);

  $(".menu-inner  .menu-item a").each(function () {
    // alert(this.href);
    if (this.href === path || this.href === " ") {
      var menuItem = $(this).parent(".menu-item");
      menuItem.addClass("active");
      var submenu = $(this).closest(".menu-sub");
      if (submenu.find(".menu-item").hasClass("active")) {
        $(".menu-sub").parents(".menu-item").removeClass("active");
        $(submenu).parents("li.menu-item").addClass("active");
        $(submenu).parents("li.menu-item").addClass("open");
      }
    }
  });
  // account form toggle
  $("#contenteditbtn").hide();
  $("#editForm").hide();
  $("#contentbtn").click(function () {
    $("#contentmainForm").hide();
    $("#editForm").show();
    $("#contentbtn").hide();
    $("#contenteditbtn").show();
  });

  $("#contenteditbtn").click(function () {
    $("#contentmainForm").show();
    $("#editForm").hide();
    $("#contenteditbtn").hide();
    $("#contentbtn").show();
  });
});
