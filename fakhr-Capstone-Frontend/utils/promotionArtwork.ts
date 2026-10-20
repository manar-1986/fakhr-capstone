import type {HomeCarouselRecord} from './homeCarouselRecords';
/** Banner-only artwork; detail-page assets and source records are never replaced. */
export function promotionArtwork(ad:HomeCarouselRecord){
 if(ad.id==='doctor-hadeel-yassin-faras')return require('../assets/images/hadeel-clinic/portrait-cutout-review.png');
 if(ad.id==='kw-s-hope')return require('../assets/images/schools/hope-banner-cutout.png');
 if(ad.id==='p-3')return require('../assets/images/product-3-banner-cutout.png');
 return ad.image;
}
