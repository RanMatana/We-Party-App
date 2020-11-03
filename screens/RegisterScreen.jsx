import React, { Component } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Keyboard, ScrollView } from 'react-native';
import * as firebase from 'firebase';
import { Avatar } from 'react-native-elements';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';

var url = 'http://185.60.170.14/plesk-site-preview/ruppinmobile.ac.il/site03/api/user/';


export default class RegisterScreen extends Component {
    constructor(props) {
        super(props);
    }
    state = {
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        image: "try",
        errorMessage: null,
        status: false,
    }
    async componentDidMount() {
        this.getPermissionAsync();
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
    componentWillUnmount() {
        console.log("sign");
    }
    // Button SignUp
    handleSignUp = async () => {
        if (this.state.first_name != "" && this.state.last_name != "" && this.state.password != ""
            && this.state.email != "" && this.state.image != "try") {
            if (this.state.password.length >= 6) {
                firebase
                    .auth()
                    .createUserWithEmailAndPassword(this.state.email, this.state.password)
                    .then(userCredentials => {
                        this.setState({
                            status: true,
                        }, () => {
                            return userCredentials.user.updateProfile({
                                displayName: this.state.first_name + this.state.last_name
                            })
                        });
                    })
                    .catch(error => this.setState({ errorMessage: error.message }));

                if (!this.state.status) {
                    let img = this.state.image;
                    let imgName = `${this.state.first_name} ${this.state.last_name}`;
                    this.imageUpload(img, imgName);
                    await this.updateDatabase();
                }
                else {
                    alert('Something go wrong!');
                }
            } else {
                alert('Password must be 6 characters or more long');
            }
        } else {
            alert('Not all fields are full\nDo not forget to upload a photo');
        }
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
    // Method For Pick Photo
    _pickImage = async () => {
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
    // Update Database
    updateDatabase = async () => {
        let s = await this.signUserDetailes(this.state.email, this.state.password);
        console.log('returned value= ' + s);

        if (s != 'user not found!!!') {
            // Success
        }
        else {
            console.log("The user " + this.state.name + "Sign with firebase but not exist write to database!");
        }
    }
    // Method For Sign User
    signUserDetailes = async (Email, Password) => {
        console.log("email=", Email);
        console.log("password=", Password);
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
                    "First_Name": this.state.first_name,
                    "Last_Name": this.state.last_name,
                    "Email": Email,
                    "Password": Password,
                    "Url_Photo": this.state.image,
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
    // Button Back To LoginPage
    btnBackToLogin = () => {
        this.props.navigation.navigate('Login');
    }
    render() {
        return (
            <ScrollView>
                <View style={styles.container}>
                    <Text style={styles.greeting}>{`Hello!\nSign up to get started.`}</Text>
                    <View style={styles.errorMessage}>
                        {this.state.errorMessage && <Text style={styles.error}>{this.state.errorMessage}</Text>}
                    </View>
                    <TouchableOpacity style={{ alignItems: 'center' }} onPress={this._pickImage}>
                        <Avatar
                            size='xlarge'
                            containerStyle={{ marginBottom: 10 }}
                            rounded
                            source={{ uri: `${this.state.image}` }}
                        />
                    </TouchableOpacity>
                    <View style={styles.form}>
                        <View>
                            <Text style={styles.inputTitle}>First Name</Text>
                            <TextInput
                                style={styles.input}
                                onChangeText={first_name => this.setState({ first_name })}
                                autoCapitalize="none"
                                value={this.state.first_name}>
                            </TextInput>
                        </View>
                        <View style={{ marginTop: 20 }}>
                            <Text style={styles.inputTitle}>Last Name</Text>
                            <TextInput
                                style={styles.input}
                                onChangeText={last_name => this.setState({ last_name })}
                                autoCapitalize="none"
                                value={this.state.last_name}>
                            </TextInput>
                        </View>
                        <View style={{ marginTop: 20 }}>
                            <Text style={styles.inputTitle}>Email Address</Text>
                            <TextInput
                                style={styles.input}
                                onChangeText={email => this.setState({ email })}
                                autoCapitalize="none"
                                value={this.state.email}>
                            </TextInput>
                        </View>
                        <View style={{ marginTop: 20 }}>
                            <Text style={styles.inputTitle}>Password</Text>
                            <TextInput
                                style={styles.input}
                                secureTextEntry
                                autoCapitalize="none"
                                onChangeText={password => this.setState({ password })}
                                value={this.state.password}>
                            </TextInput>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.button} onPress={this.handleSignUp}>
                        <Text style={{ color: '#FFF', fontWeight: "500" }}>Sign Up</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={{ alignItems: 'center', marginTop: 32 }}>
                        <Text style={{ color: 'white', fontSize: 15 }}>
                            All Ready Login ? <Text onPress={this.btnBackToLogin} style={{ fontWeight: "500", color: '#E9446A' }}>Login</Text>
                        </Text>
                    </TouchableOpacity>
                    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                        <Image source={require('../assets/Logo.png')} style={styles.logo} />
                    </View>
                </View>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1E1E1E',
    },
    greeting: {
        marginTop: 32,
        color: 'white',
        fontSize: 18,
        fontWeight: "400",
        textAlign: 'center'
    },
    errorMessage: {
        height: 72,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 30
    },
    error: {
        color: '#E9446A',
        fontSize: 13,
        fontWeight: "600",
        textAlign: 'center'
    },
    form: {
        marginBottom: 48,
        marginHorizontal: 30
    },
    inputTitle: {
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
        justifyContent: 'center'
    },
    backgroundImage: {
        flex: 1,
        resizeMode: 'cover',
    },
    logo: {
        width: 150,
        height: 150,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 0,
    },
});