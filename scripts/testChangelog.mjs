import assert from 'node:assert/strict';
import {test} from 'node:test';
import {changelogEntries,latestChangelog} from '../js/changelog.js';
test('5.x history contains grouped releases rather than one entry per small fix',()=>{
  const entries=[...changelogEntries],recent=entries.filter(entry=>entry.version.startsWith('v5.'));
  assert.deepEqual(recent.map(entry=>entry.version),['v5.4.0','v5.3.0','v5.2.0','v5.1.0','v5.0.0']);
  for(const entry of recent){assert.ok(entry.title);assert.ok(entry.changes.length>=3&&entry.changes.length<=8);}
  assert.equal(latestChangelog.version,recent[0].version);
  assert.equal(new Set(entries.map(entry=>entry.version)).size,entries.length);
});
test('grouped entries keep major features without obsolete playlist and Marker instructions',()=>{
  const entries=[...changelogEntries],text=entries.filter(entry=>entry.version.startsWith('v5.')).flatMap(entry=>entry.changes).join(' ');
  for(const feature of ['Marker','Impostor','Maryli Rodowicz','128','grafikę','rankingi','Kalambury','Wisielca'])assert.ok(text.includes(feature),feature);
  assert.ok(!text.includes('Zapisz krzyżyk'));assert.ok(!text.includes('z własnej playlisty'));assert.ok(!text.includes('Własną playlistę można załadować'));
  assert.ok(entries.some(entry=>entry.version==='v4.3.0'));assert.ok(entries.some(entry=>entry.version==='v2.0.0'));
});
