import {test} from 'node:test';
import assert from 'node:assert/strict';
import {bindMobileHeader} from '../js/mobileHeader.js';
class Node {
  children=[];attrs=new Map();events=new Map();parent=null;classes=new Set();
  classList={toggle:(name,on)=>{const enabled=on ?? !this.classes.has(name);if(enabled)this.classes.add(name);else this.classes.delete(name);return enabled;},add:name=>this.classes.add(name),remove:name=>this.classes.delete(name)};
  append(node){if(node.parent)node.parent.children.splice(node.parent.children.indexOf(node),1);node.parent=this;this.children.push(node);}
  setAttribute(k,v){this.attrs.set(k,v);}getAttribute(k){return this.attrs.get(k)??null;}removeAttribute(k){this.attrs.delete(k);}
  addEventListener(k,fn){this.events.set(k,fn);}removeEventListener(k,fn){if(this.events.get(k)===fn)this.events.delete(k);}
  contains(node){return node===this||this.children.some(child=>child.contains(node));}focus(){this.focused=true;}
}
test('mobile moves actual account/saldo nodes, menu closes on Escape and desktop restores every action',()=>{
  const header=new Node(),brand=new Node(),nav=new Node(),account=new Node(),money=new Node(),friend=new Node();
  const logo=new Node(),level=new Node();header.append(brand);header.append(nav);brand.append(logo);brand.append(level);nav.append(friend);nav.append(money);nav.append(account);
  header.querySelector=s=>s==='.brand-zone'?brand:nav;nav.querySelector=s=>s==='#account'?account:s==='.money'?money:null;
  const media={matches:true,addEventListener:(k,fn)=>media.changed=fn,removeEventListener:()=>media.changed=null};
  const doc=new Node();doc.createElement=()=>new Node();globalThis.document=doc;globalThis.window={matchMedia:()=>media};
  const dispose=bindMobileHeader(header),toggle=header.children.at(-1);
  assert.equal(account.parent,brand);assert.equal(money.parent,brand);assert.deepEqual(nav.children,[friend]);
  toggle.events.get('click')();assert.equal(toggle.getAttribute('aria-expanded'),'true');
  doc.events.get('keydown')({key:'Escape',preventDefault(){}});assert.equal(toggle.getAttribute('aria-expanded'),'false');assert.equal(toggle.focused,true);
  media.matches=false;media.changed();assert.deepEqual(nav.children,[friend,money,account]);assert.deepEqual(brand.children,[logo,level]);
  dispose();assert.equal(media.changed,null);assert.equal(doc.events.size,0);
});
