/** Fixtures require a separate, explicit opt-in and the network-isolated development harness. */
export function planFixturesEnabled(development:boolean,isolatedHarness?:string,fixtures?:string){return development&&isolatedHarness==='true'&&fixtures==='true'}
