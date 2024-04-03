import styled from "@emotion/native";
import * as SecureStore from "expo-secure-store";
import { User } from "../types";
import { router } from "expo-router";
import BottomSheet from "@gorhom/bottom-sheet";
import { Dimensions, View } from "react-native";
import { useState } from "react";
import { BottomSheetMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import LoadingGlyph from "./loadingGlyph";

const LeftAlignedView = styled.View`
  padding: 14px 38px;
  align-items: flex-start;
  flex-direction: column;
  height: 100%;
`;

const BigTitle = styled.Text`
  font-size: 40px;
  color: #ffffff;
  font-family: Inter_700Bold;
  letter-spacing: -1.9px;
`;

const MediumTitle = styled.Text`
  font-size: 32px;
  color: #ffffff;
  font-family: Inter_700Bold;
  letter-spacing: -1.6px;
`;

const ProfileSection = styled.View`
  flex-direction: row;
  gap: 20px;
  justify-content: start;
  align-items: center;
  margin-bottom: 70px;
`;

const ProfileTextSection = styled.View`
  justify-content: center;
`;

const BigProfilePicture = styled.Image`
  width: 80px;
  height: 80px;
  border-radius: 40px;
`;

const RoleText = styled.Text`
  font-size: 24px;
  color: #7c7c7c;
  font-family: Inter_500Medium;
  margin-top: -10px;
  letter-spacing: -1.2px;
`;

const StatsText = styled.Text`
  font-size: 20px;
  color: #a5a5a5;
  font-family: Inter_600SemiBold;
  include-font-padding: false;
  letter-spacing: -1px;
`;

const LogoutButtonContainer = styled.Pressable`
  align-items: center;
  justify-content: center;
  position: absolute;
  bottom: 50px;
  left: 38px;
`;

const LogoutButtonView = styled.View`
  align-items: center;
  justify-content: center;
  background-color: #3d3d3d;
  width: 124px;
  height: 61px;
  border-radius: 10px;
`;

const LogoutButtonText = styled.Text`
  font-size: 24px;
  color: #ffffff;
  font-family: Inter_500Medium;
  letter-spacing: -1.2px;
`;

const PressableContainer = styled.Pressable`
  align-items: center;
  justify-content: center;
`;

const DarkFilter = styled.View`
  opacity: 0.4;
  background-color: #000000;
  width: 100%;
  height: 100%;
`;

type HomeDetailsProps = {
  userData: User | "loading";
  reference: React.Ref<BottomSheetMethods>;
};

const HomeDetails: React.FC<HomeDetailsProps> = ({ userData, reference }) => {
  const [isActive, setIsActive] = useState(false);
  console.log(userData);

  const screenSize = {
    width: Dimensions.get("screen").width,
    height: Dimensions.get("screen").height,
    position: "absolute" as "absolute" | "relative",
    bottom: 0,
    left: 0,
    Zindex: 10,
  };
  return (
    <View style={screenSize}>
      {isActive ? (
        <PressableContainer
          onPress={() => {
            // @ts-expect-error idk why they have such a problem
            ref.current.close();
            setIsActive(false);
          }}
        >
          <DarkFilter></DarkFilter>
        </PressableContainer>
      ) : (
        ""
      )}

      <BottomSheet
        index={-1}
        snapPoints={["68%"]}
        ref={reference}
        onChange={(index) => {
          setIsActive(index > -1);
        }}
      >
        <LeftAlignedView>
          <ProfileSection>
            {userData === "loading" ? (
              <LoadingGlyph height={80} width={80} borderRadius={40} />
            ) : (
              <BigProfilePicture
                source={{
                  uri: `https://cdn.discordapp.com/avatars/${userData.discord_id}/${userData.image}.png?size=80px`,
                }}
              />
            )}
            <ProfileTextSection>
              {userData === "loading" ? (
                <LoadingGlyph height={30} width={80} borderRadius={5} />
              ) : (
                <BigTitle style={{ maxWidth: "100%" }} numberOfLines={1}>
                  {userData.display_name}
                </BigTitle>
              )}
              {userData === "loading" ? (
                <LoadingGlyph height={15} width={50} borderRadius={5} />
              ) : (
                <RoleText>{userData.auth_level == 99 ? "Admin" : "Player"}</RoleText>
              )}
            </ProfileTextSection>
          </ProfileSection>
          <MediumTitle>Stats</MediumTitle>
          {/*/ Todo change when api is ready /*/}
          <BigTitle>{`#${3} Global`}</BigTitle>
          <StatsText>{`${0} wins, ${1} draw, ${2} losses`}</StatsText>
          <StatsText>{`${1000} XP gained`}</StatsText>
          <LogoutButtonContainer
            onPress={() => {
              SecureStore.setItemAsync("refreshToken", "null");
              router.replace("/login");
            }}
          >
            <LogoutButtonView>
              <LogoutButtonText>Log out</LogoutButtonText>
            </LogoutButtonView>
          </LogoutButtonContainer>
        </LeftAlignedView>
      </BottomSheet>
    </View>
  );
};

export default HomeDetails;
