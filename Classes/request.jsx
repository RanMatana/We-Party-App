export default class request {
    constructor(Request_ID, User_ID, To_Place, Status, Date) {

        this.Request_ID = Request_ID;
        this.User_ID = User_ID;
        this.To_Place = To_Place;
        this.Status = Status;
        this.Date = Date;
    }

    show() {
        return `ID= ${this.Request_ID} From=${this.User_ID} To=${this.To_Place}`;
    }
}