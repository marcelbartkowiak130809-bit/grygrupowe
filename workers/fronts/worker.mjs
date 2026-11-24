import {DurableObject} from 'cloudflare:workers';
import {needsUpdate,statusFor,updatePool} from '../../js/fronts/queue.mjs';

const kinds = ['join','cancel','act','status'];
const identity = /^Bearer ([a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12})$/i;

export default {
  async fetch(request,env) {
    const origin = request.headers.get('Origin');
    if (origin !== env.FRONTEND_ORIGIN) return Response.json({error:'Origin'},{status:403});
    const headers = {'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Methods':'POST, OPTIONS',
      'Access-Control-Allow-Headers':'Authorization, Content-Type','Access-Control-Max-Age':'600',
      'Cache-Control':'no-store','Vary':'Origin'};
    const respond = (error,status) => Response.json({error},{status,headers});
    if (new URL(request.url).pathname !== '/match') return respond('Route',404);
    if (request.method === 'OPTIONS') return new Response(null,{status:204,headers});
    if (request.method !== 'POST') return respond('Method',405);
    const token = identity.exec(request.headers.get('Authorization') || '')?.[1];
    if (!token) return respond('Session',401);
    const reader = request.body?.getReader();
    const decoder = new TextDecoder();
    let payload = '';
    let total = 0;
    while (reader) {
      const {done,value} = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total>1024) {
        await reader.cancel();
        return respond('Request too large',413);
      }
      payload += decoder.decode(value,{stream:true});
    }
    let input;
    try { input = JSON.parse(payload+decoder.decode()); } catch { return respond('JSON',400); }
    if (!kinds.includes(input?.kind)) return respond('Action',400);
    const namespace = env.MATCHMAKER.getByName('three-fronts-v1');
    const match = await namespace.fetch('https://internal/match',{
      method:'POST',body:JSON.stringify({uid:token.toLowerCase(),input})
    });
    return new Response(match.body,{status:match.status,headers:{...headers,'Content-Type':'application/json'}});
  },
};

export class Matchmaker extends DurableObject {
  async fetch(request) {
    const {uid,input} = await request.json();
    const storage = this.ctx.storage;
    const now = Date.now();
    if (input.kind === 'status') {
      const current = await storage.get('pool') || {};
      if (!needsUpdate(current,uid,input,now)) return Response.json(statusFor(current,uid,now));
    }
    const id = crypto.randomUUID();
    const seed = crypto.getRandomValues(new Uint32Array(1))[0];
    const pool = await storage.transaction(async tx => {
      const current = await tx.get('pool') || {};
      if (!needsUpdate(current,uid,input,now)) return current;
      let randomState = seed;
      const random = () => {
        randomState = (Math.imul(randomState,1664525)+1013904223) >>> 0;
        return randomState/2**32;
      };
      const next = updatePool(current,uid,input,now,random,id);
      await tx.put('pool',next);
      return next;
    });
    return Response.json(statusFor(pool,uid,now));
  }
}
