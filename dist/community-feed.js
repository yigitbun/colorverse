const KEY = 'colorverse-community-private-drafts-v1';
const validColors = colors => Array.isArray(colors) && colors.length === 5 && colors.every(color => /^#[0-9a-f]{6}$/i.test(color));
const types = new Set(['palette', 'work', 'question']);
export function cleanDiscussion(value) {
  if (!value || typeof value.id !== 'string' || !/^draft-[a-z0-9-]+$/i.test(value.id) || !types.has(value.type) || !validColors(value.colors) || typeof value.text !== 'string') return null;
  return { id: value.id.slice(0, 80), type: value.type, text: value.text.slice(0, 1200), colors: value.colors.map(color => color.toUpperCase()), comments: (Array.isArray(value.comments) ? value.comments : []).filter(item => typeof item === 'string').slice(-30).map(item => item.slice(0, 500)) };
}
export function initCommunity({ getPalette, openPalette }) {
  const composer = document.getElementById('communityComposer');
  if (!composer) return;
  const $ = id => document.getElementById(id);
  let drafts = [], filter = 'all';
  try { drafts = JSON.parse(localStorage.getItem(KEY) || '[]').slice(0, 20).map(cleanDiscussion).filter(Boolean); } catch {}
  const examples = [{ id: 'example-ratio', type: 'question', title: 'Same colors. Different roles.', text: 'A quieter bottle or a bolder label? Open this draft in Studio and compare how the same colors work on different surfaces.', colors: ['#F2ECE4', '#D7C7B1', '#8F9A88', '#A87956', '#31362F'], comments: [] }];
  let sampleComments = [];
  const palette = getPalette();
  let draftColors = validColors(palette?.colors) ? [...palette.colors] : [...examples[0].colors];
  const status = text => { $('communityDraftStatus').textContent = text; };
  function store() {
    try { localStorage.setItem(KEY, JSON.stringify(drafts)); status('Saved privately on this device. Nothing has been published.'); }
    catch { status('Browser storage is unavailable. This draft is only kept until you leave the page.'); }
  }
  const element = (tag, text, className) => { const e = document.createElement(tag); if (text) e.textContent = text; if (className) e.className = className; return e; };
  function colorsRow(colors) { const row = element('div', null, 'community-post-palette'); colors.forEach(color => { const chip = element('i'); chip.style.setProperty('--swatch', color); chip.setAttribute('aria-label', color); row.append(chip); }); row.setAttribute('aria-label', 'Five-color palette'); return row; }
  const colorInputs = $('communityDraftColors');
  draftColors.forEach((color, index) => { const chip = element('i'); const input = element('input'); input.type = 'color'; input.value = color; input.setAttribute('aria-label', `Draft color ${index + 1}`); input.addEventListener('change', () => { draftColors[index] = input.value.toUpperCase(); }); chip.append(input); colorInputs.append(chip); });
  function render() {
    const posts = [...drafts, ...examples];
    $('communityPosts').replaceChildren(...posts.filter(post => filter === 'all' || post.type === filter).map(post => {
      const isExample = post.id.startsWith('example-');
      const article = element('article', null, 'discussion-post');
      const header = element('header'); header.append(element('strong', isExample ? 'ColorVerse' : 'Your private draft'), element('span', isExample ? 'Example question · not a member post' : `${post.type} · device only`)); article.append(header);
      if (post.title) article.append(element('h2', post.title));
      article.append(element('p', post.text), colorsRow(post.colors));
      const actions = element('div', null, 'discussion-actions'); const open = element('button', 'Try palette in Studio ↗'); open.type = 'button'; open.onclick = () => openPalette({ id: `discussion-${post.id}`, name: post.title || 'Community draft', colors: post.colors, image: null, category: 'Private draft', description: post.text.slice(0, 160), sourcePaletteId: null }); actions.append(open);
      if (!isExample) { const remove = element('button', 'Remove draft', 'discussion-delete'); remove.type = 'button'; remove.onclick = () => { drafts = drafts.filter(item => item.id !== post.id); store(); render(); }; actions.append(remove); }
      article.append(actions);
      const comments = element('div', null, 'discussion-comments');
      const replies = isExample ? sampleComments : post.comments;
      if (!replies.length) comments.append(element('p', 'Try a comment. It stays private on this device.', 'discussion-comment-empty'));
      replies.forEach(text => { const p = element('p', text, 'discussion-comment'); p.prepend(element('small', 'You · private test comment')); comments.append(p); });
      const form = element('form', null, 'discussion-comment-form'), input = element('input'), add = element('button', 'Add'); input.placeholder = 'Comment on a color decision…'; input.maxLength = 500; input.required = true; input.setAttribute('aria-label', 'Private test comment'); add.type = 'submit'; form.append(input, add);
      form.onsubmit = event => { event.preventDefault(); const text = input.value.trim(); if (!text) return; if (isExample) { sampleComments = [...sampleComments, text].slice(-30); status('Test comment added locally. It is not a public comment and clears when you reload.'); } else { post.comments = [...post.comments, text].slice(-30); store(); } render(); };
      comments.append(form); article.append(comments); return article;
    }));
  }
  composer.onsubmit = event => { event.preventDefault(); const text = $('communityPostText').value.trim(); if (!text) return; drafts.unshift({ id: `draft-${crypto.randomUUID()}`, type: $('communityPostType').value, text, colors: [...draftColors], comments: [] }); drafts = drafts.slice(0, 20); $('communityPostText').value = ''; store(); render(); };
  document.querySelectorAll('[data-discussion-filter]').forEach(button => button.onclick = () => { filter = button.dataset.discussionFilter; document.querySelectorAll('[data-discussion-filter]').forEach(item => item.setAttribute('aria-pressed', String(item === button))); render(); });
  render();
}
