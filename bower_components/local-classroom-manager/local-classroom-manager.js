/**
 * local-classroom-manager.js
 */

(function () {
    "use strict";

    var findClassroom = function(classrooms, isCorrect) {
        for (var i = 0; i < classrooms.length; i++) {
            if (isCorrect(classrooms[i])) {
                return classrooms[i];
            }
        }
    };

    var findClassroomById = function(classrooms, dsid) {
        return findClassroom(classrooms, function(classroom) {
            return classroom.dsid === dsid
        });
    };

    var sendGetRequest = function(search, date, callback) {
        if (gapi.client === undefined) return;
        gapi.client.dhstutorial.list_classes({
            "search": search,
            "date": date,
        }).execute(callback);
    }

    var sendPostRequest = function(dsid, parent_id, signup, callback) {
        gapi.client.dhstutorial.signup({
            "dsid": dsid,
            "parent_id": parent_id,
            "signup": signup,
        }).execute(callback);
    };

    var checkSignedIn = function(response) {
        if (!response.code) {
            return true;
        } else if (response.code === 401) {
            return false;
        } else if (response.code === 503) {
            gapi.client.oauth2.userinfo.get().execute(function(resp) {
                if (response.code === 401) {
                    return false;
                }
            });
        }
        return null;
    };


    Polymer({
        classrooms: [],
        search: "",
        date: "",
        signedIn: null,
        pendingRequests: 0,
        loaded: false,

        classroomsChanged: function() {
            this.updateClassroomCards();
        },

        searchChanged: function(oldValue) {
            this.loaded = true;
            this.load(true);
        },

        dateChanged: function(oldValue) {
            this.loaded = true;
            this.load(true);
        },

        signIn: function() {
            var context = this;
            this.signedIn = null;
            window.signIn(false, function() {
                context.load(true);
            });
        },

        load: function(animate) {
            if (gapi.client === undefined || !this.loaded) return;

            var animate = Boolean(animate);
            var context = this;

            var contentAnimation = this.$.contentAnimation;
            contentAnimation.target = this.$.container;
            if (!this.pendingRequests++ && animate) {
                contentAnimation.direction = "normal";
                contentAnimation.play();
                this.loaded = false;
            }

            sendGetRequest(this.search, this.date, function(response) {
                context.signedIn = checkSignedIn(response);
                context.classrooms = (response.classrooms !== undefined) ?
                                     response.classrooms : [];
                context.updateClassroomCards();
                if (!--context.pendingRequests && animate) {
                    context.loading = false;
                    contentAnimation.direction = "reverse";
                    contentAnimation.play();
                    context.loaded = true;
                }
            });
        },

        updateClassroomCards: function() {
            for (var i = 0; i < this.classrooms.length; i++) {
                var remainingSeats = this.classrooms[i].totalseats - this.classrooms[i].takenseats;
                if (remainingSeats === 0) {
                    this.classrooms[i].remainingseats = "no seats remain";
                } else if (remainingSeats === 1) {
                    this.classrooms[i].remainingseats = "1 seat remains";
                } else {
                    this.classrooms[i].remainingseats = String(remainingSeats) + " seats remain";
                }
            }
        },

        onSignup: function(event) {
            var context = this;

            findClassroomById(this.classrooms, event.detail.dsid).takenseats ++;
            sendPostRequest(event.detail.dsid, event.detail.parent_id, true, function(response) {
                context.signedIn = checkSignedIn(response);
            });

            var previousSignedupClassroom = findClassroom(this.classrooms, function(classroom) {
                return classroom.signedup && (classroom.dsid !== event.detail.dsid);
            });
            if (previousSignedupClassroom !== undefined) {
                previousSignedupClassroom.signedup = false;
                previousSignedupClassroom.takenseats --;
            }
            this.updateClassroomCards();
        },

        onUnsignup: function(event) {
            var context = this;

            findClassroomById(this.classrooms, event.detail.dsid).takenseats --;
            sendPostRequest(event.detail.dsid, event.detail.parent_id, false, function(response) {
                context.signedIn = checkSignedIn(response);
            });
            this.updateClassroomCards();
        },
    });
})();
