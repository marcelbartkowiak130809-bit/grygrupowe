const units = [
  ['knight','Rycerz Pękniętej Tarczy',2,1,3,0,'ward','Blokuje pierwsze 2 obrażenia.'],
  ['lancer','Jeździec Burzy',3,3,2,1,'charge','Może od razu zaszarżować na wroga.'],
  ['duelist','Mistrz Dwóch Ostrzy',4,3,3,2,'cleave','Po dobiciu wroga zadaje 1 sąsiadom celu.'],
  ['guard','Tarczownik',3,1,5,1,'guard','Przyjmuje pierwszy cios w sąsiada w każdej rundzie.'],
  ['runner','Goniec',2,2,1,0,'haste','Może atakować od razu.'],
  ['sapper','Saper',2,2,2,1,'bomb','Po śmierci zadaje 2 wrogowi naprzeciw.'],
  ['marshal','Chorąży Korony',5,3,5,2,'rally','Po wejściu jest tarczą dla sąsiadów: +1 tarczy.'],
  ['paladin','Słoneczna Paladynka',4,2,5,1,'medic','Po wejściu leczy sąsiadów o 2 HP.'],
  ['dwarf','Krasnal z Młotem',3,2,4,0,'crusher','Atak w jednostkę z tarczą zadaje 2 więcej.'],
  ['griffin','Gryf Strażniczy',5,4,3,2,'range','Może atakować jednostki na sąsiednich frontach.'],
  ['archer','Łuczniczka z Głuszy',2,1,3,0,'range','Może strzelać do sąsiednich frontów.'],
  ['ranger','Tropicielka Cierni',3,2,3,1,'mark','Trafiony wróg dostaje +1 od kolejnego ataku.'],
  ['slime','Kostka Szlamu',2,1,2,0,'split','Po śmierci zostawia dwa gluty 1/1, jeśli jest miejsce.'],
  ['golem','Kamienny Golem',4,2,7,1,'rooted','Cudze efekty nie mogą go przesunąć.'],
  ['phoenix','Feniks z Popiołu',5,4,3,3,'rebirth','Raz zostawia jajko. Ocalałe jajko przywraca go z 2 HP.'],
  ['mushroom','Grzybek Wojownik',1,1,2,0,'spore','Po śmierci leczy bazę o 1 HP.'],
  ['fox','Lisi Zwiadowca',1,1,1,0,'scout','Po wystawieniu dobiera kartę.'],
  ['squirrel','Żołędziowy Rycerz',2,1,3,0,'oak','Po wejściu zyskuje 1 tarczy, jeśli ma sąsiada.'],
  ['wolf','Wilk z Mglistego Boru',3,2,3,1,'pack','Atakuje za 1 więcej, jeśli ma sąsiada.'],
  ['ent','Stróż Starego Dębu',5,3,6,2,'renew','Na początku twojej tury leczy się o 1 HP.'],
  ['witch','Wiedźma z Mokradła',3,1,4,1,'poison','Trafiony wróg traci 1 HP na końcu swojej tury.'],
  ['frost','Tkacz Szronu',4,2,4,2,'freeze','Pierwszy trafiony wróg traci najbliższy atak.'],
  ['ember','Mag Żaru',4,3,3,2,'fireball','Może strzelać do sąsiednich frontów za 1 mniej.'],
  ['elemental','Mistrz Żywiołów',5,3,4,3,'element','Po wejściu: ogień rani, lód mrozi, wiatr odpycha.'],
  ['sprite','Duszek Chmur',1,1,1,1,'wind','Gdy się przesunie, zyskuje 1 tarczy.'],
  ['bubble','Bąbelkowy Czarodziej',2,1,2,0,'bubble','Po wejściu zakłada sobie tarczę 2.'],
  ['owl','Sowa Bibliotekarka',3,1,4,1,'archive','Pierwsza taktyka w twojej turze kosztuje o 1 mniej.'],
  ['wyvern','Szkarłatna Wiwerna',6,5,4,3,'scorch','Po trafieniu zadaje 1 pozostałym wrogom.'],
  ['ghost','Duch ze Starej Wieży',2,2,2,1,'vanish','Po pierwszym ataku cofa się na wolny front.'],
  ['spirit','Latarnik',2,1,3,0,'lantern','Po wejściu leczy bazę o 2 HP.'],
  ['spider','Kryształowy Pająk',3,2,3,1,'web','Pierwszy trafiony wróg nie może się przesunąć przez rundę.'],
  ['otter','Rzeczna Zaklinaczka',3,2,3,1,'river','Po przesunięciu leczy się o 2 HP.'],
  ['mammoth','Śnieżny Mamut',6,4,7,2,'trample','Nadmiar obrażeń po dobiciu uderza w bazę.'],
  ['turtle','Perłowy Żółw',3,1,4,1,'shell','Ataki z sąsiednich frontów zadają mu 1 mniej.'],
  ['unicorn','Jednorożec Księżyca',5,2,5,3,'moon','Po wejściu zdejmuje z twoich jednostek truciznę i lód.'],
];

const tactics = [
  ['hail','Burza Gradowa',3,2,'hail','Zadaj po 1 wszystkim wrogom.','instant'],
  ['quake','Pęknięcie Ziemi',3,2,'quake','Zadaj po 2 obu jednostkom na wybranym froncie.','lane'],
  ['rain','Wiosenny Deszcz',2,0,'rain','Wylecz swoją jednostkę o 3 HP.','ally'],
  ['fog','Mgła',1,0,'fog','Przez rundę blokuj ataki z boku na wybrany front.','lane'],
  ['trap','Fałszywy Odwrót',2,1,'trap','Na pustym froncie: przerwij atak na bazę i zadaj 3.','empty'],
  ['gust','Podmuch',2,1,'gust','Przesuń wroga na wolny sąsiedni front.','moveEnemy'],
  ['cleanse','Ulewa',1,0,'cleanse','Zmyj truciznę ze wszystkich jednostek.','instant'],
  ['order','Rozkaz Szarży',1,0,'order','Przesuń swoją jednostkę na wolny sąsiedni front.','moveAlly'],
  ['portal','Lustrzany Portal',2,2,'portal','Zamień miejscami dwie swoje jednostki.','swap'],
  ['camp','Ognisko',2,0,'camp','Wylecz bazę o 3 HP.','instant'],
  ['thorns','Krzew Cierni',1,0,'thorns','Do twojej następnej tury pierwszy napastnik na froncie traci 2 HP.','lane'],
  ['meteor','Gwiazdospad',5,3,'meteor','Zadaj 4 wybranej wrogiej jednostce.','enemy'],
  ['barrier','Świetlista Bariera',1,0,'barrier','Daj swojej jednostce 3 tarczy do początku twojej tury.','ally'],
  ['boulder','Lawina',3,1,'boulder','Na wybranym froncie przez rundę nie działa przesuwanie.','lane'],
  ['bolt','Piorun',2,1,'bolt','Zadaj 2 wybranej wrogiej jednostce.','enemy'],
];

export const cards = [
  ...units.map(([id,name,cost,attack,hp,rarity,ability,text], art) => ({id,name,cost,attack,hp,rarity,ability,text,art,type:'unit'})),
  ...tactics.map(([id,name,cost,rarity,ability,text,target], i) => ({id,name,cost,rarity,ability,text,target,art:35+i,type:'tactic'})),
];
export const cardById = Object.fromEntries(cards.map(card => [card.id, card]));
cardById.mini = {id:'mini',name:'Mały Glut',attack:1,hp:1,type:'unit',rarity:0,art:50,text:'Mały, ale waleczny.'};
cardById.egg = {id:'egg',name:'Jajko Feniksa',attack:0,hp:2,type:'unit',rarity:3,art:51,text:'W następnej turze wykluje się feniks.'};
export const rarities = ['Zwykła','Rzadka','Epicka','Legendarna'];
