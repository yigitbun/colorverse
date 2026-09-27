import { aiStudies } from './ai-studies.js?v=2';

// Image-display approval is not final editorial/Library palette approval.
export const approvedPaletteIds = Object.freeze([]);
export const isApprovedPalette = palette => Boolean(palette && approvedPaletteIds.includes(palette.id));
export const canReviewCandidates = hostname => ['localhost', '127.0.0.1', '[::1]', '::1'].includes(hostname);
export const reviewCandidates = aiStudies;
// Explore is a handpicked presentation, not the complete experiment registry.
// Keep only Room from the related stone-colored Katre series. Hidden studies
// remain available to existing Studio links and Sandbox experiments.
export const homeStudyIds = Object.freeze([
  'concept-piera', 'concept-lorien', 'concept-lorien-care', 'concept-katre-room',
]);
export const homeStudies = Object.freeze(homeStudyIds.map(id => aiStudies.find(study => study.id === id)));
export function homeCandidateFor(id, archive, hostname) {
  // Owner requested these supplied concepts on Explore, including the public
  // working environment. Retired third-party photography is no longer offered.
  return homeStudies.find(palette => palette.id === id)
    || archive.find(palette => palette.id === id && isApprovedPalette(palette));
}
