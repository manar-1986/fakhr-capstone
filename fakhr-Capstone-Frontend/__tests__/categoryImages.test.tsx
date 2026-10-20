import React from "react";
import {render,fireEvent} from "@testing-library/react-native";
import CategoryInstitutionImage from "../components/directory/CategoryInstitutionImage";
import {categoryContent,CATEGORY_PRODUCT_TAGS} from '../utils/disabilityContent';
import {doctorImageAsset} from '../components/directory/DoctorVisuals';
import {institutionImages} from '../components/directory/InstitutionImage';
import fs from 'fs';
import path from 'path';
test('audit category directory images and asset paths',()=>{
 const institutions=new Map(Object.keys(CATEGORY_PRODUCT_TAGS).flatMap(id=>{const d=categoryContent(id);return [...d.centers,...d.education].map(x=>[x.id,x] as const);}));
 const doctors=new Map(Object.keys(CATEGORY_PRODUCT_TAGS).flatMap(id=>categoryContent(id).professionals.map(x=>[x.id,x] as const)));
 for(const item of institutions.values())if(item.mainImage)expect(institutionImages[item.mainImage]).toBeTruthy();
 for(const file of ['../components/directory/InstitutionImage.tsx','../components/directory/DoctorVisuals.tsx']){
 const source=path.resolve(__dirname,file);for(const match of fs.readFileSync(source,'utf8').matchAll(/require\("([^"]+)"\)/g)) expect(fs.existsSync(path.resolve(path.dirname(source),match[1]))).toBe(true);
 }
});

for(const isRTL of [true,false]) test.each(Object.keys(CATEGORY_PRODUCT_TAGS))(`${isRTL?'ar':'en'} %s renders exact mapped images or labeled placeholders`,id=>{
 const d=categoryContent(id);
 for(const item of [...d.education,...d.centers]){
  const screen=render(<CategoryInstitutionImage item={item} isRTL={isRTL}/>);
  if(item.mainImage){
   expect(screen.getByTestId(`category-image-${item.id}`).props.source).toBe(institutionImages[item.mainImage]);
   fireEvent(screen.getByTestId(`category-image-${item.id}`),'error');
  }
  expect(screen.getByTestId(`category-placeholder-${item.id}`)).toBeTruthy();
  expect(screen.getByText(isRTL?'الصورة غير متوفرة':'Image unavailable')).toBeTruthy();
  screen.unmount();
 }
});
