import firebase from 'firebase';

var firebaseConfig = {
    apiKey: "AIzaSyAx-LPZCHLZlKdLEkkxGtYBtgEqqi33QMA",
    authDomain: "awesome-project-210e3.firebaseapp.com",
    databaseURL: "https://awesome-project-210e3.firebaseio.com",
    projectId: "awesome-project-210e3",
    storageBucket: "awesome-project-210e3.appspot.com",
    messagingSenderId: "1029488755339",
    appId: "1:1029488755339:web:fd72e5eff405cbdf"
  };

export const firebaseApp = firebase.initializeApp(firebaseConfig);

