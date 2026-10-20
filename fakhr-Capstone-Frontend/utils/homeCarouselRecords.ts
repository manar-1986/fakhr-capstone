import type {Href} from "expo-router";
import type {ImageSourcePropType} from "react-native";
import {PUBLIC_DOCTORS} from "../constants/approvedDoctors";
import {HOME_SERVICE_PROVIDERS} from "../constants/homeServiceProviders";
import {institutionImages} from "../components/directory/InstitutionImage";
import {doctorImageAsset} from "../components/directory/DoctorVisuals";
import {providerImages} from "../components/directory/HomeServiceProviderCard";
import {isListedCenter} from "./centerVisibility";
import {isSpeechPlus} from "../constants/speechPlus";
import {INSTITUTIONS,backendInstitution,institutionDirectoryCategory} from "./institutionDirectory";
import type {HealthCenter} from "../types/directory.types";
import type {Institution} from "../types/institution";
type Copy={ar:string;en:string};
export type HomeCarouselRecord={id:string;name:Copy;description:Copy;note:Copy;href:Href;image:ImageSourcePropType;fit:"contain"|"cover";category:string};
const labels:Record<string,Copy>={sports:{ar:"النوادي الرياضية",en:"Sports Clubs"},doctor:{ar:"الأطباء والأخصائيون",en:"Doctors & Specialists"},rehabilitation:{ar:"المراكز",en:"Centers"},nursery:{ar:"الحضانات",en:"Nurseries"},school:{ar:"المدارس",en:"Schools"},service:{ar:"العيادات والخدمات المنزلية",en:"Home Services & Clinics"}};
export function centerRecordId(center?:HealthCenter):string{return center?.id||(center as any)?._id||"";}
export function eligibleCarouselCenter(center:HealthCenter):boolean{return /^[a-f\d]{24}$/i.test(centerRecordId(center))&&!!center.name&&isListedCenter(center);}
/** Registry-backed images only. Unknown or failed images never get a placeholder slide. */
export function buildHomeCarouselRecords(api:HealthCenter[]|HealthCenter=[],institutions:Institution[]=INSTITUTIONS):HomeCarouselRecord[]{
 const groups:Record<string,HomeCarouselRecord[]>={doctor:[],rehabilitation:[],nursery:[],school:[],service:[]};const seen=new Set<string>();
 const add=(id:string,name:Copy,category:string,image:ImageSourcePropType|undefined,href:Href,fit:"contain"|"cover"="contain")=>{if(!image||seen.has(id))return;seen.add(id);groups[category === "sports" ? "rehabilitation" : category].push({id,name,category,image,href,fit,description:labels[category],note:{ar:"",en:""}});};
 for(const d of PUBLIC_DOCTORS){const a=d.id === "center-speech-plus" ? doctorImageAsset(d) : d.sourceInstitution?.mainImage?{source:institutionImages[d.sourceInstitution.mainImage],fit:"contain" as const}:doctorImageAsset(d);add(d.id,{ar:d.nameAr,en:d.nameEn},"doctor",a?.source,{pathname:"/(tabs)/directory/professional-details",params:{id:d.id}},a?.fit);}
 for(const i of institutions){if(!isListedCenter({...i,nameEn:i.nameEn||undefined})||isSpeechPlus(i))continue;const category=institutionDirectoryCategory(i);add(i.canonicalId||i.id,{ar:i.nameAr,en:i.nameEn||i.nameAr},category,i.mainImage?institutionImages[i.mainImage]:undefined,{pathname:"/(tabs)/directory/institution-details",params:{id:i.id}});}
 for(const p of HOME_SERVICE_PROVIDERS)add(p.id,p.name,"service",p.image?providerImages[p.image]:undefined,{pathname:"/(tabs)/services/service-details",params:{id:p.id}});
 for(const c of Array.isArray(api)?api:[api]){if(!eligibleCarouselCenter(c))continue;const i=backendInstitution(c);if(!isListedCenter({...i,nameEn:i.nameEn||undefined})||isSpeechPlus(i))continue;const remote=(c as any).image;const image=i.mainImage?institutionImages[i.mainImage]:typeof remote==="string"&&/^https:\/\//i.test(remote)?{uri:remote}:undefined;add(i.canonicalId||i.id,{ar:i.nameAr,en:i.nameEn||i.nameAr},institutionDirectoryCategory(i) === "sports" ? "sports" : "rehabilitation",image,{pathname:"/(tabs)/directory/institution-details",params:{id:i.id}});}
 const result:HomeCarouselRecord[]=[];const queues=Object.values(groups);for(let n=0;queues.some(q=>q[n]);n++)for(const q of queues)if(q[n])result.push(q[n]);return result;
}
