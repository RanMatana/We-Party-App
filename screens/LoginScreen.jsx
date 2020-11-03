import React, { Component } from 'react';
import { Keyboard, View, Text, StyleSheet, TextInput, TouchableOpacity, Image, KeyboardAvoidingView } from 'react-native';
import * as firebase from 'firebase';
import { SocialIcon } from 'react-native-elements';
import * as Facebook from 'expo-facebook';
import * as Google from 'expo-google-app-auth';

var AppID = '1264083400461368';

export default class LoginScreen extends Component {
  constructor(props) {
    super(props);
  }
  state = {
    email: "",
    password: "",
    errorMessage: null,
    status: false,
  }

  // Button Check If User Connect Firebase If Yes Go To HomePage
  handleLogin = async () => {
    const { email, password } = this.state
    Keyboard.dismiss();
    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .catch(error => this.setState({ errorMessage: error.message }))
  }
  // Button For Authentication Facebook
  btnFace = async () => {

    try {
      await Facebook.initializeAsync(AppID);
      const {
        type,
        token,
        expires,
        permissions,
        declinedPermissions,
      } = await Facebook.logInWithReadPermissionsAsync({
        permissions: ['public_profile'],
      });

      if (type === 'success') {
        // Get the user's name using Facebook's Graph API
        const response = await fetch(`https://graph.facebook.com/me?access_token=${token}`);
        let res = await response.json();
        await this.updatefirebase(res);
      } else {
        // type === 'cancel'
      }
    } catch ({ message }) {
      alert(`Facebook Login Error: ${message}`);
    }
  }
  // Update Firebase
  updatefirebase = async (res) => {
    firebase
      .auth()
      .createUserWithEmailAndPassword("" + res.email, "" + res.password)
      .then(userCredentials => {
        this.setState({
          status: true,
        }, () => {
          return userCredentials.user.updateProfile({
            displayName: res.name
          })
        });
      })
      .catch(error => this.setState({ errorMessage: error.message }));

    if (!this.state.status) {
      let img = "" + res.picture.data.url;
      let imgName = `${res.name}`;
      this.imageUpload(img, imgName);
      await this.updateDatabase(res);
    }
    else {
      alert('Something go wrong!');
    }
  }
  // Update Database
  updateDatabase = async (res) => {
    let s = await this.signUserDetailes(res.email, res.password, res.name, res.picture.data.url);
    console.log('returned value= ' + s);
    if (s != 'user not found!!!') {
      // Success
    }
    else {
      console.log("The user " + res.name + "Sign with firebase but not exist write to database!");
    }
  }
  // Method For SIgn User
  signUserDetailes = async (Email, Password, Name, Photo) => {
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
          "First_Name": Name,
          "Last_Name": "",
          "Email": Email,
          "Password": Password,
          "Url_Photo": "" + Photo,
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
   // Button For Authentication Google
  btnGoogle = async () => {
    const { type, accessToken, user } = await Google.logInAsync({
      iosClientId: `246805410883-8gmj2jr3pagjnic5fbfnvp34ei5mqhro.apps.googleusercontent.com`,
      androidClientId: `246805410883-b9i7403tn5alad19h5r5a0u5hkgk4ats.apps.googleusercontent.com`,
    });

    if (type === 'success') {
      /* `accessToken` is now valid and can be used to get data from the Google API with HTTP requests */
      console.log(user);
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.greeting}>{`Hello again.\nWelcome back.`}</Text>
        <View style={styles.errorMessage}>
          {this.state.errorMessage && <Text style={styles.error}>{this.state.errorMessage}</Text>}
        </View>
        <KeyboardAvoidingView behavior="padding">
          <View style={styles.form}>
            <View>
              <Text style={styles.inputTitle}>Email Address</Text>
              <TextInput
                style={styles.input}
                onChangeText={email => this.setState({ email })}
                autoCapitalize="none"
                value={this.state.email}>
              </TextInput>
            </View>
            <View style={{ marginTop: 32 }}>
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

          <TouchableOpacity style={styles.button} onPress={this.handleLogin}>
            <Text style={{ color: '#FFF', fontWeight: "500" }}>Sign in</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
        <TouchableOpacity
          style={{ alignItems: 'center', marginTop: 32 }}
          onPress={() => this.props.navigation.navigate('Register')}>

          <Text style={{ color: 'white', fontSize: 15 }}>
            New to WeParty ? <Text style={{ fontWeight: "500", color: '#E9446A' }}>Sign Up</Text>
          </Text>
        </TouchableOpacity>
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <Image source={require('../assets/Logo.png')} style={styles.logo} />
        </View>
        <View style={{ marginTop: -40 }}>
          <SocialIcon
            onPress={this.btnFace}
            title='Sign In With Facebook'
            button
            type='facebook'
          />
          <SocialIcon
            onPress={this.btnGoogle}
            title='Sign In With Gmail'
            button
            type='google'
          />
        </View>
      </View >

    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  greeting: {
    color: 'white',
    marginTop: 32,
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
  }
});