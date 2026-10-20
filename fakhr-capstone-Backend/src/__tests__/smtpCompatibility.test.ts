import net from 'net';
import nodemailer from 'nodemailer';
import { AddressInfo } from 'net';
async function fakeSMTP(mode:'ok'|'auth-fail'|'recipient-fail'|'slow'='ok', requireTLS=false) {
 const messages:string[]=[];const commands:string[]=[];const sockets=new Set<net.Socket>();
 const server=net.createServer(socket=>{
  sockets.add(socket);socket.on('close',()=>sockets.delete(socket));socket.on('error',()=>{});
  if(mode==='slow')return;
  socket.write('220 mock.invalid ESMTP\r\n');let buffer='',data=false,message='';
  socket.on('data',chunk=>{buffer+=chunk.toString();let i;while((i=buffer.indexOf('\r\n'))>=0){const line=buffer.slice(0,i);buffer=buffer.slice(i+2);
   if(data){if(line==='.') {data=false;messages.push(message);socket.write('250 queued synthetic\r\n');}else message+=line+'\r\n';continue;}
   commands.push(line.split(' ')[0]);
   if(/^EHLO|^HELO/.test(line))socket.write('250-mock.invalid\r\n250 AUTH PLAIN\r\n');
   else if(line==='STARTTLS')socket.write('502 TLS not supported by mock\r\n');
   else if(/^AUTH/.test(line))socket.write(mode==='auth-fail'?'535 authentication rejected\r\n':'235 authenticated\r\n');
   else if(/^MAIL FROM/.test(line))socket.write('250 sender accepted\r\n');
   else if(/^RCPT TO/.test(line))socket.write(mode==='recipient-fail'?'550 recipient rejected\r\n':'250 recipient accepted\r\n');
   else if(line==='DATA'){data=true;socket.write('354 end with dot\r\n');}
   else if(line==='QUIT'){socket.end('221 goodbye\r\n');}
   else socket.write('250 OK\r\n');
  }});
 });
 await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
 const transport=nodemailer.createTransport({host:'127.0.0.1',port:(server.address() as AddressInfo).port,secure:false,ignoreTLS:!requireTLS,requireTLS,auth:{user:'synthetic-only',pass:'synthetic-only'},connectionTimeout:1000,greetingTimeout:200,socketTimeout:1000,disableFileAccess:true,disableUrlAccess:true});
 return {transport,messages,commands,close:async()=>{transport.close();for(const s of sockets)s.destroy();await new Promise<void>(resolve=>server.close(()=>resolve()));}};
}
describe('Nodemailer 10.1.1 loopback mock SMTP protocol',()=>{
 it('verifies SMTP authentication and submits reset text and HTML',async()=>{const mock=await fakeSMTP();try{
  expect(await mock.transport.verify()).toBe(true);
  const result=await mock.transport.sendMail({from:'Fakhr <sender@example.invalid>',to:{name:'',address:'parent@example.invalid'},subject:'Password Reset Request - Fakhr',text:'Synthetic reset link',html:'<p>Synthetic reset link</p>'});
  expect(result.accepted).toEqual(['parent@example.invalid']);expect(mock.messages).toHaveLength(1);expect(mock.messages[0]).toContain('multipart/alternative');expect(mock.commands).toContain('AUTH');
 }finally{await mock.close();}});
 it('rejects a server without STARTTLS when TLS is required',async()=>{const mock=await fakeSMTP('ok',true);try{
  await expect(mock.transport.sendMail({from:'sender@example.invalid',to:'parent@example.invalid',text:'Synthetic'})).rejects.toBeDefined();expect(mock.messages).toHaveLength(0);expect(mock.commands).not.toContain('AUTH');
 }finally{await mock.close();}});
 it.each(['auth-fail','recipient-fail','slow'] as const)('bounds and propagates %s failure',async mode=>{const mock=await fakeSMTP(mode);try{
  await expect(mock.transport.sendMail({from:'sender@example.invalid',to:'parent@example.invalid',text:'Synthetic'})).rejects.toBeDefined();expect(mock.messages).toHaveLength(0);
 }finally{await mock.close();}});
});
