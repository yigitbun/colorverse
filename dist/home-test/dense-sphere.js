import { add, mul, dot, cross, norm, mix } from '../geometry.js';

// Class-I geodesic dual: twelve pentagons; every other cell is a hexagon.
export function createDenseSphere(frequency = 9) {
  if (!Number.isInteger(frequency) || frequency < 1) throw new RangeError('Use a positive integer frequency.');
  const t = (1 + Math.sqrt(5)) / 2;
  const base = [[-1,t,0],[1,t,0],[-1,-t,0],[1,-t,0],[0,-1,t],[0,1,t],[0,-1,-t],[0,1,-t],[t,0,-1],[t,0,1],[-t,0,-1],[-t,0,1]].map(norm);
  const baseFaces = [[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]];
  const vertices = [], faces = [], shared = new Map();
  const vertex = point => {
    const center = norm(point);
    const key = center.map(value => Math.round(value * 1e10)).join(':');
    if (!shared.has(key)) { shared.set(key, vertices.length); vertices.push(center); }
    return shared.get(key);
  };
  for (const [a,b,c] of baseFaces) {
    const grid = new Map();
    for (let i = 0; i <= frequency; i++) {
      for (let j = 0; j <= frequency - i; j++) {
        const point = [0,1,2].map(axis => ((frequency-i-j)*base[a][axis] + i*base[b][axis] + j*base[c][axis]) / frequency);
        grid.set(i+':'+j, vertex(point));
      }
    }
    const at = (i,j) => grid.get(i+':'+j);
    for (let i = 0; i < frequency; i++) {
      for (let j = 0; j < frequency - i; j++) {
        faces.push([at(i,j),at(i+1,j),at(i,j+1)]);
        if (i+j < frequency-1) faces.push([at(i+1,j),at(i+1,j+1),at(i,j+1)]);
      }
    }
  }
  const neighbors = vertices.map(() => []);
  for (const [a,b,c] of faces) {
    const corner = norm(add(add(vertices[a],vertices[b]),vertices[c]));
    for (const index of [a,b,c]) neighbors[index].push(corner);
  }
  return vertices.map((center,index) => {
    const u = norm(cross(Math.abs(center[1]) > .9 ? [1,0,0] : [0,1,0],center));
    const v = cross(center,u);
    const corners = neighbors[index].sort((a,b) => Math.atan2(dot(a,v),dot(a,u)) - Math.atan2(dot(b,v),dot(b,u)));
    const rim = corners.map(point => norm(mix(center,point,.957)));
    return { center, corners, bottom: rim.map(point => mul(point,.994)), rim: rim.map(point => mul(point,1.011)), face: corners.map(point => mul(norm(mix(center,point,.905)),1.014)) };
  });
}
