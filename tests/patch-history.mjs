import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';

test('the lobby archive keeps at least 20 notes with the newest update first', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const archive = html.split('<dialog id="patchNotes"')[1].split('</dialog>')[0];
  const notes = [...archive.matchAll(/<ul>([\s\S]*?)<\/ul>/g)].flatMap(group =>
    [...group[1].matchAll(/<li>([^<]+)<\/li>/g)].map(match => match[1]));
  assert.ok(new Set(notes).size >= 20);
  const dates = [...archive.matchAll(/<time datetime="([^"]+)"/g)].map(match => Date.parse(match[1]));
  assert.ok(dates.length > 0 && dates.every(Number.isFinite));
  assert.deepEqual(dates, [...dates].sort((a, b) => b - a));
});
