const boundViews=new WeakSet();
const pendingViews=new WeakSet();

export const gameFullscreenButton='<button class="ghost game-fullscreen-button" type="button" data-game-fullscreen aria-pressed="false">Pełny ekran</button>';
export const gameRotationHint='<p class="game-rotation-hint">Obróć telefon, żeby powiększyć planszę.</p>';

function updateButton(root){
 const button=root.querySelector('[data-game-fullscreen]');
 if(!button)return;
 const active=root.classList.contains('game-presentation');
 button.setAttribute('aria-pressed',String(active));
 button.textContent=active?'Zamknij pełny ekran':'Pełny ekran';
}

export function bindGamePresentation(root){
 const button=root.querySelector('[data-game-fullscreen]');
 if(!button)return;
 const doc=root.ownerDocument;
 const expanded=()=>root.classList.contains('game-presentation');
 const native=()=>doc.fullscreenElement===root;
 const setExpanded=active=>{
  root.classList.toggle('game-presentation',active);
  updateButton(root);
 };
 const toggle=async()=>{
  if(pendingViews.has(root))return;
  pendingViews.add(root);
  try{
   if(expanded()){
    if(native()){
     try{await doc.exitFullscreen();}catch{return;}
    }
    setExpanded(false);
   }else{
    if(doc.fullscreenEnabled&&root.requestFullscreen){
     try{await root.requestFullscreen();}catch{/* The browser's viewport is still available. */}
    }
    if(root.isConnected){
     setExpanded(true);
     if(!native())root.querySelector('[data-game-fullscreen]')?.focus({preventScroll:true});
    }
   }
  }finally{pendingViews.delete(root);}
 };
 if(!boundViews.has(root)){
  boundViews.add(root);
  root.addEventListener('fullscreenchange',()=>setExpanded(native()));
  root.addEventListener('keydown',event=>{
   if(!expanded()||native())return;
   if(event.key==='Escape'){
    event.preventDefault();
    setExpanded(false);
    root.querySelector('[data-game-fullscreen]')?.focus({preventScroll:true});
   }else if(event.key==='Tab'){
    const controls=[...root.querySelectorAll('button:not(:disabled),summary,a[href],input:not(:disabled)')]
     .filter(control=>control.tabIndex>=0&&control.getClientRects().length);
    const first=controls[0],last=controls.at(-1);
    if(doc.activeElement===(event.shiftKey?first:last)){
     event.preventDefault();
     (event.shiftKey?last:first)?.focus({preventScroll:true});
    }
   }
  });
 }
 button.onclick=toggle;
 updateButton(root);
}
