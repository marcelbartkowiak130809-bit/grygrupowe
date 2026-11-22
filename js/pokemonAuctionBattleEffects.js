import { Audio } from "./audio.js?v=20261123-2";

// PokéAPI cry IDs match the battle catalogue, including alternate and Mega forms.
const crySource = "https://raw.githubusercontent.com/PokeAPI/cries/b3a9044bb839b5e3152aaa536c7b463a0fcf0140/cries/pokemon/latest";
const cryUrl = id => Number.isSafeInteger(id) && id > 0 ? `${crySource}/${id}.ogg` : "";

export function preloadBattleCry(unit) {
  for (const id of [unit?.id,unit?.megaTarget]) Audio.preloadSfxSample(cryUrl(id));
}

export function playBattleCry(event, fallbackId, isCurrent) {
  if (event?.targetUid && !event.skipped && !event.tactical) {
    void Audio.playSfxSample(cryUrl(event.cryId ?? fallbackId),isCurrent).catch(() => {});
  }
}

const accents = {
  normal:"#c5d1ea", fire:"#ff9657", water:"#60caff", electric:"#ffe36b", grass:"#85ec9c", ice:"#a0efff",
  fighting:"#ff846f", poison:"#f49ae9", ground:"#ebbf80", flying:"#b1c3ff", psychic:"#ff87b5", bug:"#d1ee7a",
  rock:"#dab98c", ghost:"#bd9bff", dragon:"#a6a1ff", dark:"#c8a6ef", steel:"#c2e2ef", fairy:"#ffc0e3",
};

export const battleAccent = type => accents[type] || accents.normal;
export const motionEnabled = () => !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
export const battleCard = (root,uid,slot) => [...root.querySelectorAll("[data-battle-player]")]
  .find(card=>card.dataset.battlePlayer===uid && Number(card.dataset.slot)===slot);

const translate = (x,y) => `translate(${x}px,${y}px)`;
function center(node) {
  const box=node.getBoundingClientRect();
  return {x:box.left+box.width/2,y:box.top+box.height/2};
}

function particle(point,className,color,text) {
  const node=document.createElement("span");
  node.className=`battle-fx ${className}`;
  node.style.cssText=`left:${point.x}px;top:${point.y}px;--fx-accent:${color}`;
  node.setAttribute("aria-hidden","true");
  if (text) node.textContent=text;
  document.body.append(node);
  return node;
}

function temporary(node,frames,options) {
  const motion=node.animate(frames,options);
  motion.onfinish=motion.oncancel=()=>node.remove();
}

function ripple(point,color,delay=0,shield=false) {
  temporary(particle(point,shield?"battle-fx-shield":"battle-fx-ring",color),
    [{scale:.35,opacity:0},{scale:1,opacity:1,offset:.24},{scale:shield?1.13:2.1,opacity:0}],
    {duration:shield?380:350,delay,fill:"backwards",easing:"ease-out"});
}

function floatText(point,color,label,delay) {
  temporary(particle({x:point.x,y:point.y-19},"battle-fx-label",color,label),
    [{transform:"translateY(7px) scale(.8)",opacity:0},{transform:"translateY(0)",opacity:1,offset:.2},{transform:"translateY(-27px)",opacity:0}],
    {duration:570,delay,fill:"backwards",easing:"ease-out"});
}

export function animateBattleEntry(card) {
  const sprite=card?.querySelector(".battle-sprite");
  if (!sprite?.animate || !motionEnabled()) return;
  sprite.getAnimations().forEach(animation=>animation.cancel());
  const point=center(sprite);
  ripple(point,"#87f4e0");
  sprite.animate([{opacity:.18,translate:"0 13px",scale:.78},{opacity:1,translate:"0 -5px",scale:1.08,offset:.66},{opacity:1,translate:"0 0",scale:1}],
    {duration:380,easing:"ease-out"});
}

export function animateBattleAction(root,event) {
  if (!event || !motionEnabled()) return;
  const from=battleCard(root,event.uid,event.slot)?.querySelector(".battle-sprite");
  const to=battleCard(root,event.targetUid,event.targetSlot)?.querySelector(".battle-sprite");
  if (!from?.animate || event.skipped) return;
  const fromPoint=center(from);
  const color=battleAccent(event.moveType);
  if (event.tactical) {
    if (event.failed || event.missed) return;
    const buff=!(["status","lower"].includes(event.moveEffect));
    const recipient=buff || !to ? from : to;
    ripple(center(recipient),event.moveEffect==="protect"?"#9eefff":color,20,event.moveEffect==="protect");
    recipient.animate([{scale:1},{scale:1.10,offset:.35},{scale:1}],{duration:330,easing:"ease-out"});
    return;
  }
  if (!to || event.copies) return;
  const target=center(to);
  const dx=target.x-fromPoint.x, dy=target.y-fromPoint.y;
  const isRanged=event.moveCategory==="special";
  const reach=isRanged ? .17 : .68;
  const landed=Boolean(event.damage || event.blocked || event.factor===0);
  from.animate([
    {transform:translate(0,0)},{transform:translate(dx*-.055,dy*-.055),offset:.22},
    {transform:translate(dx*reach,dy*reach),offset:.52},{transform:translate(0,0)},
  ],{duration:415,easing:"ease-in-out"});

  const contactDelay=210;
  if (isRanged) {
    const orb=particle(fromPoint,"battle-fx-orb",color);
    temporary(orb,[{transform:translate(0,0),opacity:.2},{transform:translate(dx*.28,dy*.28),opacity:1,offset:.28},
      {transform:translate(dx*(event.missed?1.15:1),dy),opacity:1}],{duration:contactDelay,easing:"ease-in"});
  }
  if (!landed || !event.damage) {
    if (event.blocked || event.factor===0) ripple(target,"#9eefff",contactDelay,true);
    const label=event.blocked?"Blokada":event.missed?"Pudło":event.factor===0?"Brak efektu":"";
    if (label) floatText(target,"#caeeff",label,contactDelay);
    return;
  }
  ripple(target,color,contactDelay);
  for (let index=0;index<6;index++) {
    const angle=index*Math.PI/3;
    temporary(particle(target,"battle-fx-spark",color),[{opacity:1,transform:translate(0,0)},
      {opacity:0,transform:translate(Math.cos(angle)*25,Math.sin(angle)*25)}],
      {duration:290,delay:contactDelay,fill:"backwards",easing:"ease-out"});
  }
  to.animate([{transform:"none"},{transform:translate(dx*.04,-8),filter:"brightness(1.65)",offset:.24},
    {transform:translate(-dx*.025,2),offset:.55},{transform:"none"}],{duration:310,delay:contactDelay,easing:"ease-out"});
  floatText(target,event.factor>1 || event.critical?"#ffdf80":"#f6f8ff",`−${event.damage}${event.critical?" ✦":""}`,contactDelay);
  if (event.knockedOut) {
    to.animate([{opacity:1},{opacity:.35,scale:.72,translate:"0 12px"}],{duration:245,delay:contactDelay+230,easing:"ease-in"});
  }
}
