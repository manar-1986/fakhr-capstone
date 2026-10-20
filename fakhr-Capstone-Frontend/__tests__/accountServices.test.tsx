import React from "react";
import {render,fireEvent} from "@testing-library/react-native";
import Favorites from "../app/(tabs)/favorites";
import Bookings from "../app/(tabs)/bookings";
const mockRouter={push:jest.fn(),replace:jest.fn()},mockMutate=jest.fn(),mockRefetch=jest.fn();
let mockUser:{id:string}|null={id:"parent"},mockRTL=false;
let mockFavorites={data:[{kind:"product",targetId:"p-1",nameAr:"كرسي متحرك",nameEn:"Wheelchair",available:true}],isPending:false,isError:false};
let mockEvents={data:[{id:"event",childId:"child",title:"Actual saved appointment",date:"2026-10-15",startTime:"09:00",timezone:"Asia/Kuwait",category:"doctor",status:"scheduled"},{id:"home",childId:"child",title:"Home task",category:"home"}],isPending:false,isError:false};
jest.mock("expo-router",()=>({useRouter:()=>mockRouter}));
jest.mock("../context/AuthContext",()=>({useAuth:()=>({user:mockUser,loading:false})}));
jest.mock("../hooks/useI18nLayout",()=>({useI18nLayout:()=>({isRTL:mockRTL,align:mockRTL?"right":"left"})}));
jest.mock("../hooks/useFavorites",()=>({useFavorites:()=>({...mockFavorites,refetch:mockRefetch,mutation:{mutate:mockMutate,isError:false,isPending:false}})}));
jest.mock("../hooks/useCalendarEvents",()=>({useCalendarEvents:()=>({...mockEvents,refetch:mockRefetch})}));
jest.mock("@tanstack/react-query",()=>({useQuery:({queryKey}:{queryKey:string[]})=>({data:queryKey[0]==="children"?[{id:"child",name:"Synthetic child"}]:[],isPending:false,isError:false,refetch:mockRefetch})}));
jest.mock("../api/children.api",()=>({getChildren:jest.fn()}));
jest.mock("../utils/journeyStore",()=>({readJourney:jest.fn()}));
jest.mock("../components/plan/CalendarPanel",()=>"CalendarPanel");
beforeEach(()=>{jest.clearAllMocks();mockUser={id:"parent"};mockFavorites.isPending=false;mockFavorites.isError=false;});
test.each([false,true])("favorites details and remove are functional in both languages, RTL=%s",rtl=>{
 mockRTL=rtl;const ui=render(<Favorites/>);expect(ui.getByText(rtl?"كرسي متحرك":"Wheelchair")).toBeTruthy();
 fireEvent.press(ui.getByText(rtl?"التفاصيل":"Details"));expect(mockRouter.push).toHaveBeenCalledWith({pathname:"/(tabs)/products/product-details",params:{id:"p-1"}});
 fireEvent.press(ui.getByText(rtl?"إزالة من المفضلة":"Remove from favorites"));expect(mockMutate).toHaveBeenCalledWith(expect.objectContaining({kind:"product",targetId:"p-1",saved:true}));
});
test("favorites loading and error offer retry without false empty state",()=>{mockRTL=false;mockFavorites.isPending=true;const ui=render(<Favorites/>);expect(ui.queryByText("You have not saved any items yet.")).toBeNull();mockFavorites.isPending=false;mockFavorites.isError=true;ui.rerender(<Favorites/>);fireEvent.press(ui.getByText("Could not load favorites — retry"));expect(mockRefetch).toHaveBeenCalled();});
test.each([false,true])("bookings reads shared appointments, not invented orders, RTL=%s",rtl=>{mockRTL=rtl;const ui=render(<Bookings/>);expect(ui.getByText("Actual saved appointment")).toBeTruthy();expect(ui.queryByText("Home task")).toBeNull();expect(ui.getByText(/2026-10-15/)).toBeTruthy();fireEvent.press(ui.getByText(rtl?"إدارة تقويم خطة طفلي":"Manage My Child’s Plan calendar"));});
test("both personal screens protect guest access",()=>{mockUser=null;render(<Favorites/>);render(<Bookings/>);expect(mockRouter.replace).toHaveBeenCalledTimes(2);expect(mockRouter.replace).toHaveBeenCalledWith("/(auth)/login");});

test("empty favorites is distinct from a request error",()=>{mockRTL=false;const previous=mockFavorites.data;mockFavorites.data=[];const ui=render(<Favorites/>);expect(ui.getByText("You have not saved any items yet.")).toBeTruthy();mockFavorites.data=previous;});
test("calendar errors offer retry and no false appointment list",()=>{mockRTL=false;const previous=mockEvents;mockEvents={data:[],isPending:false,isError:true};const ui=render(<Bookings/>);fireEvent.press(ui.getByText("Could not load appointments — retry"));expect(mockRefetch).toHaveBeenCalled();expect(ui.queryByText("No doctor, center, or therapy appointments recorded for this year.")).toBeNull();mockEvents={data:[],isPending:false,isError:false};ui.rerender(<Bookings/>);expect(ui.getByText("No doctor, center, or therapy appointments recorded for this year.")).toBeTruthy();mockEvents=previous;});
