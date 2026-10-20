import { PUBLIC_DOCTORS } from "../constants/approvedDoctors";
import { directorySpecialty } from "../components/directory/DoctorVisuals";
import { doctorSpecialtyOptions, doctorVisibleSpecialtyOptions, doctorSpecialtyIds, filterDirectoryDoctors } from "../utils/doctorSpecialtyFilters";
test("every active specialty has one bilingual option and exact matching doctors", () => {
 const options = doctorSpecialtyOptions();
 expect(new Set(options.map(o=>o.key)).size).toBe(options.length);
 expect(options.map(o=>o.key).sort()).toEqual([...new Set(PUBLIC_DOCTORS.flatMap(doctorSpecialtyIds))].sort());
 for(const option of options){
  expect(option.ar).toBeTruthy(); expect(option.en).toBeTruthy();
  const expected=PUBLIC_DOCTORS.filter(d=>doctorSpecialtyIds(d).includes(option.key));
  expect(filterDirectoryDoctors(PUBLIC_DOCTORS,option.key,"")).toEqual(expected);
  for(const doctor of expected) for(const name of [doctor.nameAr,doctor.nameEn]) expect(filterDirectoryDoctors(PUBLIC_DOCTORS,option.key,name)).toContain(doctor);
 }
 expect(filterDirectoryDoctors(PUBLIC_DOCTORS,"all","")).toEqual(PUBLIC_DOCTORS);
 expect(filterDirectoryDoctors(PUBLIC_DOCTORS,"dentistry","Hadeel")).toEqual([]);
});
test("explicit multiple specialty IDs match either filter without duplicate options or records",()=>{
 const doctor={...PUBLIC_DOCTORS[0],specialtyIds:["pediatrics","neurology","pediatrics"] as const};
 expect(doctorSpecialtyIds(doctor)).toHaveLength(3);
 expect(doctorSpecialtyOptions([doctor])).toHaveLength(3);
 for(const id of doctorSpecialtyIds(doctor)) expect(filterDirectoryDoctors([doctor],id,"")).toEqual([doctor]);
});


test("only the general orthopedic filter is hidden, without changing membership or search",()=>{
 const all=doctorSpecialtyOptions();
 expect(doctorVisibleSpecialtyOptions()).toEqual(all.filter(o=>o.key!=="orthopedic-surgery"));
 expect(doctorVisibleSpecialtyOptions().some(o=>o.key==="pediatric-orthopedics")).toBe(true);
 const general={...PUBLIC_DOCTORS[0],id:"general-orthopedic-test",group:"orthopedic-surgery" as const,specialtyIds:undefined};
 expect(doctorSpecialtyOptions([general]).map(o=>o.key)).toEqual(["orthopedic-surgery"]);
 expect(doctorVisibleSpecialtyOptions([general])).toEqual([]);
 expect(filterDirectoryDoctors([general],"all","")).toEqual([general]);
 for(const name of [general.nameAr,general.nameEn]) expect(filterDirectoryDoctors([general],"all",name)).toEqual([general]);
 expect(filterDirectoryDoctors([general],"pediatric-orthopedics","")).toEqual([]);
 expect(filterDirectoryDoctors(PUBLIC_DOCTORS,"all","")).toEqual(PUBLIC_DOCTORS);
});
