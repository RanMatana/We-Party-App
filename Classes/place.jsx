export default class place {
    constructor(Place_ID, Name_Place, Address_Place, Area, Latitude_Place, Longitude_Place, About_Place, Image_Url, Cover_Image, Likes_Place) {

        this.Place_ID = Place_ID;
        this.Name_Place = Name_Place;
        this.Address_Place = Address_Place;
        this.Area = Area;
        this.Latitude_Place = Latitude_Place;
        this.Longitude_Place = Longitude_Place;
        this.About_Place = About_Place;
        this.Image_Url = Image_Url;
        this.Cover_Image = Cover_Image;
        this.Likes_Place=Likes_Place;
        this.Distance = 0;
    }

    show() {
        return `id=${this.Place_ID} name=${this.Name_Place}`;
    }
}