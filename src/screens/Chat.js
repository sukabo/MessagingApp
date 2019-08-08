import React, {PropTypes} from 'react';
import {observer, inject} from 'mobx-react';
import {View, Image, ActivityIndicator} from 'react-native';
import {GiftedChat, GiftedAvatar} from 'react-native-gifted-chat';
import notifications from '../notifications';

@inject('chats','users') 
@observer 
export default class Chat extends React.Component {

    static navigationOptions = ({ navigation }) => ({
        title: navigation.state.params.name,
        headerRight: <Image source={{uri:navigation.state.params.image}}
                            style={{
                                width: 30,
                                height: 30,
                                borderRadius: 15,
                                marginRight: 10,
                                resizeMode: 'cover'
                            }} />,
    })

    onSend(messages){
        console.log("onSend chatId",this.chatId);
        console.log("onSend contactId",this.contactId);
        console.log("onSend senderId",this.props.users.id);
        this.props.chats.addMessages(this.chatId, this.contactId, this.props.users.id, messages);
    }

    componentDidMount() {
        this.contactId = this.props.navigation.state.params.contactId;
        this.chatId = this.props.navigation.state.params.id;
        this.props.chats.selectChat(this.chatId);
        notifications.createNotificationListeners(); //add this line

    }

    render() {
        var messages = this.props.chats.selectedChatMessages;
        if (this.props.chats.downloadingChat) {
            return <View><ActivityIndicator style={{marginTop:20}} /></View>
        }
        
        return (
            <GiftedChat
                onSend={(messages)=> this.onSend(messages)}
                messages={messages ? messages.toJS().reverse() : []}
                user={{
                    _id: this.props.users.id,
                    name: this.props.users.name,
                    avatar: this.props.users.avatar
                }}
            />
        );
    }
}
