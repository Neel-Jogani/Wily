import React from 'react'
import{Text,View, TouchableOpacity, StyleSheet, TextInput, Image, Alert} from 'react-native'
import * as Permissions from 'expo-permissions'
import {BarCodeScanner} from 'expo-barcode-scanner'
import db from '../config'
import  firebase from 'firebase'

export default class TransactionScreen extends React.Component{

    constructor(){
        super()
        this.state={
            hasCameraPermissions: null,
            scanned: false,
            buttonState: 'normal',
            scannedBookID: '',
            scannedStudentID:'',
            transactionMessage: ''
        }
    }

    getCameraPermissions=async(id)=>{
        const {status}=await Permissions.askAsync(Permissions.CAMERA)
        this.setState({
            hasCameraPermissions: status==='granted',
            buttonState: id,
            scanned: false
        })
    }

    handleBarCodeScanned=async({type,data})=>{
        if(this.state.buttonState==="BookID"){
            this.setState({
                scanned: true,
                scannedBookID: data,
                buttonState: "normal",
            })
        }
        else if(this.state.buttonState==="StudentID"){
            this.setState({
                scanned: true,
                scannedStudentID: data,
                buttonState: "normal",
            })
        }
        
    }

    handleTransaction=async()=>{
        var transactionMessage
        db.collection('books').doc(this.state.scannedBookID).get()
        .then((doc)=>{
            var book=doc.data()
            if(book.bookAvailibility){
                this.initiateBookIssue()
                transactionMessage="Book Issued"
            }
            else{
                this.initiateBookReturn()
                transactionMessage= "Book Return"
            }
        })
        this.setState({
            transactionMessage: transactionMessage
        })
    }
    
    initiateBookIssue=async()=>{
        db.collection('transactions').add({
            'studentID': this.state.scannedStudentID,
            'bookID': this.state.scannedBookID,
            'date': firebase.firestore.Timestamp.now().toDate(),
            'transactionType': 'issue'
        })
        db.collection('books').doc(this.state.scannedBookID).update({
            'bookAvailibility': false,
        })
        db.collection('students').doc(this.state.scannedStudentID).update({
            'numberOfBooksIssued': firebase.firestore.FieldValue.increment(1),
        })
        Alert.alert('Book Issued')
        this.setState({
            scannedBookID:'',
            scannedStudentID: ''
        })
    }

    initiateBookReturn=async()=>{
        db.collection('transactions').add({
            'studentID': this.state.scannedStudentID,
            'bookID': this.state.scannedBookID,
            'date': firebase.firestore.Timestamp.now().toDate(),
            'transactionType': 'return'
        })
        db.collection('books').doc(this.state.scannedBookID).update({
            'bookAvailibility': true,
        })
        db.collection('students').doc(this.state.scannedStudentID).update({
            'numberOfBooksIssued': firebase.firestore.FieldValue.increment(-1),
        })
        Alert.alert('Book Return')
        this.setState({
            scannedBookID:'',
            scannedStudentID: ''
        })
    }

    render(){
        const hasCameraPermissions= this.state.hasCameraPermissions
        const scanned= this.state.scanned
        const buttonState= this.state.buttonState

        if(buttonState!=="normal" && hasCameraPermissions){
            return(
                <BarCodeScanner
                onBarCodeScanned={scanned?undefined:this.handleBarCodeScanned}
                style={StyleSheet.absoluteFillObject}
                />
            )
        }
        else if(buttonState==="normal"){
            return(
                <View style={styles.container}>
                    <View>
                        <Text style={styles.header}>WILY</Text>
                        <Image source={require('../assets/booklogo.jpg')} style={{width:200, height:200}}/>
                    </View>
                    <View style={styles.input}>
                        <TextInput style={styles.inputBox} placeholder='Book ID' value={this.state.scannedBookID}/>
                        <TouchableOpacity style={styles.button} onPress={()=>{
                        this.getCameraPermissions('BookID')
                        }}>
                            <Text style={styles.buttonText}>Scan</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.input}>
                        <TextInput style={styles.inputBox} placeholder='Student ID' value={this.state.scannedStudentID}/>
                        <TouchableOpacity style={styles.button} onPress={()=>{
                            this.getCameraPermissions("StudentID")
                        }}>
                            <Text style={styles.buttonText}>Scan</Text>
                        </TouchableOpacity>
                    </View>
                   <TouchableOpacity style={styles.submit} onPress={async()=>{
                       this.handleTransaction()
                   }}>
                        <Text style={styles.submitText}> Submit </Text>
                   </TouchableOpacity>
                </View>
            )
        }
    }
}

const styles= StyleSheet.create({

    container:{
        flex:1,
        justifyContent:"center",
        alignItems: "center",
    },

    input:{
        flexDirection: "row",
        margin:20,
    },

    inputBox:{
        width:200,
        height:40,
        borderWidth: 1,
        fontSize:20,
        textAlign: 'center'
    },

    button:{
        backgroundColor:"grey",
        width:60,
        height:40,
    },

    buttonText:{
        textAlign:"center",
        fontSize: 20,
        fontWeight: "bold"
    },

    header:{
        fontSize:30,
        textAlign: 'center',
        fontWeight: 'bold'
    },

    submit:{
        width:100,
        height: 50,
        alignSelf: 'center',
        backgroundColor: 'lightblue',
        justifyContent: 'center',
    },

    submitText:{
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white'
    }

})