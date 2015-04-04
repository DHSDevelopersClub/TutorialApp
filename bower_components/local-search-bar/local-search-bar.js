/**
 * local-search-bar.js
 *
 * Main script for local-search-bar.
 */

(function () {
    "use strict";

    var trySetZ = function(context, newZ) {
        try {
            context.$.container.querySelector("#searchBox").setZ(newZ);
        } catch(e) {
            if (!context.mediaIsMobile || !(e instanceof TypeError)) {
                throw e;
            }
        }
    };

    Polymer({
        MODE_NULL: 0,
        MODE_SEARCH: 1,

        search: "",
        inputValue: "",
        mode: 0,
        searching: false,

        inputValueChanged: function(oldValue) {
            var context = this;
            var startValue = this.inputValue;
            this.searching = true;
            setTimeout(function() {
                if (context.inputValue == startValue) {
                    context.search = context.inputValue;
                    context.searching = false;
                }
            }, 1000);
        },

        enableSearchMode: function() {
            if (this.mode === this.MODE_SEARCH) return;

            var context = this;
            try {
                this.$.container.querySelector("#searchBox").setZ(0);
            } catch(e) {
                setTimeout(function() {
                    trySetZ(context, 0);
                }, 100);
            }
            setTimeout(function() {
                context.focusInput();
            }, 100);

            this.mode = this.MODE_SEARCH;
            this.fire("local-search-mode-enable");
        },

        disableSearchMode: function() {
            if (this.mode !== this.MODE_SEARCH) {
                return;
            }
            trySetZ(this, 1);

            this.mode = this.MODE_NULL;
            this.clearInput();
        },

        clearInput: function() {
            this.inputValue = "";
            this.search = "";
            this.focusInput();
        },

        focusInput: function() {
            this.$.container.querySelector("#boxInput").focus();
        }
    });
}());
