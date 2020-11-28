const test = require('./test_framework');
test('generic', 'rectangle_intersection');

function niceRectangle(a) {
  return {
    x: a[0],
    y: a[1],
    width: a[2],
    height: a[3],
  };
}

function hasIntersection(r1, r2) {
  return (
    (r1.x <= r2.x + r2.width && r2.x <= r1.x + r1.width) &&
    (r1.y <= r2.y + r2.height && r2.y <= r1.y + r1.height)
  );
}

// r1:array = [x, y, width, height]
function rectangle_intersection(r1, r2) {
  r1 = niceRectangle(r1);
  r2 = niceRectangle(r2);
  // return empty result
  let result = [0, 0, -1, -1];

  if (hasIntersection(r1, r2)) {
    // x
    result[0] = Math.max(r1.x, r2.x);
    // y
    result[1] = Math.max(r1.y, r2.y);
    // width
    result[2] =
      Math.min(r1.x + r1.width, r2.x + r2.width) - result[0];
    // height
    result[3] =
      Math.min(r1.y + r1.height, r2.y + r2.height) - result[1];
  }

  return result;
}
