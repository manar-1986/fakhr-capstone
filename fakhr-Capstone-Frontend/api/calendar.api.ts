import api from "./axios";
export type EventCategory = "therapy"|"doctor"|"center"|"school"|"home"|"education"|"reminder";
export type CalendarInput = {title:string;date:string;startTime:string;endTime?:string;timezone:string;category:EventCategory;notes:string;status:"scheduled"|"completed"};
export type CalendarEvent = CalendarInput & {id:string;childId:string;revision:number};
export const listCalendarEvents = async(childId:string,from:string,to:string):Promise<CalendarEvent[]> => (await api.get("/calendar-events",{params:{childId,from,to}}) as unknown as {events:CalendarEvent[]}).events;
export const createCalendarEvent = async(input:CalendarInput & {childId:string;requestId:string}):Promise<CalendarEvent> => (await api.post("/calendar-events",input) as unknown as {event:CalendarEvent}).event;
export const updateCalendarEvent = async(id:string,input:CalendarInput & {revision:number}):Promise<CalendarEvent> => (await api.put("/calendar-events/"+id,input) as unknown as {event:CalendarEvent}).event;
export const deleteCalendarEvent = async(id:string,revision:number) => {await api.delete("/calendar-events/"+id,{params:{revision}});};
export const eventInput = (e:CalendarEvent):CalendarInput => ({title:e.title,date:e.date,startTime:e.startTime,endTime:e.endTime,timezone:e.timezone,category:e.category,notes:e.notes,status:e.status});
