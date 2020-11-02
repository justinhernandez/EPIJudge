const test = require('./test_framework');
test('generic', 'parity', parity);

function parity(x) {
  let result = 0;

  while (x) {
    result ^= x & 1;
    x >>= 1;
  }

  return result;
}
