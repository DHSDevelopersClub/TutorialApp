/**
 * local-classroom-manager.js
 */

(function () {
    "use strict";

    // TODO: remove with fake server
    /*Array.prototype.move = function (item, new_index) {
        var old_index = this.indexOf(item);
        if (new_index >= this.length) {
            var k = new_index - this.length;
            while ((k--) + 1) {
                this.push(undefined);
            }
        }
        this.splice(new_index, 0, this.splice(old_index, 1)[0]);
        return this; // for testing purposes
    };*/

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

    // TODO: remove fake server
    /*
    var FAKE_SERVER = {
        data: {
          "classrooms": [
            {
              "dsid": "a39hsefosFHSO4892",
              "teacher": "Mr. Milstead",
              "profilepic": "http://cache3.asset-cache.net/gc/57442583-portrait-of-a-school-teacher-gettyimages.jpg?v=1&c=IWSAsset&k=2&d=Y3hy48kuiy7pabQpAfxaQrcgpfAMUuQ1FcwFl8J80Es%3D",
              "room": "127",
              "totalseats": 30,
              "takenseats": 14,
              "signedup": true
            },
            {
              "dsid": "bh9hsefk23hrkO489",
              "teacher": "Mrs. Foo",
              "profilepic": "http://mcauliffe.dpsk12.org/wp-content/uploads/2011/09/StephanieGronholz_Retouch-square-crop.jpg",
              "room": "222",
              "totalseats": 28,
              "takenseats": 28,
              "signedup": false
            },
            {
              "dsid": "Clghi4k23hrkO4892",
              "teacher": "Mr. Bar",
              "profilepic": "http://4.bp.blogspot.com/-sXyOdCbaVi4/UA7dYAwjUCI/AAAAAAAAFmI/tbO4vxpVHS4/s220/nfowkes-square.jpg",
              "room": "409",
              "totalseats": 30,
              "takenseats": 28,
              "signedup": false
            },
            {
              "dsid": "d8s4hOFH4h84HOf48",
              "teacher": "Mrs. Wolfeschlegelsteinhausenbergerdorff",
              "profilepic": "http://cache2.asset-cache.net/gc/dv1313056-portrait-of-a-mature-teacher-gettyimages.jpg?v=1&c=IWSAsset&k=2&d=jDI%2BiZbzwv%2BjFYTsYAzbzRIz392Wxp0jHzYXiV6NO3k%3D",
              "room": "413",
              "totalseats": 18,
              "takenseats": 17,
              "signedup": false
            },
            {
              "dsid": "ehHUE7e2BF2Hkkeuk",
              "teacher": "Mrs. Example",
              "profilepic": "http://cache4.asset-cache.net/gc/57442708-portrait-of-a-female-school-teacher-gettyimages.jpg?v=1&c=IWSAsset&k=2&d=E5y3FqGCZA78hfJC8P3s3hrnAf50DBBxD1Fa1hqvjx8%3D",
              "room": "104A",
              "totalseats": 33,
              "takenseats": 3,
              "signedup": false
            }
          ]
        },
        getData: function(search, date, callback) {
            var data = JSON.stringify(this.data);
            callback(JSON.parse(data));
        },
        _changeEntry: function(classroom, signedup) {
            var signedup = Boolean(signedup);
            var status;
            if (classroom.signedup !== signedup) {
                classroom.takenseats += signedup ? 1 : -1;
                if (classroom.takenseats <= classroom.totalseats) {
                    if (signedup) {
                        this.data.classrooms.move(classroom, 0);
                    }
                    classroom.signedup = signedup;
                    status = 0;
                } else {
                    classroom.takenseats = classroom.totalseats;
                    status = 2;
                }
            } else {
                status = 1;
            }
        },
        postData: function(dsid, signedup, callback) {
            var classroom = findClassroomById(this.data.classrooms, dsid);
            this._changeEntry(classroom, signedup);

            if (signedup) {
                var previousSignedup = findClassroom(this.data.classrooms, function(classroom) {
                    return classroom.signedup && (classroom.dsid !== dsid);
                });
                if (previousSignedup !== undefined) {
                    this._changeEntry(previousSignedup, false);
                }
            }

            setTimeout(function() {
                callback(classroom.signedup, status);
            }, 1000);
        }
    }
    */

    var sendGetRequest = function(search, date, callback) {
        if (gapi.client === undefined) return;
        gapi.client.tutorialsignup.list_classes({
            "search": search,
            "date": date
        }).execute(callback);
    }

    var sendPostRequest = function(dsid, parent_id, signup, callback) {
        gapi.client.tutorialsignup.signup({
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

        classroomsChanged: function() {
            this.updateClassroomCards();
        },

        searchChanged: function(oldValue) {
            this.load(true);
        },

        dateChanged: function(oldValue) {
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
            var animate = Boolean(animate);
            var context = this;

            var contentAnimation = this.$.contentAnimation;
            contentAnimation.target = this.$.container;
            if (animate) {
                contentAnimation.direction = "normal";
                contentAnimation.play();
                this.$.loadingSpinner.active = true;
                this.$.loadingSpinner.removeAttribute("hidden");
            }

            sendGetRequest(this.search, this.date, function(response) {
                context.signedIn = checkSignedIn(response);
                context.classrooms = (response.classrooms !== undefined) ?
                                     response.classrooms : [];
                context.updateClassroomCards();
                if (animate) {
                    contentAnimation.direction = "reverse";
                    contentAnimation.play();
                    context.$.loadingSpinner.active = false;
                    context.$.loadingSpinner.setAttribute("hidden", "");
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
