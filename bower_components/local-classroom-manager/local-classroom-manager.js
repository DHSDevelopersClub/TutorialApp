function Room(teacher, seats, roomNumber, profilePic) {
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
