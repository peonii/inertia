import styled from "@emotion/native";
import { LinearGradient } from "expo-linear-gradient";
import BottomSheet from "@gorhom/bottom-sheet";
import { useCallback, useRef, useState } from "react";
import HomeDetails from "./homeDetails";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import { fetchTypeSafe } from "../api/fetch";
import { ENDPOINTS } from "../api/constants";
import { Game, Team, User } from "../types";
import { useAuth } from "../context/AuthContext";
import * as Haptics from "expo-haptics";
import { useQuery } from "@tanstack/react-query";
import { ActivityIndicator, View } from "react-native";

const fakeTeams: Team[] = [
  {
    id: "1",
    name: "Penguincat Inc",
    color: "#4B6FA1",
    emoji: "🐳",
    xp: 1800,
    balance: 900,
    created_at: "2020-01-01T00:00:00.",
    is_runner: true,
    veto_period_end: "2021-01-01T00:00:00",
    game_id: "1",
  },
  {
    id: "2",
    name: "Haste and Taste",
    color: "#99000",
    emoji: "🎸",
    xp: 3600,
    balance: 100,
    created_at: "2020-01-01T00:00:00.",
    is_runner: false,
    veto_period_end: "2021-01-01T00:00:00",
    game_id: "2",
  },
];

function dimmColor(color: number) {
  return color - 20 < 0 ? 0 : color - 20;
}
function brightenColor(color: number) {
  return color + 20 > 255 ? 255 : color + 20;
}

function makeGradientColorsFromColor(color: string) {
  const red = parseInt(color.substring(1, 3), 16);
  const green = parseInt(color.substring(3, 5), 16);
  const blue = parseInt(color.substring(5, 7), 16);
  const startColor = `rgb(${dimmColor(red)}, ${dimmColor(green)}, ${dimmColor(blue)})`;
  const endColor = `rgb(${brightenColor(red)}, ${brightenColor(green)}, ${brightenColor(blue)})`;
  return [startColor, endColor];
}

const CenteredView = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  background-color: #252525;
  height: 100%;
`;

const LoadingGlyph = styled.View`
  background-color: #474747;
  height: 100%;
  width: 100%;
`;

const TopBar = styled.View`
  position: absolute;
  width: 100%;
  top: 63px;
  align-items: center;
  flex-direction: row;
`;

const InertiaLogo = styled.Image`
  width: 55px;
  height: 55px;
  left: 27px;
`;

const UserInfoContainer = styled.View`
  align-items: center;
  justify-content: center;
  position: absolute;
  right: 27px;
  overflow: hidden;
  border-radius: 10px;
`;
const UserInfoButton = styled.Pressable`
  align-items: center;
  justify-content: center;
  flex-direction: row;
  gap: 10px;
`;

const Username = styled.Text`
  font-size: 24px;
  color: #ffffff;
  font-family: Inter_600SemiBold;
  letter-spacing: -1.6px;
`;

const UserProfilePicutre = styled.Image`
  width: 39px;
  height: 39px;
  border-radius: 26px;
`;

const TitleWithIndicatiorView = styled.View`
  align-items: center;
  justify-content: flex-start;
  flex-direction: row;
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
  font-family: Inter_700Bold;
  letter-spacing: -1.6px;
`;

const SmallTitle = styled.Text`
  font-size: 16px;
  font-family: Inter_600SemiBold;
  color: #7c7c7c;
  letter-spacing: -1px;
`;

const Section = styled.View`
  width: 100%;
  align-items: left;
  overflow: visible;
  margin-top: 30px;
`;

const ListContainer = styled.ScrollView`
  flex-direction: row;
  overflow: visible;
  padding: -20px;
  gap: 20px;
`;

const GameContainer = styled.View`
  align-items: start;
  padding-left: 20px;
  justify-content: center;
  background-color: #1e1e1e;
  width: 220px;
  height: 86px;
  border-radius: 10px;
  margin: 0px 10px;
  overflow: hidden;
`;

const TeamContainer = styled.View`
  width: 200px;
  height: 300px;
  border-radius: 10px;
  background-color: #1e1e1e;
  margin: 0px 10px;
  margin: 0px 10px;
  overflow: hidden;
`;

const TeamInfo = styled.View`
  padding: 12px 16px;
`;
const BalanceText = styled.Text`
  padding-top: 12px;
  font-size: 20px;
  color: #ffffff;
  font-family: Inter_600SemiBold;
  letter-spacing: -1.3px;
`;

const DarkFilterContainer = styled.TouchableOpacity`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
`;

const DarkFilter = styled.View`
  opacity: 0.4;
  background-color: #000000;
  width: 100%;
  height: 100%;
`;

const RetryButton = styled.Pressable`
  padding-top: 15px;
`;
const RetryButtonText = styled.Text`
  color: #ffffff;
  text-decoration: underline;
  font-family: Inter_400Regular;
  font-size: 14px;
`;

const Home: React.FC = () => {
  const authContext = useAuth();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);

  const handleSheetChanges = useCallback((index: number) => {
    index === -1 && setIsBottomSheetVisible(false);
  }, []);

  const userDataRequest = useQuery({
    queryKey: ["userData"],
    queryFn: () => fetchTypeSafe<User>(ENDPOINTS.users.me, authContext),
  });

  const gamesDataRequest = useQuery({
    queryKey: ["gamesData"],
    queryFn: () => fetchTypeSafe<Game[]>(ENDPOINTS.games.me, authContext),
  });

  const teamsDataRequest = useQuery({
    queryKey: ["teamsData"],
    queryFn: () => fetchTypeSafe<Team[]>(ENDPOINTS.teams.me, authContext),
  });

  if (userDataRequest.error || gamesDataRequest.error || teamsDataRequest.error) {
    userDataRequest.error && console.log(userDataRequest.error.message);
    gamesDataRequest.error && console.log(gamesDataRequest.error.message);
    teamsDataRequest.error && console.log(teamsDataRequest.error.message);
    return (
      <CenteredView>
        <MediumTitle>Oops! Something went wrong</MediumTitle>
        <RetryButton
          onPress={() => {
            router.replace("/");
          }}
        >
          <RetryButtonText>Retry</RetryButtonText>
        </RetryButton>
      </CenteredView>
    );
  }

  const userData = userDataRequest.isPending ? "loading" : userDataRequest.data;
  const gamesData = gamesDataRequest.isPending ? "loading" : gamesDataRequest.data;
  const teamsData = teamsDataRequest.isPending ? "loading" : teamsDataRequest.data;

  // const userData = "loading";
  // const gamesData = "loading";
  // const teamsData = "loading";

  console.log(userData, gamesData, teamsData);

  //Turning games's data into a list of views
  const gamesList =
    gamesData === "loading"
      ? [
          <GameContainer key="0" style={{ paddingLeft: 0 }}>
            <LoadingGlyph></LoadingGlyph>
          </GameContainer>,
        ]
      : gamesData.map((game) => {
          const color = "#439255";
          const statusText = "essa";

          return (
            <GameContainer key={game.id}>
              <MediumTitle numberOfLines={1}>{game.name}</MediumTitle>
              <SmallTitle numberOfLines={1} style={{ color: color }}>
                {statusText}
              </SmallTitle>
            </GameContainer>
          );
        });

  console.log("here", gamesData);
  // If no games
  if (gamesData.length == 0) {
    console.log("also here");
    gamesList.push(
      <GameContainer key="0">
        <MediumTitle>No text</MediumTitle>
      </GameContainer>
    );
  }

  //Turning teams's data into a list of views
  const teamList =
    teamsData === "loading"
      ? // Is loading
        [
          <TeamContainer key={"0"}>
            <LoadingGlyph></LoadingGlyph>
          </TeamContainer>,
        ]
      : // Loaded
        teamsData.map((team) => {
          return (
            <TeamContainer key={team.id}>
              <LinearGradient
                colors={makeGradientColorsFromColor(team.color)}
                style={{
                  height: 175,
                  alignItems: "center",
                  justifyContent: "center",
                }}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <BigTitle style={{ fontSize: 64 }}>{team.emoji}</BigTitle>
              </LinearGradient>
              <TeamInfo>
                <MediumTitle numberOfLines={1}>{team.name}</MediumTitle>
                <SmallTitle
                  numberOfLines={1}
                >{`${team.xp} XP  •  ${team.is_runner ? "Runner" : "Hunter"}`}</SmallTitle>
                <BalanceText>{`${team.balance}$`}</BalanceText>
              </TeamInfo>
            </TeamContainer>
          );
        });

  if (teamsData.length == 0) {
    teamList.push(
      <TeamContainer key="0">
        <MediumTitle>no teams</MediumTitle>
      </TeamContainer>
    );
  }

  function logOut() {
    SecureStore.setItemAsync("refreshToken", "null");
    router.replace("/login");
  }

  return (
    <CenteredView>
      <TopBar>
        <InertiaLogo source={require("./../../assets/inertia-icon.png")} />
        <UserInfoContainer>
          {userData == "loading" ? (
            <LoadingGlyph style={{ height: 50, width: 150 }}></LoadingGlyph>
          ) : (
            <UserInfoButton
              onPress={() => {
                bottomSheetRef.current.expand();
                setIsBottomSheetVisible(true);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Username>{userData.display_name}</Username>
              <UserProfilePicutre
                source={{
                  uri: `https://cdn.discordapp.com/avatars/${userData.discord_id}/${userData.image}.png?size=39px`,
                }}
              />
            </UserInfoButton>
          )}
        </UserInfoContainer>
      </TopBar>
      <Section>
        <TitleWithIndicatiorView>
          <BigTitle>Your games</BigTitle>
          {gamesData === "loading" ? (
            <ActivityIndicator color="#ffffff" size="small"></ActivityIndicator>
          ) : null}
        </TitleWithIndicatiorView>
        <ListContainer
          horizontal
          snapToInterval={240}
          snapToAlignment="start"
          contentContainerStyle={{
            paddingRight: 10,
            paddingLeft: 10,
          }}
          showsHorizontalScrollIndicator={false}
        >
          {gamesList}
        </ListContainer>
      </Section>
      <Section>
        <TitleWithIndicatiorView>
          <BigTitle>Your teams</BigTitle>
          {teamsData === "loading" ? (
            <ActivityIndicator color="#ffffff" size="small"></ActivityIndicator>
          ) : null}
        </TitleWithIndicatiorView>
        <ListContainer
          horizontal
          snapToInterval={220}
          snapToAlignment="start"
          contentContainerStyle={{
            paddingRight: 10,
            paddingLeft: 10,
          }}
          showsHorizontalScrollIndicator={false}
        >
          {teamList}
        </ListContainer>
      </Section>
      <DarkFilterContainer
        onPressOut={() => {
          setIsBottomSheetVisible(false);
          bottomSheetRef.current.close();
        }}
        style={{ display: isBottomSheetVisible ? "flex" : "none" }}
        activeOpacity={1}
      >
        <DarkFilter></DarkFilter>
      </DarkFilterContainer>

      {/*/ Home Details List /*/}

      {userData == "loading" ? null : (
        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          snapPoints={["68%"]}
          onChange={handleSheetChanges}
          enablePanDownToClose={true}
          backgroundStyle={{ backgroundColor: "#252525" }}
        >
          <HomeDetails userData={userData} logOutFunction={logOut} />
        </BottomSheet>
      )}
    </CenteredView>
  );
};

export default Home;
