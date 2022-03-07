import { useCallback, useRef, useState } from "react";
import { Pressable, StyleProp, Animated, ViewStyle } from "react-native";
import type { SwitchProps } from "react-native";
import { PlatformColor } from "react-native-platform-color";

const trackWidthes = { default: 48, small: 38, large: 60 };
const trackHeightes = { default: 30, small: 24, large: 38 };

export function Switch(props: SwitchProps): JSX.Element {
  const {
    value = false,
    onChange,
    onValueChange,
    thumbColor = "#fff",
    trackColor = {},
    testID,
    style,
    disabled = false,
  } = props;
  const [internalOn, setInternalOn] = useState(value);

  const size = "default";

  const trackWidth = trackWidthes[size] || trackWidthes.default;
  const trackHeight = trackHeightes[size] || trackHeightes.default;
  const gap = 2;
  const thumbWidth = trackHeight - gap * 2;
  const thumbHeight = trackHeight - gap * 2;

  const trackFalseColor = trackColor.false ?? PlatformColor("systemGray5");
  const trackTrueColor = trackColor.true ?? PlatformColor("systemGreen");
  const trackColorValue = useRef(
    new Animated.Value(internalOn ? 1 : 0)
  ).current;
  const pressedValue = useRef(new Animated.Value(0)).current;
  const thumbMarginLeftValue = useRef(new Animated.Value(0)).current;

  const pressedThumbWidth = pressedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [thumbWidth, thumbWidth + 6],
  });

  const thumbMarginLeft = thumbMarginLeftValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -6],
  });

  const currentTrackColor = trackColorValue.interpolate({
    inputRange: [0, 1],
    outputRange: [String(trackFalseColor), String(trackTrueColor)],
  });

  const currentThumbLeft = trackColorValue.interpolate({
    inputRange: [0, 1],
    outputRange: [gap, trackWidth - thumbWidth - gap],
  });

  const onPress = useCallback(
    (e) => {
      if (disabled) return;
      const nextOn = !internalOn;
      setInternalOn(nextOn);

      // do animation
      Animated.timing(trackColorValue, {
        toValue: nextOn ? 1 : 0,
        useNativeDriver: true,
        duration: 150,
      }).start();

      if (onValueChange) {
        onValueChange(nextOn);
      }
      if (onChange) {
        e.value = nextOn;
        onChange(e);
      }
    },
    [internalOn, onChange, trackColorValue, onValueChange, disabled]
  );

  const onPressIn = useCallback(() => {
    if (disabled) return;
    Animated.timing(pressedValue, {
      duration: 150,
      toValue: 1,
      useNativeDriver: true,
    }).start();
    Animated.timing(thumbMarginLeftValue, {
      duration: 150,
      toValue: internalOn ? 1 : 0,
      useNativeDriver: true,
    }).start();
  }, [internalOn, thumbMarginLeftValue, pressedValue, disabled]);

  const onPressOut = useCallback(() => {
    if (disabled) return;
    Animated.timing(pressedValue, {
      duration: 150,
      toValue: 0,
      useNativeDriver: true,
    }).start();
    Animated.timing(thumbMarginLeftValue, {
      duration: 150,
      toValue: 0,
      useNativeDriver: true,
    }).start();
  }, [pressedValue, thumbMarginLeftValue, disabled]);

  const trackStyles: StyleProp<ViewStyle> = {
    position: "relative",
    width: trackWidth,
    height: trackHeight,
    borderRadius: trackHeight,
    opacity: disabled ? 0.8 : undefined,
  };

  const thumbStyles: StyleProp<ViewStyle> = {
    position: "absolute",
    top: gap,
    width: thumbWidth,
    height: thumbHeight,
    borderRadius: trackHeight,
    backgroundColor: thumbColor,
  };

  return (
    <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View
        style={[
          trackStyles,
          {
            backgroundColor: currentTrackColor,
          },
          style,
        ]}
        testID={testID}
      >
        <Animated.View
          style={[
            thumbStyles,
            {
              marginLeft: thumbMarginLeft,
              width: pressedThumbWidth,
              left: currentThumbLeft,
            },
          ]}
        ></Animated.View>
      </Animated.View>
    </Pressable>
  );
}
