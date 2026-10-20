import api from "./axios";
export type FavoriteKey = {kind:"doctor"|"institution"|"product";targetId:string};
export type Favorite = FavoriteKey & {nameAr?:string;nameEn?:string;available:boolean};
export async function listFavorites():Promise<Favorite[]> {
 const items:Favorite[]=[]; let offset:number|null=0;
 while(offset!==null){
  const page=await api.get("/favorites",{params:{offset}}) as unknown as {items:Favorite[];nextOffset:number|null};
  items.push(...page.items); if(page.nextOffset!==null&&page.nextOffset<=offset)throw new Error("Invalid pagination"); offset=page.nextOffset;
 }
 return items;
}
export async function saveFavorite(key:FavoriteKey){await api.put("/favorites",key);}
export async function removeFavorite(key:FavoriteKey){await api.delete("/favorites",{params:key});}
