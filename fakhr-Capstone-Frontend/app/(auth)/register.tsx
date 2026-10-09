import { View } from "react-native";
import { CreateAccountScreen } from "../../components/screens/CreateAccountScreen";
import { MainTabBar } from "../../components/navigation/MainTabBar";

export default function RegisterScreen() {
  return <View style={{ flex: 1, backgroundColor: "white" }}>
    <CreateAccountScreen registrationDestination="/(tabs)/home" showBack />
    <MainTabBar inline />
  </View>;
}
