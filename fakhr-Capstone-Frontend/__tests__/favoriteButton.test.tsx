import React from "react";

import {render,fireEvent,waitFor,cleanup} from "@testing-library/react-native";
import {QueryClient,QueryClientProvider} from "@tanstack/react-query";
import FavoriteButton from "../components/FavoriteButton";
import {listFavorites,saveFavorite,removeFavorite} from "../api/favorites.api";
let mockUser:{id:string}|null={id:"a"};
const mockRequire=jest.fn(()=>!!mockUser);
jest.mock("../api/favorites.api",()=>({listFavorites:jest.fn(),saveFavorite:jest.fn(),removeFavorite:jest.fn()}));
jest.mock("../context/AuthContext",()=>({useAuth:()=>({user:mockUser})}));
jest.mock("../hooks/useRequireAuth",()=>({useRequireAuth:()=>({requireAuth:mockRequire})}));
jest.mock("../hooks/useI18nLayout",()=>({useI18nLayout:()=>({isRTL:false})}));
jest.mock("expo-router",()=>({useFocusEffect:()=>{}}));
jest.mock("@expo/vector-icons",()=>({Ionicons:"Icon"}));
let client:QueryClient;
beforeEach(()=>{jest.clearAllMocks();mockUser={id:"a"};client=new QueryClient({defaultOptions:{queries:{retry:false},mutations:{retry:false,gcTime:0}}});jest.mocked(listFavorites).mockResolvedValue([]);jest.mocked(saveFavorite).mockResolvedValue(undefined);jest.mocked(removeFavorite).mockResolvedValue(undefined);});
afterEach(()=>{cleanup();client.clear();jest.restoreAllMocks();});
const view=()=>render(<QueryClientProvider client={client}><FavoriteButton item={{kind:"product",targetId:"p-1"}}/></QueryClientProvider>);
test("save and remove use exact identity despite returned metadata",async()=>{
 const ui=view();await waitFor(()=>expect(ui.getByLabelText("Save to favorites").props.accessibilityState.disabled).toBe(false));
 jest.mocked(listFavorites).mockResolvedValue([{kind:"product",targetId:"p-1",nameAr:"اسم",nameEn:"Name",available:true}]);
 fireEvent.press(ui.getByLabelText("Save to favorites"));await waitFor(()=>expect(ui.getByLabelText("Remove from favorites")).toBeTruthy());expect(saveFavorite).toHaveBeenCalledWith({kind:"product",targetId:"p-1"});
 jest.mocked(listFavorites).mockResolvedValue([]);fireEvent.press(ui.getByLabelText("Remove from favorites"));await waitFor(()=>expect(ui.getByLabelText("Save to favorites")).toBeTruthy());expect(removeFavorite).toHaveBeenCalledWith({kind:"product",targetId:"p-1"});
});
test("guest gets login destination without data fetch or mutation",()=>{mockUser=null;const ui=view();fireEvent.press(ui.getByLabelText("Save to favorites"));expect(mockRequire).toHaveBeenCalledWith({pathname:"/(tabs)/products/product-details",params:{id:"p-1"}});expect(listFavorites).not.toHaveBeenCalled();expect(saveFavorite).not.toHaveBeenCalled();});
test("failed mutation is explicit, never optimistic success",async()=>{jest.mocked(saveFavorite).mockRejectedValue(new Error("offline"));const ui=view();await waitFor(()=>expect(ui.getByLabelText("Save to favorites").props.accessibilityState.disabled).toBe(false));fireEvent.press(ui.getByLabelText("Save to favorites"));await waitFor(()=>expect(ui.getByText("Could not update favorites. Please try again.")).toBeTruthy());expect(ui.queryByLabelText("Remove from favorites")).toBeNull();});


test("account change never renders previous account favorites",async()=>{jest.mocked(listFavorites).mockResolvedValueOnce([{kind:"product",targetId:"p-1",available:true}]).mockResolvedValue([]);const ui=view();await waitFor(()=>expect(ui.getByLabelText("Remove from favorites")).toBeTruthy());mockUser={id:"b"};ui.rerender(<QueryClientProvider client={client}><FavoriteButton item={{kind:"product",targetId:"p-1"}}/></QueryClientProvider>);expect(ui.queryByLabelText("Remove from favorites")).toBeNull();await waitFor(()=>expect(listFavorites).toHaveBeenCalledTimes(2));});
