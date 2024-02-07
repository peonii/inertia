import styled from "@emotion/native";
import { useEffect, useRef, useState } from "react";
import { Animated, Easing } from "react-native";

const Container = styled.View`
  width: 100%;
  height: 100%;
`;

const BigTitle = styled.Text`
  font-size: 40px;
  color: #ffffff;
  font-family: Inter_700Bold;
  letter-spacing: -1.9px;
  padding: 20px;
  padding-left: 27px;
`;

const MediumTitle = styled.Text`
  font-size: 24px;
  padding-left: 7px;
  color: #ffffff;
  font-family: Inter_600SemiBold;
  letter-spacing: -1.6px;
`;

const ProgressTrackerContainer = styled.View`
  flex-direction: column;
  gap: 10px;
  padding-left: 29px;
`;

const StatusDotsContainer = styled.View`
  flex-direction: row;
  gap: 10px;
`;

const StatusProgressText = styled.Text`
  font-size: 24px;
  color: #439255;
  font-family: Inter_500Medium;
  letter-spacing: -1.6px;
`;

const NextButtonContainer = styled.Pressable`
  align-items: center;
  justify-content: center;
  position: absolute;
  bottom: 28%;
  align-self: center;
`;

const NextButtonView = styled.View`
  align-items: center;
  justify-content: center;
  background-color: #3d3d3d;
  border-radius: 10px;
  width: 124px;
  height: 61px;
`;

const FieldPage = styled.View`
  width: 25%;
  height: 100%;
  align-items: center;
  justify-content: center;
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
  const done = statusArray.filter((status) => status == "done").length + 1;

  return (
    <ProgressTrackerContainer>
      <StatusDotsContainer>{statusList}</StatusDotsContainer>
      <StatusProgressText>
        {done > statusList.length ? "All done!" : `${done}/${statusArray.length}`}
      </StatusProgressText>
    </ProgressTrackerContainer>
  );
};

const GameCreationView: React.FC = () => {
  const currentScreen = useRef(new Animated.Value(0)).current;
  function scrollTo(index: number) {
    console.log(index);
    Animated.timing(currentScreen, {
      toValue: index,
      useNativeDriver: false,
      duration: 500,
      easing: Easing.elastic(1),
    }).start();
  }

  const [statusArray, setStatusArray] = useState(["active", "undone", "undone"] as (
    | "active"
    | "done"
    | "undone"
  )[]);

  useEffect(() => {
    console.log(statusArray);
    if (statusArray.indexOf("active") >= 0) {
      scrollTo(statusArray.indexOf("active"));
    } else {
      scrollTo(3);
    }
  }, [statusArray]);

  function goNext() {
    if (statusArray[statusArray.length - 1] == "done") {
      setStatusArray(["active", "undone", "undone"]);
      return;
    }

    if (statusArray[statusArray.length - 1] === "active") {
      setStatusArray(["done", "done", "done"]);
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

      {
        // align-items: left;
        // justify-content: flex-start;
        // flex-direction: row;
        // height: 320px;
        // width: 400%;
        // background-color: #fee;
        // position: absolute;
        // top: 23%;
        // left: -300%;
      }

      <Animated.View
        style={{
          flexDirection: "row",
          height: 320,
          width: "400%",
          position: "absolute",
          top: "23%",
          left: currentScreen.interpolate({
            inputRange: [0, 3],
            outputRange: ["-0%", "-300%"],
          }),
        }}
      >
        <FieldPage style={{ backgroundColor: "#f00" }}>
          <BigTitle>1</BigTitle>
        </FieldPage>
        <FieldPage style={{ backgroundColor: "#0f0" }}>
          <BigTitle>2</BigTitle>
        </FieldPage>
        <FieldPage style={{ backgroundColor: "#00f" }}>
          <BigTitle>3</BigTitle>
        </FieldPage>
        <FieldPage style={{ backgroundColor: "#000" }}>
          <BigTitle>4</BigTitle>
        </FieldPage>
      </Animated.View>

      <NextButtonContainer onPress={goNext}>
        <NextButtonView>
          <MediumTitle>
            {statusArray[statusArray.length - 1] === "done" ? "Create" : "Next"}
          </MediumTitle>
        </NextButtonView>
      </NextButtonContainer>
    </Container>
  );
};

export default GameCreationView;
