import { Powerup } from "../../types";
import { CircularProgressBase } from "react-native-circular-progress-indicator";
import { useEffect, useMemo, useState } from "react";
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

const PowerupIndicator: React.FC<PowerupIndicatorProps> = ({
  powerup,
  destroySelf,
}) => {
  const [meta, setMeta] = useState({
    color: "#000",
    secondaryColor: "#000",
    image: null,
  });

  const [timeLeft, setTimeLeft] = useState(
    (new Date(powerup.ends_at).getTime() - new Date().getTime()) / 1000,
  );
  const duration = useMemo(
    () =>
      (new Date(powerup.ends_at).getTime() -
        new Date(powerup.created_at).getTime()) /
      1000,
    [],
  );

  useEffect(() => {
    switch (powerup.type) {
      case "blacklist":
        setMeta({
          color: "#000",
          secondaryColor: "#333",
          image: require("../../../assets/powerups/powerup_hide.png"),
        });
        break;
      case "freeze_hunters":
        setMeta({
          color: "#2cf",
          secondaryColor: "#07a",
          image: require("../../../assets/powerups/powerup_freeze.png"),
        });
        break;
      case "freeze_runners":
        setMeta({
          color: "#2cf",
          secondaryColor: "#07a",
          image: require("../../../assets/powerups/powerup_freeze.png"),
        });
        break;
      case "hide_tracker":
        setMeta({
          color: "#555",
          secondaryColor: "#333",
          image: require("../../../assets/powerups/powerup_hide.png"),
        });
        break;
      case "hunt":
        setMeta({
          color: "#c55",
          secondaryColor: "#522",
          image: require("../../../assets/powerups/powerup_hunt.png"),
        });
        break;
      case "reveal_hunters":
        setMeta({
          color: "#7BBD39",
          secondaryColor: "#3B7D09",
          image: require("../../../assets/powerups/powerup_reveal.png"),
        });
        break;
      default:
        break;
    }

    console.log("Initializing timer!");
    const timer = setInterval(() => {
      if (timeLeft < 0) {
        clearInterval(timer);
        destroySelf();
        return;
      }
      setTimeLeft(
        (new Date(powerup.ends_at).getTime() - new Date().getTime()) / 1000,
      );

      return () => clearInterval(timer);
    }, 1000);
  }, []);
  return (
    <CircularProgressBase
      value={timeLeft}
      maxValue={duration}
      radius={20}
      activeStrokeWidth={6}
      activeStrokeColor={meta.color}
      inActiveStrokeWidth={6}
      inActiveStrokeColor={meta.secondaryColor}
    >
      <PowerupImage source={meta.image} />
    </CircularProgressBase>
  );
};

export default PowerupIndicator;
