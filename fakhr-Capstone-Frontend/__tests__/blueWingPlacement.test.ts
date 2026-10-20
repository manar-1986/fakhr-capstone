import { isListedCenter, isPublicCenter } from "../utils/centerVisibility";
import { BLUE_WING_DOCTOR, BLUE_WING_INSTITUTION } from "../constants/blueWing";
import { PUBLIC_DOCTORS } from "../constants/approvedDoctors";
import { INSTITUTIONS, filterInstitutions, findInstitution } from "../utils/institutionDirectory";

test("Blue Wing is omitted only from Centers, preserving source and doctor identity",()=>{
  expect(isPublicCenter(BLUE_WING_INSTITUTION as any)).toBe(true);
  expect(isListedCenter(BLUE_WING_INSTITUTION as any)).toBe(false);
  expect(findInstitution(BLUE_WING_INSTITUTION.id)).toBe(BLUE_WING_INSTITUTION);
  expect(filterInstitutions(INSTITUTIONS,{})).not.toContain(BLUE_WING_INSTITUTION);
  expect(PUBLIC_DOCTORS.filter(d=>d.id===BLUE_WING_DOCTOR.id)).toEqual([BLUE_WING_DOCTOR]);
  expect(BLUE_WING_DOCTOR.clinic?.whatsapp?.url).toBe("https://wa.me/96569666041");
  expect(BLUE_WING_DOCTOR.clinic?.mapUrl).toBe("https://maps.app.goo.gl/RA3VhkwEQ4Ma2gYy7");
});
test.each(["Blue Wing Center","Blue Wing","BLUE WING CENTRE","مركز بلو وينج","مركز بلو وينغ"])("exact API name %s cannot reappear",name=>{
  expect(isListedCenter({id:"database-id",name})).toBe(false);
});
test("unrelated names remain visible",()=>{
  expect(isListedCenter({id:"other",name:"Blue Wing Other Center"})).toBe(true);
  expect(isListedCenter({id:"other",name:"Another Center"})).toBe(true);
});
