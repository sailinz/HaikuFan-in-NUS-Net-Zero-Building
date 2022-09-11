// Home.js
import React, {Component}  from 'react'
import {
  View,
  Text,
  StyleSheet,
  Image,
  Slider,
  Switch,
  
} from 'react-native'
import {Navigation} from 'react-native-navigation';
import QRCodeScanner from 'react-native-qrcode-scanner';
import * as firebase from 'firebase';
import renderIf from './renderIf';
import { Button } from 'react-native-elements';

'use strict';

// config your own firebase database
const config = {
    apiKey: "",
    authDomain: "fantest.firebaseapp.com",
    databaseURL: "https://fantest.firebaseio.com",
    projectId: "fantest",
    storageBucket: "fantest.appspot.com",
    messagingSenderId: "" 
};
firebase.initializeApp(config);

type Props = {};
var  fanStatusColors = ['#339966','#33cc99','#66ffcc','#cccccc','#ffcccc','#ff3333','#cc3333'];
const rpTexts = [
  "Thank you for lowering down the fan speed! This helps us to reduce the energy consumption.",
  "Speed changed as requested, but this will require more energy consumption."
]

var new_Record = {
  fanID: "NA",
  current_fan_speed: "NA",
  desired_fan_speed: "NA",
  current_fan_power: "NA",
  desired_fan_power: "NA",
  timestamp: "NA",
  user_position: "NA", 
  eco_suggestion: "NA",
  participatory_feedback: "NA",
  user_selection: "NA"
}
    
export default class Home extends Component<Props> {
  static get options() {
    return {
      topBar: {
        title: {
          text: 'Net-Zero Energy Building Fan'
        },
      }
    }
  }

  constructor(props){
    super(props)

    this.state = {
      current_speed: 0,
      fanSpeed: 0,
      fanID:'fan',
      userlocation:'',
      fanPower:false,
      fanStatusColor: '#cccccc',
      isShowQR: true,
      isFirstSliderChange: true,
      rpText: "",
    }

    this.updateFanPower = this.updateFanPower.bind(this);
    this.updateFanSpeed = this.updateFanSpeed.bind(this);
    this.addRecord = this.addRecord.bind(this);
    this.onScan = this.onScan.bind(this);
    this.getCurrentColor = this.getCurrentColor.bind(this);
    this.fanStatusChangeListener = this.fanStatusChangeListener.bind(this)
  }

  fanStatusChangeListener(fanID){
    firebase
    .database()
    .ref()
    .child("fans_status/" + fanID)
    .on("child_changed", snapshot => {
      var key = snapshot.key;
      var value = snapshot.val();

      console.log(snapshot)

      if(key == "speed")
      {
        this.setState({ 
          fanSpeed: value,
          fanStatusColor: fanStatusColors[Math.ceil(value * 6 / 100)],
        })
      }else if(key == "power"){
        this.setState({ 
          fanPower: value,
        })
      }else{

      }
    });
  }

  initializeFanStatus(fanID){
    firebase
    .database()
    .ref()   
    .child("fans_status/" + fanID)
    .once("value", snapshot => {
      const message = snapshot.val();
      this.setState({ 
        fanSpeed: message.speed,
        current_fan_speed: message.speed,
        fanStatusColor: fanStatusColors[Math.ceil(message.speed * 6 / 100)],
        fanPower: message.power,
      })
    });
  }

  addRecord(isFanPower, fanPower, fanspeed){
    
    const newRecord = firebase
        .database()
        .ref()
        .child("records")
        .push();
    if(isFanPower){
      //-- the state update has delay as comparing to updating the fans_status table. this is a walkaround
      new_Record = {
        fanID: this.state.fanID,
        current_fan_speed: this.state.fanSpeed,
        desired_fan_speed: "NA",
        current_fan_power: !fanPower,
        desired_fan_power: fanPower,
        timestamp: Date.now(),
        user_position: this.state.userlocation, 
        eco_suggestion: "NA",
        participatory_feedback: "NA",
      }       
 
    }else{ //lower down fan speed
      new_Record = {
        fanID: this.state.fanID,
        current_fan_speed: this.state.current_speed,
        desired_fan_speed: fanspeed,
        current_fan_power: fanPower,
        desired_fan_power: fanPower,
        timestamp: Date.now(),
        user_position: this.state.userlocation, 
        eco_suggestion: "NA",
        participatory_feedback: "NA",
      }   
      this.updateFanSpeed(fanspeed);
    }
    newRecord.set(
      new_Record
    ); 
  }

  updateFanSpeed(fanspeed){
    firebase
      .database()
      .ref()
      .child("fans_status/"+this.state.fanID)
      .update({
          speed: fanspeed,
      });
  }


  updateFanPower(powerstatus){
    this.setState({ 
      fanPower: powerstatus,
    })  
    
    firebase
      .database()
      .ref()
      .child("fans_status/"+this.state.fanID)
      .update({
          power: powerstatus
      });
    this.addRecord(true, powerstatus,0);
  }

  //--  scan QR code to retrieve fan location
  onScan(e) {
    var fanLocation = e.data.split("-");
    
    this.setState({ 
      fanID: fanLocation[0],
      userlocation: fanLocation[1]
    });

    this.initializeFanStatus(fanLocation[0]);
    this.setState({
      isShowQR: false
    }); 
    
    this.fanStatusChangeListener(fanLocation[0]);  

  }

  getCurrentColor = function(options){
    return{
      flex:4.5,
      backgroundColor: this.state.fanStatusColor,
    }
  }
  
  render() {
    return (
      <View style={styles.container}>
        <View style={this.getCurrentColor()}>
          <Image 
            style={{       
              flex: 1,
              width: null,
              height: null,
             }}
            source={require ('../images/fan_image.png')}
          />
        </View>
        
        <View style={styles.fanpower}>
            <Text style={styles.fanIDText}>
              {this.state.fanID}
            </Text>
            <Switch
              value={
                this.state.fanPower
              }
              onValueChange={val =>        
                this.updateFanPower(val)               
              }
              tintColor={"rgba(230,230,230,2.55)"}
              onTintColor={"rgba(255,204,0,2.55)"}
            />
          </View>
          <View style={styles.fanspeed}>
            <Slider
              style={{ width: 260 }}
              step={100/6}
              minimumValue={0}
              maximumValue={100}
              value={this.state.fanSpeed}
              onValueChange={val => {
                  if(this.state.isFirstSliderChange){
                    this.setState({
                      current_speed:this.state.fanSpeed
                    })
                    this.setState({
                      isFirstSliderChange:false
                    })

                  }
        
                  this.setState({ 
                    fanSpeed: val,
                    fanStatusColor: fanStatusColors[Math.ceil(val * 6 / 100)],
                  })
                }
              }
              onSlidingComplete={ (val) => 
                {                          
                  if(val > this.state.current_speed){
                    var maximum = 5;
                    var minimum = 1;
                  
                    var feedback_rand = Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
                    
                    var es; //eco-suggestions
                    var pf; //participatory feedback
                    var nextscreen;

                    if(feedback_rand == 1){
                      es = 1;
                      pf = 1;
                      nextscreen = 'Screen_fanlocation';
                    }else if(feedback_rand == 2){
                      es = 1;
                      pf = 2;
                      nextscreen = 'Screen_fanlocation_goal_driven';
                    }
                    else if(feedback_rand == 3){
                      es = 2;
                      pf = 1;
                      nextscreen = 'Screen_changecloth';
                    }
                    else if(feedback_rand == 4){
                      es = 2;
                      pf = 2;
                      nextscreen = 'Screen_changecloth_goal_driven';
                    }else{ //feedback_rand == 5
                      
                      es = 3;
                      pf = 3;
                    }
                    
  
                    newRecord = {
                      fanID: this.state.fanID,
                      current_fan_speed: this.state.current_speed,
                      desired_fan_speed: val,
                      current_fan_power: this.state.fanPower,
                      desired_fan_power: this.state.fanPower,
                      timestamp: Date.now(),
                      user_position: parseInt(this.state.userlocation) , 
                      eco_suggestion: es,
                      participatory_feedback: pf,
                      user_selection: "NA"
                    }
  
  
                    // nextscreen = 'Screen_fanlocation_goal_driven';
                    if(feedback_rand!=5){
                      Navigation.push(this.props.componentId, {
                        component: {
                          name: nextscreen,
                          passProps: newRecord
                        }
                      });
    
                      //set it back to current value unless user insist to change it
                      this.setState({ 
                        fanSpeed: this.state.current_speed,
                        fanStatusColor: fanStatusColors[Math.ceil(this.state.current_speed * 6 / 100)],
                      })
  
                      this.setState({
                        isFirstSliderChange:false
                      })
  
                      this.setState({
                        rpText: ""
                      })
                    
                    }else{
                      this.setState({
                        rpText: rpTexts[1]
                      })
                    }

                    
                  }else{ // lower down fan speed
                    this.setState(
                      {
                        rpText: rpTexts[0]
                      }
                    )
                    this.addRecord(false, this.state.fanPower, val)
                    this.setState({
                      current_speed: val
                    })
                  }                         
                }

              }
              maximumTrackTintColor={"rgba(230,230,230,2.55)"}
              minimumTrackTintColor={"rgba(255,204,0,2.55)"}
            />
            <Text>
              {(this.state.fanSpeed * 6 /100).toFixed(0)}
            </Text>
          </View>
          {renderIf(this.state.isShowQR)(
            <View style={styles.qrcodeView}>
              <QRCodeScanner 
                cameraStyle={{
                  width: 120,
                  height: 120,}}
                onRead={this.onScan}
                fadeIn = {true}
                reactivate = {true}
              />
            </View>
          )}
          {renderIf(!this.state.isShowQR)(
            <View style={styles.qrcodeScanNewView}>
              <Text style={
                {
                  textAlign: 'center',
                  fontSize: 14,
                  padding: 20,
                }
              }>
                {this.state.rpText}
              </Text>
              <Button
                onPress={() => {
                    this.setState({
                      isShowQR: true
                    }); 
                  }
                }
                title="Scan a new location"
                textStyle={{textAlign: 'center'}}
                buttonStyle={{backgroundColor: '#ffcc00', borderRadius: 20}}  
              />
            </View>
           )} 
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
  },


  fanpower:{
    flex:1,
    flexDirection: 'row',
    paddingTop:5,
    paddingLeft: 15,
    paddingRight: 15,
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  fanspeed:{
    flex: 0.7,
    flexDirection: 'row',
    alignItems:'center',
    paddingLeft: 10,
    paddingRight: 15,
    justifyContent: 'space-around'
  },

  fanSpeedText:{
    padding: 10,
    textAlign: 'center',
    fontSize: 16
  },

  fanIDText:{
    textAlign: 'center',
    fontSize: 16
  },

  qrcodeView:{
    flex: 3,
    flexDirection: 'row',
    paddingLeft: 100,
    paddingRight: 100,
    justifyContent:'center',
    alignItems:'center',
  },

  qrcodeScanNewView:{
    flex: 3,
    // paddingLeft: 15,
    // paddingRight: 15,
    flexDirection: 'column',
    justifyContent:'center',
    alignItems:'center',
  },

})

