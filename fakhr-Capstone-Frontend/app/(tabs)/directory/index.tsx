import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CenterCard } from "../../../components/directory/CenterCard";
import { DoctorCard } from "../../../components/directory/DoctorCard";
import { FEATURED_LISTINGS } from "../../../components/directory/directoryMockData";
import { FilterChip } from "../../../components/directory/FilterChip";
import type { DirectoryListing } from "../../../components/directory/types";
import { libraryColors as c } from "../../../constants/libraryTheme";

export default function CentersAndProfessionalsScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [nearMe, setNearMe] = useState(true);

  const goBooking = (item: DirectoryListing) => {
    router.push({
      pathname: "/(tabs)/directory/booking",
      params: { item: encodeURIComponent(JSON.stringify(item)) },
    });
  };

  const callItem = (item: DirectoryListing) => {
    const url = `tel:${item.phone.replace(/\s/g, "")}`;
    Alert.alert("Call", `Dial ${item.phone}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Call",
        onPress: () => {
          Linking.openURL(url).catch(() => {});
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Pressable
            style={({ pressed }) => [styles.headerIconBtn, pressed && styles.pressed]}
            onPress={() => {
              if (router.canGoBack()) router.back();
              else router.replace("/(tabs)/home");
            }}
          >
            <Ionicons name="chevron-back" size={24} color={c.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Centers & Professionals</Text>
          <Pressable
            style={({ pressed }) => [styles.headerIconBtn, pressed && styles.pressed]}
            onPress={() =>
              Alert.alert("Notifications", "No new notifications.")
            }
          >
            <Ionicons name="notifications-outline" size={22} color={c.text} />
          </Pressable>
        </View>

        <View style={styles.searchRow}>
          <Ionicons name="search-outline" size={20} color={c.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search centers or specialists"
            placeholderTextColor={c.textLight}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          <FilterChip
            label="Near Me"
            selected={nearMe}
            onPress={() => setNearMe((v) => !v)}
          />
          <FilterChip
            label="Pediatrics"
            selected={false}
            showDropdownChevron
            onPress={() =>
              Alert.alert("Pediatrics", "Filter options (coming soon).")
            }
          />
          <FilterChip
            label="Therapy"
            selected={false}
            showDropdownChevron
            onPress={() =>
              Alert.alert("Therapy", "Filter options (coming soon).")
            }
          />
        </ScrollView>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Featured Centers</Text>
          <Pressable onPress={() => router.push("/(tabs)/directory/centers")}>
            <Text style={styles.viewAll}>View All</Text>
          </Pressable>
        </View>

        {FEATURED_LISTINGS.map((item) =>
          item.kind === "doctor" ? (
            <DoctorCard
              key={item.id}
              item={item}
              onBookAppointment={() => goBooking(item)}
              onCall={() => callItem(item)}
            />
          ) : (
            <CenterCard
              key={item.id}
              item={item}
              onBookAppointment={() => goBooking(item)}
              onCall={() => callItem(item)}
            />
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bgApp },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 110,
    paddingTop: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: c.headerIconBg,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "700",
    color: c.text,
    marginHorizontal: 8,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: c.white,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.inputBorder,
    paddingHorizontal: 14,
    minHeight: 50,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: c.text,
    paddingVertical: 12,
  },
  filterScroll: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 18,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: c.text,
  },
  viewAll: {
    fontSize: 14,
    fontWeight: "600",
    color: c.primary,
  },
  pressed: { opacity: 0.88 },
});
