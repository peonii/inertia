import { View, Text } from "react-native";
import { Powerup } from "../../types";
import { CircularProgressBase } from "react-native-circular-progress-indicator";
import { useState } from "react";
import styled from "@emotion/native";

type PowerupIndicatorProps = {
  powerup: Powerup;
  destroySelf: () => void;
};

const PowerupImage = styled.Image`
  width: 30px;
  height: 30px;
  border-radius: 45px;
`;

const PowerupIndicator: React.FC<PowerupIndicatorProps> = ({ powerup, destroySelf }) => {
  let color;
  let secondaryColor;
  let image;
  switch (powerup.type) {
    case "blacklist":
      color = "#000";
      secondaryColor = "#333";
      break;
    case "freeze_hunters":
      color = "#2cf";
      secondaryColor = "#07a";
      break;
    case "freeze_runners":
      color = "#2cf";
      secondaryColor = "#07a";
      break;
    case "hide_tracker":
      color = "#555";
      secondaryColor = "#333";
      break;
    case "hunt":
      color = "#c55";
      secondaryColor = "#522";
      break;
    case "reveal_hunters":
      color = "#999";
      secondaryColor = "#666";
      break;
    default:
      color = "#000";
      secondaryColor = "#000";
      break;
  }

  const duration =
    (new Date(powerup.ends_at).getTime() - new Date(powerup.created_at).getTime()) / 1000;
  const [timeLeft, setTimeLeft] = useState(
    (new Date(powerup.ends_at).getTime() - new Date().getTime()) / 1000
  );
  const timer = setInterval(() => {
    if (timeLeft <= 0) {
      clearInterval(timer);
      destroySelf();
      return;
    }
    setTimeLeft((new Date(powerup.ends_at).getTime() - new Date().getTime()) / 1000);
  }, 1000);
  return (
    <CircularProgressBase
      value={timeLeft}
      maxValue={duration}
      radius={20}
      activeStrokeWidth={6}
      activeStrokeColor={color}
      inActiveStrokeWidth={6}
      inActiveStrokeColor={secondaryColor}
    >
      <PowerupImage source={require("../../../assets/powerups/powerup_freeze.png")} />
    </CircularProgressBase>
  );
};

export default PowerupIndicator;
