import CenterProfileScreen from "../components/directory/CenterProfileScreen";
import { INSTITUTIONS, LEGACY_INSTITUTIONS, institutionDirectoryCategory } from "../utils/institutionDirectory";
import DoctorProfileScreen from "../components/directory/DoctorProfileScreen";
import React from "react";
import { fireEvent, render, waitFor, cleanup } from "@testing-library/react-native";
import { Linking, Platform } from "react-native";
import FatmaClinicContact from "../components/directory/FatmaClinicContact";
import HadeelClinicContact from "../components/directory/HadeelClinicContact";
import { findApprovedDoctor, APPROVED_DOCTORS } from "../constants/approvedDoctors";
import * as storage from "../utils/secureStorage";
import { localAppointmentTime } from "../utils/personalAppointmentCalendar";
let mockUser: { id: string } | null = null;
let mockRTL = false;
const mockPush = jest.fn();
jest.mock("expo-router", () => ({ useRouter: () => ({ push: mockPush }) }));
jest.mock("@expo/vector-icons", () => ({ Ionicons: "Icon" }));
jest.mock("../context/AuthContext", () => ({ useAuth: () => ({ user: mockUser }) }));
jest.mock("../hooks/useI18nLayout", () => ({ useI18nLayout: () => ({ isRTL: mockRTL, align: mockRTL ? "right" : "left", dir: mockRTL ? "rtl" : "ltr" }) }));
jest.mock("../api/children.api", () => ({ getChildren: jest.fn() }));
jest.mock("@tanstack/react-query", () => ({ useQuery: () => ({ data: [{ id: "registered-child-id", name: "Existing Child" }], isError: false }) }));
jest.mock("../utils/secureStorage", () => ({ getItemAsync: jest.fn().mockResolvedValue(null), setItemAsync: jest.fn().mockResolvedValue(undefined) }));
const doctor = findApprovedDoctor("doctor-fatima-al-awadhi")!;
test.each(["ios", "android", "web"] as const)("%s Hadeel exact links, two original photos and guest calendar", async os => {
  const original = Platform.OS; Object.defineProperty(Platform, "OS", { configurable: true, value: os });
  const open = jest.spyOn(Linking, "openURL").mockResolvedValue(undefined);
  try { for (const rtl of [true, false]) {
    mockRTL = rtl; mockUser = null;
    const hadeel = findApprovedDoctor("doctor-hadeel-yassin-faras")!;
    expect(hadeel.nameAr).toBe("د. هديل فرس"); expect(hadeel.nameEn).toBe("Dr. Hadeel Faras"); expect(hadeel.clinic?.address).toBeUndefined();
    const ui = render(<HadeelClinicContact doctor={hadeel} />);
    expect(ui.getAllByLabelText(rtl ? /^تكبير:/ : /^Enlarge:/)).toHaveLength(2);
    for (const [label, url] of [[rtl ? "اتصال بالعيادة" : "Call Clinic", "tel:22286547"], [rtl ? "تواصل عبر واتساب" : "Contact via WhatsApp", "https://wa.me/96599670739"], ["@dr.hadeel.faras.clinic", "https://www.instagram.com/dr.hadeel.faras.clinic/"], [rtl ? "فتح الموقع في Google Maps" : "Open in Google Maps", "https://maps.app.goo.gl/g4asgvEuRzJxeoE86"]]) {
      const link = ui.getByLabelText(label); if (os === "web") expect(link.props.href).toBe(url); else { fireEvent.press(link); await waitFor(() => expect(open).toHaveBeenLastCalledWith(url)); }
    }
    fireEvent.press(ui.getByText(rtl ? "إضافة موعد للتقويم" : "Add Appointment to Calendar"));
    expect(ui.getByLabelText(rtl ? "التاريخ (YYYY-MM-DD)" : "Date (YYYY-MM-DD)")).toBeTruthy();
    expect(mockPush).not.toHaveBeenCalled(); ui.unmount();
  }} finally { open.mockRestore(); Object.defineProperty(Platform, "OS", { configurable: true, value: original }); }
});
afterEach(() => { cleanup(); jest.clearAllMocks(); });
test("same identity and exact clinic contact; no new doctor", () => {
  expect(APPROVED_DOCTORS).toHaveLength(28);
  expect(APPROVED_DOCTORS.filter(d => d.id === doctor.id)).toEqual([doctor]);
  expect(doctor.clinic?.phone).toBe("60009762");
  expect(localAppointmentTime("2030-01-02", "10:00")?.getHours()).toBe(10);
  expect(localAppointmentTime("2030-02-30", "10:00")).toBeNull();
  expect(localAppointmentTime("2030-01-02", "25:00")).toBeNull();
});
test.each(["ios", "android", "web"] as const)("%s: links, photos, and guest gate", async os => {
  const original = Platform.OS; Object.defineProperty(Platform, "OS", { configurable: true, value: os });
  const open = jest.spyOn(Linking, "openURL").mockResolvedValue(undefined);
  try { for (const rtl of [false, true]) {
    mockRTL = rtl; mockUser = null;
    const ui = render(<FatmaClinicContact doctor={doctor} />);
    for (const [label, url] of [[rtl ? "اتصال" : "Call", "tel:60009762"], [rtl ? "فتح في خرائط Google" : "Open in Google Maps", doctor.clinic!.mapUrl], ["@fatmaclinic", doctor.clinic!.instagram!]]) {
      const button = ui.getByLabelText(label);
      if (os === "web") expect(button.props.href).toBe(url);
      else { fireEvent.press(button); await waitFor(() => expect(open).toHaveBeenLastCalledWith(url)); }
    }
    expect(ui.getAllByLabelText(rtl ? /^تكبير:/ : /^Enlarge:/)).toHaveLength(3);
    fireEvent.press(ui.getAllByLabelText(rtl ? /^تكبير:/ : /^Enlarge:/)[1]);
    fireEvent.press(ui.getByLabelText(rtl ? "إغلاق الصورة" : "Close image"));
    fireEvent.press(ui.getByText(rtl ? "إضافة موعد للتقويم" : "Add Appointment to Calendar"));
    expect(ui.queryByText(rtl ? "حفظ مسودة الطلب" : "Save request draft")).toBeNull();
    expect(ui.getByLabelText(rtl ? "التاريخ (YYYY-MM-DD)" : "Date (YYYY-MM-DD)")).toBeTruthy();
    expect(mockPush).not.toHaveBeenCalled();
    expect(storage.setItemAsync).not.toHaveBeenCalled(); ui.unmount();
  }} finally { open.mockRestore(); Object.defineProperty(Platform, "OS", { configurable: true, value: original }); }
});

test.each(["ios", "android", "web"] as const)("%s: redesigned profile preserves context, tabs, gallery and guest calendar", os => {
  const original = Platform.OS;
  Object.defineProperty(Platform, "OS", { configurable: true, value: os });
  try { for (const rtl of [true, false]) {
    mockRTL = rtl;
    for (const id of ["doctor-hadeel-yassin-faras", "doctor-fatima-al-awadhi"]) {
      const current = findApprovedDoctor(id)!;
      const ui = render(<DoctorProfileScreen doctor={current}/>);
      const isHadeel = id === "doctor-hadeel-yassin-faras";
      expect(ui.getAllByRole("tab")).toHaveLength(2);
      if (isHadeel) {
        expect(ui.getByText(rtl ? "استشاري طب أطفال تطوري – بورد كندي وأمريكي" : "Consultant in Developmental Pediatrics – Canadian and American Board Certified")).toBeTruthy();
        expect(ui.queryByText(rtl ? "المؤهلات" : "Qualifications")).toBeNull();
        expect(ui.queryByText(rtl ? "الخدمات" : "Services")).toBeNull();
      } else {
        expect(ui.getByText(rtl ? "د. فاطمة العوضي، استشارية طب الأطفال التطوري، متخصصة في طب الأطفال التطوري." : "Dr. Fatma Al-Awadhi is a Consultant Developmental Pediatrician specializing in developmental pediatrics.")).toBeTruthy();
        expect(ui.queryByText(rtl ? "المؤهلات" : "Qualifications")).toBeNull();
        expect(ui.queryByText(rtl ? "الخدمات" : "Services")).toBeNull();
      }
      expect(ui.getByText(rtl ? current.nameAr : current.nameEn)).toBeTruthy();
      expect(ui.getAllByLabelText(rtl ? /^تكبير:/ : /^Enlarge:/)).toHaveLength(id.includes("hadeel") ? 2 : 3);
      expect(ui.getByText(rtl ? current.nameAr : current.nameEn)).toBeTruthy();
      fireEvent.press(ui.getByRole("tab", { name: rtl ? "الموقع" : "Location" }));
      expect(ui.getByText(rtl ? "الموقع والتواصل" : "Location & Contact")).toBeTruthy();
      fireEvent.press(ui.getByText(rtl ? "إضافة موعد للتقويم" : "Add Appointment to Calendar"));
      expect(ui.getByLabelText(rtl ? "التاريخ (YYYY-MM-DD)" : "Date (YYYY-MM-DD)")).toBeTruthy();
      fireEvent.press(ui.getByRole("tab", { name: rtl ? "نبذة" : "Overview" }));
      expect(ui.getByLabelText(rtl ? "التاريخ (YYYY-MM-DD)" : "Date (YYYY-MM-DD)")).toBeTruthy();
      ui.unmount();
    }
  }} finally { Object.defineProperty(Platform, "OS", { configurable: true, value: original }); }
});

test("other doctors retain their Qualifications and Services sections", () => {
  mockRTL = false;
  const ui = render(<DoctorProfileScreen doctor={findApprovedDoctor("doctor-nahed-al-ateeqi")!}/>);
  expect(ui.getAllByRole("tab")).toHaveLength(3);
  expect(ui.getByText("Qualifications")).toBeTruthy();
  fireEvent.press(ui.getByRole("tab", {name:"Services"}));
  expect(ui.getByText("No service list is available for this clinic yet. Contact the clinic for details.")).toBeTruthy();
});

test.each(["ios", "android", "web"] as const)("%s: Mohammed existing identity, bilingual contact links and guest calendar", async os => {
  const original = Platform.OS;
  Object.defineProperty(Platform, "OS", {configurable:true,value:os});
  const open = jest.spyOn(Linking,"openURL").mockResolvedValue(undefined);
  try { for (const rtl of [true,false]) {
    mockRTL=rtl;
    const current=findApprovedDoctor("doctor-mohammed-almuhtab")!;
    expect(APPROVED_DOCTORS.filter(d=>d.id===current.id)).toHaveLength(1);
    expect(APPROVED_DOCTORS).toHaveLength(28);
    expect(current.clinic?.whatsapp).toBeUndefined();
    const ui=render(<DoctorProfileScreen doctor={current}/>);
    expect(ui.getByText(rtl?"د. محمد المحطب":"Dr. Mohammed Al-Muhtab")).toBeTruthy();
    expect(ui.getByText(current.suppliedBiography![rtl?"ar":"en"])).toBeTruthy();
    expect(ui.getAllByRole("tab")).toHaveLength(2);
    expect(ui.queryByText(rtl?"المؤهلات":"Qualifications")).toBeNull();
    expect(ui.queryAllByLabelText(rtl?/^تكبير:/:/^Enlarge:/)).toHaveLength(0);
    for(const [label,url] of [[rtl?"اتصال":"Call","tel:1808111"],[rtl?"اتصال بالرقم الإضافي":"Call Additional Number","tel:55885566"],["@dr_almuhtab","https://www.instagram.com/dr_almuhtab/"],[rtl?"فتح الموقع في Google Maps":"Open in Google Maps","https://maps.app.goo.gl/2DvBC13b9ThH2VcXA"]]) {
      const link=ui.getByLabelText(label);
      if(os==="web") expect(link.props.href).toBe(url);
      else {fireEvent.press(link);await waitFor(()=>expect(open).toHaveBeenLastCalledWith(url));}
    }
    fireEvent.press(ui.getByText(rtl?"إضافة موعد للتقويم":"Add Appointment to Calendar"));
    expect(ui.getByLabelText(rtl?"التاريخ (YYYY-MM-DD)":"Date (YYYY-MM-DD)")).toBeTruthy();
    ui.unmount();
  }} finally {open.mockRestore();Object.defineProperty(Platform,"OS",{configurable:true,value:original});}
});

test.each(["ios", "android", "web"] as const)("%s: Ahmed qualifications, original image and contact destinations", async os => {
  const original=Platform.OS; Object.defineProperty(Platform,"OS",{configurable:true,value:os});
  const open=jest.spyOn(Linking,"openURL").mockResolvedValue(undefined);
  try {for(const rtl of [true,false]) {
    mockRTL=rtl; const current=findApprovedDoctor("doctor-ahmed-al-tamimi")!;
    expect(APPROVED_DOCTORS.filter(d=>d.id===current.id)).toHaveLength(1);
    expect(APPROVED_DOCTORS).toHaveLength(28);
    const ui=render(<DoctorProfileScreen doctor={current}/>);
    expect(ui.getByLabelText("Dr. Ahmed Al-Tamimi portrait")).toBeTruthy();
    expect(ui.getAllByRole("tab")).toHaveLength(2);
    expect(ui.queryByText(rtl?"المؤهلات":"Qualifications")).toBeNull();
    expect(ui.queryByText(rtl?"الخدمات":"Services")).toBeNull();
    expect(ui.getByRole("header",{name:rtl?"عن الطبيب":"About the Doctor"})).toBeTruthy();
    for(const qualification of current.suppliedQualifications![rtl?"ar":"en"]) expect(ui.getByText(qualification)).toBeTruthy();
    expect(ui.getByText("B.Med.Sci (Dent), BDM, MFDS RCS (Ed), DPaedDent, FFD RCSI (Paed Dent).")).toBeTruthy();
    expect(ui.queryAllByLabelText(rtl?/^تكبير:/:/^Enlarge:/)).toHaveLength(0);
    for(const [label,url] of [[rtl?"اتصال":"Call","tel:1881122"],[rtl?"فتح الموقع":"Open Location","https://maps.app.goo.gl/ndCUFr3rjJNvvBTKA"],["@drahmedaltimimi","https://www.instagram.com/drahmedaltimimi/"]]) {
      const link=ui.getByLabelText(label);if(os==="web")expect(link.props.href).toBe(url);else{fireEvent.press(link);await waitFor(()=>expect(open).toHaveBeenLastCalledWith(url));}
    }
    fireEvent.press(ui.getByText(rtl?"إضافة موعد للتقويم":"Add Appointment to Calendar"));
    expect(ui.getByLabelText(rtl?"التاريخ (YYYY-MM-DD)":"Date (YYYY-MM-DD)")).toBeTruthy();ui.unmount();
  }} finally {open.mockRestore();Object.defineProperty(Platform,"OS",{configurable:true,value:original});}
});

test.each(["ios", "android", "web"] as const)("%s: Dalal supplied biography, hospital links and guest calendar", async os => {
  const original=Platform.OS;Object.defineProperty(Platform,"OS",{configurable:true,value:os});
  const open=jest.spyOn(Linking,"openURL").mockResolvedValue(undefined);
  try {for(const rtl of [true,false]) {
    mockRTL=rtl;const current=findApprovedDoctor("doctor-dalal-alsubaie")!;
    expect(APPROVED_DOCTORS).toHaveLength(28);expect(APPROVED_DOCTORS.filter(d=>d.id===current.id)).toHaveLength(1);
    expect(current.clinic?.instagram).toBeUndefined();expect(current.suppliedAboutItems?.independentlyVerified).toBe(false);
    const ui=render(<DoctorProfileScreen doctor={current}/>);
    expect(ui.getByLabelText("Dr. Dalal Al-Subaie portrait")).toBeTruthy();
    expect(ui.getAllByRole("tab")).toHaveLength(2);
    expect(ui.queryByText(rtl?"المؤهلات":"Qualifications")).toBeNull();expect(ui.queryByText(rtl?"الخدمات":"Services")).toBeNull();
    for(const item of current.suppliedAboutItems![rtl?"ar":"en"])expect(ui.getByText("• "+item)).toBeTruthy();
    for(const [label,url] of [[rtl?"اتصال بالمستشفى":"Call Hospital","tel:1830003"],[rtl?"فتح الموقع في Google Maps":"Open in Google Maps","https://maps.app.goo.gl/6F4yskuFGoYspmfs8"]]) {
      const link=ui.getByLabelText(label);if(os==="web")expect(link.props.href).toBe(url);else{fireEvent.press(link);await waitFor(()=>expect(open).toHaveBeenLastCalledWith(url));}
    }
    expect(ui.getAllByRole("link")).toHaveLength(2);
    fireEvent.press(ui.getByText(rtl?"إضافة موعد للتقويم":"Add Appointment to Calendar"));
    expect(ui.getByLabelText(rtl?"التاريخ (YYYY-MM-DD)":"Date (YYYY-MM-DD)")).toBeTruthy();ui.unmount();
  }} finally {open.mockRestore();Object.defineProperty(Platform,"OS",{configurable:true,value:original});}
});

test.each(["ios","android","web"] as const)("%s: Blue Wing guest links and calendar without invented phone or gallery", async os=>{
 const original=Platform.OS;Object.defineProperty(Platform,"OS",{configurable:true,value:os});const open=jest.spyOn(Linking,"openURL").mockResolvedValue(undefined);
 try{for(const rtl of [true,false]){mockRTL=rtl;const d=findApprovedDoctor("doctor-dalal-sulaiman-al-shayji")!;const ui=render(<DoctorProfileScreen doctor={d}/>);
 expect(ui.getAllByRole("tab")).toHaveLength(2);expect(d.clinic?.phone).toBeUndefined();expect(ui.queryAllByLabelText(rtl?/^تكبير:/:/^Enlarge:/)).toHaveLength(0);
 for(const [label,url] of [[rtl?"تواصل عبر واتساب":"Contact via WhatsApp","https://wa.me/96569666041"],[rtl?"فتح الموقع في Google Maps":"Open in Google Maps","https://maps.app.goo.gl/RA3VhkwEQ4Ma2gYy7"]]){const link=ui.getByLabelText(label);if(os==="web")expect(link.props.href).toBe(url);else{fireEvent.press(link);await waitFor(()=>expect(open).toHaveBeenLastCalledWith(url));}}
 fireEvent.press(ui.getByText(rtl?"إضافة موعد للتقويم":"Add Appointment to Calendar"));expect(ui.getByLabelText(rtl?"التاريخ (YYYY-MM-DD)":"Date (YYYY-MM-DD)")).toBeTruthy();ui.unmount();}}
 finally{open.mockRestore();Object.defineProperty(Platform,"OS",{configurable:true,value:original});}
});

test.each(["ios", "android", "web"] as const)("%s center profiles reuse clinic tabs and omit all research metadata", os => {
  const original = Platform.OS; Object.defineProperty(Platform, "OS", { configurable: true, value: os });
  try { for (const rtl of [true,false]) { mockRTL=rtl;
    for (const item of [...INSTITUTIONS,...LEGACY_INSTITUTIONS].filter(i=>i.categories.includes("rehabilitation"))) {
      const before=JSON.stringify(item);const ui=render(<CenterProfileScreen item={item}/>);
      expect(ui.getByText(rtl?"تفاصيل المركز":"Center Details")).toBeTruthy();
      expect(ui.getAllByRole("tab")).toHaveLength(2);
      for(const note of item.reviewNotesAr) expect(ui.queryByText(note)).toBeNull();
      expect(ui.queryByText(/بيانات مرجعية|تفاصيل المصادر|Reference data|Source details/)).toBeNull();
      fireEvent.press(ui.getByRole("tab",{name:rtl?"الموقع":"Location"}));
      fireEvent.press(ui.getByRole("tab",{name:rtl?"نبذة":"About"}));
      if(item.id==="kw-autism-kuwait") { expect(ui.getByLabelText(rtl?"اتصال بالمركز":"Call Center")).toBeTruthy(); expect(ui.getByLabelText(rtl?"فتح الموقع في Google Maps":"Open in Google Maps")).toBeTruthy(); }
      expect(JSON.stringify(item)).toBe(before);ui.unmount();
    }
  }} finally {Object.defineProperty(Platform,"OS",{configurable:true,value:original});}
});
