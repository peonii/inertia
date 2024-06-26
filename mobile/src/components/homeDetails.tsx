import styled from "@emotion/native";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import { useCallback, useEffect } from "react";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import LoadingGlyph from "./loadingGlyph";
import { useDataContext } from "../context/DataContext";
import { useQuery } from "@tanstack/react-query";
import { fetchTypeSafe } from "../api/fetch";
import { ENDPOINTS } from "../api/constants";
import { User } from "../types";
import { useAuth } from "../context/AuthContext";

const LeftAlignedView = styled.View`
  padding: 14px 38px;
  align-items: flex-start;
  flex-direction: column;
  background-color: #252525;
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

type HomeDetailsProps = {
  bottomSheetRef: React.Ref<BottomSheetModalMethods>;
};

const HomeDetails: React.FC<HomeDetailsProps> = ({ bottomSheetRef }) => {
  const DataContext = useDataContext();
  const userData = DataContext.userData;
  const authContext = useAuth();
  const dataContext = useDataContext();

  const userDataRequest = useQuery<User>({
    queryKey: ["userData"],
    queryFn: () => fetchTypeSafe<User>(ENDPOINTS.users.me, authContext),
    staleTime: 1000 * 60 * 3,
  });

  useEffect(() => {
    if (userDataRequest.data) {
      dataContext.setUserData(userDataRequest.data);
    }
  }, [userDataRequest.data, userDataRequest.error]);

  // {/* {isActive ? (
  //   <PressableContainer
  //     onPress={() => {
  //       // @ts-expect-error idk why they have such a problem
  //       bottomSheetRef.current.close();
  //       setIsActive(false);
  //     }}
  //   >
  //     <DarkFilter></DarkFilter>
  //   </PressableContainer>
  // ) : (
  //   ""
  // )} */}

  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        enableTouchThrough={true}
        pressBehavior="close"
        appearsOnIndex={0}
        disappearsOnIndex={-1}
      />
    ),
    [],
  );

  return (
    <BottomSheetModal
      index={0}
      enablePanDownToClose={true}
      enableContentPanningGesture={true}
      enableHandlePanningGesture={true}
      snapPoints={["70%"]}
      ref={bottomSheetRef}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: "#252525" }}
      handleIndicatorStyle={{ backgroundColor: "#353535" }}
    >
      <LeftAlignedView>
        <ProfileSection>
          {userData === "loading" ? (
            <LoadingGlyph height={80} width={80} borderRadius={40} />
          ) : (
            <BigProfilePicture
              source={{
                uri: `${userData.image}?size=128px`,
              }}
            />
          )}
          <ProfileTextSection>
            {userData === "loading" ? (
              <LoadingGlyph height={30} width={80} borderRadius={5} />
            ) : (
              <BigTitle style={{ maxWidth: "100%" }} numberOfLines={1}>
                {userData.name}
              </BigTitle>
            )}
            {userData === "loading" ? (
              <LoadingGlyph height={15} width={50} borderRadius={5} />
            ) : (
              <RoleText>
                {userData.auth_level == 99 ? "Admin" : "Player"}
              </RoleText>
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
    </BottomSheetModal>
  );
};

export default HomeDetails;
