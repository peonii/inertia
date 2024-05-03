import styled from "@emotion/native";
import { useForm, Controller } from "react-hook-form";
import DateTimePicker from "@react-native-community/datetimepicker";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import MapView from "react-native-maps";
import { useAuth } from "../context/AuthContext";
import { fetchTypeSafe } from "../api/fetch";
import { ENDPOINTS } from "../api/constants";
import { formatDate, formatDateLong, formatDateShort } from "../utilis";
import LocationPickerSheet from "../components/locationPickerSheet";
import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Keyboard } from "react-native";
import { router } from "expo-router";
import { useDataContext } from "../context/DataContext";

type formStatus = "active" | "done" | "undone";

const Container = styled.View`
  width: 100%;
  height: 100%;
  background-color: #252525;
  padding-top: 30px;
  top: 0px;
`;

const BigTitle = styled.Text`
  font-size: 40px;
  color: #ffffff;
  font-family: Inter_700Bold;
  letter-spacing: -1.9px;
  padding: 20px;
  padding-top: 0px;
  padding-left: 27px;
`;

const MediumTitle = styled.Text`
  font-size: 24px;
  color: #ffffff;
  font-family: Inter_600SemiBold;
  letter-spacing: -1.6px;
`;

const MediumGrayTitle = styled.Text`
  font-size: 24px;
  color: #a5a5a5;
  font-family: Inter_500Medium;
  letter-spacing: -1.6px;
`;

const SmallGrayTitle = styled.Text`
  font-size: 20px;
  color: #7c7c7c;
  font-family: Inter_500Medium;
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

const PressableContainer = styled.Pressable`
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

const FieldPage = styled.View`
  width: 25%;
  height: 100%;
  align-items: flex-start;
  justify-content: flex-start;
  padding: 20px;
`;

const GameNameInput = styled.TextInput`
  margin-top: 15px;
  align-self: center;
  width: 326px;
  height: 53px;
  padding-horizontal: 15px;
  vertical-align: middle;
  include-font-padding: false;
  border-radius: 10px;
  font-size: 20px;
  font-family: Inter_500Medium;
  background-color: #323232;
  color: #ffffff;
  letter-spacing: -1.6px;
`;

const Divider = styled.View`
  width: 320px;
  margin-vertical: 15px;
  height: 1px;
  background-color: #3d3d3d;
  align-self: center;
`;

const CurrentDetails = styled.View`
  top: 100px;
  right: 30px;
  align-items: flex-end;
  position: absolute;
`;

const ErrorMessage = styled.Text`
  font-size: 18px;
  font-family: Inter_600SemiBold;
  color: #dd3333;
  letter-spacing: -1.2px;
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

type NameFormData = {
  name: string;
};

type DateFormData = {
  startDate: string;
  endDate: string;
};

type LocationFormData = {
  location: {
    lat: number;
    lng: number;
  };
};

const GameCreation: React.FC = () => {
  const authContext = useAuth();
  const [startDatePickerVisible, setStartDatePickerVisible] = useState(false);
  const [endDatePickerVisible, setEndDatePickerVisible] = useState(false);
  const [isPickingTime, setIsPickingTime] = useState(false);

  const dataContext = useDataContext();

  const userData = dataContext.userData;
  if (userData === "loading") {
    router.push(`/error/` + "User id not found");
    return;
  }
  const userId = userData.id;

  //3 forms, each for every screen
  const nameForm = useForm<NameFormData>({
    defaultValues: {
      name: "",
    },
  });

  const endDate = new Date();
  endDate.setHours(endDate.getHours() + 6);

  const dateForm = useForm<DateFormData>({
    defaultValues: {
      startDate: new Date().toISOString(),
      endDate: endDate.toISOString(),
    },
  });

  const tempDate = useRef(new Date());

  const locationForm = useForm<LocationFormData>({
    defaultValues: {
      location: {
        lat: 52.22884197323852,
        lng: 21.003216436837576,
      },
    },
  });

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

  const slideInValues = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  function scale(index: number) {
    return slideInValues[index].interpolate({
      inputRange: [0, 1],
      outputRange: [30, 0],
    });
  }

  function reverse(index: number) {
    return slideInValues[index].interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0],
    });
  }

  function reverseScale(index: number) {
    return slideInValues[index].interpolate({
      inputRange: [0, 1],
      outputRange: [-30, 0],
    });
  }

  function slide(index: number, direction: "in" | "out") {
    Animated.timing(slideInValues[index], {
      toValue: direction === "in" ? 1 : 0,
      useNativeDriver: false,
      duration: 600,
      easing: Easing.out(Easing.cubic),
    }).start();
  }

  async function goPrevious() {
    const lastActiveIndex = statusArray.indexOf("active");
    if (lastActiveIndex === 1) {
      dateForm.reset();
      slide(0, "out");
    }

    if (lastActiveIndex === 2) {
      locationForm.reset();
      updateAdressText();
      slide(1, "out");
    }

    if (lastActiveIndex < 0) {
      slide(0, "in");
      slide(1, "in");
      setStatusArray(["done", "done", "active"]);
      return;
    }
    if (lastActiveIndex == 0) {
      router.replace("/home");
    }

    setStatusArray((prev) => {
      const lastActiveIndex = prev.indexOf("active");
      const newArray = [...prev];
      newArray[lastActiveIndex] = "undone";
      newArray[lastActiveIndex - 1] = "active";
      return newArray;
    });
  }

  async function createGame(gameData) {
    await fetchTypeSafe(ENDPOINTS.games.create, authContext, {
      method: "POST",
      body: JSON.stringify(gameData),
    });
  }

  async function goNext() {
    if (statusArray[statusArray.length - 1] == "done") {
      // TODO send post request to database
      const data = {
        name: nameForm.getValues("name"),
        host_id: userId,
        time_start: dateForm.getValues("startDate"),
        time_end: dateForm.getValues("endDate"),
        loc_lat: locationForm.getValues("location").lat,
        loc_lng: locationForm.getValues("location").lng,
      };
      await createGame(data);
      router.replace("/home");
      return;
    }
    if (statusArray.indexOf("active") < 2)
      slide(statusArray.indexOf("active"), "in");
    else {
      slide(0, "out");
      slide(1, "out");
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

  const animTextStyle = {
    fontSize: 20,
    fontFamily: "Inter_500Medium",
    color: "#a5a5a5",
    letterSpacing: -1.3,
  };

  const locationPickerRef = useRef<BottomSheetModal>(null);

  const mapRef = useRef<MapView>(null);
  const [addressText, setAdressText] = useState("");

  async function updateAdressText() {
    const adress = await mapRef.current.addressForCoordinate({
      latitude: locationForm.getValues("location").lat,
      longitude: locationForm.getValues("location").lng,
    });
    console.log(adress);
    if (adress.thoroughfare)
      setAdressText(`${adress.thoroughfare}, ${adress.locality}`);
    else if (adress.subLocality)
      setAdressText(`${adress.subLocality}, ${adress.locality}`);
    else setAdressText(adress.locality);
  }
  useEffect(() => {
    (async () => {
      updateAdressText();
    })();
  }, []);

  return (
    <Container>
      <BigTitle>Host your game</BigTitle>
      <ProgressTracker statusArray={statusArray}></ProgressTracker>

      <CurrentDetails>
        <Animated.Text
          style={[
            [animTextStyle],
            { opacity: slideInValues[0], marginTop: scale(0) },
          ]}
        >
          {nameForm.getValues("name")}
        </Animated.Text>
        <Animated.Text
          style={[
            [animTextStyle],
            { opacity: slideInValues[1], marginTop: scale(1) },
          ]}
        >
          Starts @ {formatDateShort(dateForm.getValues("startDate"))}
        </Animated.Text>
      </CurrentDetails>
      <Animated.View
        style={{
          flexDirection: "row",
          height: 320,
          width: "400%",
          position: "absolute",
          top: 150,
          left: currentScreen.interpolate({
            inputRange: [0, 3],
            outputRange: ["-0%", "-300%"],
          }),
        }}
      >
        {/* Page 1 */}
        <FieldPage>
          <SmallGrayTitle>What's your game called?</SmallGrayTitle>
          <Controller
            control={nameForm.control}
            rules={{
              required: "Name is required",
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <GameNameInput
                placeholderTextColor={"#7c7c7c"}
                placeholder="Name"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                onSubmitEditing={nameForm.handleSubmit(goNext)}
              />
            )}
            name="name"
          ></Controller>
          <ErrorMessage>
            {nameForm.formState.errors.name &&
              nameForm.formState.errors.name.message}
          </ErrorMessage>
        </FieldPage>

        {/* Page 2 */}
        <FieldPage>
          <SmallGrayTitle>When is it starting?</SmallGrayTitle>
          <Controller
            control={dateForm.control}
            rules={{
              required: true,
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <PressableContainer
                style={{ alignItems: "flex-start" }}
                onBlur={onBlur}
                onPress={() => {
                  setIsPickingTime(false);
                  setStartDatePickerVisible(true);
                }}
              >
                <MediumGrayTitle>Start date</MediumGrayTitle>
                <MediumTitle>{formatDate(value)}</MediumTitle>
                <MediumGrayTitle style={{ color: "#7c7c7c" }}>
                  Edit
                </MediumGrayTitle>
                {startDatePickerVisible && (
                  <DateTimePicker
                    themeVariant="dark"
                    mode={isPickingTime ? "time" : "date"}
                    value={new Date(value)}
                    onChange={(event) => {
                      if (event.type == "dismissed") {
                        console.log("dismissed");
                        setStartDatePickerVisible(false);
                        return;
                      }
                      if (isPickingTime) {
                        const date = tempDate.current;
                        const newValues = new Date(event.nativeEvent.timestamp);
                        date.setHours(newValues.getHours());
                        date.setMinutes(newValues.getMinutes());
                        onChange(date);
                        // Check if there are no errors with end Date
                        if (date > new Date(dateForm.getValues("endDate"))) {
                          date.setHours(date.getHours() + 1);
                          dateForm.setValue("endDate", date.toISOString());
                        }
                        setStartDatePickerVisible(false);
                      } else {
                        tempDate.current = new Date(
                          event.nativeEvent.timestamp,
                        );
                        setIsPickingTime(true);
                      }
                    }}
                  ></DateTimePicker>
                )}
              </PressableContainer>
            )}
            name="startDate"
          ></Controller>
          <Divider></Divider>
          <Controller
            control={dateForm.control}
            rules={{
              required: true,
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <PressableContainer
                style={{ alignItems: "flex-start" }}
                onBlur={onBlur}
                onPress={() => {
                  setIsPickingTime(false);
                  setEndDatePickerVisible(true);
                }}
              >
                <MediumGrayTitle>End date</MediumGrayTitle>
                <MediumTitle>{formatDate(value)}</MediumTitle>
                <MediumGrayTitle style={{ color: "#7c7c7c" }}>
                  Edit
                </MediumGrayTitle>
                {endDatePickerVisible && (
                  <DateTimePicker
                    themeVariant="dark"
                    mode={isPickingTime ? "time" : "date"}
                    value={new Date(value)}
                    onChange={(event) => {
                      if (event.type === "dismissed") {
                        console.log("dismissed");
                        setEndDatePickerVisible(false);
                        return;
                      }
                      if (isPickingTime) {
                        const date = tempDate.current;
                        const newValues = new Date(event.nativeEvent.timestamp);
                        date.setHours(newValues.getHours());
                        date.setMinutes(newValues.getMinutes());
                        onChange(date.toISOString());
                        // Check if there are no errors with start Date
                        if (date < new Date(dateForm.getValues("startDate"))) {
                          date.setHours(date.getHours() - 1);
                          dateForm.setValue("startDate", date.toISOString());
                        }
                        setEndDatePickerVisible(false);
                      } else {
                        tempDate.current = new Date(
                          event.nativeEvent.timestamp,
                        );
                        setIsPickingTime(true);
                      }
                    }}
                  ></DateTimePicker>
                )}
              </PressableContainer>
            )}
            name="endDate"
          ></Controller>
        </FieldPage>

        {/* Page 3 */}
        <FieldPage>
          <SmallGrayTitle>Where is it starting?</SmallGrayTitle>
          <PressableContainer
            style={{ alignItems: "flex-start", width: "100%" }}
            onPress={() => {
              mapRef.current.animateToRegion(
                {
                  latitude: locationForm.getValues("location").lat,
                  longitude: locationForm.getValues("location").lng,
                  latitudeDelta: 0.1383,
                  longitudeDelta: 0.06315,
                },
                0,
              );
              locationPickerRef.current.expand();
            }}
          >
            <MediumGrayTitle>Location</MediumGrayTitle>
            <MediumTitle>{addressText}</MediumTitle>
            <MediumGrayTitle style={{ paddingTop: 10 }}>Edit</MediumGrayTitle>
          </PressableContainer>
        </FieldPage>

        {/* Page 4 */}
        <FieldPage>
          <SmallGrayTitle>Does this look right?</SmallGrayTitle>
          <Animated.View
            style={{
              opacity: reverse(0),
              top: reverseScale(0),
              paddingTop: 70,
            }}
          >
            <MediumTitle
              style={{ fontFamily: "Inter_700Bold", paddingBottom: 15 }}
            >
              {nameForm.getValues("name")}
            </MediumTitle>
            <SmallGrayTitle style={{ color: "#a5a5a5" }}>
              Starts @ {formatDateLong(dateForm.getValues("startDate"))}
            </SmallGrayTitle>
            <SmallGrayTitle style={{ color: "#a5a5a5", paddingBottom: 15 }}>
              Ends @ {formatDateLong(dateForm.getValues("endDate"))}
            </SmallGrayTitle>
            <SmallGrayTitle style={{ color: "#a5a5a5" }}>
              {addressText}
            </SmallGrayTitle>
          </Animated.View>
        </FieldPage>
      </Animated.View>

      <PressableContainer
        style={{
          position: "absolute",
          bottom: "12%",
          paddingLeft: 5,
          alignSelf: "center",
        }}
        onPress={(() => {
          if (statusArray.indexOf("active") === 0) {
            Keyboard.dismiss();
          }
          switch (statusArray.indexOf("active")) {
            case 0:
              return nameForm.handleSubmit(goNext);
            case 1:
              return dateForm.handleSubmit(goNext);
            case 2:
              return locationForm.handleSubmit(goNext);
            case -1:
              return goNext;
          }
        })()}
      >
        <NextButtonView>
          <MediumTitle>
            {statusArray[statusArray.length - 1] === "done" ? "Create" : "Next"}
          </MediumTitle>
        </NextButtonView>
      </PressableContainer>
      <PressableContainer
        style={{ position: "absolute", bottom: "12%" }}
        onPress={goPrevious}
      >
        {/* I know its a previous button stfu */}
        <NextButtonView style={{ backgroundColor: "transparent" }}>
          <SmallGrayTitle>
            {statusArray.indexOf("active") !== 0 ? "Previous" : "Cancel"}
          </SmallGrayTitle>
        </NextButtonView>
      </PressableContainer>
      <LocationPickerSheet
        sheetRef={locationPickerRef}
        onCancel={() => {}}
        onAccept={async () => {
          const camera = await mapRef.current.getCamera();
          console.log(camera);
          locationForm.setValue("location", {
            lat: camera.center.latitude,
            lng: camera.center.longitude,
          });
          await updateAdressText();
        }}
        initialRegion={locationForm.getValues("location")}
        mapRef={mapRef}
      ></LocationPickerSheet>
    </Container>
  );
};

export default GameCreation;
