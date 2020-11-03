import React, { Component } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import * as firebase from 'firebase';
import { Spinner } from 'native-base';


export default class LoadingScreen extends Component {
    constructor(props) {
        super(props);

        this.RotateValueHolder = new Animated.Value(0);
    }
    componentDidMount() {
        this.StartImageRotateFunction()
        firebase.auth().onAuthStateChanged(user => {
            this.props.navigation.navigate(user ? "App" : "Auth")
        })
    };
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
        const RotateData = this.RotateValueHolder.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg'],
        });
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
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
    },
});