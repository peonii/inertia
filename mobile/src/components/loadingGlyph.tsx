import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import { Animated, DimensionValue, Easing } from "react-native";

type LoadingGlyphProps = {
  height?: DimensionValue;
  width?: DimensionValue;
};

const LoadingGlyph: React.FC<LoadingGlyphProps> = ({
  height = "100%",
  width = "100%",
}) => {
  // It is actually half of gradient's size
  const gradientSize = 0.4;
  const gradientPosition = useRef(new Animated.Value(-gradientSize)).current;
  const [gradientPositionValue, setGradientPositionValue] = useState(0);
  gradientPosition.addListener(({ value }) => {
    setGradientPositionValue(value);
  });

  useEffect(() => {
    Animated.loop(
      Animated.timing(gradientPosition, {
        toValue: 1 + gradientSize,
        useNativeDriver: false,
        duration: 1000,
        // easing: Easing.inOut(Easing.linear),
        delay: 200,
      })
    ).start();
  }, []);

  return (
    <LinearGradient
      style={{
        height: height,
        width: width,
      }}
      colors={["#4a4a4a", "#5b5b5b", "#4a4a4a"]}
      start={{ x: gradientPositionValue - gradientSize, y: 0 }}
      end={{ x: gradientPositionValue + gradientSize, y: 0 }}
    ></LinearGradient>
  );
};

export default LoadingGlyph;
