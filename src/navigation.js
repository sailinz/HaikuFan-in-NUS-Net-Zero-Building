import { Navigation } from 'react-native-navigation'

export const goHome = () => Navigation.setRoot({
    root: {
      stack: {
        id: 'App',
        children: [
          {
            component: {
              name: 'Home',
              // name: 'Screen_changecloth',
              // name: 'Screen_fanlocation',
            }
          }
      ],
      }
    }
  })