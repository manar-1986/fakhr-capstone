import {favoriteHref,detailFavorite} from "../utils/favoriteNavigation";
import {listFavorites,saveFavorite,removeFavorite} from "../api/favorites.api";
import api from "../api/axios";
import catalog from "../data/favoriteCatalog.json";
jest.mock("../api/axios",()=>({get:jest.fn(),put:jest.fn(),delete:jest.fn()}));
beforeEach(()=>jest.clearAllMocks());
test.each(["doctor","institution","product"] as const)("%s uses original Details route and identity",kind=>{
 const path=favoriteHref({kind,targetId:"canonical"}) as {pathname:string;params:{id:string}};
 expect(path.params).toEqual({id:"canonical"});expect(detailFavorite(path.pathname.replace("/(tabs)",""),"canonical")).toEqual({kind,targetId:"canonical"});
});
test("catalog has no duplicate identities or invented titles",()=>{expect(new Set(catalog.map(i=>i.kind+":"+i.targetId)).size).toBe(catalog.length);expect(catalog.every(i=>i.nameAr&&i.nameEn)).toBe(true);});
test("all pages load and mutations send identity only",async()=>{
 (api.get as jest.Mock).mockResolvedValueOnce({items:[{kind:"product",targetId:"p-1"}],nextOffset:50}).mockResolvedValueOnce({items:[{kind:"product",targetId:"p-2"}],nextOffset:null});
 expect(await listFavorites()).toHaveLength(2);expect(api.get).toHaveBeenLastCalledWith("/favorites",{params:{offset:50}});
 await saveFavorite({kind:"product",targetId:"p-1"});expect(api.put).toHaveBeenCalledWith("/favorites",{kind:"product",targetId:"p-1"});
 await removeFavorite({kind:"product",targetId:"p-1"});expect(api.delete).toHaveBeenCalledWith("/favorites",{params:{kind:"product",targetId:"p-1"}});
});
test("pagination loops and network errors do not look like empty success",async()=>{
 (api.get as jest.Mock).mockResolvedValueOnce({items:[],nextOffset:0});await expect(listFavorites()).rejects.toThrow();
 (api.get as jest.Mock).mockRejectedValueOnce(new Error("offline"));await expect(listFavorites()).rejects.toThrow("offline");
});
