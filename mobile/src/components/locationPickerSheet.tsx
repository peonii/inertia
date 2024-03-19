import styled from "@emotion/native";
import BottomSheet, { useBottomSheet } from "@gorhom/bottom-sheet";
import { BottomSheetMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import React, { LegacyRef, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Dimensions, View, useWindowDimensions } from "react-native";
import MapView from "react-native-maps";

const Container = styled.View`
  width: 100%;
  height: 100%;
  background-color: #252525;
`;

const SmallTitle = styled.Text`
  font-size: 20px;
  color: #ffffff;
  font-family: Inter_600SemiBold;
  letter-spacing: -1.3px;
`;

const PressableContainer = styled.Pressable`
  align-items: center;
  justify-content: center;
`;

const ExitButton = styled.View`
  background-color: #434343;
  width: 30px;
  height: 30px;
  border-radius: 15px;
  align-items: center;
  justify-content: center;
`;

const ExitButtonText = styled.Text`
  font-size: 19px;
  font-family: Inter_600SemiBold;
  include-font-padding: false;
  vertical-align: middle;
  color: #929292;
  padding-bottom: 2px;
`;

const MapContainer = styled.View`
  height: 100%;
  width: 91%;
  margin: 16px;
  margin-bottom: 20px;
  border-radius: 10px;
  overflow: hidden;
  align-items: center;
  justify-content: center;
`;

const DarkFilter = styled.View`
  opacity: 0.4;
  background-color: #000000;
  width: 100%;
  height: 100%;
`;

const Crosshair = styled.Image`
  position: absolute;
  width: 100px;
  height: 35px;
`;

const NextButtonView = styled.View`
  align-items: center;
  justify-content: center;
  background-color: #3d3d3d;
  border-radius: 10px;
  width: 124px;
  height: 61px;
`;

const MediumTitle = styled.Text`
  font-size: 24px;
  color: #ffffff;
  font-family: Inter_600SemiBold;
  letter-spacing: -1.6px;
`;

type LocationPickerProps = {
  sheetRef: React.Ref<BottomSheetMethods>;
  onCancel: () => void;
  onAccept: () => void;
  mapRef: LegacyRef<MapView>;
  initialRegion: { lat: number; lng: number };
};

const LocationPickerSheet: React.FC<LocationPickerProps> = ({
  sheetRef,
  onAccept,
  onCancel,
  mapRef,
  initialRegion,
}) => {
  const [isActive, setIsActive] = useState(false);
  const [isMapActivity, setIsMapActivity] = useState(false);
  const currentRegion = useRef(initialRegion);
  function updateRegion(newRegion: { lat: number; lng: number }) {
    currentRegion.current = newRegion;
  }

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
        <PressableContainer onPress={onCancel}>
          <DarkFilter></DarkFilter>
        </PressableContainer>
      ) : (
        ""
      )}
      <BottomSheet
        snapPoints={["85%"]}
        ref={sheetRef}
        enablePanDownToClose={true}
        index={-1}
        backgroundStyle={{ backgroundColor: "#252525" }}
        onChange={(index) => {
          setIsActive(index > -1);
        }}
      >
        <Container
          style={{
            alignItems: "center",
            height: Math.round(useWindowDimensions().height * 0.66),
          }}
        >
          <SmallTitle style={{ alignSelf: "flex-start", left: 16 }}>
            Select location
          </SmallTitle>
          <PressableContainer
            style={{ position: "absolute", right: 16 }}
            onPress={() => {
              onCancel();
              //@ts-expect-error chuj wie again
              sheetRef.current.forceClose();
              setIsActive(false);
            }}
          >
            <ExitButton>
              <ExitButtonText>x</ExitButtonText>
            </ExitButton>
          </PressableContainer>
          <MapContainer>
            <MapView
              initialRegion={{
                latitude: initialRegion.lat,
                longitude: initialRegion.lng,
                latitudeDelta: 0.1383,
                longitudeDelta: 0.06315,
              }}
              style={{
                width: "100%",
                height: "100%",
              }}
              onRegionChange={({ latitude, longitude }) => {
                updateRegion({ lat: latitude, lng: longitude });
              }}
              ref={mapRef}
            ></MapView>
            {isMapActivity && <DarkFilter style={{ position: "absolute" }}></DarkFilter>}
            {isMapActivity ? (
              <ActivityIndicator
                style={{ position: "absolute" }}
                size={"large"}
              ></ActivityIndicator>
            ) : (
              <Crosshair source={require("../../assets/map-crosshair.png")}></Crosshair>
            )}
          </MapContainer>
          <PressableContainer
            onPress={async () => {
              setIsMapActivity(true);
              await onAccept();
              //@ts-expect-error chuj wie co mu sie tu nie podoba
              sheetRef.current.forceClose();
              setIsActive(false);
              setIsMapActivity(false);
            }}
          >
            <NextButtonView>
              <MediumTitle>Done</MediumTitle>
            </NextButtonView>
          </PressableContainer>
        </Container>
      </BottomSheet>
    </View>
  );
};

export default LocationPickerSheet;

// Okręt nasz wpłynął w mgłę i fregaty dwie
// Popłynęły naszym kursem by nie zgubić się
// Potem szkwał wypchnął nas poza mleczny pas
// I nikt wtedy nie przypuszczał że fregaty śmierć nam niosą
// Ciepła krew poleje się strugami
// Wygra ten kto utrzyma ship
// W huku dział ktoś przykryje się falami
// Jak da Bóg ocalimy bryg
// Nagły huk w uszach grał i już atak trwał
// To fregaty uzbrojone rzędem w setkę dział
// Czarny dym spowił nas przyszedł śmierci czas
// Krzyk i lament mych kamratów przerywany ogniem katów
// Ciepła krew poleje się strugami
// Wygra ten kto utrzyma ship
// W huku dział ktoś przykryje się falami
// Jak da Bóg ocalimy bryg
// Pocisk nasz trafił w maszt usłyszałem trzask
// To sterburtę rozwaliła jedna z naszych salw
// „Żagiel staw" krzyknął ktoś znów piratów złość
// Bo od rufy nam powiało a fregatom w mordę wiało
// Ciepła krew poleje się strugami
// Wygra ten kto utrzyma ship
// W huku dział ktoś przykryje się falami
// Jak da Bóg ocalimy bryg
// Z fregat dwóch tylko ta pierwsza w pogoń szła
// Wnet abordaż rozpoczęli gdy dopadli nas
// Szyper ich dziury dwie zrobił w swoim dnie
// Nie pomogło to psubratom reszta z rei zwisa za to
// Ciepła krew poleje się strugami
// Wygra ten kto utrzyma ship
// W huku dział ktoś przykryje się falami
// Jak da Bóg ocalimy bryg
// Po dziś dzień tamtą mgłę i fregaty dwie
// Kiedy noc zamyka oczy widzę w moim śnie
// Tamci co śpią na dnie uśmiechają się
// Że ich straszną śmierć pomścili bracia którzy zwyciężyli
// Ciepła krew poleje się strugami
// Wygra ten kto utrzyma ship
// W huku dział ktoś przykryje się falami
// Jak da Bóg ocalimy bryg
// Ciepła krew poleje się strugami
// Jak da Bóg ocalimy bryg
// Jak da Bóg ocalimy

// Żegnajcie nam dziś hiszpańskie dziewczyny
// Żegnajcie nam dziś marzenia ze snów
// Ku brzegom angielskim już ruszać nam pora
// Lecz kiedyś na pewno wrócimy tu znów
// I smak waszych ust hiszpańskie dziewczyny
// W noc ciemną i złą nam będzie się śnił
// Leniwie popłyną znów rejsu godziny
// Wspomnienie ust waszych przysporzy nam sił
// I smak waszych ust hiszpańskie dziewczyny
// W noc ciemną i złą nam będzie się śnił
// Leniwie popłyną znów rejsu godziny
// Wspomnienie ust waszych przysporzy nam sił
// Niedługo ujrzymy znów w dali Cape Deadman
// I Głowę Baranią sterczącą wśród wzgórz
// I statki stojące na redzie przed Plymouth
// Klarować kotwicę najwyższy czas już
// I smak waszych ust hiszpańskie dziewczyny
// W noc ciemną i złą nam będzie się śnił
// Leniwie popłyną znów rejsu godziny
// Wspomnienie ust waszych przysporzy nam sił
// I smak waszych ust hiszpańskie dziewczyny
// W noc ciemną i złą nam będzie się śnił
// Leniwie popłyną znów rejsu godziny
// Wspomnienie ust waszych przysporzy nam sił
// I znów białe żagle na masztach rozkwitną
// Kurs szyper wyznaczy do Portland i Wight
// I znów stara łajba potoczy się ciężko
// Przez fale w kierunku na Beachie Fairlee Light
// I smak waszych ust hiszpańskie dziewczyny
// W noc ciemną i złą nam będzie się śnił
// Leniwie popłyną znów rejsu godziny
// Wspomnienie ust waszych przysporzy nam sił
// I smak waszych ust hiszpańskie dziewczyny
// W noc ciemną i złą nam będzie się śnił
// Leniwie popłyną znów rejsu godziny
// Wspomnienie ust waszych przysporzy nam sił
// Zabłysną nam bielą skał zęby pod Dover
// I znów noc w kubryku wśród legend i bajd
// Powoli i znojnie tak płynie nam życie
// Na wodach i w portach przy South Foreland Light
// I smak waszych ust hiszpańskie dziewczyny
// W noc ciemną i złą nam będzie się śnił
// Leniwie popłyną znów rejsu godziny
// Wspomnienie ust waszych przysporzy nam sił
// I smak waszych ust hiszpańskie dziewczyny
// W noc ciemną i złą nam będzie się śnił
// Leniwie popłyną znów rejsu godziny
// Wspomnienie ust waszych przysporzy nam sił

// Kiedy rum zaszumi w głowie
// Cały świat nabiera treści
// Wtedy chętnie słucha człowiek
// Morskich opowieści

// Hej, ha! Kolejkę nalej!
// Hej, ha! Kielichy wznieśmy!
// To zrobi doskonale
// Morskim opowieściom

// Łajba to jest morski statek
// Sztorm to wiatr co dmucha z gestem
// Cierpi kraj na niedostatek
// Morskich opowieści

// Hej, ha! Kolejkę nalej!
// Hej, ha! Kielichy wznieśmy!
// To zrobi doskonale
// Morskim opowieściom

// Pływał raz marynarz, który
// Żywił się wyłącznie pieprzem
// Sypał pieprz do konfitury
// I do zupy mlecznej

// Hej, ha! Kolejkę nalej!
// Hej, ha! Kielichy wznieśmy!
// To zrobi doskonale
// Morskim opowieściom

// Był na „Lwowie" młodszy majtek
// Czort, Rasputin, bestia taka
// Że sam kręcił kabestanem
// I to bez handszpaka

// Hej, ha! Kolejkę nalej!
// Hej, ha! Kielichy wznieśmy!
// To zrobi doskonale
// Morskim opowieściom

// Jak spod Helu raz dmuchnęło
// Żagle zdarła moc nadludzka
// Patrzę, w koję mi przywiało
// Nagą babkę z Pucka

// Hej, ha! Kolejkę nalej!
// Hej, ha! Kielichy wznieśmy!
// To zrobi doskonale
// Morskim opowieściom

// Niech drżą gitary struny
// Wiatr niech grzywacze pieści
// Gdy płyniemy pod banderą
// Morskich opowieści

// Hej, ha! Kolejkę nalej!
// Hej, ha! Kielichy wznieśmy!
// To zrobi doskonale
// Morskim opowieściom

// Może ktoś się będzie zżymał
// Mówiąc, że to zdrożne wieści
// Ale to jest właśnie klimat
// Morskich opowieści

// Hej, ha! Kolejkę nalej!
// Hej, ha! Kielichy wznieśmy!
// To zrobi doskonale
// Morskim opowieściom

// Pij bracie, pij na zdrowie
// Jutro ci się humor przyda
// Spirytus ci nie zaszkodzi
// Sztorm idzie, wyrzygasz

// Hej, ha! Kolejkę nalej!
// Hej, ha! Kielichy wznieśmy!
// To zrobi doskonale
// Morskim opowieściom

// Kiedy znudzą ci się szanty
// I obrzydną ci Mazury
// To pierdolnij kapitana
// I uciekaj w góry

// Hej, ha! Kolejkę nalej!
// Hej, ha! Kielichy wznieśmy!
// To zrobi doskonale
// Morskim opowieściom

// Kto chce niechaj wierzy
// Kto nie chce niech nie wierzy
// Nam na tym nie zależy
// Więc wypijmy jeszcze!

// Hej, ha! Kolejkę nalej!
// Hej, ha! Kielichy wznieśmy!
// To zrobi doskonale
// Morskim opowieściom

// Hej, ha! Kolejkę nalej!
// Hej, ha! Kielichy wznieśmy!
// To zrobi doskonale
// Morskim opowieściom
