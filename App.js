import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';

import LoadingScreen from './screens/LoadingScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';

import firebase from 'firebase';
import NavigatePage from './screens/NavigatePage';

var firebaseConfig = {
  apiKey: "AIzaSyAqn5jNsDdeI_2DcPmsavheIPWjrUq8cCc",
  authDomain: "weparty-eaae8.firebaseapp.com",
  databaseURL: "https://weparty-eaae8.firebaseio.com",
  projectId: "weparty-eaae8",
  storageBucket: "weparty-eaae8.appspot.com",
  messagingSenderId: "979547493915",
  appId: "1:979547493915:web:891299f40bd81c776ecabe",
  measurementId: "G-310NQQ82WD"
};

firebase.initializeApp(firebaseConfig);

const AppStack = createStackNavigator({
  Navigate: {
    screen: NavigatePage,
    navigationOptions: {
      headerShown: false
    }
  }
});

const AuthStack = createStackNavigator({
  Login: {
    screen: LoginScreen,
    navigationOptions: {
      headerShown: false
    }
  },
  Register: {
    screen: RegisterScreen,
    navigationOptions: {
      headerShown: false
    }
  }
});

export default createAppContainer(
  createSwitchNavigator({
    Loading: LoadingScreen,
    App: AppStack,
    Auth: AuthStack
  }, {
    initialRouteName: "Loading"
  })
)