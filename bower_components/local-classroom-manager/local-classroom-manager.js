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

    var FAKE_DATA = JSON.stringify({
      "classrooms": [
        {
          "id": "239hsefosFHSO4892",
          "teacher": "Mr. Milstead",
          "profilepic": "http://cache3.asset-cache.net/gc/57442583-portrait-of-a-school-teacher-" +
                        "gettyimages.jpg?v=1&c=IWSAsset&k=2&d=Y3hy48kuiy7pabQpAfxaQrcgpfAMUuQ1Fc" +
                        "wFl8J80Es%3D",
          "room": "127",
          "totalseats": 30,
          "takenseats": 14,
          "signedup": false
        },
        {
          "id": "shHUE7e2BF2Hkkeuk",
          "teacher": "Mrs. Example",
          "profilepic": "http://cache4.asset-cache.net/gc/57442708-portrait-of-a-female-school-t" +
                        "eacher-gettyimages.jpg?v=1&c=IWSAsset&k=2&d=E5y3FqGCZA78hfJC8P3s3hrnAf5" +
                        "0DBBxD1Fa1hqvjx8%3D",
          "room": "104A",
          "totalseats": 33,
          "takenseats": 19,
          "signedup": true
        }
      ]
    });

    var sendServerRequest = function(id, signedup, callback) {
        // TODO: send server request
        callback();
    };

    Polymer({
        classrooms: [],
        search: "",
        date: "",

        ready: function() {
        },
        searchChanged: function(oldValue) {
            this.load();
        },
        dateChanged: function(oldValue) {
            this.load();
        },
        load: function() {
            // TODO: send an actual request to the server instead of using FAKE_DATA
            //var request = gapi.client.oauth2.userinfo.get().execute(function(resp) {
            //    if (!resp.code) {
            //        // User is signed in, call my Endpoint
            //        console.log("debug loading...");
            //    }
            //});

            this.classrooms = JSON.parse(FAKE_DATA).classrooms;

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
            var classrooms = this.classrooms;

            sendServerRequest(event.detail.classid, true, function() {
                for (var i = 0; i < classrooms.length; i++) {
                    if (classrooms[i].id === event.detail.classid) {
                        classrooms[i].signedup = true;
                    }
                }
            });

            for (var i = 0; i < this.classrooms.length; i++) {
                if (classrooms[i].signedup && classrooms[i].id !== event.detail.classid) {
                    sendServerRequest(classrooms[i].id, false, function() {
                        classrooms[i].signedup = false;
                    });
                }
            }
        },
        onUnsignup: function(event) {
            var classrooms = this.classrooms;

            sendServerRequest(event.detail.classid, false, function() {
                for (var i = 0; i < classrooms.length; i++) {
                    if (classrooms[i].id === event.detail.classid) {
                        classrooms[i].signedup = false;
                    }
                }
            });
        },
    });
})();
