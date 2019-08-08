import {observable, computed, map, toJS, action} from 'mobx';
import {firebaseApp} from '../firebase';
import notifications from '../notifications';

class Chats {

    @observable list;
    @observable selectedChatMessages;
    @observable downloadingChats = false;
    @observable downloadingChat = false;

    @action addMessages = function(chatId, contactId, senderId, messages){
        //add a list of messages to a chat
        if (!messages || messages.length <1) return;
        
        messages.forEach( (message) => {
                let formattedMessage = {
                    _id: message._id,
                    user: {
                        _id: message.user._id,
                    }
                };
                if (message.text) formattedMessage.text = message.text;
                if (message.createdAt) formattedMessage.createdAt = message.createdAt / 1;
                if (message.user.name) formattedMessage.user.name = message.user.name;
                if (message.user.avatar) formattedMessage.user.avatar = message.user.avatar;
                if (message.image) formattedMessage.image = message.image;

                //add the message to the chat
                firebaseApp.database().ref('/messages/'+chatId).push().set(formattedMessage);

                //Add the message to the contact chat also
                let contactChatId = contactId+senderId;
                let contactFormattedMessageContact = {                    
                    _id: message._id,
                    text: formattedMessage.text,
                    createdAt: formattedMessage.createdAt,
                    user: {
                        _id: senderId,
                        name: 'senderName',
                    }
                };
                firebaseApp.database().ref('/messages/'+contactChatId).push().set(contactFormattedMessageContact);

                //notify person on the chat room
                // TEST ONCE()
                firebaseApp.database().ref('/users/'+contactId).once('value')
                .then(function(snapshot){
                    console.log("inside addMessages on snapshot.val()",snapshot.val());
                    var notificationToken = snapshot.val().notificationToken;
                    notifications.sendNotification(notificationToken,{
                        sender: message.user.name,
                        text: message.text,
                        image: message.user.image,
                        chatId,
                        contactChatId,
                    })
                });           
                // TEST ON('value',)
                // firebaseApp.database().ref('/users/'+contactId).on('value',(snapshot)=>{
                //     console.log("inside addMessages on snapshot.val()",snapshot.val());
                //     var notificationToken = snapshot.val().notificationToken;
                //     console.log("inside addMessages on notificationToken=",notificationToken);

                //     notifications.sendNotification(notificationToken,{
                //         sender: message.user.name,
                //         text: message.text,
                //         image: message.user.image,
                //         chatId,
                //     })
                // });


            }

        );
            

    }

    @action selectChat = function(id){
        //set a chat as selected and retrieve all the messages for it
        this.downloadingChat = true;
        if (this.chatBind && typeof this.chatBind.off === 'function')
            this.chatBind.off();

        this.chatBind = firebaseApp.database().ref('/messages/'+id).on('value',(snapshot)=>{
            this.selectedChatMessages = [];
            this.downloadingChat = false;
            const messagesObj = snapshot.val();
            for(var id in messagesObj){
                this.selectedChatMessages.push({
                    _id: id,
                    text: messagesObj[id].text,
                    createdAt: messagesObj[id].createdAt,
                    user: {
                        _id: messagesObj[id].user._id,
                        name: messagesObj[id].user.name,
                        avatar: messagesObj[id].user.avatar
                    },
                    image: messagesObj[id].image
                });
            }
        });
    }

    @action add(user1, user2){
        //add a new chat to the list of chats for the users in it
        return new Promise(function(resolve, reject){
            firebaseApp.database().ref('/chats/'+user1.id + '/'  + user1.id + user2.id).set({
                name: user2.name,
                image: user2.avatar,
                contactId: user2.id
            })
            .then(()=>{
                firebaseApp.database().ref('/chats/'+user2.id + '/' + +user1.id + user2.id).set({
                    name: user1.name,
                    image: user1.avatar,
                    contactId: user1.id
                })
                .then(()=>{
                    resolve();
                });
            });
        });
    }

    bindToFirebase(userId){
        //listen for the list of chats in Firebase to update the @observable list
        console.log("chats bindToFirebase... user",userId);
        this.downloadingChats = true;


        return firebaseApp.database().ref('/chats/'+userId).on('value',(snapshot)=>{
            this.downloadingChats = false;
            const chatsObj = snapshot.val();
            this.list = [];
            for(var id in chatsObj){
                this.list.push({
                    id,
                    name: chatsObj[id].name,
                    image: chatsObj[id].image,
                    contactId: chatsObj[id].contactId,
                });
            }
            //console.log("chats bindToFirebase... return end",snapshot);
            console.log("chats bindToFirebase... chats.list",this.list);
        })
    }

}

const chats = new Chats();
export default chats;