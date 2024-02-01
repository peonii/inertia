import styled from "@emotion/native";
import { ToastAndroid } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const fakeData = {
  username: "nattie",
  profilePicture: require("./../../assets/nattie-pfp.png"),
  games: [
    { id: "1912313", name: "Jet Lag: Season 6", status: "Playing", timeLeft: 372 },
    { id: "2941279", name: "Jet Lag: Season 7", status: "Starts in 40 days" },
  ],
  teams: [
    {
      id: "1",
      name: "Penguincat Inc.",
      experience: 300,
      role: "Hunter",
      money: 2550,
      color: "#4E77A3",
      icon: "🐳",
    },
    {
      id: "2",
      name: "Haste nad Taste",
      experience: 999,
      role: "Runner",
      money: 0,
      color: "#990000",
      icon: "🎸",
    },
  ],
};

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
  console.log(startColor, endColor);
  return [startColor, endColor];
}

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

const TeamContainer = styled.View`
  width: 200px;
  height: 300px;
  border-radius: 10px;
  background-color: #1e1e1e;
  margin: 0px 10px;
  margin: 0px 10px;
  overflow: hidden;
`;

const TeamInfo = styled.View``;

const Home: React.FC = () => {
  //Turning games's data into a list of views
  const gamesList = fakeData.games.map((game) => {
    const statusText =
      game.status === "Playing"
        ? `Playing  •  ${Math.floor(game.timeLeft / 60)}h${game.timeLeft % 60}min`
        : game.status;

    const color = game.status === "Playing" ? "#439255" : "#7c7c7c";

    return (
      <GameContainer key={game.id}>
        <MediumTitle>{game.name}</MediumTitle>
        <SmallTitle style={{ color: color }}>{statusText}</SmallTitle>
      </GameContainer>
    );
  });

  //Turning teams's data into a list of views
  const teamList = fakeData.teams.map((team) => {
    return (
      <TeamContainer key={team.id}>
        <LinearGradient
          colors={makeGradientColorsFromColor(team.color)}
          style={{ height: 175 }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <TeamInfo></TeamInfo>
      </TeamContainer>
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
      <Section>
        <BigTitle>Your games</BigTitle>
        <ListContainer horizontal showsHorizontalScrollIndicator={false}>
          {gamesList}
        </ListContainer>
      </Section>
      <Section>
        <BigTitle>Your teams</BigTitle>
        <ListContainer horizontal showsHorizontalScrollIndicator={false}>
          {teamList}
        </ListContainer>
      </Section>
    </CenteredView>
  );
};

export default Home;
