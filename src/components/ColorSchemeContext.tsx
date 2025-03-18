import {
  makeImageFromView,
  Image,
  Canvas,
  mix,
  vec,
  ImageShader,
  Circle,
  dist,
  Fill,
} from "@shopify/react-native-skia";
import type { SkImage } from "@shopify/react-native-skia";
import { StatusBar } from "expo-status-bar";
import type { ReactNode, RefObject } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useReducer,
  useRef,
} from "react";
import { Appearance, Dimensions, View, StyleSheet } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import {
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const wait = async (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export type ColorSchemeName = "light" | "dark";
const { width, height } = Dimensions.get("window");
const corners = [vec(0, 0), vec(width, 0), vec(width, height), vec(0, height)];


interface ColorScheme {
  statusBarStyle: ColorSchemeName ;
  colorScheme: ColorSchemeName;
  overlay1: SkImage | null;
  overlay2: SkImage | null;
  active: boolean;
}

interface ColorSchemeContext extends ColorScheme {
  dispatch: (scheme: ColorScheme) => void;
  ref: RefObject<View>;
  transition: SharedValue<number>;
  circle: SharedValue<{ x: number; y: number; r: number }>;
}

const defaultValue: ColorScheme = {
  statusBarStyle: (Appearance.getColorScheme() ?? "light") == "light" ? "dark" : "light",
  colorScheme: Appearance.getColorScheme() ?? "light",
  overlay1: null,
  overlay2: null,
  active: false, 
};

const ColorSchemeContext = createContext<ColorSchemeContext | null>(null);

const colorSchemeReducer = (_: ColorScheme, colorScheme: ColorScheme) => {
  return colorScheme;
};

export const useColorScheme = () => {
  const ctx = useContext(ColorSchemeContext);
  if (ctx === null) {
    throw new Error("No ColorScheme context context found");
  }
  const { colorScheme, dispatch, ref, transition, circle, active } = ctx;
  const toggle = useCallback(async (x: number, y: number) => {
    const newColorScheme = colorScheme === "light" ? "dark" : "light";

    dispatch({
      statusBarStyle: newColorScheme,
      active: true,
      colorScheme,
      overlay1: null,
      overlay2: null,
    });

    circle.value = { x, y, r: Math.max(...corners.map(corner => dist(corner, vec(x, y)))) };
    const overlay1 = await makeImageFromView(ref);
    dispatch({
      statusBarStyle: newColorScheme,
      active: true,
      colorScheme,
      overlay1,
      overlay2: null,
    });
    await wait(10);
    dispatch({
      statusBarStyle: newColorScheme,
      active: true,
      colorScheme: newColorScheme,
      overlay1,
      overlay2: null,
    });
    await wait(10);
    const overlay2 = await makeImageFromView(ref);
    dispatch({
      statusBarStyle: newColorScheme,
      active: true,
      colorScheme: newColorScheme,
      overlay1,
      overlay2,
    });
    const duration = 800;
    transition.value = 0;
    transition.value = withTiming(1, { duration });

    await wait(duration);
    dispatch({
      statusBarStyle: colorScheme,
      active: false,
      colorScheme: newColorScheme,
      overlay1: null,
      overlay2: null,
    });
  }, [colorScheme, dispatch, ref, circle, transition]);
  return { colorScheme, toggle, active };
};

interface ColorSchemeProviderProps {
  children: ReactNode;
}


export const ColorSchemeProvider = ({ children }: ColorSchemeProviderProps) => {
  const transition = useSharedValue(0);
  const circle = useSharedValue({ x: 0, y: 0, r: 0 });

  const ref = useRef(null);
  const [{ colorScheme, overlay1, overlay2, active, statusBarStyle }, dispatch] = useReducer(
    colorSchemeReducer,
    defaultValue
  );
  const r = useDerivedValue(() => {
    return mix(transition.value, 0, circle.value.r);
  });
  return (
    <View style={{ flex: 1 }}>
      <StatusBar style={statusBarStyle} />
      <View style={{ flex: 1 }} collapsable={false} ref={ref}>
        <ColorSchemeContext.Provider
          value={{
            colorScheme,
            statusBarStyle,
            overlay1,
            overlay2,
            dispatch,
            ref,
            transition,
            circle,
            active,
          }}
        >
          {children}
        </ColorSchemeContext.Provider>
      </View>
      {overlay1 && (
        <Canvas
          style={StyleSheet.absoluteFill}
          pointerEvents={'none'}
        >
          <Image image={overlay1} x={0} y={0} width={width} height={height} />
          {overlay2 && (
            <Circle
              c={circle}
              r={r}
            >
              <ImageShader
                image={overlay2}
                x={0}
                y={0}
                width={width}
                height={height}
                fit={'cover'}
              />
            </Circle>
          )}
          {/* <Fill color={"cyan"} /> */}
        </Canvas>
      )}
    </View>
  );
};
