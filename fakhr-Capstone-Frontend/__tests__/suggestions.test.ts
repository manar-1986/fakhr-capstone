import {categories,selectResources,rankResources,Resource} from '../utils/fakhrSuggestions';
const resource:Resource={id:'one',category:'activities',title:{ar:'تواصل',en:'Communication'},description:{ar:'مورد',en:'Resource'},source:'https://example.invalid',verifiedAt:null,status:'directory'};
test('all nine categories exist without a diagnosis input',()=>{expect(categories).toHaveLength(9);expect(rankResources([resource],{activities:'communication'})[0].id).toBe('one')});
test('saved, dismissed and search filters honor explicit choices',()=>{const state={resourceId:'one',revision:0,saved:true,dismissed:false,feedback:'',answers:{}};expect(selectResources([resource],'activities','communication',[state],true)).toHaveLength(1);expect(selectResources([resource],'activities','',[{...state,dismissed:true}],true)).toHaveLength(0);expect(selectResources([resource],'schools','',[])).toHaveLength(0)});

import {previewActivities} from '../utils/suggestionActivityPreview';
test('draft preview resolves exact shared duration and accessibility references without missing fields',()=>{const a=previewActivities(7);expect(a).toHaveLength(10);expect(a.every(x=>x.duration.ar&&x.duration.en&&x.adaptations.length===7&&x.steps.length>0)).toBe(true);expect(previewActivities(4)).toHaveLength(0);expect(previewActivities(11)).toHaveLength(10);expect(previewActivities(16)).toHaveLength(10)});
