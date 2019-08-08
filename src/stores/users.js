import {observable, computed, map, toJS, action} from 'mobx';
import chats from './chats';
import firebase from 'firebase';
import {firebaseApp} from '../firebase';
import notifications from '../notifications';

class Users {

    @observable loggingIn = false;
    @observable registering = false;
    @observable loggingError = null;
    @observable registeringError = null;
    @observable isLoggedIn = false;

    @action login = function(username, password){

        if (!username || username == '') {
            this.loggingIn = false;
            this.loggingError = 'Username was not entered';
            return;
        }

        //login with Firebase email/password method
        this.loggingIn = true;
        this.loggingError = null;

        //console.log("users.login start...");

        firebase.auth().signInWithEmailAndPassword(username, password)
        .then(()=>{
            console.log("users.login inside then...");
            this.loggingIn = false;
            this.isLoggedIn = true;        

            notifications.init((notificationToken)=>{
                 this.setNotificationsToken(notificationToken);
            });
        })
        .catch((error)=>{
            console.log("users.login inside catch...",error);
            var errorCode = error.code;
            var errorMessage = error.message;

            //alert(errorMessage);
            this.loggingIn = false;
            this.loggingError = "["+error.code + "] " + errorMessage;
        });
    }

    @action logout = function(){
        //logout from Firebase authentication service
        this.setNotificationsToken('');
        firebase.auth().signOut();
    }

    @action register = function(email, password, name){
        //register through firebase authentication service
        if (!name || name == '') {
            this.registering = false;
            this.registeringError = 'Name was not entered';
            return;
        }
        this.registering = true;
        this.registeringError = null;
        firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((user)=>{
            this.registering = false;
            notifications.init((notificationToken)=>{
                this.setNotificationsToken(notificationToken);
            })
            console.log("registered user....",user)
            firebaseApp.database().ref('/users/' + user.uid).set({
                name: name
            });
        })
        .catch((error)=>{
            this.registering = false;
            this.registeringError = error.message;
        });
    }

    @action setNotificationsToken(token){
        //store the notification toekn for this device
        if (!this.id) return;
        this.notificationToken = token;
        firebaseApp.database().ref('/users/' + this.id).update({
            notificationToken : token,
        });
    }

    searchUsers(name) {
        //helper for searching users by name in the database
        return new Promise(function(resolve){
            firebaseApp.database().ref('/users/').once('value')
            .then(function(snapshot) {
                let foundUsers = [];
                const users = snapshot.val();
                for (var id in users) {
                    if (users[id].name === name){
                        foundUsers.push({
                            name: users[id].name,
                            avatar: users[id].avatar,
                            notificationToken: users[id].notificationToken,
                            id
                        });
                    }
                }
                resolve(foundUsers);
            });
        });
    } 

    constructor() {
        this.bindToFirebase();
    } 

    bindToFirebase() {
        //Initialize connection to Firebase user
        //authentication status and data
        return firebase.auth().onAuthStateChanged((user)=>{
            if (this.chatsBind && typeof this.chatsBind.off === 'function')
                this.chatsBind.off();
            if (this.chatsBind && typeof this.userBind.off === 'function')
                this.userBind.off();

            console.log("users.bindToFirebase()  aa");

            if (user){
                //console.log("users.bindToFirebase()  bb",user);
                this.id = user.uid;
                //this.isLoggedIn = true;
                this.chatsBind = chats.bindToFirebase(user.uid);
                this.userBind = firebaseApp.database().ref('/users/'+ this.id).on('value',(snapshot)=>{
                    const userObj = snapshot.val();
                    if (!userObj) return;
                    this.name = userObj.name;
                    this.avatar = userObj.avatar;
                })
            }
            else {
                this.id = null;
                this.isLoggedIn = false;
                this.userBind = null;
                this.chatsBind = null;
                this.name = null;
                this.avatar = null;
            }
        });
    } 
}

const users = new Users();

export default users;