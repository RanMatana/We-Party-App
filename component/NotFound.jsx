import React, { Component } from 'react'
import { StyleSheet, Text, View, Dimensions, KeyboardAvoidingView, Keyboard, Slider, Vibration } from 'react-native'
import { Button } from 'react-native-elements';

var { height, width } = Dimensions.get('window');
const DURATION = 100;

export default class NotFound extends Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }
    btnUpdate = async () => {
        Vibration.vibrate(DURATION);
        Keyboard.dismiss();
        this.props.sendR(this.state.value * 1000);
    }
    render() {
        return (
            <View style={{ height, width, alignItems: 'center', justifyContent: 'center' }}>
                <KeyboardAvoidingView behavior="padding">
                    <Text style={{ textAlign: 'center', color: 'white', marginBottom: 40 }}>
                        {`NO PLACES AROUND YOU !\nPLEASE CHANGE YOU SEARCH AREA`}
                    </Text>
                    <View style={{ marginBottom: 80, alignItems: 'center' }}>
                        <Slider
                            style={{ width: 250, height: 40 }}
                            minimumValue={10}
                            maximumValue={500}
                            onValueChange={(value) => this.setState({ value })}
                            minimumTrackTintColor="#FFFFFF"
                            maximumTrackTintColor="#000000"
                            step={1}
                        />
                        <Text style={{
                            textAlign: 'center',
                            color: 'white',
                            fontWeight: 'bold'
                        }}>{this.state.value}</Text>
                    </View>
                    <View>
                        <Button onPress={this.btnUpdate} title="CHANGE" />
                    </View>
                </KeyboardAvoidingView>
            </View>
        )
    }
}
const styles = StyleSheet.create({
    container: {
        backgroundColor: '#1E1E1E',
        flex: 1,
    },
    input: {
        textAlign: 'center',
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