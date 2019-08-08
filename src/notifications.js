import RNfirebase from 'react-native-firebase';
import React, { Component } from 'react';
import { Alert } from 'react-native';


const API_URL = 'https://fcm.googleapis.com/fcm/send';
const FirebaseServerKey = 'AIzaSyBELhcnTO-azPCIyE5sKj65Q7TqjqU-ZQg';//legacy key

let notificationListener = null;
let notificationDisplayedListener = null;
let notificationOpenedListener = null;
let refreshTokenListener = null;
let messageListener = null;
let showAlert = (title, body)=> {
    Alert.alert(
      title, body,
      [
          { text: 'OK', onPress: () => console.log('OK Pressed -' + title + ' : ' + body) },
      ],
      { cancelable: false },
    );
};

const init = (cb) => {
    console.log("notifications inside init...");

    const messaging = RNfirebase.messaging();

    messaging.getToken()
    .then(fcmToken => {
      if (fcmToken) {
        // user has a device token
        console.log("notifications getFCMToken ..",fcmToken);
        cb(fcmToken);
      } else {
        // user doesn't have a device token yet
        console.warn("notifications no token found");
      } 
    });

    refreshTokenListener = messaging.onTokenRefresh(fcmToken => {
        // Process your token as required
        cb(fcmToken);
    });

}

const sendNotification = (token, data) => {

    console.log("inside sendNotification  received token=",token);
    console.log("inside sendNotification  received data=",data);

    let body = JSON.stringify({
        "to": token,
        "notification": {
            "title" : data.sender || '',
            "body": data.text || '',
            "sound": "default"
        },
        "data": {
            "name": data.sender,
            "chatId": data.chatId,
            "contactChatId": data.contactChatId,
            "image": data.image
        },
        "priority": 10
    });

    let headers = new Headers({
        "Content-Type": "application/json",
        "Content-Length": parseInt(body.length),
        "Authorization": "key=" + FirebaseServerKey,
    });

    fetch(API_URL, {method: "POST", headers, body})
    .then(response => console.log("sendNotification Send response OK ", response))
    .catch(error=>console.log("sendNotification Error sending ", error ));
}

// ADD NEW CODE
const createNotificationListeners = async (cb) => {

    console.log('Inside: createNotificationListeners loaded!!!');

    //Set channel
    const channel = new firebase.notifications.Android.Channel('test-channel', 'Test Channel', RNfirebase.notifications.Android.Importance.Max)
        .setDescription('My Messagin App test channel'); //add this line

     RNfirebase.notifications().android.createChannel(channel); //add this line

    /*
    * Triggered when a particular notification has been received in foreground
    * */
    this.notificationListener = RNfirebase.notifications().onNotification((notification) => {
        console.log('Inside notifications().onNotification',notification);
        const { title, body } = notification;
        showAlert('onNotification', title + ' : ' +body);
        cb(notification);//run callback
    });
    /*
    * Triggered when a particular notification has been displayed
    * */
   this.notificationDisplayedListener = RNfirebase.notifications().onNotificationDisplayed((notification) => {
       console.log('Inside notifications().onNotificationDisplayed',notification);
       showAlert('onNotificationDisplayed', ' todo ');
        // ANDROID: Remote notifications do not contain the channel ID. You will have to specify this manually if you'd like to re-display the notification.
        notification.android.setChannelId('test-channel');
        RNfirebase.notifications().displayNotification(notification);
    });


    /*
    * If your app is in background, you can listen for when a notification is clicked / tapped / opened as follows:
    * */
    this.notificationOpenedListener = RNfirebase.notifications().onNotificationOpened((notificationOpen) => {
        console.log('Inside notifications().onNotificationOpened',notificationOpen);
        const { contactChatId, chatId } = notificationOpen.notification.data;
        showAlert('onNotificationOpened', contactChatId + ' ,  chatId = ' +chatId);
        cb(notificationOpen.notification);//run callback
    });
  
    /*
    * If your app is closed, you can check if it was opened by a notification being clicked / tapped / opened as follows:
    * */
    const notificationOpen = await RNfirebase.notifications().getInitialNotification();
    if (notificationOpen) {
        console.log('Inside notifications().getInitialNotification',notificationOpen);
         // Get the action triggered by the notification being opened
        const action = notificationOpen.action;
        // Get information about the notification that was opened
        const notification = notificationOpen.notification;
        const { contactChatId, chatId } = notification.data;

        showAlert('getInitialNotification', contactChatId + ' ,  chatId = ' +chatId);
        cb(notification);//run callback
    }
    /*
    * Triggered for data only payload in foreground
    * */
    this.messageListener = RNfirebase.messaging().onMessage((message) => {
      //process data message
      let payload =  SON.stringify(message);
      console.log('messageListener = ' + payload);
      showAlert('messageListener onMessage', payload);
    });
  }



export default { init, sendNotification, createNotificationListeners};