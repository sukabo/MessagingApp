import React, {PropTypes} from 'react';
import {View, TextInput, Button, FlatList} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {observer, inject} from 'mobx-react';
import ListItem from '../components/ListItem';

@inject('users','chats') @observer 
export default class Search extends React.Component {

    imgPlaceholder = 'http://';

    state = {
        name: '',
        foundUsers: null,
    }

    static navigationOptions = {
        tabBarLabel: 'Search',
        tabBarIcon: ({tintColor}) => {
            <Icon name="search" size={30} color={tintColor} />
        }
    }

    onPressSearch() {
        this.props.users.searchUsers(this.state.name)
        .then((foundUsers)=>{
            this.setState({foundUsers});
        });
    }

    onPressUser(user){
        //open a chat with the selected user
        this.props.chats.add({
            id: this.props.users.id,
            name: this.props.users.name,
            avatar: this.props.users.avatar || this.imgPlaceholder,
            notificationToken: this.props.users.notificationToekn || '',
        },{
            id: user.id,
            name: user.name,
            avatar: user.avatar || this.imgPlaceholder,
            notificationToekn: user.notificationToekn || ''
        });
        this.props.navigation.navigate('Chats',{});
    }

    render() {
        return (
            <View>
                <View style={{padding:20, marginTop:20, backgroundColor: '#eee'}}>
                    <View style={{backgroundColor: 'white', padding:15, borderRadius:10}}>
                        <TextInput
                            style={{borderColor:'gray',borderBottomWidth:1, height:40}}
                            onChangeText={(name)=>this.setState({name})}
                            value={this.state.name}
                            placeholder='Name of user'
                        />
                        <Button
                            onPress={this.onPressSearch.bind(this)}
                            title='Search'
                        />
                    </View>
                </View>
                {
                    this.state.foundUsers  &&
                    <FlatList
                        data={this.state.foundUsers}
                        keyExtractor={(item,index)=>index}
                        renderItem={({item})=>{
                            return (
                                <ListItem
                                    text={item.name}
                                    image={item.avatar | this.imgPlaceholder}
                                    onPress={this.onPressUser.bind(this,item)}
                                />
                            )
                        }}

                    />
                }
            </View>
        )
    }
}
