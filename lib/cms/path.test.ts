import { getByPath, setByPath } from './path';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
}

const obj = { hero: { title: 'Hello', subtitle: 'World' } };

const cleared = setByPath(obj, 'hero.title', '');
assert(getByPath(cleared, 'hero.title') === '', 'empty string should be stored');
assert(getByPath(cleared, 'hero.subtitle') === 'World', 'sibling keys unchanged');

let threw = false;
try {
  setByPath(obj, 'hero.missing', '');
} catch {
  threw = true;
}
assert(threw, 'missing nested key should throw');

console.log('path.test.ts: all passed');
