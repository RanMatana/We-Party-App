import React, { Component } from 'react';
import { Header, Item, Input, Icon, Button, Text } from 'native-base';
import { Keyboard } from 'react-native';

export default class SearchPlace extends Component {

    constructor(props) {
        super(props);
        this.state = {
            search: '',
        }
    }
    txtchg = (text) => {
        this.setState({ search: text });
    }
    btnSearch = () => {
        alert(this.state.search);
    }
    render() {
        return (
            <Header searchBar rounded>
                <Item>
                    <Icon onPress={this.btnSearch} name="ios-search" />
                    <Input onChangeText={(text) => this.txtchg(text)} placeholder="Search" />
                    <Icon name="ios-wine" />
                </Item>
            </Header>
        );
    }
}