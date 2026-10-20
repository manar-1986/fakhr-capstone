import api from "./axios";
export type SupportThread={id:string;subject:string;status:"open"|"closed";updatedAt:string};
export type SupportMessage={id:string;sender:"parent"|"admin";body:string;createdAt:string};
export type SupportDetail={id:string;subject:string;status:"open"|"closed";messages:SupportMessage[]};
export async function supportInbox(){let offset:number|null=0;const items:SupportThread[]=[];let mode:"parent"|"admin"="parent";while(offset!==null){const page=await api.get("/support",{params:{offset}}) as unknown as {mode:"parent"|"admin";items:SupportThread[];nextOffset:number|null};items.push(...page.items);mode=page.mode;if(page.nextOffset!==null&&page.nextOffset<=offset)throw Error("Invalid page");offset=page.nextOffset;}return {mode,items};}
export async function supportDetail(id:string){return await api.get("/support/"+id) as unknown as SupportDetail;}
export async function startSupport(input:{subject:string;body:string;requestId:string}){return await api.post("/support",input) as unknown as {id:string};}
export async function replySupport(id:string,input:{body:string;requestId:string}){await api.post(`/support/${id}/messages`,input);}
export async function reportSupport(id:string,reason:"privacy"|"abuse"|"other"){await api.post(`/support/${id}/report`,{reason});}
export async function deleteSupport(id:string){await api.delete(`/support/${id}`);}
