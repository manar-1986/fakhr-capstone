import api from './axios';import {SuggestionState} from '../utils/fakhrSuggestions';
export const readSuggestionStates=async(childId:string)=>await api.get('/plan-dashboard/suggestions',{params:{childId}}) as unknown as {records:SuggestionState[]};
export const saveSuggestionState=async(childId:string,state:SuggestionState)=>await api.put('/plan-dashboard/suggestions',{childId,resourceId:state.resourceId,revision:state.revision,saved:state.saved,dismissed:state.dismissed,feedback:state.feedback,answers:state.answers}) as unknown as {record:SuggestionState};
