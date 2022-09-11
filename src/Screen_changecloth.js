import React, {Component} from 'react'
import {
  View,
  Text,
  StyleSheet,
  Image,
} from 'react-native'
import {Navigation} from 'react-native-navigation';
import RadioForm, {RadioButton, RadioButtonInput, RadioButtonLabel} from 'react-native-simple-radio-button';
import * as firebase from 'firebase';
import { Button } from 'react-native-elements';


type Props = {};

var socialComparisonNumber;

var radio_props = [
  {label: 'Yes. I would like to save energy', value: 0, color: '#ffcc00'},
  {label: 'No. I would like to change the fan speed anyway', value: 1, color: '#ffcc00' },
  {label: 'I do not have the option to take off clothes', value: 2, color: '#ffcc00' }
];

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

const socialComparisonTextBase = 'people chose to move to a similar temperature zone to save energy.'

export default class changeClothesSC extends Component<Props> {
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
      radioProps: radio_props,
    }

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
          if(key == "sc_change_clothes"){
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
    .child("pf_aggregate/sc_change_clothes")
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
        sc_change_clothes: this.state.socialComparisonText + 1,
      });  
  }

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
            {this.state.socialComparisonText  + " " + socialComparisonTextBase}
          </Text>
        </View>
        <View style={styles.ecofeedbackImage}>
          <Image 
            style={{       
              flex: 1,
             }}
            source={require ('../images/body_metaphor.png')}
            resizeMode="contain"
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
            onPress={(value) => {
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
    justifyContent: 'space-around'
  },

  ecofeedbackImage:{
    flex: 5,
    flexDirection: 'row',
    paddingLeft: 30,
    paddingRight: 30,
    alignItems:'center',
    justifyContent: 'space-around'
  },

  ecofeedbackSelection:{
    // flex: 3,
    // flexDirection: 'row',
    // paddingLeft: 30,
    // paddingRight: 30,
    // alignItems:'flex-start',
    // justifyContent: 'flex-start'
    flex: 3,
    flexDirection: 'row',
    paddingTop: 10,
    paddingLeft: 20,
    paddingRight: 20,
    alignItems:'flex-start',
    justifyContent: 'flex-start'
  },

  ecofeedbackSubmitBtn:{
    flex: 1,
    paddingTop:0,
    paddingBottom:20,
    flexDirection: 'row',
    alignItems:'center',
    justifyContent: 'center',
  },

})