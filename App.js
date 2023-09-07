import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import QrCodeScreen from "./screens/qr-code.screen";
import PermissionsService from "./services/permissions.service";
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        {/* <Stack.Screen
          name="PermissionsService"
          component={PermissionsService}
        /> */}
        <Stack.Screen name="qrCode" component={QrCodeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
