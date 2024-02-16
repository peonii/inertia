import styled from "@emotion/native";
import { useEffect, useRef, useState } from "react";
import { Animated, Easing } from "react-native";
import { useForm, Controller } from "react-hook-form";

type formStatus = "active" | "done" | "undone";

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
  status: formStatus;
};

const StatusDot: React.FC<StatusDotProps> = ({ status }) => {
  const width = useRef(new Animated.Value(status == "active" ? 1 : 0)).current;

  function changeWidth(value: number) {
    Animated.timing(width, {
      toValue: value,
      useNativeDriver: false,
      duration: 350,
      easing: Easing.out(Easing.cubic),
    }).start();
  }

  function expand() {
    changeWidth(1);
  }

  function collapse() {
    changeWidth(0);
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
  statusArray: formStatus[];
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
        {done > statusList.length
          ? "All done!"
          : `${done}/${statusArray.length}`}
      </StatusProgressText>
    </ProgressTrackerContainer>
  );
};

type GameCreationViewProps = {
  closeView: () => void;
};

const GameCreationView: React.FC<GameCreationViewProps> = ({ closeView }) => {
  const currentScreen = useRef(new Animated.Value(0)).current;
  function scrollTo(index: number) {
    Animated.timing(currentScreen, {
      toValue: index,
      useNativeDriver: false,
      duration: 600,
      easing: Easing.out(Easing.cubic),
    }).start();
  }

  const [statusArray, setStatusArray] = useState([
    "active",
    "undone",
    "undone",
  ] as formStatus[]);

  useEffect(() => {
    if (statusArray.indexOf("active") >= 0) {
      scrollTo(statusArray.indexOf("active"));
    } else {
      scrollTo(3);
    }
  }, [statusArray]);

  function goPrevious() {
    const lastActiveIndex = statusArray.indexOf("active");
    if (lastActiveIndex < 0) {
      setStatusArray(["done", "done", "active"]);
      return;
    }
    if (lastActiveIndex == 0) {
      closeView();
    }
  }

  function goNext() {
    if (statusArray[statusArray.length - 1] == "done") {
      // TODO send post request to database
      closeView();
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
        {/* Page 1 */}
        <FieldPage>
          <BigTitle>1</BigTitle>
        </FieldPage>

        {/* Page 2 */}
        <FieldPage>
          <BigTitle>2</BigTitle>
        </FieldPage>

        {/* Page 3 */}
        <FieldPage>
          <BigTitle>3</BigTitle>
        </FieldPage>

        {/* Page 4 */}
        <FieldPage>
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
