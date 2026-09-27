// Owner-supplied AI visuals, not commissioned/photographed real-world products.
// These are working color interpretations, NOT approved editorial Library entries.
const sources = [
  { id: 'concept-piera', name: 'Citrus Muse', family: 'Piera', image: 'piera', category: 'Brand · Beverages', tags: ['brand', 'retail', 'product', 'packaging'], colors: ['#C8D8A7', '#BBA2D1', '#E9947B', '#EAC843', '#253B25'], imageAlt: 'AI concept of Piera botanical drinks in coral, yellow, lavender and green cans.' },
  { id: 'concept-lorien', name: 'Quiet Ink', family: 'Lorien', image: 'lorien', category: 'Objects · Writing', tags: ['brand', 'product', 'editorial', 'stationery'], colors: ['#E9DFCF', '#958373', '#203147', '#74322F', '#283D31'], imageAlt: 'AI concept of Lorien pens and packaging in ivory, navy, forest green, burgundy and taupe.' },
  { id: 'concept-katre-body', name: 'Oat Ritual', family: 'Katre', image: 'katre-body', category: 'Brand · Body care', tags: ['brand', 'retail', 'product', 'packaging'], colors: ['#E7DFD1', '#BBAE9B', '#938570', '#736951', '#2C2924'], imageAlt: 'AI concept of Katre body care in ivory packaging, stone textures and dark caps.' },
  { id: 'concept-katre-desk', name: 'Paper Dune', family: 'Katre', image: 'katre-desk', category: 'Editorial · Stationery', tags: ['brand', 'product', 'editorial', 'stationery'], colors: ['#EBE2D3', '#C3B6A3', '#837666', '#AC9064', '#34312B'], imageAlt: 'AI concept of Katre stationery with a charcoal notebook, warm paper, brass and stone.' },
  { id: 'concept-katre-room', name: 'Stone Haven', family: 'Katre', image: 'katre-room', category: 'Spaces · Living', tags: ['space', 'product', 'interior', 'lighting'], colors: ['#EBE4D7', '#C8BBA7', '#A49379', '#74725A', '#34332D'], imageAlt: 'AI concept of Katre living objects with a textured chair, stone lamp and olive branches.' },
  { id: 'concept-katre-street', name: 'Soft Trail', family: 'Katre', image: 'katre-street', category: 'Objects · Apparel', tags: ['brand', 'product', 'fashion', 'accessories'], colors: ['#E9E3D7', '#B6AA96', '#91836F', '#706D60', '#35332C'], imageAlt: 'AI concept of Katre footwear, bag and clothing in ivory, taupe and charcoal.' },
  { id: 'concept-katre-motion', name: 'Amber Drift', family: 'Katre', image: 'katre-motion', category: 'Objects · Mobility', tags: ['brand', 'product', 'mobility', 'campaign'], colors: ['#EAE2D4', '#BDB09C', '#8F806C', '#BD8246', '#292720'], imageAlt: 'AI concept of a Katre vehicle in warm ivory with an amber light and dark details.' },
  { id: 'concept-lorien-care', name: 'Clay Veil', family: 'Lorien', image: 'lorien-care', category: 'Brand · Body care', tags: ['brand', 'retail', 'product', 'packaging'], colors: ['#E5D7C1', '#B8AA88', '#B27D50', '#8B4938', '#4B2B1C'], imageAlt: 'AI concept of Lorien cosmetic tubes and jars in cream, sand, caramel, terracotta and chocolate on stone steps against an olive backdrop.' },
];
export const aiStudies = Object.freeze(sources.map(source => Object.freeze({
  ...source, colors: Object.freeze(source.colors), tags: Object.freeze(source.tags),
  image: `/assets/studies/${source.image}.jpg`,
  description: `${source.family} is an AI-generated concept. This palette is a provisional visual interpretation, not a manufacturer specification.`,
  useCases: Object.freeze(source.tags.slice(0, 3)),
  credit: Object.freeze({ kind: 'ai', label: 'AI concept', origin: 'owner-supplied' }),
  paletteStatus: 'proposed', sourcePaletteId: null,
})));
