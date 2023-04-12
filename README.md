# **RevolvingText**

`RevolvingText` is a React Native component that animates text to scroll horizontally from right to left in a never-ending loop. It is designed to handle text that overflows its container and provides a smooth scrolling experience to the user.

# **Installation**

RevolvingText can be installed via NPM or Yarn:

`npm install react-native-revolving-text @react-native-masked-view/masked-view react-native-reanimated react-native-linear-gradient --save`

`yarn add react-native-revolving-text @react-native-masked-view/masked-view react-native-reanimated react-native-linear-gradient`

# **Usage**

```ts
import React from "react";
import { StyleSheet, View } from "react-native";
import { RevolvingText } from "react-native-revolving-text";

const App = () => {
  return (
    <View style={styles.container}>
      <RevolvingText fontStyle={styles.text} speed={80} delayMs={4000} marginLeft={10} textColor={"white}>
        This text will continuously scroll to the left in a loop if the text is larger than its parent view
      </RevolvingText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
    marginHorizontal: 40,
  },
  text: {
    fontFamily: "Helvetica",
    fontSize: 18,
    fontWeight: "600",
  },
});
```

# **Props**

- `delayMs` (optional) - The number of milliseconds to delay before the animation starts. Defaults to 4000.
- `marginLeft` (optional) - The amount of margin to add to the left of the text. Defaults to 0.
- `speed` (optional) - The speed of the animation in pixels per second. Defaults to 50.
- `textColor` (optional) - The color of the text. Defaults to black.
- `fontStyle` (optional) - An object containing any additional styles to be applied to the text component.

![](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNmI3YmJlOTFhZTcyOTA5YWI5OTkwMWMxNTk4MGE1MjQ4NTdiNDdjMSZjdD1n/1ymHr0E5x93qYU17lR/giphy.gif)
