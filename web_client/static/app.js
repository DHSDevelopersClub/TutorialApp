/**
 * app.js
 *
 * Javascript for app template in index.html.
 *
 * Author: Alexander Otavka
 */

var app = document.querySelector("template#app");
app.search = "";
app.date = "";

app.addEventListener("template-bound", function() {
    "use strict";

    var actionBarSearchAnimation = (function() {
        /* Search transition animation for the action bar. */
        var green = "#4CB04F";
        var grey = "#ABABAB";

        var anim = new CoreAnimationGroup();
        anim.type = "par";
        anim.duration = 200;

        var bg = new CoreAnimation();
        bg.target = app.$.actionBarToolbar;
        bg.fill = "forwards";
        bg.keyframes = [{backgroundColor: green},
                        {backgroundColor: grey}];
        anim.appendChild(bg);

        var buttons = new CoreAnimation();
        buttons.target = app.$.actionButtons;
        buttons.fill = "forwards";
        buttons.keyframes = [{opacity: 1},
                             {opacity: 0}];
        anim.appendChild(buttons);

        var nav = new CoreAnimation();
        nav.target = app.$.navWrapper;
        nav.fill = "forwards";
        var default_nav_keyframes = [{opacity: 0, left: "-15px"},
                                     {opacity: 1, left: "0px"}];
        var reverse_nav_keyframes = [{opacity: 0, left: "15px"},
                                     {opacity: 1, left: "0px"}];
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
    var searchBoxResizeAnimation = (function() {
        var anim = new CoreAnimationGroup();
        anim.type = "par";
        anim.duration = 200;

        var nav = new CoreAnimation();
        nav.target = app.$.navWrapper;
        anim.appendChild(nav);

        var ab = new CoreAnimation();
        ab.target = app.$.actionButtons;
        anim.appendChild(ab);

        anim.setKeyframes = function (newKeyframes) {
            for (var i=0; i < anim.children.length; i++) {
                anim.children[i].keyframes = newKeyframes;
            }
        };

        return anim;
    }());

    app.onReady = function() {
        gapi.client.tutorialsignup.next_tutorial().execute(function(response) {
            app.date = response.date;
        });
    };

    app.onMediaMobileChange = function() {
        /* Align the search bar based on media and search state. */

        var inSearchMode = function () {
            return (app.$.searchBar.mode === app.$.searchBar.MODE_SEARCH);
        };

        if (app.mediaIsMobile && inSearchMode()) {
            app.$.actionButtons.setAttribute("hidden", "");
            app.$.navBackText.setAttribute("hidden", "");
            app.$.searchBar.$.boxWrapper.style.textAlign = "left";
        } else {
            app.$.actionButtons.removeAttribute("hidden");
            app.$.navBackText.removeAttribute("hidden");
            app.$.searchBar.$.boxWrapper.style.textAlign = "center";
        }

        if (!inSearchMode()) {
            for (var i = 0; i < app.$.actionButtons.children.length; i++) {
                app.$.actionButtons.children[i].removeAttribute("hidden");
            }
        }

        var oldNavWid;
        var oldABWid;
        if (!app.mediaIsMobile) {
            oldNavWid = app.$.navWrapper.offsetWidth;
            oldABWid = app.$.actionButtons.offsetWidth;
        }

        app.$.navWrapper.style.width = "auto";
        app.$.actionButtons.style.width = "auto";

        if (!app.mediaIsMobile) {
            var widthMargin = Math.max(app.$.actionButtons.offsetWidth,
                                       app.$.navWrapper.offsetWidth) + 2;
            var snapToWidth = function () {
                app.$.navWrapper.style.width = widthMargin + "px";
                app.$.actionButtons.style.width = widthMargin + "px";

                if (app.$.searchBar.mode === app.$.searchBar.MODE_SEARCH) {
                    for (var i = 0; i < app.$.actionButtons.children.length; i++) {
                        app.$.actionButtons.children[i].setAttribute("hidden", "");
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
    };
    app.onMediaMobileChange();

    app.enableSearchMode = function() {
        actionBarSearchAnimation.play();

        app.$.navTitle.setAttribute("hidden", "");
        app.$.navBack.removeAttribute("hidden");
        app.onMediaMobileChange();
    };

    app.disableSearchMode = function() {
        if (app.$.searchBar.mode !== app.$.searchBar.MODE_SEARCH) return;

        app.$.searchBar.disableSearchMode();
        actionBarSearchAnimation.playReverse();

        app.$.navBack.setAttribute("hidden", "");
        app.$.navTitle.removeAttribute("hidden");
        app.onMediaMobileChange();
    };

    app.refresh = function() {
        app.$.classroomManager.load(true);
    };

    app.signOut = function() {
        gapi.auth.setToken(null);
        app.refresh(true);
    };
});
