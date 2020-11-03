import React, { Component } from 'react'
import { Text, View, StyleSheet, Animated, Easing, ScrollView, RefreshControl } from 'react-native'
import { ScrollView as GHScrollView } from 'react-native-gesture-handler';
import { Spinner } from 'native-base';
import RequestItem from '../component/RequestItem';
import * as firebase from 'firebase';

var url = 'http://185.60.170.14/plesk-site-preview/ruppinmobile.ac.il/site03/PostAllRequestsUser';
var urlCurrent = 'http://185.60.170.14/plesk-site-preview/ruppinmobile.ac.il/site03/current';

export default class OrderScreen extends Component {
    constructor(props) {
        super(props);
        this.RotateValueHolder = new Animated.Value(0);
        this.state = {
            isReady: false,
            arrRequests: [],
            current: null,
            email: null,
            user_id: null,
            refreshing: false,
        }
    }
    getRequest = (Request_ID) => {
        this.props.sendRequest(Request_ID)
    }
    async componentDidMount() {
        this.StartImageRotateFunction()
        setTimeout(() => { this.setState({ isReady: true }); }, 2000);
        const { email, displayName } = firebase.auth().currentUser
        this.setState({
            email: email,
        }, async () => {
            let temp = await this.updateCurrentUser();
            if (temp != null) {
                this.setState({ current: temp }, async () => {
                    let s = await this.fetchGiveAllRequestsByUser();
                    if (s != null) {
                        this.setState({ arrRequests: s });
                        let output;
                        output = this.state.arrRequests.map(
                            (request) => {
                                return <RequestItem key={request.Request_ID} request={request} sendRequest={this.getRequest} />
                            }
                        )
                        this.setState({ ans: output });
                    }
                    else {
                        console.log("No Request");
                    }
                })
            }
        });
    }

    _onRefresh = async () => {
        this.setState({ refreshing: true, isReady: false });
        await new Promise(resolve => setTimeout(resolve, 2000));
        // refresh requests
        let s = await this.fetchGiveAllRequestsByUser();
        if (s != null) {
            this.setState({ arrRequests: s });
            let output;
            output = this.state.arrRequests.map(
                (request) => {
                    return <RequestItem key={request.Request_ID} request={request} sendRequest={this.getRequest} />
                }
            )
            this.setState({ ans: output });
        }
        else {
            console.log("No Requests");
        }
        this.setState({ refreshing: false, isReady: true });
    };

    updateCurrentUser = async () => {
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
    fetchGiveAllRequestsByUser = async () => {
        let returnedObj = null;

        await fetch(url,
            {
                method: 'POST', // 'GET', 'POST', 'PUT', 'DELETE', etc.
                headers: new Headers({
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }),
                body: JSON.stringify({
                    "Request_ID": 1018,
                    "User_ID": `${this.state.current.User_ID}`,
                    "To_Place": "",
                    "Status": "",
                    "Date": "",
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
    StartImageRotateFunction() {
        this.RotateValueHolder.setValue(0);
        Animated.timing(this.RotateValueHolder, {
            toValue: 1,
            duration: 1000,
            easing: Easing.linear,
        }).start(() => this.StartImageRotateFunction());
        return true;
    }
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
                <View >
                    <View>
                        <Text style={styles.greeting}>Tickets</Text>
                    </View>
                    <View style={styles.container} >{this.state.ans}</View>
                </View>
            </ScrollComponent>

        )
    }
}
const styles = StyleSheet.create({
    container: {
        backgroundColor: '#1E1E1E',
        flex: 1,
    },
    greeting: {
        margin: 20,
        color: 'white',
        fontSize: 30,
        fontWeight: "400",
        textAlign: 'center'
    },
});
