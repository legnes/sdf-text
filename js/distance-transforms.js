// http://cs.brown.edu/people/pfelzens/papers/dt-final.pdf
const f = [];
const v = [];
const z = [];
const squaredEuclideanDistanceTransform1d = (data, offset, stride, length) => {
  // copy row or col
  for (let q = 0; q < length; q++) {
    f[q] = data[offset + q * stride];
  }

  // begin alg
  let k = 0;          // Index of rightmost parabola in lower envelope
  v[0] = 0;           // Locations of parabolas in lower envelope 
  z[0] = -Infinity;   // Locations of boundaries between parabolas
  z[1] = Infinity;

  // Compute lower envelope
  for (let q = 1; q < length; q++) { 
    let s = -Infinity;
    k++;
    while (s <= z[k]) {
      k--;
      const r = v[k];
      s = (f[q] - f[r] + q * q - r * r) / (q - r) / 2;
    }

    k++;
    v[k] = q;
    z[k] = s;
    z[k + 1] = Infinity;
  }

  // Fill in values of distance transform
  k = 0;
  for (let q = 0; q < length; q++) { 
    while (z[k + 1] < q) {
      k++;
    }
    data[offset + q * stride] = (q - v[k]) * (q - v[k]) + f[v[k]];
  }
};

const manhattanDistanceTransform1d = (data, offset, stride, length) => {
  for (let q = 1; q < length; q++) {
    const curr = data[offset + q * stride];
    const prev = data[offset + (q - 1) * stride];
    data[offset + q * stride] = Math.min(curr, prev + 1);
  }

  for (let q = length - 2; q > -1; q--) {
    const curr = data[offset + q * stride];
    const next = data[offset + (q + 1) * stride];
    data[offset + q * stride] = Math.min(curr, next + 1);
  }
};

const getDistanceTransform2d = (transform1d, remapFn) => (data, width, height) => {
  for (let y = 0; y < height; y++) {
    transform1d(data, y * width, 1, width);
  }
  for (let x = 0; x < width; x++) {
    transform1d(data, x, width, height);
  }

  if (remapFn) {
    for (let i = 0; i < width * height; i++) {
      data[i] = remapFn(data[i]);
    }
  }
};

const transforms = {
  euclidean: getDistanceTransform2d(squaredEuclideanDistanceTransform1d, Math.sqrt),
  manhattan: getDistanceTransform2d(manhattanDistanceTransform1d),
};

export default transforms;