import React from "react";
import { Platform } from "react-native";
import { render, fireEvent, waitFor, cleanup } from "@testing-library/react-native";
import PersonalAppointment from "../components/directory/PersonalAppointment";
import { openCenterCalendarDraft } from "../utils/addAppointmentToCalendar";
import { savePersonalEvent } from "../utils/personalAppointmentCalendar";
import * as Calendar from "expo-calendar";
jest.mock("expo-calendar", () => ({ createEventInCalendarAsync: jest.fn() }));
jest.mock("../hooks/useI18nLayout", () => ({ useI18nLayout: () => ({isRTL:false,align:"left",dir:"ltr"}) }));
jest.mock("../utils/personalAppointmentCalendar", () => ({
  ...jest.requireActual("../utils/personalAppointmentCalendar"), savePersonalEvent: jest.fn().mockResolvedValue({status:"exported"}),
}));
const original = Platform.OS;
afterEach(() => {cleanup();jest.clearAllMocks();Object.defineProperty(Platform,"OS",{value:original,configurable:true});});
test.each(["ios","android"])("%s requests date and calendar confirmation without opening an unmanaged draft", os=>{
 Object.defineProperty(Platform,"OS",{value:os,configurable:true});const ui=render(<PersonalAppointment center identity="center-test" name="Center"/>);
 fireEvent.press(ui.getByRole("button",{name:"Add Appointment to Calendar"}));expect(ui.getByLabelText("Date (YYYY-MM-DD)").props.value).toBe("");expect(Calendar.createEventInCalendarAsync).not.toHaveBeenCalled();expect(savePersonalEvent).not.toHaveBeenCalled();
});
test("native draft falls back to supplied Maps location",async()=>{
  (Calendar.createEventInCalendarAsync as jest.Mock).mockResolvedValue({action:"saved"});
  await openCenterCalendarDraft({name:"Center",mapUrl:"https://maps.app.goo.gl/test"});
  expect(Calendar.createEventInCalendarAsync).toHaveBeenCalledWith(expect.objectContaining({location:"https://maps.app.goo.gl/test"}));
});
test("web requires user-entered date/time and confirmation, retaining center details",async()=>{
  Object.defineProperty(Platform,"OS",{value:"web",configurable:true});
  const ui=render(<PersonalAppointment center identity="center-test" name="Center" address="Address" mapUrl="https://maps.app.goo.gl/test"/>);
  fireEvent.press(ui.getByRole("button",{name:"Add Appointment to Calendar"}));
  expect(ui.getByLabelText("Center name").props.value).toBe("Center");
  fireEvent.press(ui.getByRole("button",{name:"Confirm & Download Calendar File"}));
  expect(savePersonalEvent).not.toHaveBeenCalled();
  fireEvent.changeText(ui.getByLabelText("Date (YYYY-MM-DD)"),"2099-11-10");
  fireEvent.changeText(ui.getByLabelText("Time (HH:mm)"),"10:30");
  expect(savePersonalEvent).not.toHaveBeenCalled();
  fireEvent.press(ui.getByRole("button",{name:"Confirm & Download Calendar File"}));
  await waitFor(()=>expect(savePersonalEvent).toHaveBeenCalledWith(expect.objectContaining({name:"Center",address:"Address",mapUrl:"https://maps.app.goo.gl/test",start:expect.any(Date)}),""));
});
