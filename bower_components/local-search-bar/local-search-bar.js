/**
 * local-search-bar.js
 *
 * Main script for local-search-bar.
 */

(function () {
    "use strict";

    Polymer({
        MODE_NULL: 0,
        MODE_SEARCH: 1,

        search: "",
        inputValue: "",
        mode: 0,

        inputValueChanged: function(oldValue) {
            var context = this;
            var startValue = this.inputValue;
            setTimeout(function() {
                if (context.inputValue == startValue) {
                    context.search = context.inputValue;
                }
            }, 1000);
        },

        enableSearchMode: function() {
            if (this.mode === this.MODE_SEARCH) {
                return;
            }
            this.$.container.querySelector("#searchBox").setZ(0);
            var context = this;
            setTimeout(function() {
//                container.querySelector("#boxInput").focus();
                context.focusInput();
            }, 100);

            this.mode = this.MODE_SEARCH;
            this.fire("local-search-mode-enable");
        },

        disableSearchMode: function() {
            if (this.mode !== this.MODE_SEARCH) {
                return;
            }
            this.$.container.querySelector("#searchBox").setZ(1);

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
