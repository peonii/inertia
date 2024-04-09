import styled from "@emotion/native";
import LoadingGlyph from "./loadingGlyph";
import { router } from "expo-router";
import { useDataContext } from "../context/DataContext";

const Container = styled.View`
  padding-top: 63px;
  width: 100%;
  align-items: center;
  flex-direction: row;
  background-color: #252525;
`;

const InertiaLogo = styled.Image`
  width: 55px;
  height: 55px;
  left: 27px;
`;

const UserInfoContainer = styled.View`
  align-items: center;
  height: 100%;
  justify-content: center;
  position: absolute;
  bottom: 0;
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

const PressableContainer = styled.Pressable`
  align-items: center;
  justify-content: center;
`;

type TopBarProps = {
  onclicks: {
    profilePicture: () => void;
  };
};

const TopBar: React.FC<TopBarProps> = ({ onclicks }) => {
  const dataContext = useDataContext();
  const userData = dataContext.userData;
  return (
    <Container>
      <PressableContainer
        onPress={() => {
          router.replace("/home");
        }}
      >
        <InertiaLogo source={require("./../../assets/inertia-icon.png")} />
      </PressableContainer>
      <UserInfoContainer>
        {userData == "loading" ? (
          <LoadingGlyph width={170} height={50}></LoadingGlyph>
        ) : (
          <UserInfoButton
            onPress={() => {
              onclicks.profilePicture();
            }}
          >
            <Username>{userData.name}</Username>
            <UserProfilePicutre
              source={{
                uri: `${userData.image}?size=64px`,
              }}
            />
          </UserInfoButton>
        )}
      </UserInfoContainer>
    </Container>
  );
};

export default TopBar;
