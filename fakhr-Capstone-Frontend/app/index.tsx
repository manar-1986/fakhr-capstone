import React, { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { hasCompletedWelcome } from "../utils/welcome";
export default function Index() {
  const { user, loading } = useAuth();
  const [completed, setCompleted] = useState<boolean | null>(null);
  useEffect(() => { let active = true; hasCompletedWelcome().then(value => { if (active) setCompleted(value); }).catch(() => { if (active) setCompleted(false); }); return () => { active = false; }; }, []);
  if (loading || completed === null) return <View style={{ flex: 1, backgroundColor: "white", justifyContent: "center" }}><ActivityIndicator color="#6E7CAF" /></View>;
  return <Redirect href={user || completed ? "/(tabs)/home" : "/(auth)/welcome"} />;
}
