const test = require('./test_framework');
test('generic', 'parity', parity);

function parity(x) {
  x = BigInt(x);
  let result = BigInt(0);

  while (x) {
    x = x & (x - BigInt(1));
    result ^= BigInt(1);
  }

  return result;
}
