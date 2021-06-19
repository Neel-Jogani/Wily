import firebase from 'firebase'
require('@firebase/firestore')

var firebaseConfig = {
    apiKey: "AIzaSyD7UgYJxemsjdwL8dhwaFaXULFP6jPR_tE",
    authDomain: "wily-cb9cf.firebaseapp.com",
    projectId: "wily-cb9cf",
    storageBucket: "wily-cb9cf.appspot.com",
    messagingSenderId: "217693157563",
    appId: "1:217693157563:web:b2e1a70d6def0235ba919e"
  };
  // Initialize Firebase
 firebase.initializeApp(firebaseConfig);


export default firebase.firestore