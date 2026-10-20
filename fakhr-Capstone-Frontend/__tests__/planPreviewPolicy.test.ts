import {planFixturesEnabled} from '../utils/planPreviewPolicy';
test('normal application never receives fixtures from the web harness flag alone',()=>{expect(planFixturesEnabled(true,'true',undefined)).toBe(false);expect(planFixturesEnabled(true,undefined,undefined)).toBe(false)});
test('fixtures require explicit isolated development consent',()=>{expect(planFixturesEnabled(true,'true','true')).toBe(true);expect(planFixturesEnabled(true,'false','true')).toBe(false);expect(planFixturesEnabled(false,'true','true')).toBe(false)});
