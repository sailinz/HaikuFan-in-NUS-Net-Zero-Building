import {Navigation} from 'react-native-navigation';

export function registerScreens() {
  Navigation.registerComponent('Home', () => require('./Home').default);
  Navigation.registerComponent('Initializing', (sc) => require('./Initializing').default);
  Navigation.registerComponent('Screen_fanlocation', () => require('./Screen_fanlocation').default);
  Navigation.registerComponent('Screen_changecloth', () => require('./Screen_changecloth').default);
  Navigation.registerComponent('Screen_fanlocation_goal_driven', () => require('./Screen_fanlocation_goal_driven').default);
  Navigation.registerComponent('Screen_changecloth_goal_driven', () => require('./Screen_changecloth_goal_driven').default);
  
}