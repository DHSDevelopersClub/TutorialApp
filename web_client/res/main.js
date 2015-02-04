/**
 * main.js
 *
 * Javascript for index.html.
 */

window.addEventListener("polymer-ready", function () {
    "use strict";

    /* Element Selectors. */
    var mediaMobile = document.getElementById("mediaMobile");
    var navWrapper = document.getElementById("navWrapper");
    var navBack = document.getElementById("navBack");
    var backButton = document.getElementById("backButton");
    var navBackText = document.getElementById("navBackText");
    var navTitle = document.getElementById("navTitle");
    var searchBar = document.getElementById("searchBar");
    var searchBoxWrapper = document.querySelector("#searchBar").$.boxWrapper;
    var actionButtons = document.getElementById("actionButtons");
    var actionButtonList = document.querySelectorAll("#actionButtons paper-icon-button");
    var refreshButton = document.getElementById("refreshButton");
    var moreButton = document.getElementById("moreButton");
    var classroomManager = document.getElementById("classroomManager");

    /* Animation Declaration. */
    var actionBarSearchAnimation = (function () {
        /* Search transition animation for the action bar. */
        var green = "#4CB04F";
        var grey = "#ABABAB";

        var anim = new CoreAnimationGroup();
        anim.type = "par";
        anim.duration = 200;

        var bg = new CoreAnimation();
        bg.target = document.getElementById("actionBar");
        bg.fill = "forwards";
        bg.keyframes = [{backgroundColor: green},
                        {backgroundColor: grey}];
        anim.appendChild(bg);

        var buttons = new CoreAnimation();
        buttons.target = document.getElementById("actionButtons");
        buttons.fill = "forwards";
        buttons.keyframes = [{opacity: 1},
                             {opacity: 0}];
        anim.appendChild(buttons);

        var nav = new CoreAnimation();
        nav.target = document.getElementById("navWrapper");
        nav.fill = "forwards";
        var default_nav_keyframes = [{opacity: 0, left: "-15px"},
                                     {opacity: 1, left: "0px"}];
        var reverse_nav_keyframes = [{left: "15px"},
                                     {left: "0px"}];
        nav.keyframes = default_nav_keyframes;
        anim.appendChild(nav);

        anim.playReverse = function () {
            bg.direction = "reverse";
            buttons.direction = "reverse";
            nav.keyframes = reverse_nav_keyframes;
            anim.play();
            bg.direction = "normal";
            buttons.direction = "normal";
            nav.keyframes = default_nav_keyframes;
        };

        return anim;
    }());
    var searchBoxResizeAnimation = (function () {
        var anim = new CoreAnimationGroup();
        anim.type = "par";
        anim.duration = 200;

        var nav = new CoreAnimation();
        nav.target = navWrapper;
        anim.appendChild(nav);

        var ab = new CoreAnimation();
        ab.target = actionButtons;
        anim.appendChild(ab);

        anim.setKeyframes = function (newKeyframes) {
            for (var i=0; i < anim.children.length; i++) {
                anim.children[i].keyframes = newKeyframes;
            }
        };

        return anim;
    }());

    /* Function Definitions. */
    var fireMediaEvent = (function () {
        var event = new CustomEvent("core-media-change", {});
        return function (media) {
            media.dispatchEvent(event);
        };
    }());

    /* Align the search bar based on media and search state. */
    mediaMobile.addEventListener("core-media-change", function () {
        var onMobile = mediaMobile.queryMatches;
        var inSearchMode = (searchBar.mode === searchBar.MODE_SEARCH);

        if (onMobile && inSearchMode) {
            actionButtons.setAttribute("hidden", "");
            navBackText.setAttribute("hidden", "");
            searchBoxWrapper.style.textAlign = "left";
        } else {
            actionButtons.removeAttribute("hidden");
            navBackText.removeAttribute("hidden");
            searchBoxWrapper.style.textAlign = "center";
        }

        if (!inSearchMode) {
            for (var i = 0; i < actionButtonList.length; i++) {
                actionButtonList[i].removeAttribute("hidden");
            }
        }

        var oldNavWid;
        var oldABWid;
        if (!onMobile) {
            oldNavWid = navWrapper.offsetWidth;
            oldABWid = actionButtons.offsetWidth;
        }

        navWrapper.style.width = "auto";
        actionButtons.style.width = "auto";

        if (!onMobile) {
            var widthMargin = Math.max(actionButtons.offsetWidth,
                                       navWrapper.offsetWidth) + 2;
            var snapToWidth = function () {
                navWrapper.style.width = widthMargin + "px";
                actionButtons.style.width = widthMargin + "px";

                if (searchBar.mode === searchBar.MODE_SEARCH) {
                    for (var i = 0; i < actionButtonList.length; i++) {
                        actionButtonList[i].setAttribute("hidden", "");
                    }
                }
            };
            if (oldABWid === oldNavWid) {
                var oldWidth = oldNavWid;
                searchBoxResizeAnimation.setKeyframes(
                        [{width: oldWidth + "px"},
                         {width: widthMargin + "px"}]);
                // TODO: make fill = "forwards" work, so slower browsers look good
                searchBoxResizeAnimation.addEventListener(
                        "core-animation-finish", snapToWidth);
                searchBoxResizeAnimation.play();
            } else {
                snapToWidth();
            }
        }
    });

    /* Add tap and change event listeners for search. */
    searchBar.addEventListener("search-mode-enable", function () {
        actionBarSearchAnimation.play();

        navTitle.setAttribute("hidden", "");
        navBack.removeAttribute("hidden");
        fireMediaEvent(mediaMobile);
    });
    searchBar.addEventListener("search-change", function () {
        // NOTE: local-classroom-manager search will work as soon as classroom manager is implemented
        console.log("search changed to '" + searchBar.search + "'");
        classroomManager.search = searchBar.search;
    });

    /* Add click event listener for back button. */
    backButton.addEventListener("click", function () {
        searchBar.disableSearchMode();
        actionBarSearchAnimation.playReverse();

        navBack.setAttribute("hidden", "");
        navTitle.removeAttribute("hidden");
        fireMediaEvent(mediaMobile);
    });

    /* Add click event listener for action buttons. */
    refreshButton.addEventListener("click", classroomManager.load);
    moreButton.addEventListener("click", function () {
        // TODO: implement more button
        console.log("more button pressed");
    })
});
