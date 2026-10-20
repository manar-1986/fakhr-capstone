// Native configuration is unchanged. This opt-in local web preview needs no native notification plugin.
module.exports=({config})=>({...config,plugins:process.env.EXPO_PUBLIC_SMART_PLAN_PREVIEW==='true'?config.plugins.filter(p=>(Array.isArray(p)?p[0]:p)!=='expo-notifications'):config.plugins});
