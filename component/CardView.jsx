import React, { Component } from 'react';
import { Image, Dimensions, Linking, Vibration, Alert } from 'react-native';
import { Audio } from 'expo-av';
import { Card, CardItem, Thumbnail, Text, Button, Icon, Left, Body, Right, Fab, Toast } from 'native-base';
import { TouchableHighlight } from 'react-native-gesture-handler';

var urlLike = 'http://185.60.170.14/plesk-site-preview/ruppinmobile.ac.il/site03/api/like';
var urlRequest = 'http://185.60.170.14/plesk-site-preview/ruppinmobile.ac.il/site03/api/request';
var UrlCheckUser = 'http://185.60.170.14/plesk-site-preview/ruppinmobile.ac.il/site03/checkIfUserClicked';
var urlP = 'http://185.60.170.14/plesk-site-preview/ruppinmobile.ac.il/site03/api/place';
var UrlCurrentStatus = 'http://185.60.170.14/plesk-site-preview/ruppinmobile.ac.il/site03/PostCurrentStatus';


var { height, width } = Dimensions.get('window');
const DURATION = 100;

export default class CardView extends Component {

  constructor(props) {
    super(props);

    this.state = {
      like: false,
      likeUser: 'Like',
      total: 0,
      active: false,
      globalLike: null,
      activeTicket: false,
      getTicket: 'GET TICKET',
      lastPress: 0,
      reqID: null,
    }
  }
  async componentDidMount() {
    this.setState({ total: this.props.place.Likes_Place });
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      playThroughEarpieceAndroid: false
    });
    this.sound = new Audio.Sound();
    const status = {
      shouldPlay: false,
    };

    await this.sound.loadAsync(require('../assets/click_Like.mp3'), status, false);

    // כל פעם שנוצר קארד נבדוק אם המשתמש הקיש ואז ככה נשנה את הסטייט , כמו כן לפני זה נהיה חייבים לקבל את המשתמש הנוכחי
    // update
    let check = await this.checkIfUserClick();

    if (check != null) {
      this.setState({ likeUser: 'Liked', like: false });
    } else {
      this.setState({ likeUser: 'Like', like: true });
    }
    // TODO: fetch by User_ID and To_Place
    let currentStatus = await this.takeCurrentStatus();
    if (currentStatus != null) {
      this.setState({ getTicket: 'SENT!', activeTicket: true, reqID: currentStatus.Request_ID });
    }
  }
  componentWillUnmount() {
    console.log('CardView');
  }
  takeCurrentStatus = async () => {
    let returnedObj = null;
    let tempID = this.props.user.User_ID;
    let tempPlace = this.props.place.Place_ID;

    await fetch(UrlCurrentStatus,
      {
        method: 'POST', // 'GET', 'POST', 'PUT', 'DELETE', etc.
        headers: new Headers({
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }),
        body: JSON.stringify({
          "Request_ID": 1,
          "User_ID": tempID,
          "To_Place": tempPlace,
          "Status": "",
          "Date": "2020-05-05",
        }),
      }) // Call the fetch function passing the url of the API as a parameter
      .then((resp) => resp.json()) // Transform the data into json
      .then(function (data) {
        if (data != `something fail`) {
          returnedObj = data;
        }
        else {
          returnedObj = null;
        }
      })
      .catch(function (err) {
        alert(err);
      });
    return returnedObj;
  }
  checkIfUserClick = async () => {
    let returnedObj = null;
    let tempID = this.props.user.User_ID;

    await fetch(UrlCheckUser,
      {
        method: 'POST', // 'GET', 'POST', 'PUT', 'DELETE', etc.
        headers: new Headers({
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }),
        body: JSON.stringify({
          "User_ID": tempID,
          "Place_ID": this.props.place.Place_ID,
          "Date": "2020-05-05",
        }),
      }) // Call the fetch function passing the url of the API as a parameter
      .then((resp) => resp.json()) // Transform the data into json
      .then(function (data) {
        if (data != `user witn id ${tempID} not clicked`) {
          returnedObj = data;
        }
        else {
          returnedObj = null;
        }
      })
      .catch(function (err) {
        alert(err);
      });
    return returnedObj;
  }
  btnGetTicket = async () => {
    await this.sound.setPositionAsync(0);
    await this.sound.playAsync();
    await this.checkPer();
  }
  getTicket = async () => {
    let s = await this.addRequest();
    if (s != null) {
      console.log('request send');
    }
    this.setState({ activeTicket: true, getTicket: 'SENT!', reqID: s.Request_ID }, () => {
      Toast.show({
        duration: 3000,
        type: 'success',
        buttonText: 'Your Request Sent!\nPlease Refresh Your Tickets',
      });
    });
  }
  cancelTicket = async () => {
    if (this.state.reqID != null) {
      let s = await this.deleteRequest(this.state.reqID);
      if (s != null) {
        console.log('request deleted');
      }
      this.setState({ activeTicket: true, getTicket: 'GET TICKET', reqID: null }, () => {
        Toast.show({
          duration: 3000,
          type: 'success',
          buttonText: 'Your Request Deleted!\nPlease Refresh Your Tickets',
        });
      });
    }
  }
  checkPer = async () => {
    Alert.alert(
      "",
      "Select options",
      [
        {
          text: "Cancel ticket",
          style: "cancel",
          onPress: this.cancelTicket
        },
        { text: "Order ticket", onPress: this.getTicket }
      ],
      { cancelable: false }
    );
  }
  deleteRequest = async (id) => {
    let returnedObj = null;
    let tempID = this.props.user.User_ID;
    var currentdate = new Date();
    var datetime = currentdate.getFullYear() + "-"
      + currentdate.getDate() + "-"
      + (currentdate.getMonth() + 1);

    await fetch(urlRequest + `/${id}`,
      {
        method: 'DELETE', // 'GET', 'POST', 'PUT', 'DELETE', etc.
        headers: new Headers({
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }),
      }) // Call the fetch function passing the url of the API as a parameter
      .then((resp) => resp.json()) // Transform the data into json
      .then(function (data) {
        if (data != `request with id = ${id} was not found to delete!!!`) {
          returnedObj = data;
        }
        else {
          returnedObj = null;
        }
      })
      .catch(function (err) {
        alert(err);
      });
    return returnedObj;
  }
  addRequest = async () => {
    let returnedObj = null;
    let tempID = this.props.user.User_ID;
    var currentdate = new Date();
    var datetime = currentdate.getFullYear() + "-"
      + currentdate.getDate() + "-"
      + (currentdate.getMonth() + 1);

    await fetch(urlRequest + `/`,
      {
        method: 'POST', // 'GET', 'POST', 'PUT', 'DELETE', etc.
        headers: new Headers({
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }),
        body: JSON.stringify({
          "User_ID": tempID,
          "To_Place": this.props.place.Place_ID,
          "Status": 'Waiting...',
          "Date": datetime,
        }),
      }) // Call the fetch function passing the url of the API as a parameter
      .then((resp) => resp.json()) // Transform the data into json
      .then(function (data) {
        if (data != `request exist in DB!!!`) {
          returnedObj = data;
        }
        else {
          returnedObj = null;
        }
      })
      .catch(function (err) {
        alert(err);
      });
    return returnedObj;
  }
  btnGo = async () => {
    await this.sound.setPositionAsync(0);
    await this.sound.playAsync();
    Linking.openURL(`https://www.waze.com/ul?ll=${this.props.place.Latitude_Place}%2C${this.props.place.Longitude_Place}&navigate=yes&zoom=17`);
  }
  btnLike = async () => {
    this.setState({ globalLike: true });

    if (!this.state.globalLike) {
      if (this.state.like) {
        await this.sound.setPositionAsync(0);
        await this.sound.playAsync();
        Vibration.vibrate(DURATION);
        this.setState({
          like: false,
          likeUser: 'Liked',
        }, async () => {
          await this.insertIntoDBLike();
        });
      } else {
        await this.sound.setPositionAsync(0);
        await this.sound.playAsync();
        Vibration.vibrate(DURATION);
        this.setState({
          like: true,
          likeUser: 'Like',
        }, async () => {
          await this.deleteLikeFromDB();
        });
      }
      let currentPlace = await this.getPlaceByID();
      if (currentPlace != null) {
        let totalFromServer = currentPlace.Likes_Place;

        if (!this.state.like) {
          totalFromServer += 1;
        }
        else {
          totalFromServer -= 1;
        }
        this.setState({ total: totalFromServer }, async () => {
          await this.updatePlace();
        });
      }
      //here i need in call back to fetch update like
      this.setState({ globalLike: false });
    }
  }

  updatePlace = async () => {
    let returnedObj = null;
    await fetch(urlP + `/`,
      {
        method: 'PUT', // 'GET', 'POST', 'PUT', 'DELETE', etc.
        headers: new Headers({
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }),
        body: JSON.stringify({
          "Place_ID": this.props.place.Place_ID,
          "Name_Place": this.props.place.Name_Place,
          "Address_Place": this.props.place.Address_Place,
          "Area": this.props.place.Area,
          "Latitude_Place": this.props.place.Latitude_Place,
          "Longitude_Place": this.props.place.Longitude_Place,
          "About_Place": this.props.place.About_Place,
          "Image_url": this.props.place.Image_Url,
          "Cover_Image": this.props.place.Cover_Image,
          "Likes_Place": this.state.total,
        })
      }) // Call the fetch function passing the url of the API as a parameter
      .then((resp) => resp.json()) // Transform the data into json
      .then(function (data) {
        if (data != null) {
          returnedObj = data;
        }
        else {
          returnedObj = null;
        }
      })
      .catch(function (err) {
        alert(err);
      });
    return returnedObj;
  }
  getPlaceByID = async () => {
    let returnedObj = null;
    await fetch(urlP + `/${this.props.place.Place_ID}`,
      {
        method: 'GET', // 'GET', 'POST', 'PUT', 'DELETE', etc.
        headers: new Headers({
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }),
      }) // Call the fetch function passing the url of the API as a parameter
      .then((resp) => resp.json()) // Transform the data into json
      .then(function (data) {
        if (data != null) {
          returnedObj = data;
        }
        else {
          returnedObj = null;
        }
      })
      .catch(function (err) {
        alert(err);
      });
    return returnedObj;
  }
  deleteLikeFromDB = async () => {
    let returnedObj = null;
    let tempID = this.props.user.User_ID;

    await fetch(urlLike + `/${this.props.user.User_ID}`,
      {
        method: 'DELETE', // 'GET', 'POST', 'PUT', 'DELETE', etc.
        headers: new Headers({
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }),
        body: JSON.stringify({
          "User_ID": tempID,
          "Place_ID": this.props.place.Place_ID,
          "Date": "2020-05-05",
        }),
      }) // Call the fetch function passing the url of the API as a parameter
      .then((resp) => resp.json()) // Transform the data into json
      .then(function (data) {
        if (data != null) {
          returnedObj = data;
        }
        else {
          returnedObj = null;
        }
      })
      .catch(function (err) {
        alert(err);
      });
    return returnedObj;
  }

  insertIntoDBLike = async () => {
    let returnedObj = null;
    var currentdate = new Date();
    var datetime = currentdate.getFullYear() + "-"
      + currentdate.getDate() + "-"
      + (currentdate.getMonth() + 1);

    await fetch(urlLike + `/`,
      {
        method: 'POST', // 'GET', 'POST', 'PUT', 'DELETE', etc.
        headers: new Headers({
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }),
        body: JSON.stringify({
          "User_ID": this.props.user.User_ID,
          "Place_ID": this.props.place.Place_ID,
          "Date": datetime,
        })
      }) // Call the fetch function passing the url of the API as a parameter
      .then((resp) => resp.json()) // Transform the data into json
      .then(function (data) {
        if (data != null) {
          returnedObj = data;
        }
        else {
          returnedObj = null;
        }
      })
      .catch(function (err) {
        alert(err);
      });
    return returnedObj;
  }
  btnShareWhatsapp = () => {
    let text = `Hey what do you want to do tonight? Going to the ${this.props.place.Name_Place} ?\nThe Location:\nhttps://www.waze.com/ul?ll=${this.props.place.Latitude_Place}%2C${this.props.place.Longitude_Place}&navigate=yes&zoom=17`;
    let phoneNumber = '';
    Linking.openURL(`whatsapp://send?text=${text}&phone=${phoneNumber}`);
  }
  btnShareGmail = () => {
    Linking.openURL(`mailto:?subject=Tonight ${this.props.place.Name_Place}&body=Celebrating today, what do you think ?`);
  }
  btnShareMessage = () => {
    Linking.openURL(`sms:?body=Hey what do you want to do tonight? Going to the ${this.props.place.Name_Place} ?\nThe Location:\nhttps://www.waze.com/ul?ll=${this.props.place.Latitude_Place}%2C${this.props.place.Longitude_Place}&navigate=yes&zoom=17`);
  }
  btnFab = () => {
    this.setState({ active: !this.state.active }, () => {
      Vibration.vibrate(DURATION);
    })
  }
  onPress = () => {
    var delta = new Date().getTime() - this.state.lastPress;
    if (delta < 200) {
      alert('success');
    } else {
      alert('one');
    }
    this.setState({
      lastPress: new Date(),
    });
  }
  render() {
    return (
      <Card style={{ width }}>
        <CardItem>
          <Body>
            <Text>{this.props.place.Name_Place}</Text>
            <Text note>{this.props.place.Area}</Text>
            <Text note>{parseInt(this.props.place.distance / 1000) + " km"}</Text>
          </Body>
          <Right>
            <Thumbnail source={{ uri: `${this.props.place.Image_Url}` }} />
          </Right>
        </CardItem>
        <CardItem style={{ alignContent: 'center', justifyContent: 'center' }} cardBody>
          <TouchableHighlight onPress={this.onPress}>
            <Image source={{ uri: `${this.props.place.Cover_Image}` }} style={{ height: height / 4, width }} />
          </TouchableHighlight>
        </CardItem>
        <CardItem>
          <Body>
            <Text>{this.props.place.About_Place}</Text>
          </Body>
        </CardItem>
        <CardItem style={{ alignSelf: 'flex-end' }}>
          <Fab
            active={this.state.active}
            containerStyle={{}}
            style={{ backgroundColor: '#1E1E1E', width: 50, height: 50 }}
            direction="right"
            position="bottomLeft"
            onPress={this.btnFab}>
            <Icon name="share" />
            <Button style={{ backgroundColor: '#34A34F' }} onPress={this.btnShareWhatsapp} >
              <Icon name="logo-whatsapp" />
            </Button>
            <Button style={{ backgroundColor: '#3B5998' }} onPress={this.btnShareMessage}>
              <Icon name="ios-send" />
            </Button>
            <Button style={{ backgroundColor: '#DD5144' }} onPress={this.btnShareGmail}>
              <Icon name="mail" />
            </Button>
          </Fab>
          <Body>
            {/* <Icon style={{ fontSize: 25 }} active name="cog" /> */}
          </Body>
          <Right>
            <Icon style={{ fontSize: 25 }} name="thumbs-up" />
            <Text>Likes {this.state.total}</Text>
          </Right>

        </CardItem>
        <CardItem style={{ width }}>
          <Left>
            <Button style={{ alignContent: 'center', justifyContent: 'center' }} onPress={this.btnGo} transparent>
              <Text >GO</Text>
              <Icon style={{ fontSize: 35 }} active name="navigate" />
            </Button>
          </Left>
          <Body style={{ paddingRight: 30 }} >
            <Button style={{ alignContent: 'center', justifyContent: 'center' }} onPress={this.btnGetTicket} transparent>
              <Text >{this.state.getTicket}</Text>
              <Icon style={{ fontSize: 35 }} active name="beer" />
            </Button>
          </Body>
          <Right>
            <Button style={{ alignContent: 'center', justifyContent: 'center' }} onPress={this.btnLike} transparent>
              <Text>{this.state.likeUser}</Text>
              <Icon style={{ fontSize: 35 }} active name="thumbs-up" />
            </Button>
          </Right>
        </CardItem>
      </Card>
    );
  }
}