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
        mode: 0,

        enableSearchMode: function() {
            if (this.mode === this.MODE_SEARCH) {
                return;
            }
            this.$.container.querySelector("#searchBox").setZ(0);
            var container = this.$.container;
            setTimeout(function() {
                container.querySelector("#boxInput").focus();
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
            var input = this.$.container.querySelector("#boxInput");
            input.value = "";
            input.commit();
            if (this.mode === this.MODE_SEARCH) {
                input.focus();
            }
        },
    });
}());
