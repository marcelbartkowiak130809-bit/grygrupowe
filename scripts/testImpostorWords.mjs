import assert from 'node:assert/strict';
import {test} from 'node:test';
import {impostorWords,impostorCategories} from '../content/impostor/words.js';
import {createImpostorGame} from '../js/impostor.js';
const normalize=value=>value.normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const pairKey=(a,b)=>[normalize(a),normalize(b)].sort().join('|');
test('catalog has unique, distinct pairs and every category stays populated',()=>{
  const seen=new Set();
  for(const pair of impostorWords){assert.ok(pair.main.trim());assert.ok(pair.impostor.trim());assert.notEqual(normalize(pair.main),normalize(pair.impostor));const key=pair.category+'|'+pairKey(pair.main,pair.impostor);assert.ok(!seen.has(key),key);seen.add(key);}
  assert.ok(impostorWords.length>250);for(const category of impostorCategories)assert.ok(impostorWords.filter(p=>p.category===category).length>=4,category);
});
test('near-identical animals, synonyms, subtypes and aliases cannot return',()=>{
  const removed=[['krokodyl','aligator'],['żaba','ropucha'],['cytryna','limonka'],['brzoskwinia','nektarynka'],['excel','arkusz kalkulacyjny'],['PLS DONATE','Please Donate'],['perkusja','bębny'],['słuchawki','airpodsy'],['piłka nożna','futsal'],['cola','pepsi'],['lody','sorbet'],['gitara','ukulele']];
  const keys=new Set(impostorWords.map(p=>pairKey(p.main,p.impostor)));for(const [a,b] of removed)assert.ok(!keys.has(pairKey(a,b)),a+' / '+b);
  for(const [main,impostor] of [['krokodyl','hipopotam'],['żaba','żółw'],['gitara','pianino'],['cola','lemoniada'],['excel','PowerPoint']])assert.ok(impostorWords.some(p=>normalize(p.main)===normalize(main)&&normalize(p.impostor)===normalize(impostor)));
  // Keep useful existing middle-distance pairs instead of broad random pairings.
  for(const [main,impostor] of [['burger','kebab'],['rekin','delfin'],['koszykówka','siatkówka']])assert.ok(impostorWords.some(p=>pairKey(p.main,p.impostor)===pairKey(main,impostor)));
});
test('broader familiar associations replace closest substitutes without changing the accepted animal pair',()=>{
  const keys=new Set(impostorWords.map(p=>pairKey(p.main,p.impostor)));
  for(const pair of [['gitara','skrzypce'],['fortepian','akordeon'],['perkusja','tamburyn'],['perkusja','marakasy'],['mandarynka','pomarańcza'],['mango','papaja'],['papuga','kanarek'],['ładowarka','powerbank'],['krzesło','taboret']])assert.ok(!keys.has(pairKey(...pair)),pair.join(' / '));
  for(const pair of [['gitara','pianino'],['fortepian','perkusja'],['papuga','pingwin'],['lampka','świeca'],['krokodyl','hipopotam']])assert.ok(keys.has(pairKey(...pair)),pair.join(' / '));
});
test('new rounds assign both words from one curated pair with the configured special roles',()=>{
  for(let i=0;i<300;i++){
    const game=createImpostorGame(['a','b','c','d','e','f'],{categories:impostorCategories,impostorCount:1,whiteEnabled:true,whiteCount:1});
    assert.ok(impostorWords.some(pair=>pair.category===game.category&&pair.main===game.mainWord&&pair.impostor===game.impostorWord));
    const roles=Object.values(game.roles);assert.equal(roles.filter(r=>r.role==='impostor').length,1);assert.equal(roles.filter(r=>r.role==='white').length,1);
    for(const role of roles)assert.equal(role.word,role.role==='impostor'?game.impostorWord:role.role==='white'?null:game.mainWord);
  }
});
