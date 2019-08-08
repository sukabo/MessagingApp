/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */
import React, {Component} from 'react';
import {Platform, View, Alert} from 'react-native';
import {createDrawerNavigator, createBottomTabNavigator, createAppContainer} from 'react-navigation';
import {observer, inject} from 'mobx-react';

import Login from './src/screens/Login';
import Profile from './src/screens/Profile';
import Search from './src/screens/Search';
import Chats from './src/screens/Chats';


let Navigator;
if (Platform.OS === 'ios') {
  Navigator = createBottomTabNavigator({
    Chats,
    Search,
    Profile,
  },{
    tabBarOptions: {
      inactiveTintColor: '#aaa',
      activeTintColor: '#000',
      showLabel: true,
    }
  });
} else {
  Navigator = createDrawerNavigator({
    Chats,
    Search,
    Profile,
  });
}

let AppContainer = createAppContainer(Navigator);

@inject("users") 
@observer
export default class App extends React.Component {

  render(){
    if (this.props.users.isLoggedIn){
      return <AppContainer />
    }
    else {
      return <Login/>
    }
  }
}
