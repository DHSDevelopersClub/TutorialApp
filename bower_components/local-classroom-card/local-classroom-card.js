/**
 * local-classroom-card.js
 *
 * Author: Alexander Otavka
 */

Polymer({
    toggleSignup: function() {
        this.data.signedup = !this.data.signedup;
        this.syncSignup();
    },
    syncSignup: function() {
        if (this.data.signedup) {
            this.fire("local-signup", {classid: this.data.id});
        } else {
            this.fire("local-unsignup", {classid: this.data.id});
        }
    },
});
