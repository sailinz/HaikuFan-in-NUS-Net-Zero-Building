import React, {Component} from 'react'
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  FlatList,
  ListView,
  Dimensions,
} from 'react-native'
import {Navigation} from 'react-native-navigation';
import RadioForm, {RadioButton, RadioButtonInput, RadioButtonLabel} from 'react-native-simple-radio-button';
import * as firebase from 'firebase';
import { Button } from 'react-native-elements';

'use strict';

type Props = {};


var radio_props = [
  {label: 'Yes. I would like to save energy', value: 0},
  {label: 'No. I would like to change the fan speed anyway', value: 1}
];

const numColumns = 2;

var fan_Data = [
  {speed: 5, power: 1, fanStatus: 0, pos0: 2, pos1: 0, pos2: 0, pos3: 0},
  {speed: 0, power: 0, fanStatus: 0, pos0: 0, pos1: 0, pos2: 0, pos3: 0},
  {speed: 0, power: 0, fanStatus: 0, pos0: 0, pos1: 0, pos2: 0, pos3: 0},
  {speed: 0, power: 0, fanStatus: 0, pos0: 0, pos1: 0, pos2: 0, pos3: 0},
  {speed: 0, power: 0, fanStatus: 0, pos0: 0, pos1: 0, pos2: 0, pos3: 0},
  {speed: 0, power: 0, fanStatus: 0, pos0: 0, pos1: 0, pos2: 0, pos3: 0},
  {speed: 0, power: 0, fanStatus: 0, pos0: 0, pos1: 0, pos2: 0, pos3: 0},
  {speed: 0, power: 0, fanStatus: 0, pos0: 0, pos1: 0, pos2: 0, pos3: 0},
];

var socialComparisonNumber = 0;

// different fan speed image directory
const fanSpeedImage0 = require('../images/fan_location/speed0.png')
const fanSpeedImage1 = require('../images/fan_location/speed1.png')
const fanSpeedImage2 = require('../images/fan_location/speed2.png')
const fanSpeedImage3 = require('../images/fan_location/speed3.png')
const fanSpeedImage4 = require('../images/fan_location/speed4.png')
const fanSpeedImage5 = require('../images/fan_location/speed5.png')
const fanSpeedImage6 = require('../images/fan_location/speed6.png')
const fanSpeedImage = [fanSpeedImage0,fanSpeedImage1,fanSpeedImage2,fanSpeedImage3,fanSpeedImage4,fanSpeedImage5,fanSpeedImage6]

// fan status directory
const fanStatusImage0 = require('../images/fan_location/fan_unselected.png')
const fanStatusImage1 = require('../images/fan_location/fan_selected.png')
const fanStatusImage2 = require('../images/fan_location/fan_try.png')
const fanStatusImage = [fanStatusImage0, fanStatusImage1, fanStatusImage2]

// seat occupacy directory
// occuppied
const pos0true = require('../images/fan_location/pos0_occupied.png')
const pos1true = require('../images/fan_location/pos1_occupied.png') 
const pos2true = require('../images/fan_location/pos2_occupied.png')
const pos3true = require('../images/fan_location/pos3_occupied.png')
// unoccupied
const pos0false = require('../images/fan_location/pos0_unoccupied.png')
const pos1false = require('../images/fan_location/pos1_unoccupied.png')
const pos2false = require('../images/fan_location/pos2_unoccupied.png')
const pos3false = require('../images/fan_location/pos3_unoccupied.png')
// user location
const pos0user = require('../images/fan_location/pos0_yourpos.png')
const pos1user = require('../images/fan_location/pos1_yourpos.png')
const pos2user = require('../images/fan_location/pos2_yourpos.png')
const pos3user = require('../images/fan_location/pos3_yourpos.png')

const posOccupacy0 = [pos0true, pos0false, pos0user]
const posOccupacy1 = [pos1true, pos1false, pos1user]
const posOccupacy2 = [pos2true, pos2false, pos2user]
const posOccupacy3 = [pos3true, pos3false, pos3user]

const socialComparisonTextBase = 'Move to a similar temperature zone will make a positive contribution to our energy saving goal today.'

var new_Records = {
  fanID: "NA",
  current_fan_speed: "NA",
  desired_fan_speed: "NA",
  current_fan_power: "NA",
  desired_fan_power: "NA",
  timestamp: "NA",
  user_position: "NA", 
  eco_suggestion: "NA",
  participatory_feedback: "NA",
  user_selection: 0
}


export default class fanLocationSGD extends Component<Props> {
  static get options() {
    return {
      topBar: {
        title: {
          text: 'Net-Zero Energy Building Fan'
        },
      }
    };
  }

  constructor(props){
    super(props)
    this.state = {
      socialComparisonText: this.initializeSCaggregate(),
      ecoFeedbackResult: 1, //1: do not accept; 0: accept
      fanData: this.initializeFanStatus(),  
      radioProps: radio_props,
    }

    this.initializeFanStatus = this.initializeFanStatus.bind(this);
    this.initializeSCaggregate = this.initializeSCaggregate.bind(this);
    this.updatePFaggregate = this.updatePFaggregate.bind(this);
    this.addRecord = this.addRecord.bind(this);
    this.updateFanSpeed = this.updateFanSpeed.bind(this);

  }

  componentDidMount(){  
    // receive props from the home screen
    // console.log(this.props)
    new_Records.fanID = this.props.fanID;
    new_Records.current_fan_speed = this.props.current_fan_speed ;
    new_Records.desired_fan_speed = this.props.desired_fan_speed ;
    new_Records.current_fan_power = this.props.current_fan_power ;
    new_Records.desired_fan_power = this.props.desired_fan_power ;
    new_Records.timestamp = this.props.timestamp ;
    new_Records.user_position = this.props.user_position ;
    new_Records.eco_suggestion = this.props.eco_suggestion ;
    new_Records.participatory_feedback = this.props.participatory_feedback ;

    // set user location and fan status
    var fanid = parseInt(new_Records.fanID.replace("fan",""));
    var userpos =  new_Records.user_position;
    fan_Data[fanid].fanStatus = 1;

    if(userpos == 0){
      fan_Data[fanid].pos0 = 2;
    }else if(userpos == 1){
      fan_Data[fanid].pos1 = 2;
    }else if(userpos == 2){    
      fan_Data[fanid].pos2 = value;
    }else if(userpos == 3){
      fan_Data[fanid].pos3 = 2;
    }else{

    }
    //-- update fan speed and power if the request from other user has updated it
    for (let i = 0; i < fan_Data.length; i++)
    {
      firebase
      .database()
      .ref()
      .child("fans_status/" + "fan" + i)
      .on("child_changed", snapshot => {
        var key = snapshot.key;
        var value = snapshot.val();

        if(key == "speed")
        {
          fan_Data[i].speed = Math.round(value/100*6)
       
        }else if(key == "power"){ 
          var isOn = value ? 1 : 0;
          fan_Data[i].power = isOn;

        }else if(key == "pos0_occupancy"){
          fan_Data[i].pos0 = value;
        }else if(key == "pos1_occupancy"){
          fan_Data[i].pos1 = value;
        }else if(key == "pos2_occupancy"){
          fan_Data[i].pos2 = value;
        }else if(key == "pos3_occupancy"){
          fan_Data[i].pos3 = value;
        }

        if(this.mounted = true)
        {
          this.setState({ 
            fanData: fan_Data,
          });
        }

      });

    }  

    // update participatory feedback text
    firebase
      .database()
      .ref()
      .child("pf_aggregate")
      .on("child_changed", snapshot => {
        var key = snapshot.key;
        var value = snapshot.val();

        if(this.mounted = true)
        {
          if(key == "sc_relocation"){
            this.setState({
              socialComparisonText: value,
            })
          }  
        }
      });

  }

  initializeSCaggregate()
  {
    // initialize participatory feedback text
    firebase
    .database()
    .ref()   
    .child("pf_aggregate/sc_relocation")
    .once("value", snapshot => {
      var value = snapshot.val();
      socialComparisonNumber = value;
      
      if(this.mounted = true){
        this.setState({
          socialComparisonText: value,
        })  
      }
    });

    return socialComparisonNumber
  }

  initializeFanStatus(){
    for (let i = 0; i < fan_Data.length; i++)
    {
      firebase
      .database()
      .ref()   
      .child("fans_status/" + "fan" + i)
      .once("value", snapshot => {
        const message = snapshot.val();
        var isOn = message.power ? 1 : 0;
        fan_Data[i].speed = Math.round(message.speed/100*6) ;
        fan_Data[i].power = isOn;
        fan_Data[i].pos0 = message.pos0_occupancy;
        fan_Data[i].pos1 = message.pos1_occupancy;
        fan_Data[i].pos2 = message.pos2_occupancy;
        fan_Data[i].pos3 = message.pos3_occupancy;
        
        if(this.mounted = true){
          this.setState({
            fanData: fan_Data
          });
        }

      });
    }
    return fan_Data;
  }

  updateFanSpeed(fanspeed){
    firebase
      .database()
      .ref()
      .child("fans_status/"+new_Records.fanID)
      .update({
          speed: fanspeed,
      });
  }

  updatePFaggregate(){   
    firebase
      .database()
      .ref()
      .child("pf_aggregate")
      .update({
        sc_relocation: this.state.socialComparisonText + 1,
      });  
  }

  // for the fan status grid
  renderItem = ({ item, index }) => {
    if (item.empty === true) {
      return <View style={[styles.item, styles.itemInvisible]} />;
    }
    return (
      <View
        style={styles.item}
      >
        <Image
          source={fanSpeedImage[item.speed * item.power]}
          resizeMode='center'
        />
        <Image
          source={fanStatusImage[item.fanStatus]}
          style={{
            zIndex:1,
            position: 'absolute'
          }}
          resizeMode='center'
        />
        <Image
          source={posOccupacy0[item.pos0]}
          style={{
            position: 'absolute'
          }}
          resizeMode='center'
        />
        <Image
          source={posOccupacy1[item.pos1]}
          style={{
            position: 'absolute'
          }}
          resizeMode='center'
        />
        <Image
          source={posOccupacy2[item.pos2]}
          style={{
            position: 'absolute'
          }}
          resizeMode='center'
        />
        <Image
          source={posOccupacy3[item.pos3]}
          style={{
            position: 'absolute'
          }}
          resizeMode='center'
        />
      </View>
    );
  };

  addRecord(record){
    
    const newRecord = firebase
        .database()
        .ref()
        .child("records")
        .push();
     
    newRecord.set(
      record
    );    
  }

  // update user selection radio props
  radioOnPress = radioProps => this.setState({radioProps})

  render() { 
    return (
      <View style={styles.container}>
        <View style={styles.ecofeedbackText}>
          <Text>
            {socialComparisonTextBase}
            {/* {this.state.socialComparisonText  + " " + socialComparisonTextBase} */}
          </Text>
        </View>
        <View style={styles.ecofeedbackImage}>
          <FlatList
            data={this.state.fanData}
            extraData={this.state}
            keyExtractor={(item, index) => index}
            style={styles.listStyle}
            renderItem={this.renderItem}
            numColumns={numColumns}
          />
        </View>
        <View style={styles.ecofeedbackSelection}>
          <RadioForm
            radio_props={radio_props}
            initial={this.state.ecoFeedbackResult}
            formHorizontal={false}
            labelHorizontal={true}
            buttonColor={'#ffcc00'}
            animation={true}
            onPress={(  ) => {
              this.setState({
                ecoFeedbackResult:value
              })
            }}

          />
        </View>
        <View style={styles.ecofeedbackSubmitBtn}>
          <Button
            onPress={() => {  
                new_Records.user_selection = this.state.ecoFeedbackResult;
                if(new_Records.user_selection == 0)
                { // don't update fan speed
                  this.updatePFaggregate(); 
                  // this.updateFanSpeed(new_Records.current_fan_speed);
                }else{ // update fan speed as requested
                  this.updateFanSpeed(new_Records.desired_fan_speed); 
                }
                this.addRecord(new_Records);
                Navigation.pop(this.props.componentId)  
              }
            }
            title="Submit"
            textStyle={{textAlign: 'center'}}
            buttonStyle={{backgroundColor: '#ffcc00', borderRadius: 20}}   
          />
        </View>
        <View style={styles.ecofeedbackLegend}>
         <Image 
            style={{       
              width:"100%",
              height: "100%",
            }}
            source={require ('../images/fan_location/legend.png')}
            resizeMode="contain"
          />
        </View>

      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
  },

  ecofeedbackText:{
    flex: 1,
    flexDirection: 'row',
    paddingLeft: 30,
    paddingRight: 30,
    alignItems:'center',
    justifyContent: 'center'
  },

  ecofeedbackImage:{
    flex: 5.8,
    flexDirection: 'row',
    paddingLeft: 5,
    paddingRight: 5,
    alignItems:'center',
    justifyContent: 'space-around'
  },

  ecofeedbackSelection:{
    flex: 1.5,
    flexDirection: 'row',
    paddingTop: 10,
    paddingLeft: 30,
    paddingRight: 30,
    alignItems:'flex-start',
    justifyContent: 'flex-start'
  },

  ecofeedbackSubmitBtn:{
    flex: 0.8,
    flexDirection: 'row',
    alignItems:'center',
    justifyContent: 'center',
  },

  ecofeedbackLegend:{
    flex: 0.5,
    justifyContent: 'flex-end',
    paddingBottom:0,
  },

  listStyle:{
    flex:1,
    marginVertical:0
  },
  item: {
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
    margin: 1,
    height: Dimensions.get('window').width / numColumns, // approximate a square
  },
  itemInvisible: {
    backgroundColor: 'transparent',
  },

})