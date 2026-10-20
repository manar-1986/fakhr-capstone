jest.mock('expo-calendar',()=>({}));jest.mock('expo-secure-store',()=>({}));
import {personalEventICS,savePersonalEvent} from '../utils/personalAppointmentCalendar';
const event={identity:'synthetic-account:synthetic-child',appointmentId:'synthetic-event-1',name:'Fakhr personal appointment',notes:'',start:new Date('2030-10-20T10:00:00Z')};
test('explicit duration is preserved and private child/medical fields are absent',()=>{const content=personalEventICS({...event,end:new Date('2030-10-20T11:15:00Z')});expect(content).toContain('DTEND:20301020T111500Z');expect(content).toContain('Personal reminder');expect(content).not.toContain('Medication');expect(content).not.toContain('Child name')});
test('older exports retain 30 minute default',()=>expect(personalEventICS(event)).toContain('DTEND:20301020T103000Z'));
test('invalid end fails before export',async()=>{await expect(savePersonalEvent({...event,end:new Date('2030-10-20T09:00:00Z')})).rejects.toThrow('date')});
