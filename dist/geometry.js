export const add = (a, b) => a.map((v, i) => v + b[i]);
export const mul = (a, n) => a.map(v => v * n);
export const dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
export const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const norm = a => mul(a, 1 / Math.hypot(...a));
export const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);

// The dual of a subdivided icosahedron gives one continuous, tightly fitted surface.
// A sphere necessarily has twelve pentagons; all other cells are hexagons.
export function createHexSphere(subdivisions = 3) {
  const t = (1 + Math.sqrt(5)) / 2;
  const vertices = [[-1,t,0],[1,t,0],[-1,-t,0],[1,-t,0],[0,-1,t],[0,1,t],[0,-1,-t],[0,1,-t],[t,0,-1],[t,0,1],[-t,0,-1],[-t,0,1]].map(norm);
  let faces = [[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]];
  for (let n = 0; n < subdivisions; n++) {
    const cache = new Map();
    const midpoint = (a, b) => {
      const key = [a, b].sort((a, b) => a - b).join(':');
      if (!cache.has(key)) { cache.set(key, vertices.length); vertices.push(norm(add(vertices[a], vertices[b]))); }
      return cache.get(key);
    };
    faces = faces.flatMap(([a, b, c]) => {
      const ab = midpoint(a, b), bc = midpoint(b, c), ca = midpoint(c, a);
      return [[a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]];
    });
  }
  const neighbors = vertices.map(() => []);
  faces.forEach(([a, b, c]) => {
    const center = norm(add(add(vertices[a], vertices[b]), vertices[c]));
    for (const i of [a, b, c]) neighbors[i].push(center);
  });
  return vertices.map((center, i) => {
    const u = norm(cross(Math.abs(center[1]) > .9 ? [1, 0, 0] : [0, 1, 0], center));
    const v = cross(center, u);
    const corners = neighbors[i].sort((a, b) => Math.atan2(dot(a, v), dot(a, u)) - Math.atan2(dot(b, v), dot(b, u)));
    const rim = corners.map(p => norm(mix(center, p, .957)));
    return { center, corners, bottom: rim.map(p => mul(p, .994)), rim: rim.map(p => mul(p, 1.011)), face: corners.map(p => mul(norm(mix(center, p, .905)), 1.014)) };
  });
}
