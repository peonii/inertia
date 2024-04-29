import styled from "@emotion/native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Game, Team, User } from "../types";
import {
  ActivityIndicator,
  RefreshControl,
  useWindowDimensions,
  View,
} from "react-native";
import LoadingGlyph from "../components/loadingGlyph";
import GameStatus from "../components/gameStatus";
import { makeGradientColorsFromColor } from "../utilis";
import { useQuery } from "@tanstack/react-query";
import { ENDPOINTS } from "../api/constants";
import { fetchTypeSafe } from "../api/fetch";
import { useAuth } from "../context/AuthContext";
import { useDataContext } from "../context/DataContext";
import ContextMenu from "react-native-context-menu-view";
import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import HomeDetails from "../components/homeDetails";

const RefreshContainer = styled.ScrollView`
  flex: 1;
  width: 100%;
`;

const CenteredView = styled.View`
  flex: 1;
  align-items: center;
  justify-content: flex-start;
  background-color: #252525;
  height: 100%;
`;

const PressableContainer = styled.Pressable`
  align-items: center;
  justify-content: center;
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

const Home: React.FC = () => {
  const authContext = useAuth();
  const dataContext = useDataContext();

  const userDataRequest = useQuery<User>({
    queryKey: ["userData"],
    queryFn: () => fetchTypeSafe<User>(ENDPOINTS.users.me, authContext),
    staleTime: 1000 * 60 * 3,
  });

  const gamesDataRequest = useQuery<Game[]>({
    queryKey: ["gamesData"],
    queryFn: () => fetchTypeSafe<Game[]>(ENDPOINTS.games.me, authContext),
    staleTime: 1000 * 60,
  });

  const teamsDataRequest = useQuery<Team[]>({
    queryKey: ["teamsData"],
    queryFn: () => fetchTypeSafe<Team[]>(ENDPOINTS.teams.me, authContext),
    staleTime: 1000 * 60,
  });

  if (
    userDataRequest.error ||
    gamesDataRequest.error ||
    teamsDataRequest.error
  ) {
    userDataRequest.error && console.log(userDataRequest.error.message);
    gamesDataRequest.error && console.log(gamesDataRequest.error.message);
    teamsDataRequest.error && console.log(teamsDataRequest.error.message);

    router.push("/error/" + "Couldn't connect to the server");
    // TODO add some offline mode when already have old data
  }

  useEffect(() => {
    if (userDataRequest.data) dataContext.setUserData(userDataRequest.data);
    if (gamesDataRequest.data) dataContext.setGamesData(gamesDataRequest.data);
    if (teamsDataRequest.data) dataContext.setTeamsData(teamsDataRequest.data);
  }, [
    userDataRequest.data,
    gamesDataRequest.data,
    teamsDataRequest.data,
    userDataRequest.error,
    gamesDataRequest.error,
    teamsDataRequest.error,
  ]);

  useEffect(() => {
    if (userDataRequest.data) {
      const user = userDataRequest.data;
      (async () => {
        const token = await Notifications.getDevicePushTokenAsync();
        console.log("Token", token.type, token.data);

        if (token.data != "") {
          fetchTypeSafe<null>(ENDPOINTS.devices.register, authContext, {
            method: "POST",
            body: JSON.stringify({
              token: token.data,
              service_type: token.type === "android" ? "fcm" : "apns",
              user_id: user.id,
            }),
          });
        }
      })();
    }
  }, [userDataRequest.data]);

  const gamesData = dataContext.gamesData;
  const teamsData = dataContext.teamsData;

  //Turning games's data into a list of views
  const gamesList =
    gamesData === "loading"
      ? // Is loading
        [
          <GameContainer key="0" style={{ paddingLeft: 0 }}>
            <LoadingGlyph></LoadingGlyph>
          </GameContainer>,
        ]
      : // Loaded
        gamesData.map((game) => {
          return (
            <View style={{ paddingHorizontal: 10 }} key={game.id}>
              <ContextMenu
                // actions={[
                //   {
                //     title: "Delete",
                //     destructive: true,
                //     icon: "Trash-2",
                //   },
                // ]}
                // onPress={() => {
                //   fetchTypeSafe<null>(ENDPOINTS.games.all + "/" + game.id, authContext, {
                //     method: "Delete",
                //   });
                // }}
                title={"Dropdown Menu"}
                actions={[
                  {
                    title: "Test Item",
                  },
                ]}
              >
                <PressableContainer
                  onPress={() => {
                    router.replace(`/game/${game.id}`);
                  }}
                >
                  <GameContainer>
                    <MediumTitle numberOfLines={1}>{game.name}</MediumTitle>
                    <GameStatus
                      timeLine={{
                        start: game.time_start,
                        end: game.time_end,
                      }}
                    ></GameStatus>
                  </GameContainer>
                </PressableContainer>
              </ContextMenu>
            </View>
          );
        });

  // Push an additional item for adding games
  if (gamesData !== "loading") {
    gamesList.push(
      <PressableContainer
        key="1"
        onPress={() => {
          router.replace("/gameCreation");
        }}
      >
        <GameContainer
          style={{
            alignItems: "center",
            justifyContent: "center",
            paddingLeft: 0,
          }}
        >
          <SmallTitle
            style={{ fontFamily: "Inter_500Medium", color: "#a3a3a3" }}
          >
            {"+ New game"}
          </SmallTitle>
        </GameContainer>
      </PressableContainer>,
    );
  }

  //Turning teams's data into a list of views
  const teamList =
    teamsData === "loading"
      ? // Is loading
        [
          <PressableContainer key={0} onPress={() => {}}>
            <TeamContainer>
              <LoadingGlyph></LoadingGlyph>
            </TeamContainer>
          </PressableContainer>,
        ]
      : // Loaded
        teamsData.map((team) => {
          return (
            <PressableContainer
              key={team.id}
              onPress={() => router.replace(`/team/${team.id}`)}
            >
              <TeamContainer>
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
            </PressableContainer>
          );
        });

  return (
    <CenteredView
      style={{
        minHeight: Math.round(useWindowDimensions().height),
      }}
    >
      <RefreshContainer
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => {
              gamesDataRequest.refetch();
              teamsDataRequest.refetch();
            }}
          />
        }
      >
        <Section>
          <TitleWithIndicatiorView>
            <BigTitle>Your games</BigTitle>
            {gamesData === "loading" ? (
              <ActivityIndicator
                color="#ffffff"
                size="small"
              ></ActivityIndicator>
            ) : null}
          </TitleWithIndicatiorView>
          <ListContainer
            horizontal
            snapToInterval={240}
            // snapToAlignment="start"
            contentContainerStyle={{
              paddingRight: 10,
              paddingLeft: 10,
            }}
            showsHorizontalScrollIndicator={false}
            style={gamesList.length === 1 ? { width: 260 } : null}
          >
            {gamesList}
          </ListContainer>
        </Section>
        <Section>
          <TitleWithIndicatiorView>
            <BigTitle>Your teams</BigTitle>
            {teamsData === "loading" ? (
              <ActivityIndicator
                color="#ffffff"
                size="small"
              ></ActivityIndicator>
            ) : null}
          </TitleWithIndicatiorView>
          {teamList.length > 0 ? (
            <ListContainer
              horizontal
              snapToInterval={220}
              snapToAlignment="start"
              contentContainerStyle={{
                paddingRight: 10,
                paddingLeft: 10,
              }}
              showsHorizontalScrollIndicator={false}
              style={teamList.length === 1 ? { width: 240 } : null}
            >
              {teamList}
            </ListContainer>
          ) : (
            <CenteredView style={{ height: 80, justifyContent: "center" }}>
              <SmallTitle style={{ width: 200, textAlign: "center" }}>
                {"You don't have any teams"}
              </SmallTitle>
            </CenteredView>
          )}
        </Section>
      </RefreshContainer>
    </CenteredView>
  );
};

export default Home;
