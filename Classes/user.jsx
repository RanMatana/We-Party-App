export default class user {
    constructor(User_ID, First_Name, Last_Name, Email, Password, Url_Photo, Latitude, Longitude, Token_User, Range_User) {

        this.User_ID = User_ID;
        this.First_Name = First_Name;
        this.Last_Name = Last_Name;
        this.Email = Email;
        this.Password = Password;
        this.Url_Photo = Url_Photo;
        this.Latitude = Latitude;
        this.Longitude = Longitude;
        this.Token_User = Token_User;
        this.Range_User = Range_User;
    }

    show() {
        return `id=${this.User_ID} name=${this.First_Name} ${this.Last_Name}`;
    }
}