const test = require('./test_framework');


function count_bits(x) {
  let num_bits = 0;

  while (x) {
    num_bits += x & 1;
    x >>= 1;
  }

  return num_bits;
}


test('generic', 'count_bits', count_bits);
