import {journeyScene,journeyLit,journeyCanCross} from './alexJourneyEngine.js?v=20261119-17';

export function journeyTime(s){const seconds=Math.max(0,Math.round(((s.done?s.finishedAt:Date.now())-s.startedAt)/1000));return `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;}

export function journeyTorchTargets(s){
 const scene=journeyScene(s);
 return s.completed[s.scene]?[]:(scene.lights||[]).filter(x=>!journeyLit(s,s.scene,x));
}

// One readable, state-dependent next action rather than an unchanged paragraph.
export function journeyObjective(s){
 const l=journeyScene(s),w=s.world[s.scene],has=id=>(s.stock[id]||0)>0;
 if(s.done)return ['Alex odnaleziona — koniec wyprawy!','Wasza przygoda zakończona. Możesz obejrzeć przebytą drogę lub zacząć od nowa.'];
 if(s.completed[s.scene])return ['Droga otwarta. Kliknij „Idź dalej”.','Nie musisz zbierać reszty — to tylko mały zapas na dalszą drogę.'];
 switch(s.scene){
 case 0:return !w.flags.wood?['Kliknij leżący pień, żeby zebrać drewno.','Zbierasz przedmioty w świecie. Drzewa w tle są dekoracją.']:['Kliknij świnię, żeby zdobyć jedzenie.','Dwa uderzenia wystarczą. Potem ruszamy w drogę!'];
 case 1:
  if(s.rulesVersion===2&&!w.flags.bridgeReleased)return ['Kliknij patyk podtrzymujący kłodę.','Kłoda opadnie na rzekę i stanie się początkiem mostu.'];
  return journeyCanCross(s,s.scene)?['Kliknij strzałkę na drugim brzegu.','Most jest gotowy — Steve może już przejść.']:['Uzupełnij most deskami na poziomie brzegu.','W craftingu zamień drewno na deski. Wybierz je w plecaku i kliknij puste kratki nad wodą.'];
 case 2:return !(w.fuel['camp-stove']>0)?['Wybierz drewno lub węgiel i kliknij piec.','Tak dodajesz paliwo. Jeden kawałek drewna wystarczy na upieczenie jedzenia.']:['Wybierz surowy schab i kliknij rozpalony piec.','Upiecz jeden kawałek, aby otworzyć dalszą drogę.'];
 case 3:
  if(!has('wooden_pickaxe')&&!has('stone_pickaxe'))return ['Zbierz drewno i wytwórz drewniany kilof.','Otwórz „Receptury”, przygotuj deski, patyki i kilof. Kliknięcie receptury układa składniki.'];
  return (s.stock.cobblestone||0)<3?['Wybierz kilof i wydobądź 3 sztuki bruku.','Klikaj głaz po prawej. Potem przygotuj kamienny kilof w craftingu.']:['Wytwórz kamienny kilof.','Receptura: 3 sztuki bruku i 2 patyki. Odbierz gotowy kilof strzałką przy craftingu.'];
 case 4:{
  const missing=journeyTorchTargets(s);
  if(missing.length)return [
   missing.length===2?'Postaw po jednej pochodni w dwóch złotych kratkach.':'Postaw pochodnię w ostatniej złotej kratce.',
   has('torch')?'Wybierz pochodnię z plecaka i kliknij oznaczone pole.':'Wydobądź węgiel i połącz go z patykiem w craftingu.'
  ];
  return ['Wybierz kamienny kilof i wydobądź żelazo.','Potrzebujesz 3 rudy. Złoże jest w oświetlonej części tunelu.'];
 }
 case 5:
  if(w.placed[90]!=='furnace'&&!has('furnace'))return ['Zdobądź 8 sztuk bruku i wytwórz piec.','Wybierz kilof, klikaj głaz, a następnie użyj receptury pieca w plecaku.'];
  if(w.placed[90]!=='furnace')return ['Wybierz piec i postaw go na palenisku.','Kliknij kamienną podstawę na środku polany.'];
  if(!(w.fuel.hearth>0))return ['Dodaj węgiel do postawionego pieca.','Wybierz węgiel w plecaku i kliknij piec.'];
  return (s.stock.iron_ingot||0)<3?['Wybierz rudę żelaza i przetop 3 sztuki.','Każde kliknięcie pieca przetapia jedną rudę.']:['Wytwórz żelazny kilof.','Potrzebujesz 3 sztabek i 2 patyków. Skorzystaj z receptur w plecaku.'];
 case 6:
  if(w.nodes.well?.opened)return ['Kliknij odsłoniętą skrzynię w studni.','W środku jest mapa prowadząca do Alex.'];
  if(s.rulesVersion===2)return !has('cobblestone')?['Wydobądź kamień leżący obok studni.','Wybierz kilof. Kamień posłuży za przeciwwagę.']:['Wybierz bruk i kliknij mechanizm na linie.','Ciężar podniesie pokrywę studni — wtedy dostaniesz się do mapy.'];
  return ['Wybierz żelazny kilof i usuń głaz ze studni.','Pod nim znajdziesz skrzynię z mapą.'];
 case 7:return journeyCanCross(s,s.scene)?['Kliknij strzałkę na górnej półce.','Schody są gotowe.']:['Zbuduj schody z bruku: najpierw dół, potem stopnie.','Wydobądź 6 sztuk bruku. Steve wejdzie o jeden blok w górę; każda kratka potrzebuje podpory.'];
 case 8:
  if(w.flags.powered)return ['Brama otwarta! Kliknij strzałkę za nią.','Alex jest już tuż obok.'];
  if(w.placed[87]!=='lever')return ['Wytwórz dźwignię i ustaw ją przed bramą.','Receptura: patyk nad brukiem. Wybierz dźwignię i kliknij pierwszą kratkę obwodu.'];
  return l.wires.every(x=>w.placed[80+x]==='redstone')?['Kliknij zamontowaną dźwignię.','Gotowy obwód otworzy bramę.']:['Połącz cztery kratki obwodu redstonem.','Wydobądź redstone żelaznym kilofem, wybierz go w plecaku i uzupełnij linię do bramy.'];
 case 9:return w.flags.lantern?['Kliknij Alex, żeby zakończyć wyprawę.','Dotarłeś! Jeszcze tylko przywitanie.']:['Wybierz pochodnię i zapal lampę przy domu.','Kliknij słupek obok Alex. Gdy zrobi się jasno, przywitaj się z nią.'];
 }
}
