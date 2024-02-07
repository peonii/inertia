import styled from "@emotion/native";
import { useEffect, useRef, useState } from "react";
import { Animated, View, Easing } from "react-native";

const Container = styled.View`
  width: 100%;
  padding-left: 7px;
`;

const BigTitle = styled.Text`
  font-size: 40px;
  color: #ffffff;
  font-family: Inter_700Bold;
  letter-spacing: -1.9px;
  padding: 20px;
`;

const MediumTitle = styled.Text`
  font-size: 24px;
  color: #ffffff;
  font-family: Inter_600SemiBold;
  letter-spacing: -1.6px;
`;

const ProgressTrackerContainer = styled.View`
  flex-direction: row;
  gap: 10px;
  padding-left: 22px;
`;

const NextButtonContainer = styled.Pressable`
  align-items: center;
  justify-content: center;
`;

const NextButtonView = styled.View`
  align-items: center;
  justify-content: center;
  background-color: #3d3d3d;
  border-radius: 10px;
  width: 124px;
  height: 61px;
`;

type StatusDotProps = {
  status: "active" | "done" | "undone";
};

const StatusDot: React.FC<StatusDotProps> = ({ status }) => {
  const width = useRef(new Animated.Value(status == "active" ? 1 : 0)).current;

  function expand() {
    Animated.timing(width, {
      toValue: 1,
      useNativeDriver: false,
      duration: 500,
      easing: Easing.elastic(1),
    }).start();
  }

  function collapse() {
    Animated.timing(width, {
      toValue: 0,
      useNativeDriver: false,
      duration: 500,
      easing: Easing.elastic(1),
    }).start();
  }

  useEffect(() => {
    if (status === "active") {
      expand();
    } else {
      collapse();
    }
  }, [status]);

  return (
    <Animated.View
      style={{
        backgroundColor: status == "undone" ? "#3d3d3d" : "#439255",
        width: width.interpolate({ inputRange: [0, 1], outputRange: [12, 88] }),
        height: 12,
        borderRadius: 10,
      }}
    ></Animated.View>
  );
};

type ProgressTrackerProps = {
  statusArray: ("active" | "done" | "undone")[];
};

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ statusArray }) => {
  const statusList = statusArray.map((status, index) => {
    return <StatusDot key={index} status={status}></StatusDot>;
  });

  return <ProgressTrackerContainer>{statusList}</ProgressTrackerContainer>;
};

const GameCreationView: React.FC = () => {
  const [statusArray, setStatusArray] = useState(["active", "undone", "undone"] as (
    | "active"
    | "done"
    | "undone"
  )[]);
  function goNext() {
    if (statusArray[statusArray.length - 1] === "active") {
      setStatusArray(["active", "undone", "undone"]);
      return;
    }
    setStatusArray((prev) => {
      const lastActiveIndex = prev.indexOf("active");
      const newArray = [...prev];
      newArray[lastActiveIndex] = "done";
      newArray[lastActiveIndex + 1] = "active";
      return newArray;
    });
  }
  return (
    <Container>
      <BigTitle>Host your game</BigTitle>
      <ProgressTracker statusArray={statusArray}></ProgressTracker>
      <NextButtonContainer onPress={goNext}>
        <NextButtonView>
          <MediumTitle>
            {statusArray[statusArray.length - 1] === "active" ? "Create" : "Next"}
          </MediumTitle>
        </NextButtonView>
      </NextButtonContainer>
    </Container>
  );
};

export default GameCreationView;
