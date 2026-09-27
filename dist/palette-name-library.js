import { aiStudies } from './ai-studies.js?v=2';

// Provisional editorial names. Palette IDs remain the stable join key and URL key.
// The ASCII rule applies to ColorVerse editorial labels, not names entered by members.
export const paletteNameLibrary = Object.freeze({
  ...Object.fromEntries(aiStudies.map(study => [study.id, Object.freeze({ label: study.name, status: 'proposed', aliases: Object.freeze([`${study.family} ${study.category}`]) })])),
  'space-meeting-room-01': Object.freeze({
    label: 'Mosswood', status: 'proposed', aliases: Object.freeze(['Oak & Green Meeting Room']),
  }),
  'space-orange-pink-seating-02': Object.freeze({
    label: 'Orchid Ember', status: 'proposed', aliases: Object.freeze(['Orange & Pink Seating']),
  }),
  'space-modern-lobby-03': Object.freeze({
    label: 'Sunlit Grove', status: 'proposed', aliases: Object.freeze(['Light-Filled Lobby']),
  }),
  'hospitality-pink-yellow-cafe-04': Object.freeze({
    label: 'Rose Brick', status: 'proposed', aliases: Object.freeze(['Pink & Yellow Café']),
  }),
  'retail-orange-green-purple-05': Object.freeze({
    label: 'Citrus Voltage', status: 'proposed', aliases: Object.freeze(['Orange, Green & Violet']),
  }),
  'product-mustard-coral-chairs-06': Object.freeze({
    label: 'Saffron Pair', status: 'proposed', aliases: Object.freeze(['Mustard & Coral Chairs']),
  }),
  'product-colorful-chair-hall-07': Object.freeze({
    label: 'Spectrum Row', status: 'proposed', aliases: Object.freeze(['Colorful Chair Hall']),
  }),
});

export const editorialNameKey = label => label.trim().toLowerCase().replace(/\s+/g, '-');

export function editorialNameFor(paletteId) {
  const record = paletteNameLibrary[paletteId];
  if (!record) throw new Error(`Missing editorial name for ${paletteId}`);
  return record.label;
}
