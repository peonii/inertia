import styled from "@emotion/native";
import { ToastAndroid } from "react-native";

const fakeData = {
  username: "nattie",
  profilePicture: require("./../../assets/nattie-pfp.png"),
  games: [
    { name: "Jet Lag: Season 6", status: "Playing", timeLeft: 372 },
    { name: "Jet Lag: Season 7", status: "Starts in 40 days" },
  ],
};

const CenteredView = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  background-color: #252525;
  height: 100%;
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

const BigTitle = styled.Text`
  font-size: 40px;
  color: #ffffff;
  font-family: Inter_700Bold;
  letter-spacing: -1.9px;
  padding: 20px;
`;

const SmallTitle = styled.Text`
  font-size: 24px;
  color: #ffffff;
  font-family: Inter_700Bold;
  letter-spacing: -1.6px;
`;

const GamesSection = styled.View`
  width: 100%;
  align-items: left;
  overflow: show;
  position: absolute;
  top: 138px;
`;

const GamesListContainer = styled.ScrollView`
  flex-direction: row;
  overflow: show;
  padding: -20px;
  gap: 20px;
  margin: 0px 10px;
`;

const GameContainer = styled.View`
  align-items: start;
  padding-left: 20px;
  justify-content: center;
  background-color: #1e1e1e;
  width: 221px;
  height: 86px;
  border-radius: 10px;
  margin: 0px 10px;
`;

const GameStatus = styled.Text`
  font-size: 16px;
  font-family: Inter_600SemiBold;
  letter-spacing: -1px;
`;

const Home: React.FC = () => {
  //Turning games's data into a list of views
  const gamesList = fakeData.games.map((game) => {
    const statusText =
      game.status === "Playing"
        ? `Playing  •  ${game.timeLeft / 60}${game.timeLeft % 60}`
        : game.status;

    const color = game.status === "Playing" ? "#439255" : "#7c7c7c";

    return (
      <GameContainer key={game.name}>
        <SmallTitle>{game.name}</SmallTitle>
        <GameStatus style={{ color: color }}>{statusText}</GameStatus>
      </GameContainer>
    );
  });

  return (
    <CenteredView>
      <TopBar>
        <InertiaLogo source={require("./../../assets/inertia-icon.png")} />
        <UserInfoContainer>
          <UserInfoButton
            onPress={() => {
              ToastAndroid.show("It will popup here i promise", 1500);
            }}
          >
            <Username>{fakeData.username}</Username>
            <UserProfilePicutre source={fakeData.profilePicture} />
          </UserInfoButton>
        </UserInfoContainer>
      </TopBar>
      <GamesSection>
        <BigTitle>Your games</BigTitle>
        <GamesListContainer horizontal>{gamesList}</GamesListContainer>
      </GamesSection>
    </CenteredView>
  );
};

export default Home;
