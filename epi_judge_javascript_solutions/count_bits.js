const test = require('./test_framework');
test('generic', 'count_bits');

function count_bits(x) {
  let num_bits = 0;

  while (x) {
    num_bits += x & 1;
    x >>= 1;
  }

  return num_bits;
}
