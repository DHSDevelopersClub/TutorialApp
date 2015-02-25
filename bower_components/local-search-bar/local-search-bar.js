/**
 * local-search-bar.js
 *
 * Main script for local-search-bar.
 */

(function () {
    "use strict";

    Polymer({
        ready: function () {
            this.MODE_NULL = 0;
            this.MODE_SEARCH = 1;
            this.MODE_BUTTON = 2;
            this.MODE_BOX = 3;

            this.search = "";
            this.mode = this.MODE_NULL;
            this.mediaMobile = null;

//            this.searchListener = (function (context) {
//                return function (event) {
//                    context.search = context.$.boxInput.committedValue;
//                    context.fire("search-change");
//                };
//            }(this));
        },

        mediaMobileChanged: function (oldValue) {
            if (this.mode === this.MODE_SEARCH) {
                return;
            } else if (this.mediaMobile) {
                this.setButtonMode();
            } else {
                this.setBoxMode();
            }
        },

        setButtonMode: function () {
            if (this.mode === this.MODE_BUTTON) {
                return;
            }
            this.mode = this.MODE_BUTTON;

            this.$.boxWrapper.setAttribute("hidden", "");
            this.$.iconButtonWrapper.removeAttribute("hidden");
        },

        setBoxMode: function () {
            if (this.mode === this.MODE_BOX) {
                return;
            }
            this.mode = this.MODE_BOX;

            this.$.iconButtonWrapper.setAttribute("hidden", "");
            this.$.boxWrapper.removeAttribute("hidden");
        },

        enableSearchMode: function () {
            if (this.mode === this.MODE_SEARCH) {
                return;
            }
            this.setBoxMode();
            this.mode = this.MODE_SEARCH;

            this.$.boxButtonWrapper.setAttribute("hidden", "");
            this.$.boxInputWrapper.removeAttribute("hidden");
            this.$.searchBox.setZ(0);

            this.$.boxInput.focus();
//            this.$.boxInput.addEventListener("change",
//                                             this.searchListener);

            this.fire("search-mode-enable");
        },

        disableSearchMode: function () {
            if (this.mode !== this.MODE_SEARCH) {
                return;
            }
            this.mode = this.MODE_NULL;

            this.$.boxInputWrapper.setAttribute("hidden", "");
            this.$.boxButtonWrapper.removeAttribute("hidden");
            this.$.searchBox.setZ(1);

//            this.clearInput();
//            this.$.boxInput.removeEventListener("change",
//                                                this.searchListener);
            this.search = "";

            this.mediaMobileChanged();
        },

        clearInput: function () {
            this.$.boxInput.value = "";
            this.$.boxInput.commit();
            if (this.mode === this.MODE_SEARCH) {
                this.$.boxInput.focus();
            }
        }
    });
}());
