import type {Href} from "expo-router";
import type {FavoriteKey} from "../api/favorites.api";
import {findInstitution} from "./institutionDirectory";
export function favoriteHref(item:FavoriteKey):Href {
 return {pathname:item.kind==="doctor"?"/(tabs)/directory/professional-details":item.kind==="product"?"/(tabs)/products/product-details":"/(tabs)/directory/institution-details",params:{id:item.targetId}};
}
export function detailFavorite(pathname:string,id?:string):FavoriteKey|undefined {
 if(!id)return;
 if(pathname==="/directory/professional-details")return {kind:"doctor",targetId:id};
 if(pathname==="/directory/institution-details")return {kind:"institution",targetId:findInstitution(id)?.id||id};
 if(pathname==="/products/product-details")return {kind:"product",targetId:id};
}
