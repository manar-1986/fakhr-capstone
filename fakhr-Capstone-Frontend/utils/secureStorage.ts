import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const WEB_PREFIX = "fakhr_secure_";

function webKey(key: string): string {
  return `${WEB_PREFIX}${key}`;
}

/** Token/session storage. Uses localStorage on web (expo-secure-store has no web implementation). */
export async function getItemAsync(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    try {
      return window.localStorage.getItem(webKey(key));
    } catch {
      return null;
    }
  }
  return SecureStore.getItemAsync(key);
}

export async function setItemAsync(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") {
    window.localStorage.setItem(webKey(key), value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

export async function deleteItemAsync(key: string): Promise<void> {
  if (Platform.OS === "web") {
    try {
      window.localStorage.removeItem(webKey(key));
    } catch {
      /* ignore */
    }
    return;
  }
  await SecureStore.deleteItemAsync(key);
}
