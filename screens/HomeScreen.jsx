import React, { Component } from 'react';
import CardView from '../component/CardView';
import { View, StyleSheet, Dimensions, Animated, Easing, ScrollView, RefreshControl, Alert } from 'react-native';
import * as firebase from 'firebase';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView as GHScrollView } from 'react-native-gesture-handler';
import { SearchBar } from 'react-native-elements';
import { Spinner } from 'native-base';
import registerForPushNotificationsAsync from '../component/registerForPushNotificationsAsync';
import { Notifications } from 'expo';
import * as geolib from 'geolib';
import user from '../Classes/user';
import NotFound from '../component/NotFound';
import * as Battery from 'expo-battery';
import * as Network from 'expo-network';

const image = { uri: "https://reactjs.org/logo-og.png" };
var { height, width } = Dimensions.get('window');
var url = 'http://185.60.170.14/plesk-site-preview/ruppinmobile.ac.il/site03/api/place';
var urlCurrent = 'http://185.60.170.14/plesk-site-preview/ruppinmobile.ac.il/site03/current';
var urlUpdateUser = 'http://185.60.170.14/plesk-site-preview/ruppinmobile.ac.il/site03/api/user';
var urlUpdate = 'http://185.60.170.14/plesk-site-preview/ruppinmobile.ac.il/site03/api/user';


export default class HomeScreen extends Component {
    constructor(props) {
        super(props);

        this.RotateValueHolder = new Animated.Value(0);
        this.state = {
            arrPlaces: [],
            ans: null,
            current: new user(),
            scroller: 'Core',
            refreshing: false,
            location: null,
            latitude: "",
            longitude: "",
            email: "",
            displayName: "",
            search: "",
            token: "",
            round: null,
            batteryLevel: null,
        }

    }
    getPlace = (Place_ID) => {
        this.props.sendPlace(Place_ID)
    }
    getUser = (User_ID) => {
        this.props.sendUser(User_ID)
    }
    sendR = async (round) => {
        this.setState({ round }, async () => {
            await this._onRefreshAfterUp(this.state.round);
        });

    }
    async componentDidMount() {
        let net = await Network.getNetworkStateAsync();
        if (net.isConnected == true) {
            this._subscribe();
            this.StartImageRotateFunction()
            // Current user
            const { email, displayName } = firebase.auth().currentUser
            this.setState({ email, displayName });
            // Fetch fonts
            await Font.loadAsync({
                Roboto: require('native-base/Fonts/Roboto.ttf'),
                Roboto_medium: require('native-base/Fonts/Roboto_medium.ttf'),
                ...Ionicons.font,
            });
            // Fetch current User
            await this.updateCurrentUser();
            let s = await this.checkUserDetailes();
            if (s != null) {
                this.setState({ current: s }, async () => {
                    await this.updateLocationToken();
                    // Fetch places
                    let s = await this.fetchGiveAllPlaces(this.state.current.Range_User, this.state.current.Latitude, this.state.current.Longitude);
                    if (s != null) {
                        this.setState({ arrPlaces: s });
                        let output;
                        output = this.state.arrPlaces.map(
                            (place) => {
                                return <CardView key={place.Place_ID} place={place} user={this.state.current} sendUser={this.getUser} sendPlace={this.getPlace} />
                            }
                        )
                        this.setState({ ans: output });
                    }
                    else {
                        let output;
                        output = <NotFound sendR={this.sendR} />;
                        this.setState({ ans: output });
                        console.log("No Places");
                    }
                    this.setState({ isReady: true });
                });
            }

        } else {
            Alert.alert('Connection', 'Connection Error !\nPlease fix your network Area...');
        }
    }
    updateLocationToken = async () => {
        // Fetch Location
        navigator.geolocation.getCurrentPosition(
            (position) => {
                this.setState({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                }, async () => {
                    await this.fetchMyLocationAndToken(this.state.latitude, this.state.longitude, this.state.token);
                });
            },
            (error) => alert(error.message),
            { enableHighAccuracy: true, timeout: 2000, maximumAge: 1000 }
        );
    }
    componentWillUnmount() {
        this._unsubscribe();
    }
    async _subscribe() {
        const batteryLevel = await Battery.getBatteryLevelAsync();
        this.setState({ batteryLevel });
        this._subscription = Battery.addBatteryLevelListener(({ batteryLevel }) => {
            this.setState({ batteryLevel });
            console.log('batteryLevel changed!', batteryLevel);
        });
        if (parseInt(this.state.batteryLevel * 100) < 13) {
            Alert.alert('Battery Low', 'Your Battey Below 15%');
        }
    }
    _unsubscribe() {
        this._subscription && this._subscription.remove();
        this._subscription = null;
    }
    _handleNotification = (notification) => {
        this.setState({ notification })
    }
    fetchMyLocationAndToken = async (latitude, longitude, token) => {
        let returnedObj = null;

        await fetch(urlUpdateUser,
            {
                method: 'PUT', // 'GET', 'POST', 'PUT', 'DELETE', etc.
                headers: new Headers({
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }),
                body: JSON.stringify({
                    "User_ID": this.state.current.User_ID,
                    "First_Name": this.state.current.First_Name,
                    "Last_Name": this.state.current.Last_Name,
                    "Email": this.state.current.Email,
                    "Password": this.state.current.Password,
                    "Url_Photo": this.state.current.Url_Photo,
                    "Latitude": `${latitude}`,
                    "Longitude": `${longitude}`,
                    "Token_User": `${token}`,
                    "Range_User": `${this.state.current.Range_User}`,
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
    updateCurrentUser = async () => {
        // Token current User
        registerForPushNotificationsAsync()
            .then((token) => {
                // send token to DB user using FETCH
                this.setState({ token }, async () => {
                    this._notificationSubscription = Notifications.addListener(this._handleNotification);
                });
            });
    }
    checkUserDetailes = async () => {
        let returnedObj = null;
        await fetch(urlCurrent,
            {
                method: 'POST', // 'GET', 'POST', 'PUT', 'DELETE', etc.
                headers: new Headers({
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }),
                body: JSON.stringify({
                    "User_ID": 1018,
                    "First_Name": "",
                    "Last_Name": "",
                    "Email": `${this.state.email}`,
                    "Password": "",
                    "Url_Photo": "mage",
                    "Latitude": "",
                    "Longitude": "",
                    "Token_User": "",
                    "Range_User": "",
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
    btnUpdate = async () => {
        this.setState({ isReady: false }, async () => {
            Keyboard.dismiss();
            await this.sound.setPositionAsync(0);
            await this.sound.playAsync();
            Vibration.vibrate(DURATION);
            await this.updateUser();
            if (true) {
                this.setState({ isReady: true });
            }
        });
    }
    updateUser = async () => {
        let s = await this.updateUserDetailes();
        if (s != null) {
            return true;
        }
    }
    updateUserDetailes = async () => {
        let returnedObj = null;
        await fetch(urlCurrent,
            {
                method: 'PUT', // 'GET', 'POST', 'PUT', 'DELETE', etc.
                headers: new Headers({
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }),
                body: JSON.stringify({
                    "User_ID": this.state.current.User_ID,
                    "First_Name": this.state.first_name,
                    "Last_Name": this.state.last_name,
                    "Email": this.state.current.Email,
                    "Password": this.state.email,
                    "Url_Photo": this.state.current.Url_Photo,
                    "Latitude": this.state.current.Latitude,
                    "Longitude": this.state.current.Longitude,
                    "Token_User": this.state.current.Token_User,
                    "Range_User": this.state.current.Range_User,
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
    componentWillUnmount() {
        console.log("refresh");
    }
    fetchGiveAllPlaces = async (round, lat, long) => {
        let returnedObj = null;

        await fetch(url,
            {
                method: 'GET', // 'GET', 'POST', 'PUT', 'DELETE', etc.
                headers: new Headers({
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                })
            }) // Call the fetch function passing the url of the API as a parameter
            .then((resp) => resp.json()) // Transform the data into json
            .then(function (data) {
                if (data != null) {
                    returnedObj = data;
                    for (let i = 0; i < returnedObj.length; i++) {
                        returnedObj[i].distance = geolib.getDistance(
                            { latitude: lat, longitude: long },
                            { latitude: returnedObj[i].Latitude_Place, longitude: returnedObj[i].Longitude_Place })
                    }
                    for (let i = 0; i < returnedObj.length; i++) {
                        if (returnedObj[i].distance > round) {
                            returnedObj.splice(i, 1);
                            i--;
                        }
                    }
                    if (returnedObj.length == 0) {
                        returnedObj = null;
                    }
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
    updateSearch = (text) => {
        this.setState({
            search: text,
        });
    }
    StartImageRotateFunction() {
        this.RotateValueHolder.setValue(0);
        Animated.timing(this.RotateValueHolder, {
            toValue: 1,
            duration: 1000,
            easing: Easing.linear,
        }).start(() => this.StartImageRotateFunction());
        return true;
    }
    componentWillUnmount() {
        console.log("home");
    }
    // TODO: fetch for place around me
    _onRefreshAfterUp = async (range) => {
        this.setState({ refreshing: true, isReady: false });
        // Fetch current User
        await this.updateUserRange(range);
        await new Promise(resolve => setTimeout(resolve, 4000));
        let s = await this.checkUserDetailes();
        if (s != null) {
            this.setState({ current: s }, async () => {
                let l = await this.fetchGiveAllPlaces(range, this.state.current.Latitude, this.state.current.Longitude);
                if (l != null) {
                    this.setState({ arrPlaces: l }, () => {
                        let output;
                        output = this.state.arrPlaces.map(
                            (place) => {
                                return <CardView key={place.Place_ID} place={place} user={this.state.current} sendUser={this.getUser} sendPlace={this.getPlace} />
                            }
                        )
                        this.setState({ ans: output });
                    });
                }
                else {
                    let output;
                    output = <NotFound sendR={this.sendR} />;
                    this.setState({ ans: output });
                    console.log("No Places");
                }
            });
        }
        this.setState({ refreshing: false, isReady: true });
    };
    updateUserRange = async (range) => {
        let returnedObj = null;
        await fetch(urlUpdate,
            {
                method: 'PUT', // 'GET', 'POST', 'PUT', 'DELETE', etc.
                headers: new Headers({
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }),
                body: JSON.stringify({
                    "User_ID": this.state.current.User_ID,
                    "First_Name": this.state.current.First_Name,
                    "Last_Name": this.state.current.Last_Name,
                    "Email": this.state.current.Email,
                    "Password": this.state.current.Password,
                    "Url_Photo": this.state.current.Url_Photo,
                    "Latitude": this.state.latitude,
                    "Longitude": this.state.longitude,
                    "Token_User": this.state.token,
                    "Range_User": range,
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
    _onRefresh = async () => {
        this.setState({ refreshing: true, isReady: false });
        // Fetch current User
        await this.updateCurrentUser();

        await new Promise(resolve => setTimeout(resolve, 4000));

        // nice fetch render my list but i want that rander the places around me
        let s = await this.fetchGiveAllPlaces(this.state.current.Range_User, this.state.current.Latitude, this.state.current.Longitude);

        if (s != null) {
            this.setState({ arrPlaces: s });
            let output;
            output = this.state.arrPlaces.map(
                (place) => {
                    return <CardView key={place.Place_ID} place={place} user={this.state.current} sendUser={this.getUser} sendPlace={this.getPlace} />
                }
            )
            this.setState({ ans: output });
        }
        else {
            let output;
            output = <NotFound sendR={this.sendR} />;
            this.setState({ ans: output });
            console.log("No Places");
        }
        this.setState({ refreshing: false, isReady: true });
    };

    render() {
        let ScrollComponent = this.state.scroller === 'Core' ? ScrollView : GHScrollView;
        const RotateData = this.RotateValueHolder.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg'],
        });
        if (!this.state.isReady) {
            return (
                <View style={{
                    backgroundColor: '#1E1E1E',
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                    <Animated.Image style={{
                        transform: [{ rotate: RotateData }],
                        width: 150,
                        height: 150,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 0
                    }} source={require('../assets/Logo.png')} />
                    <Spinner color='red' />
                </View>
            );
        }
        return (
            <ScrollComponent
                style={styles.container}
                refreshControl={
                    <RefreshControl
                        refreshing={this.state.refreshing}
                        onRefresh={this._onRefresh}
                    />
                }
                contentContainerStyle={{
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                <View>
                    <SearchBar
                        placeholder="Type Here..."
                        onChangeText={(text) => this.updateSearch(text)}
                        value={this.state.search}
                    />
                    <View style={styles.container}>
                        {this.state.ans}
                    </View>
                </View>
            </ScrollComponent>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#1E1E1E',
        flex: 1,
    },
    input: {
        width: width / 2,
        borderBottomColor: "white",
        borderBottomWidth: StyleSheet.hairlineWidth,
        height: 40,
        fontSize: 15,
        color: 'white'
    },
    inputTitle: {
        textAlign: 'center',
        color: 'white',
        fontSize: 10,
        textTransform: "uppercase"
    },
});