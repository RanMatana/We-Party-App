import React from 'react'
import { NavigationContainer } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ProfileScreen from './ProfileScreen';
import OrderScreen from './OrderScreen';
import HomeScreen from './HomeScreen';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { View,Root } from 'native-base';

const Tab = createMaterialBottomTabNavigator();

function MainTabScreen() {
    return (
        <Tab.Navigator
            initialRouteName="Home"
            activeColor="white"
            inactiveColor="gray"
            barStyle={{ backgroundColor: '#1E1E1E' }}
        >
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarLabel: 'Profile',
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons name="account" color={color} size={26} />
                    ),
                }}
            />
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    tabBarLabel: 'Home',
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons name="home" color={color} size={26} />
                    ),
                }}
            />
            <Tab.Screen
                name="Order"
                component={OrderScreen}
                options={{
                    tabBarLabel: `Tickets`,
                    tabBarIcon: ({ color }) => (
                        <View>
                            <MaterialCommunityIcons name="ticket" color={color} size={26} />
                            {/* <Badge
                                status="error"
                                containerStyle={{ position: 'absolute', top: -4, right: -4 }}
                            /> */}
                        </View>
                    ),
                }}
            />
        </Tab.Navigator>
    );
}

export default class NavigatePage extends React.Component {
    render() {
        return (
            <Root>
                <NavigationContainer>
                    <MainTabScreen />
                </NavigationContainer>
            </Root>
        )
    }
}

