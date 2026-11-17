import {writeFileSync} from 'node:fs';
import {createJourney,journeyAction} from '../js/alexJourneyEngine.js';
import {solveJourneyScene} from './journeyTestSolutions.mjs';
const s=createJourney(),starts=[];
for(let i=0;i<10;i++){starts.push(s.log.length);solveJourneyScene(s);if(i<9)journeyAction(s,{type:'next'});}
writeFileSync(new URL('./fixtures/journey-v2.json',import.meta.url),JSON.stringify({version:1,rulesVersion:2,starts,log:s.log},null,2)+'\n');
console.log('Created current journey review fixture.');
