import { oklabDistance } from '../color.js';
import { reviewCandidates } from '../curation.js?v=7';

// Existing local review references, not newly approved Library entries.
export function rankPaletteReferences(colors, confirmed, pool = reviewCandidates) {
  const indices = [...confirmed].sort((a,b) => a-b);
  if (!indices.length) return [];
  return pool.map(palette => {
    let best = { score: Infinity, assignment: [] };
    const visit = (position, used, assignment, cost) => {
      if (cost >= best.score) return;
      if (position === indices.length) { best = { score: cost, assignment: [...assignment] }; return; }
      palette.colors.forEach((color,index) => {
        if (used.has(index)) return;
        used.add(index); assignment.push(index);
        visit(position+1,used,assignment,cost+oklabDistance(colors[indices[position]],color));
        used.delete(index); assignment.pop();
      });
    };
    visit(0,new Set(),[],0);
    return { palette, score: best.score/indices.length, assignment: best.assignment };
  }).sort((a,b) => a.score-b.score || a.palette.id.localeCompare(b.palette.id));
}

export function suggestRemaining(colors, confirmed, pool = reviewCandidates) {
  const reference = rankPaletteReferences(colors,confirmed,pool)[0];
  if (!reference) return [...colors];
  const used = new Set(reference.assignment);
  const remaining = reference.palette.colors.filter((_,index) => !used.has(index));
  let next = 0;
  return colors.map((color,index) => confirmed.has(index) ? color : remaining[next++]);
}

export function applyPaletteStep(colors, confirmed, index, hex) {
  const picked = new Set(confirmed); picked.add(index);
  const updated = [...colors]; updated[index] = hex.toUpperCase();
  return { colors: suggestRemaining(updated,picked), confirmed: picked, nextIndex: Math.min(index+1,4) };
}
