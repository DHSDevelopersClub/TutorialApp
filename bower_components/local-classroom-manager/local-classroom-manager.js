/**
 * local-classroom-manager.js
 */

(function () {
    "use strict";

/*    function Room(teacher, seats, roomNumber, profilePic) {
        this.teacher = teacher;
        this.seats = seats;
        this.roomNumber = roomNumber;
        this.profilePic = profilePic;
        this.signedUp = false;
        this.seatsTaken = 0;
        this.seatsLeft = this.seats - this.seatsTaken;
        this.studensInClass = [];

        this.signUp = function (firstName, lastName) {
            this.studentsInClass[this.seatsTaken] = [firstName, lastName];
            this.seatsTaken = this.seatsTaken + 1;
        };
    }

    var rm2 = new Room('Mrs. Foo', 30, 211, 'img.jpg');
    console.log(rm2);*/

    Array.prototype.move = function (old_index, new_index) {
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

    var FAKE_DATA = JSON.stringify({
      "classrooms": [
        {
          "id": "a39hsefosFHSO4892",
          "teacher": "Mr. Milstead",
          "profilepic": "http://cache3.asset-cache.net/gc/57442583-portrait-of-a-school-teacher-" +
                        "gettyimages.jpg?v=1&c=IWSAsset&k=2&d=Y3hy48kuiy7pabQpAfxaQrcgpfAMUuQ1Fc" +
                        "wFl8J80Es%3D",
          "room": "127",
          "totalseats": 30,
          "takenseats": 14,
          "signedup": true
        },
        {
          "id": "bh9hsefk23hrkO489",
          "teacher": "Mrs. Foo",
          "profilepic": "http://mcauliffe.dpsk12.org/wp-content/uploads/2011/09/StephanieGronhol" +
                        "z_Retouch-square-crop.jpg",
          "room": "222",
          "totalseats": 28,
          "takenseats": 28,
          "signedup": false
        },
        {
          "id": "Clghi4k23hrkO4892",
          "teacher": "Mr. Bar",
          "profilepic": "http://4.bp.blogspot.com/-sXyOdCbaVi4/UA7dYAwjUCI/AAAAAAAAFmI/tbO4vxpVH" +
                        "S4/s220/nfowkes-square.jpg",
          "room": "409",
          "totalseats": 30,
          "takenseats": 28,
          "signedup": false
        },
        {
          "id": "d8s4hOFH4h84HOf48",
          "teacher": "Mrs. Wolfeschlegelsteinhausenbergerdorff",
          "profilepic": "http://cache2.asset-cache.net/gc/dv1313056-portrait-of-a-mature-teacher" +
                        "-gettyimages.jpg?v=1&c=IWSAsset&k=2&d=jDI%2BiZbzwv%2BjFYTsYAzbzRIz392Wx" +
                        "p0jHzYXiV6NO3k%3D",
          "room": "413",
          "totalseats": 18,
          "takenseats": 17,
          "signedup": false
        },
        {
          "id": "ehHUE7e2BF2Hkkeuk",
          "teacher": "Mrs. Example",
          "profilepic": "http://cache4.asset-cache.net/gc/57442708-portrait-of-a-female-school-t" +
                        "eacher-gettyimages.jpg?v=1&c=IWSAsset&k=2&d=E5y3FqGCZA78hfJC8P3s3hrnAf5" +
                        "0DBBxD1Fa1hqvjx8%3D",
          "room": "104A",
          "totalseats": 33,
          "takenseats": 3,
          "signedup": false
        }
      ]
    });

    var FAKE_SERVER = {
        data: JSON.parse(FAKE_DATA),
        getData: function(search, date) {
            return JSON.stringify(this.data);
        },
        postData: function(id, signedup, callback) {
            var classroom = findClassroomById(this.data.classrooms, id);
            var signedup = Boolean(signedup);
            var status;
            if (classroom.signedup !== signedup) {
                classroom.takenseats += signedup ? 1 : -1;
                if (classroom.takenseats <= classroom.totalseats) {
                    if (signedup) {
                        this.data.classrooms.move(this.data.classrooms.indexOf(classroom), 0);
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
            setTimeout(function() {
                callback(classroom.signedup, status);
            }, 200);
        }
    }

    var sendServerRequest = function(id, signedup, callback) {
        // TODO: send a real server request
        FAKE_SERVER.postData(id, signedup, callback);
    };

    Polymer({
        classrooms: [],
        search: "",
        date: "",
        fakeServer: FAKE_SERVER,

        ready: function() {
        },
        searchChanged: function(oldValue) {
            this.load(true);
        },
        dateChanged: function(oldValue) {
            this.load(true);
        },
        load: function(animate) {
            // TODO: send an actual request to the server instead of using FAKE_DATA
            //var request = gapi.client.oauth2.userinfo.get().execute(function(resp) {
            //    if (!resp.code) {
            //        // User is signed in, call my Endpoint
            //        console.log("debug loading...");
            //    }
            //});
            var animate = Boolean(animate);
            this.classrooms = JSON.parse(FAKE_SERVER.getData(this.search, this.date)).classrooms;

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

            var classroomNodes = this.$.container.querySelectorAll("local-classroom-card");
            for (var i = 0; i < classroomNodes.length; i++) {
                classroomNodes[i].updateButton();
            }
        },
        onSignup: function(event) {
            findClassroomById(this.classrooms, event.detail.classid).signedup = true
            sendServerRequest(event.detail.classid, true, function(signedup, status) {});

            var previousSignedupClassroom = findClassroom(this.classrooms, function(classroom) {
                return classroom.signedup && (classroom.id !== event.detail.classid);
            });
            if (previousSignedupClassroom !== undefined) {
                previousSignedupClassroom.signedup = false;

                var classroomNodes = this.$.container.querySelectorAll("local-classroom-card");
                for (var i = 0; i < classroomNodes.length; i++) {
                    if (classroomNodes[i].data.id === previousSignedupClassroom.id) {
                        classroomNodes[i].updateButton();
                        break;
                    }
                }

                sendServerRequest(previousSignedupClassroom.id, false,
                                  function(signedup, status) {});
            }
        },
        onUnsignup: function(event) {
            findClassroomById(this.classrooms, event.detail.classid).signedup = false;
            sendServerRequest(event.detail.classid, false, function(signedup, status) {});
        },
    });
})();
