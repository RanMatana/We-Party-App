import React, { Component } from 'react'
import { TextInput, View, Text, StyleSheet, Dimensions, Keyboard, Vibration, Image, Animated, Easing, KeyboardAvoidingView, Slider, Alert, ScrollView } from 'react-native'
import { Avatar, Button } from 'react-native-elements';
import { Audio } from 'expo-av';
import * as firebase from 'firebase';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Spinner, Toast } from 'native-base';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';

var url = 'http://185.60.170.14/plesk-site-preview/ruppinmobile.ac.il/site03/current';
var urlUpdate = 'http://185.60.170.14/plesk-site-preview/ruppinmobile.ac.il/site03/api/user';
const { height, width } = Dimensions.get('window');
const DURATION = 100;
var checkIfChangePhoto = false;

export default class ProfileScreen extends Component {
    constructor(props) {
        super(props);

        this.RotateValueHolder = new Animated.Value(0);
    }
    state = {
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        displayName: "",
        current: null,
        isReady: false,
        Range: "",
        distance: 30,
        minDistance: 10,
        maxDistance: 100,
        passBefore: "",
    }
    // Permission For Camera
    getPermissionAsync = async () => {
        if (Constants.platform.ios) {
            const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
            if (status !== 'granted') {
                alert('Sorry, we need camera roll permissions to make this work!');
            }
        }
    };

    async componentDidMount() {
        this.getPermissionAsync();
        this.StartImageRotateFunction()
        const { email, displayName } = firebase.auth().currentUser
        this.setState({
            email: email,
        });
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
        await this.updateCurrentUser();
        this.setState({
            isReady: true,
            first_name: this.state.current.First_Name,
            last_name: this.state.current.Last_Name,
            password: this.state.current.Password,
            Range: this.state.current.Range_User,
            passBefore: this.state.current.Password,
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
    // Update Current User By Email
    updateCurrentUser = async () => {
        let s = await this.checkUserDetailes();
        this.setState({ current: s }, () => {
            this.setState({ image: this.state.current.Url_Photo })
        });
    }
    checkUserDetailes = async () => {
        let returnedObj = null;
        await fetch(url,
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
    perUpdate = async () => {
        this.setState({ isReady: false }, async () => {
            Keyboard.dismiss();
            await this.sound.setPositionAsync(0);
            await this.sound.playAsync();
            await this.updateUser();
            if (true) {
                this.setState({ isReady: true }, () => {
                    Toast.show({
                        duration: 3000,
                        type: 'success',
                        buttonText: 'Your Details Updated!\nPlease Refresh Your Home Page',
                    });
                });
            }
        });
    }
    // Check If The User Want To Update
    checkPer = async () => {
        Alert.alert(
            "Warning",
            "Are you sure you want\nto update your details?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                { text: "OK", onPress: this.perUpdate }
            ],
            { cancelable: false }
        );
    }
    btnUpdate = async () => {
        Vibration.vibrate(DURATION);
        Keyboard.dismiss();
        await this.checkPer();
    }
    updateUser = async () => {
        let s;
        if (checkIfChangePhoto == true) {
            console.log('true');
            let img = this.state.image;
            let imgName = `${this.state.first_name} ${this.state.last_name}`;
            this.imageUpload(img, imgName);
            s = await this.updateUserDetailes(this.state.image);
        } else {
            console.log('false');
            s = await this.updateUserDetailes(this.state.current.Url_Photo);
        }
        var user = firebase.auth().currentUser;
        user.updatePassword(this.state.password).then(function () {
            console.log('success');
        }).catch(function (error) {
            console.log(error);
        });
        if (s != null) {
            return true;
        }
        checkIfChangePhoto = false;
    }
    // Method For Upload Photo
    imageUpload = (imgUri, picName) => {
        let urlAPI = "http://185.60.170.14/plesk-site-preview/ruppinmobile.ac.il/site03/uploadpicture";
        let dataI = new FormData();
        dataI.append('picture', {
            uri: imgUri,
            name: picName,
            type: 'image/jpg'
        });
        const config = {
            method: 'POST',
            body: dataI,
        };

        fetch(urlAPI, config)
            .then((res) => {
                console.log('res.status= ', res.status);
                if (res.status == 201) {
                    return res.json();
                }
                else {
                    console.log('error uploading with status= ', res.status);
                    return "err";
                }
            })
            .then((responseData) => {
                console.log(responseData);
                if (responseData != "err") {
                    let picNameWOExt = picName.substring(0, picName.indexOf("."));
                    let imageNameWithGUID = responseData.substring(responseData.indexOf(picNameWOExt), responseData.indexOf(".jpg") + 4);
                    this.setState({
                        uploadedPicUri: { uri: this.uploadedPicPath + imageNameWithGUID },
                    });
                    console.log("img uploaded successfully!");
                }
                else {
                    console.log('error uploading ...');
                    alert('error uploading');
                }
            })
            .catch(err => {
                alert('err upload= ' + err);
            });
    }
    updateUserDetailes = async (img) => {
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
                    "First_Name": this.state.first_name,
                    "Last_Name": this.state.last_name,
                    "Email": this.state.current.Email,
                    "Password": this.state.password,
                    "Url_Photo": img,
                    "Latitude": this.state.current.Latitude,
                    "Longitude": this.state.current.Longitude,
                    "Token_User": this.state.current.Token_User,
                    "Range_User": this.state.value * 1000,
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
    // Button For Signout User
    btnOff = async () => {
        firebase.auth().signOut();
        await this.sound.setPositionAsync(0);
        await this.sound.playAsync();
        Vibration.vibrate(DURATION);
    }
    componentWillUnmount() {
        console.log("out");
    }
    // Method For Pick Image
    _pickImage = async () => {
        checkIfChangePhoto = true;
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });
            if (!result.cancelled) {
                this.setState({ image: result.uri });
            }
            console.log(result);
        } catch (E) {
            console.log(E);
        }
    };
    render() {
        const RotateData = this.RotateValueHolder.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg'],
        });
        if (!this.state.isReady) {
            return (
                <View style={styles.container}>
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
            <ScrollView>
                <View style={styles.container}>
                    <View style={{ flexDirection: 'row-reverse', width: width, height: height / 6 }}>
                        <Image source={require('../assets/Logo.png')} style={{ marginTop: 20, width: 130, height: 130 }} />
                        <TouchableOpacity style={{ marginTop: 20, marginRight: 140, top: 20 }} onPress={this.btnOff}>
                            <Image source={require('../assets/off.png')} style={styles.logo} />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={this._pickImage}>
                        <Avatar
                            size='xlarge'
                            containerStyle={{ marginBottom: 50 }}
                            rounded
                            source={{ uri: `${this.state.image}` }}
                        />
                    </TouchableOpacity>
                    <KeyboardAvoidingView behavior="padding">
                        <View>
                            <View>
                                <Text style={styles.inputTitle}>First name</Text>
                                <TextInput
                                    value={this.state.first_name}
                                    style={styles.input}
                                    onChangeText={first_name => this.setState({ first_name })}
                                    autoCapitalize="none">
                                </TextInput>
                            </View>
                            <View style={{ marginTop: 15 }}>
                                <Text style={styles.inputTitle}>Last name</Text>
                                <TextInput
                                    value={this.state.last_name}
                                    style={styles.input}
                                    onChangeText={last_name => this.setState({ last_name })}
                                    autoCapitalize="none">
                                </TextInput>
                            </View>
                            <View style={{ marginTop: 15 }}>
                                <Text style={styles.inputTitle}>Password</Text>
                                <TextInput
                                    style={styles.input}
                                    secureTextEntry
                                    autoCapitalize="none"
                                    onChangeText={password => this.setState({ password })}
                                    value={this.state.password}                            >
                                </TextInput>
                            </View>
                        </View>
                        <View style={{ backgroundColor: '#FFFFFF10' }}>
                            <Text style={styles.textR}>RANGE</Text>
                            <Slider
                                style={{ width: 250, height: 40 }}
                                minimumValue={10}
                                maximumValue={500}
                                onValueChange={(value) => this.setState({ value })}
                                minimumTrackTintColor="#FFFFFF"
                                maximumTrackTintColor="#000000"
                                step={1}
                            />
                            <Text style={styles.textR}>{this.state.value}</Text>
                        </View>
                        <View style={{ margin: 25 }}>
                            <Button onPress={this.btnUpdate} title="UPDATE" />
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </ScrollView >
        )
    }
}
const styles = StyleSheet.create({
    container: {
        backgroundColor: '#1E1E1E',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    greeting: {
        marginTop: 32,
        color: 'white',
        fontSize: 18,
        fontWeight: "400",
        textAlign: 'center'
    },
    inputTitle: {
        width: width / 1.5,
        color: 'white',
        fontSize: 10,
        textTransform: "uppercase"
    },
    input: {
        borderBottomColor: "white",
        borderBottomWidth: StyleSheet.hairlineWidth,
        height: 40,
        fontSize: 15,
        color: 'white'
    },
    button: {
        marginHorizontal: 30,
        backgroundColor: '#E9446A',
        borderRadius: 4,
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backgroundImage: {
        flex: 1,
        resizeMode: 'cover',
    },
    logo: {
        width: 50,
        height: 50,
        margin: 10,
    },
    textR: {
        textAlign: 'center',
        color: 'white',
        fontWeight: 'bold',
        margin: 5,
    }
});
