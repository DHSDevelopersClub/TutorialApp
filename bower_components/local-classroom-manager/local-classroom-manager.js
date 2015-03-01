/**
 * local-classroom-manager.js
 */

(function () {
    "use strict";

    Array.prototype.move = function (item, new_index) {
        var old_index = this.indexOf(item);
        if (new_index >= this.length) {
            var k = new_index - this.length;
            while ((k--) + 1) {
                this.push(undefined);
            }
        }
        this.splice(new_index, 0, this.splice(old_index, 1)[0]);
        return this; // for testing purposes
    };

    var findClassroom = function(classrooms, isCorrect) {
        for (var i = 0; i < classrooms.length; i++) {
            if (isCorrect(classrooms[i])) {
                return classrooms[i];
            }
        }
    };

    var findClassroomById = function(classrooms, id) {
        return findClassroom(classrooms, function(classroom) {
            return classroom.id === id
        });
    };

    var FAKE_SERVER = {
        data: {
          "classrooms": [
            {
              "id": "a39hsefosFHSO4892",
              "teacher": "Mr. Milstead",
              "profilepic": "http://cache3.asset-cache.net/gc/57442583-portrait-of-a-school-teacher-gettyimages.jpg?v=1&c=IWSAsset&k=2&d=Y3hy48kuiy7pabQpAfxaQrcgpfAMUuQ1FcwFl8J80Es%3D",
              "room": "127",
              "totalseats": 30,
              "takenseats": 14,
              "signedup": true
            },
            {
              "id": "bh9hsefk23hrkO489",
              "teacher": "Mrs. Foo",
              "profilepic": "http://mcauliffe.dpsk12.org/wp-content/uploads/2011/09/StephanieGronholz_Retouch-square-crop.jpg",
              "room": "222",
              "totalseats": 28,
              "takenseats": 28,
              "signedup": false
            },
            {
              "id": "Clghi4k23hrkO4892",
              "teacher": "Mr. Bar",
              "profilepic": "http://4.bp.blogspot.com/-sXyOdCbaVi4/UA7dYAwjUCI/AAAAAAAAFmI/tbO4vxpVHS4/s220/nfowkes-square.jpg",
              "room": "409",
              "totalseats": 30,
              "takenseats": 28,
              "signedup": false
            },
            {
              "id": "d8s4hOFH4h84HOf48",
              "teacher": "Mrs. Wolfeschlegelsteinhausenbergerdorff",
              "profilepic": "http://cache2.asset-cache.net/gc/dv1313056-portrait-of-a-mature-teacher-gettyimages.jpg?v=1&c=IWSAsset&k=2&d=jDI%2BiZbzwv%2BjFYTsYAzbzRIz392Wxp0jHzYXiV6NO3k%3D",
              "room": "413",
              "totalseats": 18,
              "takenseats": 17,
              "signedup": false
            },
            {
              "id": "ehHUE7e2BF2Hkkeuk",
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
            if (!window.apiSignedIn) return;
            var data = JSON.stringify(this.data);
            setTimeout(function() {
                callback(data);
            }, 200);
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
        postData: function(id, signedup, callback) {
            if (!window.apiSignedIn) return;
            var classroom = findClassroomById(this.data.classrooms, id);
            this._changeEntry(classroom, signedup);

            if (signedup) {
                var previousSignedup = findClassroom(this.data.classrooms, function(classroom) {
                    return classroom.signedup && (classroom.id !== id);
                });
                if (previousSignedup !== undefined) {
                    this._changeEntry(previousSignedup, false);
                }
            }

            setTimeout(function() {
                callback(classroom.signedup, status);
            }, 200);
        }
    }

    var sendGetRequest = function(search, date, callback) {
        // TODO: send an actual request to the server instead of using FAKE_DATA
        //var request = gapi.client.oauth2.userinfo.get().execute(function(resp) {
        //    if (!resp.code) {
        //        // User is signed in, call my Endpoint
        //        console.log("debug loading...");
        //    }
        //});
        FAKE_SERVER.getData(search, date, callback);
    }

    var sendPostRequest = function(id, signedup, callback) {
        // TODO: send a real server request
        FAKE_SERVER.postData(id, signedup, callback);
    };

    Polymer({
        classrooms: [],
        search: "",
        date: "",
        FAKE_SERVER: FAKE_SERVER,

        classroomsChanged: function() {
            this.updateClassroomCards();
        },
        searchChanged: function(oldValue) {
            this.load(true);
        },
        dateChanged: function(oldValue) {
            this.load(true);
        },
        load: function(animate) {
            // TODO: implement reload animation
            var animate = Boolean(animate);
            var context = this;

            sendGetRequest(this.search, this.date, function(response) {
                context.classrooms = JSON.parse(response).classrooms;
                context.updateClassroomCards();
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
            findClassroomById(this.classrooms, event.detail.classid).takenseats ++;
            sendPostRequest(event.detail.classid, true, function(signedup, status) {});

            var previousSignedupClassroom = findClassroom(this.classrooms, function(classroom) {
                return classroom.signedup && (classroom.id !== event.detail.classid);
            });
            if (previousSignedupClassroom !== undefined) {
                previousSignedupClassroom.signedup = false;
                previousSignedupClassroom.takenseats --;
            }
            this.updateClassroomCards();
        },
        onUnsignup: function(event) {
            findClassroomById(this.classrooms, event.detail.classid).takenseats --;
            sendPostRequest(event.detail.classid, false, function(signedup, status) {});
            this.updateClassroomCards();
        },
    });
})();
