import {Platform} from 'react-native';
import * as Updates from 'expo-updates';
import {reloadForLayoutDirection, changeAppLanguage} from '../i18n';
jest.mock('expo-updates',()=>({reloadAsync:jest.fn().mockResolvedValue(undefined)}));
jest.mock('expo-localization',()=>({getLocales:()=>[]}));
jest.mock('../utils/secureStorage',()=>({getItemAsync:jest.fn().mockResolvedValue(null),setItemAsync:jest.fn()}));
const os=Platform.OS;
afterEach(()=>{Platform.OS=os;jest.clearAllMocks();delete (globalThis as any).window.location;});
test.each(['/reset-password','/forgot-password'])('web recovery %s never reloads away the token',async pathname=>{Platform.OS='web';(globalThis as any).window.location={pathname};await reloadForLayoutDirection();expect(Updates.reloadAsync).not.toHaveBeenCalled();});
test('other screens retain existing reload behavior',async()=>{Platform.OS='web';(globalThis as any).window.location={pathname:'/home'};await reloadForLayoutDirection();expect(Updates.reloadAsync).toHaveBeenCalledTimes(1);});

test('explicit recovery language change persists without reloading native or web forms',async()=>{await changeAppLanguage('en',false);expect(Updates.reloadAsync).not.toHaveBeenCalled();});
