import React from "react";
import Feather from "@expo/vector-icons/Feather";
import { Pressable, View } from "react-native";

import { useColorScheme, useTheme } from "../../components";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

export const ColorSchemeButton = () => {
  const theme = useTheme();
  const { toggle, colorScheme, active  } = useColorScheme();

  const pan = Gesture.Pan().runOnJS(true).onBegin((e) => {
    if (!active){
      toggle(e.absoluteX, e.absoluteY);
    }
  });
  return (
    <GestureDetector gesture={pan}>
      <View collapsable={false}>
        <Feather
          name={colorScheme === "light" ? "moon" : "sun"}
          color={theme.colors.mainForeground}
          size={32}
        />
      </View>
    </GestureDetector>
  );
};
