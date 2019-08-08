import React, {PropTypes} from 'react';
import {View, Image, Button, Text} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {observer, inject} from 'mobx-react';


import notifications from '../notifications';

@inject('users') @observer
export default class Profile extends React.Component {

    static navigationOptions = {
        tabBarLabel: 'Profile',
        tabBarIcon: ({tintColor}) => {
            <Icon name="user" size={30} color={tintColor} />
        }
    }

    imgPlaceholder = 'http://';

    onPressLogout() {
        this.props.users.logout();
    }

    render() {
        return (
            <View style={{padding:20}}>
                {
                    this.props.users.name && 
                    <View style={{flexDirection:'row', alignItems:'center'}}>
                        <Image source={{uri:this.props.users.avatar || this.imgPlaceholder}}
                            borderRadius={50}
                            style={{width:100, height:100, margin:20, resizeMode:'cover'}} />
                        <Text style={{fontSize:25}}>{this.props.users.name}</Text>
                    </View>
                }
                <Button onPress={this.onPressLogout.bind(this)} title='Logout'/>
            </View>
        );
    }

}
