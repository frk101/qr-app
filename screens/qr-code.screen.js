import { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as Location from "expo-location";
import { BarCodeScanner } from "expo-barcode-scanner";
import useStateWithCallback from "use-state-with-callback";
import { useIsFocused } from "@react-navigation/native";
import moment from "moment";

const windowWidth = Dimensions.get("screen").width;
const windowHeight = Dimensions.get("screen").height;

const QrCodeScreen = () => {
  const isFocus = useIsFocused();
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [date, setDate] = useState();
  const [karekodOkunuyor, setKarekodOkunuyor] = useStateWithCallback(
    false,
    (newValue) => {
      if (newValue) {
        setTimeout(() => {
          setKarekodOkunuyor(false);
        }, 3000);
      }
    }
  );
  useEffect(() => {
    // 5 saniye boyunca "loading" durumunu tut
    const timeout = setTimeout(() => {
      setIsLoading(false); // 5 saniye sonra "loading" durumunu false yap
    }, 10000); // 5000 milisaniye (5 saniye)

    // useEffect temizleme işlevi
    return () => {
      clearTimeout(timeout); // bileşen ayrıldığında zamanlayıcıyı temizle
    };
  }, []); // Boş bağımlılık dizisi, yalnızca bir kere çalışmasını sağlar

  useEffect(() => {
    if (isFocus) {
      (async () => {
        // Kullanıcının konum iznini kontrol et
        let { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          setErrorMsg("Konum izni verilmedi");
          return;
        }

        // Konum bilgisini al

        let location = await Location.getCurrentPositionAsync({});
        setLocation(location);
      })();
    }
  }, [isFocus, isLoading]);

  // İki nokta arasındaki mesafeyi hesaplayan fonksiyon
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000; // Dünya yarıçapı (metre cinsinden)
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  };

  const toRadians = (degrees) => {
    return (degrees * Math.PI) / 180;
  };

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);
  const handleBarCodeScanned = async ({ type, data }) => {
    if (data && karekodOkunuyor === false) {
      oncekiKarekod = data;
      setKarekodOkunuyor(true);
      setDate(new Date());
      // Metni virgülle ayırarak iki parçaya bölme
      const parcalar = data.split(",");
      const veri = {};
      // Her bir elemanı ayrıştırarak veriyi doldurun
      parcalar.forEach((eleman) => {
        const [anahtar, deger] = eleman.replace(/"/g, "").split(":"); // Ters eğik çizgileri ve tırnak işaretlerini temizleyin
        veri[anahtar.trim()] = parseFloat(deger.trim());
      });
      const qrCodeLatitude = veri.latitude;
      const qrCodeLongitude = veri.longitude;

      // Kullanıcının anlık konumu
      const userLatitude = location.coords.latitude;
      const userLongitude = location.coords.longitude;
      // İki konum arasındaki mesafeyi hesapla
      const distance = calculateDistance(
        userLatitude,
        userLongitude,
        qrCodeLatitude,
        qrCodeLongitude
      );

      // Mesafe 5 metreden küçükse başarılı kabul edin
      if (distance <= 30) {
        Alert.alert(
          "Kullanıcı Konumda",
          `qrCodeLatitude : ${qrCodeLatitude} , qrCodeLongitude :  ${qrCodeLatitude} , kullanıcıLatitude :  ${userLatitude} , kullanıcılongitude : ${userLongitude} , Qr Okutma Tarih ve saati:  ${moment(
            date
          ).format("MMMM Do YYYY, h:mm:ss a")}  `,
          [
            {
              text: "Cancel",
              onPress: () => console.log("Cancel Pressed"),
              style: "cancel",
            },
            { text: "OK", onPress: () => console.log("OK Pressed") },
          ]
        );
      } else {
        alert("Kullanıcı kunumda değil");
      }
    }
  };

  if (!isFocus) return null;

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }
  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(52, 52, 52, 0.6)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size={"large"} color={"white"} />
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "white",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <BarCodeScanner
        onBarCodeScanned={handleBarCodeScanned}
        style={{ width: windowWidth / 1.3, height: windowWidth / 1.3 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  scanContainer: {
    position: "absolute",
    flex: 1,
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    borderTopWidth: windowHeight / 2 - 100,
    borderBottomWidth: windowHeight / 2 - 90,
    borderLeftWidth: windowWidth / 2 - 140,
    borderRightWidth: windowWidth / 2 - 140,
    borderColor: "rgba(52, 52, 52, 0.6)",
  },
  txt: {
    color: "white",
    position: "absolute",
    bottom: -30,
  },
  btn: {
    backgroundColor: "white",
    position: "absolute",
    bottom: -100,
    padding: 10,
    borderRadius: 10,
  },
});

export default QrCodeScreen;
