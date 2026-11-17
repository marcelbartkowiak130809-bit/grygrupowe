// Patch the existing view, so lava, focus, scroll and lighting keep their timeline.
export function patchBackpackView(root,html){
 const template=root.ownerDocument.createElement('template');template.innerHTML=html;
 const sync=(parent,desired)=>{
  const target=[...desired.childNodes];
  target.forEach((next,i)=>{
   let old=parent.childNodes[i];
   if(!old){parent.appendChild(next.cloneNode(true));return;}
   if(old.nodeType!==next.nodeType||old.nodeName!==next.nodeName){parent.replaceChild(next.cloneNode(true),old);return;}
   if(old.nodeType!==1){if(old.nodeValue!==next.nodeValue)old.nodeValue=next.nodeValue;return;}
   for(const attr of [...old.attributes])if(attr.name!=='data-suppress-click'&&!next.hasAttribute(attr.name))old.removeAttribute(attr.name);
   for(const attr of [...next.attributes])if(old.getAttribute(attr.name)!==attr.value)old.setAttribute(attr.name,attr.value);
   sync(old,next);
  });
  while(parent.childNodes.length>target.length)parent.lastChild.remove();
 };
 sync(root,template.content);
}
const running=new WeakMap();
export const backpackReducedMotion=()=>typeof window!=='undefined'&&window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
export function backpackAnimate(node,frames,options={}){
 if(!node||backpackReducedMotion()||typeof node.animate!=='function')return;
 running.get(node)?.cancel();
 const animation=node.animate(frames,{duration:230,easing:'cubic-bezier(.2,.8,.2,1)',...options});running.set(node,animation);
 animation.onfinish=()=>{if(running.get(node)===animation)running.delete(node);};
 return animation;
}
export function backpackFeedback(root,action,before,state){
 if(backpackReducedMotion())return;
 if(action.type==='next'){
  backpackAnimate(root.querySelector('.backpack-shell,.backpack-finish'),[{opacity:.3,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:360});return;
 }
 const tile=root.querySelector(`[data-bp-tile="${action.index}"]`),slot=root.querySelector(`[data-bp-craft-slot="${action.index}"]`);
 if(action.type==='select')backpackAnimate(root.querySelector(`[data-bp-item="${state.selected}"]`),[{transform:'scale(.94)'},{transform:'scale(1.06)'},{transform:'scale(1)'}]);
 else if(action.type==='place'&&before.placed[action.index]!==state.placed[action.index]){
  backpackAnimate(tile,[{transform:'translateY(-9px) scale(.82)',opacity:.5},{transform:'translateY(1px) scale(1.06)',opacity:1,offset:.7},{transform:'translateY(0) scale(1)'}],{duration:270});
  const item=state.placed[action.index];backpackAnimate(root.querySelector(`[data-bp-item="${item}"] b`),[{transform:'translateY(-5px)',opacity:.2},{transform:'translateY(0)',opacity:1}]);
 }else if(action.type==='craft-slot')backpackAnimate(slot,[{transform:'scale(.84)'},{transform:'scale(1.08)'},{transform:'scale(1)'}]);
 else if(action.type==='craft'&&before.moves!==state.moves){
  backpackAnimate(root.querySelector(`[data-bp-item="${state.selected}"]`),[{transform:'scale(.85)',boxShadow:'0 0 0 0 #d0ff91'},{transform:'scale(1.1)',boxShadow:'0 0 24px 6px #d0ff9166'},{transform:'scale(1)',boxShadow:'0 0 0 0 #d0ff9100'}],{duration:420});
 }else if(action.type==='undo'||action.type==='clear'||action.type==='remove')backpackAnimate(root.querySelector('.backpack-inventory'),[{opacity:.5,transform:'translateY(3px)'},{opacity:1,transform:'translateY(0)'}]);
 else if(action.type==='place'&&before.on===state.on)backpackAnimate(tile,[{transform:'translateX(0)'},{transform:'translateX(-3px)'},{transform:'translateX(3px)'},{transform:'translateX(0)'}],{duration:180});
 if(!before.solved&&state.solved){
  backpackAnimate(root.querySelector('.backpack-world'),[{boxShadow:'0 0 0 0 #b8f28400'},{boxShadow:'0 0 45px 4px #b8f28466'},{boxShadow:'0 0 30px 0 #b4e98022'}],{duration:650});
  backpackAnimate(root.querySelector('.backpack-next'),[{opacity:0,transform:'translateY(7px)'},{opacity:1,transform:'translateY(0)'}],{duration:280});
 }
}
