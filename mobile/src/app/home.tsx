import styled from "@emotion/native";
import { LinearGradient } from "expo-linear-gradient";
import BottomSheet from "@gorhom/bottom-sheet";
import { forwardRef, useRef, useState } from "react";
import HomeDetails from "../components/homeDetails";
import { router } from "expo-router";
import { Game, Team, User } from "../types";
import { ActivityIndicator, RefreshControl, useWindowDimensions } from "react-native";
import LoadingGlyph from "../components/loadingGlyph";
import GameStatus from "../components/gameStatus";
import GameCreationView from "../components/gameCreationView";
import GameDetails from "../components/gameDetails";
import { makeGradientColorsFromColor } from "../utilis";

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

const PlusIconHolder = styled.View`
  width: 50px;
  height: 50px;
  border-radius: 25px;
  background-color: #4a4a4a;
  justify-content: center;
`;

const PlusIcon = styled.Text`
  color: #ffffff;
  font-size: 30px;
  font-family: Inter_400Regular;
  include-font-padding: false;
  vertical-align: middle;
  text-align: center;
  padding-bottom: 4px;
`;

type HomeProps = {
  userData: User | "loading";
  gamesData: Game[] | "loading";
  teamsData: Team[] | "loading";
  refetch: {
    games: () => void;
    teams: () => void;
  };
};

const Home: React.FC<HomeProps> = ({ userData, gamesData, teamsData, refetch }) => {
  console.log("in home", userData, gamesData, teamsData, refetch);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [isCreatingGame, setIsCreatingGame] = useState(false);
  const [visibleGameDetailsId, setVisibleDetailsId] = useState("");

  // const userData = "loading";
  // const gamesData = "loading";
  // const teamsData = "loading";

  if (!userData) userData = "loading";
  if (!gamesData) gamesData = "loading";
  if (!teamsData) teamsData = "loading";

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
            <PressableContainer
              key={game.id}
              onPress={() => {
                setVisibleDetailsId(game.id);
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
          );
        });

  // Push an additional item for adding games
  if (gamesData !== "loading") {
    gamesList.push(
      <PressableContainer
        key="1"
        onPress={() => {
          setIsCreatingGame(true);
        }}
      >
        <GameContainer
          style={{
            alignItems: "center",
            justifyContent: "center",
            paddingLeft: 0,
          }}
        >
          <PlusIconHolder>
            <PlusIcon>+</PlusIcon>
          </PlusIconHolder>
        </GameContainer>
      </PressableContainer>
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
              onPress={() => router.push(`/team/${team.id}`)}
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

  // If no teams
  if (teamsData.length == 0) {
    teamList.push(
      <TeamContainer key="0" style={{ alignItems: "center", justifyContent: "center" }}>
        <MediumTitle>no teams</MediumTitle>
      </TeamContainer>
    );
  }

  return (
    <CenteredView
      style={{
        minHeight: Math.round(useWindowDimensions().height),
      }}
    >
      {visibleGameDetailsId ? (
        <GameDetails
          id={visibleGameDetailsId}
          closeView={() => {
            setVisibleDetailsId("");
          }}
        ></GameDetails>
      ) : isCreatingGame ? (
        <GameCreationView
          closeView={() => {
            setIsCreatingGame(false);
            refetch.games();
          }}
          userId={userData != "loading" ? userData.id : ""}
        ></GameCreationView>
      ) : (
        <RefreshContainer
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={() => {
                refetch.games();
                refetch.teams();
              }}
            />
          }
        >
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
              // snapToAlignment="start"
              contentContainerStyle={{
                paddingRight: 10,
                paddingLeft: 10,
              }}
              showsHorizontalScrollIndicator={false}
              style={gamesList.length === 1 ? { width: 260 } : {}}
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
              style={teamList.length === 1 ? { width: 240 } : {}}
            >
              {teamList}
            </ListContainer>
          </Section>
        </RefreshContainer>
      )}

      <HomeDetails userData={userData} reference={bottomSheetRef} />
    </CenteredView>
  );
};

export default Home;
