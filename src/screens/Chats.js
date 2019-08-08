import React, {PropTypes} from 'react';
import {View, Text, FlatList, ActivityIndicator} from 'react-native';
import {observer, inject} from 'mobx-react';
import {createAppContainer, createStackNavigator} from 'react-navigation';
import Icon from 'react-native-vector-icons/FontAwesome';
import notifications from '../notifications';
import ListItem from '../components/ListItem';
import Chat from './Chat';

@inject('chats','users') 
@observer
class ChatList extends React.Component {

    imgPlaceholder = 'https://';

    async componentDidMount() {

        const cb = (notif) => {
            this.props.navigation.goBack();
            //for push notification
            this.props.navigation.navigate('Chat',{
                id: notif.data.contactChatId,
                name: notif.data.name || '',
                image: notif.data.image || this.imgPlaceholder
            })
        };
        notifications.createNotificationListeners(cb); //add this line
    }

    //Remove listeners allocated in createNotificationListeners()
    // componentWillUnmount() {
    //     notifications.notificationListener();
    //     notifications.notificationOpenedListener();
    // }

    render(){
        return (
            <View>
                {   
                    this.props.chats.list && 
                    <FlatList 
                        data={this.props.chats.list.toJS()}
                        keyExtractor={(item,index)=> item.id}
                        renderItem={({item})=>{
                            return (
                                <ListItem
                                    text={item.name}
                                    image={item.image || this.imgPlaceholder}
                                    onPress={()=>this.props.navigation.navigate('Chat',{
                                        id: item.id,
                                        name: item.name || '',
                                        image: item.image || this.imgPlaceholder,
                                        contactId: item.contactId                       
                                    })}
                                />
                            )
                        }}
                    />
                }
                {
                    this.props.chats.downloadingChats && 
                    <ActivityIndicator style={{marginTop:20}} />
                }
            </View>
        );
    }
}

const AppNavigator = createStackNavigator(
    {
        Chats: {
            screen: ChatList,
            navigationOptions: ({navigation}) => ({
                title: 'Chats',
            })
        },
        Chat,
    }
  );
const AppContainer = createAppContainer(AppNavigator);

export default class Chats extends React.Component {
      
    render() {
        return <AppContainer/>;
    }
}
