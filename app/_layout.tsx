import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { ThemeProvider } from "@shopify/restyle";
import { useFonts } from "expo-font";

import type { Routes } from "../src/Routes";
import {
  ColorSchemeProvider,
  LoadAssets,
  darkTheme,
  theme,
  useColorScheme,
} from "../src/components";
import { Telegram } from "../src/Telegram";

const fonts = {};
const assets: number[] = [];
const Stack = createStackNavigator<Routes>();
const AppNavigator = () => {
  const { colorScheme } = useColorScheme();
  return (
    <ThemeProvider theme={colorScheme === "dark" ? darkTheme : theme}>
      <Stack.Navigator>
        <Stack.Group>
          <Stack.Screen
            name="Telegram"
            component={Telegram}
            options={{
              title: "💬 Telegram",
              headerShown: false,
            }}
          />
        </Stack.Group>
      </Stack.Navigator>
    </ThemeProvider>
  );
};

const App = () => {
  const [fontsLoaded] = useFonts({
    SFProDisplayBold: require("../assets/fonts/SF-Pro-Display-Bold.otf"),
    SFProTextRegular: require("../assets/fonts/SF-Pro-Text-Regular.otf"),
  });
  if (!fontsLoaded) {
    return null;
  }
  return (
    <ColorSchemeProvider>
      <AppNavigator />
    </ColorSchemeProvider>
  );
};

// eslint-disable-next-line import/no-default-export
export default App;
