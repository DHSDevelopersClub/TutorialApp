/**
 * local-classroom-card.js
 *
 * Author: Alexander Otavka
 */

Polymer({
    updateButton: function() {
        var signedup = this.data.signedup;
        if (this.mediaIsTiny) {
            var checkbox = this.$.button.querySelector("#paperCheckbox");
            if (checkbox === null) return;
            if (signedup) {
                if (!checkbox.hasAttribute("checked")) {
                    checkbox.setAttribute("checked", "");
                }
            } else {
                checkbox.removeAttribute("checked");
            }
        } else {
            var button = this.$.button.querySelector("#paperButton");
            if (button === null) return;
            if (signedup) {
                button.classList.add("signedup");
            } else {
                button.classList.remove("signedup");
            }
        }
    },
    toggleSignup: function() {
        if (!this.data.signedup) {
            this.fire("local-signup", {classid: this.data.id});
        } else {
            this.fire("local-unsignup", {classid: this.data.id});
        }
        this.updateButton();
    },
});
