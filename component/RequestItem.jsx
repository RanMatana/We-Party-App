import React, { Component } from 'react';
import { List, ListItem, Left, Body, Right, Thumbnail, Text, Button, Icon } from 'native-base';
import { Dimensions } from 'react-native';

const { height, width } = Dimensions.get('window');


var url = 'http://185.60.170.14/plesk-site-preview/ruppinmobile.ac.il/site03/api/place';

export default class RequestItem extends Component {
    constructor(props) {
        super(props);

        this.state = {
            name: null,
            image: null,
        }
    }

    async componentDidMount() {
        let s = await this.takeImageUrlFromPlaceID();
        this.setState({ image: s.Image_Url, name: s.Name_Place });
    }
    takeImageUrlFromPlaceID = async () => {

        let returnedObj = null;
        await fetch(url + `/${this.props.request.To_Place}`,
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
    render() {
        return (
            <List style={{ width: width }}>
                <ListItem avatar >
                    <Right style={{alignItems:'center'}}>
                        <Text style={{textAlign:'center'}} note>{this.props.request.Date}</Text>
                        {/* <Button style={{ alignContent: 'center', justifyContent: 'center' }} transparent>
                            <Icon style={{ fontSize: 35 }} active name="navigate" />
                        </Button> */}
                    </Right>
                    <Body style={{ marginTop: 20 }}>
                        <Text style={{ color: 'white' }}>{this.state.name}</Text>
                        <Text note>{this.props.request.Status}</Text>
                    </Body>
                    <Left>
                        <Thumbnail source={{ uri: `${this.state.image}` }} />
                    </Left>
                </ListItem>
            </List>
        );
    }
}