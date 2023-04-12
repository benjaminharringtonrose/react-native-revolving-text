import * as React from 'react';

import { RevolvingText } from 'react-native-revolving-text';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';

export default function App() {
  return (
    <View style={styles.container}>
      <View
        style={{
          backgroundColor: 'black',
          width: 300,
          padding: 5,
          borderRadius: 4,
        }}
      >
        <RevolvingText
          speed={50}
          delayMs={4000}
          textColor={Colors.white}
          marginLeft={10}
          fontStyle={{ fontWeight: '600' }}
        >
          {
            "If the text is larger than it's parent view, it'll begin revolving after the delay at the speed you set it to. Enjoy the component!"
          }
        </RevolvingText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
