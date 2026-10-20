const {getDefaultConfig}=require('expo/metro-config');
const fs=require('fs');const path=require('path');
const config=getDefaultConfig(__dirname);
if(process.env.EXPO_PUBLIC_SMART_PLAN_PREVIEW==='true'){
 const modules=fs.realpathSync(path.join(__dirname,'node_modules'));
 const fallback=process.env.FAKHR_LOCAL_MODULES_FALLBACK;
 const modulePaths=[modules,...(fallback?[path.resolve(fallback)]:[])];
 config.watchFolders=modulePaths;
 const previous=config.resolver.resolveRequest;
 config.resolver.resolveRequest=(context,name,platform)=>name==='expo-router/_ctx'?{filePath:path.join(__dirname,'preview-router-context.js'),type:'sourceFile'}:previous?previous(context,name,platform):context.resolveRequest(context,name,platform);
 config.resolver.nodeModulesPaths=modulePaths;
 config.resolver.extraNodeModules={react:path.join(modules,'react'),'react-native':path.join(modules,'react-native'),'react-native-web':path.join(modules,'react-native-web')};
}
module.exports=config;
