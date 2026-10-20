import { HOME_PRODUCTS, PRODUCT_SUPPORT_CATEGORIES } from '../constants/homeProducts';
import { productIllustration } from '../constants/productImages';
import { PUBLIC_DOCTORS, doctorGroupLabel } from '../constants/approvedDoctors';
import { HOME_ACTIVITY_VIDEOS } from '../constants/homeActivityLibrary';
import { INSTITUTIONS } from './institutionDirectory';
import { doctorImageAsset } from '../components/directory/DoctorVisuals';
import { institutionImages } from '../components/directory/InstitutionImage';
import type { HomeCarouselRecord } from './homeCarouselRecords';

/** Curated source mappings, not synthetic advertising claims. Missing assets are omitted. */
export function buildHomePromotions(): HomeCarouselRecord[] {
 const rows:HomeCarouselRecord[]=[];
 const doctor=PUBLIC_DOCTORS.find(d=>d.id==='doctor-hadeel-yassin-faras');
 const portrait=doctor && doctorImageAsset(doctor);
 if(doctor && portrait && doctor.englishVerified)rows.push({id:doctor.id,category:'doctor',name:{ar:doctor.nameAr,en:doctor.nameEn},description:{ar:'الأطباء والأخصائيون',en:'Doctors & Specialists'},note:{ar:doctorGroupLabel(doctor,true),en:doctorGroupLabel(doctor,false)},image:portrait.source,fit:'contain',href:{pathname:'/(tabs)/directory/professional-details',params:{id:doctor.id}}});
 for(const [id,category,label] of [['center-abc-kuwait','rehabilitation',{ar:'المراكز',en:'Centers'}],['kw-s-hope','school',{ar:'المدارس',en:'Schools'}]] as const){
  const item=INSTITUTIONS.find(i=>i.id===id);
  const image=item?.mainImage ? institutionImages[item.mainImage] : undefined;
  const note=item?.publicProfile?.specialization || item?.publicProfile?.classification;
  if(item?.nameEn && image && note)rows.push({id,category,name:{ar:id==='center-abc-kuwait'?'مركز تحليل السلوك التطبيقي في الكويت':item.nameAr,en:item.nameEn},description:label,note,image,fit:'contain',href:{pathname:'/(tabs)/directory/institution-details',params:{id}}});
 }
 // Existing approved resource thumbnail, visually checked 2026-10-19; no invented toy artwork.
 const activity=HOME_ACTIVITY_VIDEOS.find(v=>v.youtubeUrl==='https://youtu.be/MuSFKcYkH_M');
 if(activity?.thumbnail)rows.push({id:'activity-easy-grip',category:'activity',name:{ar:activity.titleAr,en:activity.titleEn},description:{ar:'مكتبة الأنشطة',en:'Activity Library'},note:{ar:activity.descriptionAr.replace('من CRIT ','من معهد إعادة تأهيل الأطفال '),en:activity.descriptionEn},image:require("../assets/images/activities/crit-easy-grip.jpg"),fit:'contain',href:'/(tabs)/activity-library'});
 const product=HOME_PRODUCTS.find(p=>p.id==='p-3');
 const productImage=product && productIllustration(product.id);
 const category=PRODUCT_SUPPORT_CATEGORIES.find(c=>c.id===product?.supportCategories[0]);
 if(product && productImage && category)rows.push({id:product.id,category:'product',name:{ar:product.nameAr,en:product.nameEn},description:{ar:'المنتجات',en:'Products'},note:{ar:category.nameAr,en:category.nameEn},image:productImage,fit:'contain',href:{pathname:'/(tabs)/products/product-details',params:{id:product.id}}});
 return rows;
}


