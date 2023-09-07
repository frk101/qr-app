import React, { useEffect, useState } from "react";
import { View, Button, Text } from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import * as Location from "expo-location";

const IzinKontrolBileseni = () => {
  const [kameraIzinVerildi, setKameraIzinVerildi] = useState(null);
  const [konumIzinVerildi, setKonumIzinVerildi] = useState(null);

  useEffect(() => {
    // Kamera iznini kontrol et
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setKameraIzinVerildi(status === "granted");
    })();

    // Konum iznini kontrol et
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setKonumIzinVerildi(status === "granted");
    })();
  }, []);

  const isteKameraIzniTekrar = async () => {
    console.log("burada");
    const { status } = await BarCodeScanner.requestPermissionsAsync();
    setKameraIzinVerildi(status === "granted");
  };

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      {!kameraIzinVerildi && (
        <Button title="Kamera İzni İste" onPress={isteKameraIzniTekrar} />
      )}

      {!konumIzinVerildi && (
        <Button
          title="Konum İzni İste"
          onPress={async () => {
            const { status } =
              await Location.requestForegroundPermissionsAsync();
            setKonumIzinVerildi(status === "granted");
          }}
        />
      )}

      {kameraIzinVerildi && konumIzinVerildi && (
        <Text>İzinler verildi, istediğiniz işlemi yapabilirsiniz.</Text>
      )}
    </View>
  );
};

export default IzinKontrolBileseni;
