import assert from 'node:assert/strict';
import {test} from 'node:test';
import {musicArtworkUrl} from '../js/musicArtwork.js';
import {musicPreviewCatalog} from '../js/music.js';
test('small Apple thumbnails use a real 600px rendition; larger art stays unchanged',()=>{
 for(const size of [30,60,100,300])assert.equal(musicArtworkUrl(`https://is1-ssl.mzstatic.com/image/thumb/cover.jpg/${size}x${size}bb.jpg`),'https://is1-ssl.mzstatic.com/image/thumb/cover.jpg/600x600bb.jpg');
 for(const size of [600,1200]){const url=`https://is1-ssl.mzstatic.com/image/thumb/cover.jpg/${size}x${size}bb.jpg`;assert.equal(musicArtworkUrl(url),url);}
 for(const url of ['', 'invalid','https://example.com/100x100bb.jpg','https://mzstatic.com.example.com/100x100bb.jpg'])assert.equal(musicArtworkUrl(url),url);
});
test('Need To Know and other built-in covers are no longer 100px thumbnails',()=>{
 const track=musicPreviewCatalog.find(t=>t.title==='Need To Know'&&t.artist==='Doja Cat');assert.ok(track);assert.ok(track.coverUrl.includes('/600x600bb'));
 for(const item of musicPreviewCatalog){const size=item.coverUrl?.match(/\/(\d+)x(\d+)bb/);if(size){assert.ok(Number(size[1])>=600,item.title);assert.ok(Number(size[2])>=600,item.title);}}
});
