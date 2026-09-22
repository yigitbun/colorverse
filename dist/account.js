import { getAccountClient, initAccountNavigation, accountReturnURL } from './account-client.js';
import { MIN_COLORS, MAX_COLORS, DRAFT_KEY, STUDIO_HANDOFF_KEY, normalizeHex, readDraft, sanitizeDraft, studioColors } from './member-palette.js';
import { palettes } from './palettes.js?v=27';
import { textOn } from './color.js';

const $ = selector => document.querySelector(selector);
const make = (tag, text, className) => { const el = document.createElement(tag); if (text) el.textContent = text; if (className) el.className = className; return el; };
const referenceFor = id => palettes.find(p => p.id === id) || (id === 'drift-field-01' ? { id, name: 'Field 01' } : null);
let client, session, mode = 'signin', recovery = false, busy = false, generation = 0;
let items = [], collections = [], offset = 0, editing = null, editorColors = [], referenceKey = null, choice = null, chosen = [], deleting = null;
const PAGE_SIZE = 24;
const editor = $('#paletteEditor');

function status(text, kind = '') { $('#accountStatus').textContent = text; $('#accountStatus').dataset.kind = kind; }
function editorStatus(text) { $('#memberEditorStatus').textContent = text; }
function writeDraft(value) { try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify(sanitizeDraft(value))); } catch {} }
function clearDraft() { try { sessionStorage.removeItem(DRAFT_KEY); } catch {} }
function authMessage(error) {
  if (error?.code === 'invalid_credentials') return 'Email or password is incorrect. Try again or reset your password.';
  if (error?.code === 'email_not_confirmed') return 'Please confirm your email before signing in. Check your inbox and spam folder.';
  if (/rate_limit/.test(error?.code || '') || error?.status === 429) return 'Too many attempts. Please wait a little before trying again.';
  if (error?.code === 'email_address_not_authorized') return 'Email delivery is not enabled for this address yet. Please contact the site owner.';
  if (error?.code === 'weak_password') return 'Choose a stronger password of at least 12 characters.';
  return 'We could not complete that request. Please try again. Your palette is still here.';
}

function setMode(next) {
  mode = next;
  $('#passwordLabel').hidden = next === 'reset';
  $('#accountPassword').required = next !== 'reset';
  $('#accountPassword').minLength = next === 'signup' ? 12 : 1;
  $('#accountPassword').autocomplete = next === 'signup' ? 'new-password' : 'current-password';
  $('#passwordGuide').hidden = next !== 'signup';
  $('#authSubmit').textContent = ({ signin: 'Sign in', signup: 'Create account', reset: 'Send reset link' })[next];
  $('#forgotPassword').hidden = next !== 'signin';
  $('#backToSignIn').hidden = next !== 'reset';
  document.querySelectorAll('[data-auth-mode]').forEach(button => {
    const selected = button.dataset.authMode === (next === 'reset' ? 'signin' : next);
    button.setAttribute('aria-selected', String(selected)); button.tabIndex = selected ? 0 : -1;
    if (selected) $('#authForm').setAttribute('aria-labelledby', button.id);
  });
  status('');
}
document.querySelectorAll('[data-auth-mode]').forEach(button => {
  button.addEventListener('click', () => { if (!busy) setMode(button.dataset.authMode); });
  button.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key) || busy) return;
    event.preventDefault(); setMode(button.dataset.authMode === 'signin' ? 'signup' : 'signin');
    document.querySelector('[data-auth-mode][aria-selected=true]').focus();
  });
});
$('#forgotPassword').addEventListener('click', () => setMode('reset'));
$('#backToSignIn').addEventListener('click', () => setMode('signin'));

$('#authForm').addEventListener('submit', async event => {
  event.preventDefault(); if (busy) return;
  busy = true; $('#authSubmit').disabled = true; status('Connecting securely…');
  const submittedMode = mode;
  try {
    client ||= await getAccountClient();
    const email = $('#accountEmail').value.trim(), password = $('#accountPassword').value;
    let result;
    if (submittedMode === 'signup') result = await client.auth.signUp({ email, password, options: { emailRedirectTo: accountReturnURL() } });
    else if (submittedMode === 'reset') result = await client.auth.resetPasswordForEmail(email, { redirectTo: accountReturnURL() });
    else result = await client.auth.signInWithPassword({ email, password });
    if (result.error) status(authMessage(result.error), 'error');
    else {
      $('#accountPassword').value = '';
      status(submittedMode === 'signup' && !result.data.session
        ? 'Check your inbox to confirm your account. If you already have an account, use Sign in instead.'
        : submittedMode === 'reset' ? 'If an account exists for this email, a password reset link is on its way. Check your spam folder too.' : 'You’re signed in.');
    }
  } catch (error) { status(client ? authMessage(error) : error.message, 'error'); }
  finally { busy = false; $('#authSubmit').disabled = false; }
});

$('#recoveryForm').addEventListener('submit', async event => {
  event.preventDefault(); const button = event.currentTarget.querySelector('button'); button.disabled = true;
  try {
    const { error } = await client.auth.updateUser({ password: $('#newPassword').value });
    if (error) throw error;
    $('#newPassword').value = ''; recovery = false; renderSession(); status('Password updated.');
  } catch (error) { status(authMessage(error), 'error'); }
  finally { button.disabled = false; }
});

function renderSession() {
  $('#signInPanel').hidden = Boolean(session?.user) || recovery;
  $('#libraryPanel').hidden = !session?.user || recovery;
  $('#recoveryPanel').hidden = !recovery;
  $('#accountIdentity').textContent = session?.user?.email || '';
  $('#pendingDraft').hidden = !readDraft(sessionStorage);
  if (!session?.user) {
    generation++; items = []; collections = []; $('#memberPaletteGrid').replaceChildren();
    $('#collectionFilter').replaceChildren(new Option('All collections', ''));
    editor.close(); $('#studioColorPicker').close(); $('#deletePaletteDialog').close();
    $('#accountIdentity').textContent = '';
  }
}

async function loadCollections() {
  const ownGeneration = generation;
  const { data, error } = await client.from('collections').select('id,name').order('name');
  if (ownGeneration !== generation || !session) return;
  if (error) { status('Collections could not be loaded. Please refresh to try again.', 'error'); return; }
  collections = data || [];
  const selected = $('#collectionFilter').value;
  $('#collectionFilter').replaceChildren(new Option('All collections', ''));
  $('#collectionNames').replaceChildren();
  for (const item of collections) {
    $('#collectionFilter').add(new Option(item.name, item.id));
    $('#collectionNames').append(new Option(item.name, item.name));
  }
  if (collections.some(item => item.id === selected)) $('#collectionFilter').value = selected;
}

async function loadPalettes(reset = true) {
  if (!session) return;
  const ownGeneration = ++generation;
  if (reset) { offset = 0; items = []; $('#memberPaletteGrid').replaceChildren(); }
  $('#memberPaletteGrid').setAttribute('aria-busy', 'true'); $('#loadMore').disabled = true;
  $('#emptyLibrary').hidden = true;
  try {
    let query = client.from('saved_palette_items').select('id,name,colors,palette_id,source_metadata,collection_id,updated_at,collections(name)')
      .order('created_at', { ascending: false }).order('id', { ascending: false }).range(offset, offset + PAGE_SIZE - 1);
    if ($('#collectionFilter').value) query = query.eq('collection_id', $('#collectionFilter').value);
    const { data, error } = await query;
    if (ownGeneration !== generation || !session) return;
    if (error) throw error;
    items.push(...data); offset += data.length;
    renderPalettes(); $('#loadMore').hidden = data.length < PAGE_SIZE;
    $('#emptyLibrary').hidden = items.length > 0;
  } catch { if (ownGeneration === generation) { status('Your palettes could not be loaded. Please refresh to retry; nothing has been removed.', 'error'); $('#loadMore').hidden = true; } }
  finally { if (ownGeneration === generation) { $('#memberPaletteGrid').setAttribute('aria-busy', 'false'); $('#loadMore').disabled = false; } }
}

function renderPalettes() {
  $('#memberPaletteGrid').replaceChildren();
  for (const item of items) {
    const card = make('article', '', 'member-palette-card');
    const strip = make('div', '', 'member-palette-strip'); strip.setAttribute('aria-label', item.colors.join(', '));
    for (const color of item.colors) { const swatch = make('i'); swatch.style.backgroundColor = color; swatch.title = color; strip.append(swatch); }
    const ref = referenceFor(item.source_metadata?.reference_key || item.palette_id);
    const actions = make('div', '', 'member-palette-actions');
    const edit = make('button', 'Edit'); edit.type = 'button'; edit.addEventListener('click', () => openEditor(item));
    const studio = make('button', 'Open in Studio ↗'); studio.type = 'button'; studio.disabled = item.colors.length < 5;
    if (studio.disabled) studio.title = 'Add at least five colors to use the five Studio roles.';
    studio.addEventListener('click', () => chooseStudio(item));
    const remove = make('button'); remove.type = 'button'; remove.dataset.remove = ''; remove.setAttribute('aria-label', `Delete ${item.name || 'palette'}`);
    remove.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 10v7m4-7v7"/></svg>';
    remove.addEventListener('click', () => { deleting = item; $('#deleteStatus').textContent = ''; $('#deletePaletteDialog').showModal(); });
    actions.append(edit, studio, remove);
    card.append(strip, make('h2', item.name || 'Untitled palette'), make('p', `${item.collections?.name || 'My palettes'} · ${item.colors.length} colors${ref ? ` · ${ref.name}` : ''}`), actions);
    $('#memberPaletteGrid').append(card);
  }
}

function openEditor(item = null, draft = null) {
  editing = item?.id || null;
  editorColors = [...(item?.colors || draft?.colors || ['#F1ECE4', '#C9C5B6', '#75826F', '#AC7760', '#303936'])];
  referenceKey = item?.source_metadata?.reference_key || item?.palette_id || draft?.referenceKey || null;
  $('#memberPaletteName').value = item?.name || draft?.name || 'Untitled palette';
  $('#memberCollection').value = item?.collections?.name || draft?.collection || collections.find(c => c.id === $('#collectionFilter').value)?.name || 'My palettes';
  $('#editorTitle').textContent = item ? 'Edit palette' : 'New palette';
  editorStatus(''); renderEditorColors(); editor.showModal(); $('#memberPaletteName').focus();
}
function renderEditorColors() {
  $('#memberColors').replaceChildren(); $('#memberColorCount').textContent = `${editorColors.length} colors`;
  $('#addMemberColor').disabled = editorColors.length >= MAX_COLORS;
  editorColors.forEach((color, index) => {
    const cell = make('div', '', 'member-color-cell');
    const picker = document.createElement('input'); picker.type = 'color'; picker.value = color; picker.setAttribute('aria-label', `Change color ${index + 1}`);
    const hex = document.createElement('input'); hex.type = 'text'; hex.value = color; hex.maxLength = 7; hex.required = true; hex.pattern = '#?[a-fA-F0-9]{6}'; hex.spellcheck = false; hex.setAttribute('aria-label', `HEX color ${index + 1}`);
    picker.addEventListener('input', () => { editorColors[index] = picker.value.toUpperCase(); hex.value = editorColors[index]; hex.setCustomValidity(''); });
    hex.addEventListener('input', () => { const value = normalizeHex(hex.value); hex.setCustomValidity(value ? '' : 'Enter six HEX digits, for example #75826F.'); if (value) { editorColors[index] = value; picker.value = value; } });
    const remove = make('button', '×'); remove.type = 'button'; remove.setAttribute('aria-label', `Remove color ${index + 1}`); remove.disabled = editorColors.length <= MIN_COLORS;
    remove.addEventListener('click', () => { editorColors.splice(index, 1); renderEditorColors(); });
    cell.append(picker, hex, remove); $('#memberColors').append(cell);
  });
}
$('#addMemberColor').addEventListener('click', () => { if (editorColors.length < MAX_COLORS) { editorColors.push('#D9D5CE'); renderEditorColors(); } });
$('#closeEditor').addEventListener('click', () => editor.close());
$('#newPalette').addEventListener('click', () => openEditor());
$('#savePendingDraft').addEventListener('click', () => openEditor(null, readDraft(sessionStorage)));

$('#paletteForm').addEventListener('submit', async event => {
  event.preventDefault(); if (!session) return;
  const button = $('#saveMemberPalette'); if (button.disabled) return;
  const draft = { name: $('#memberPaletteName').value.trim(), collection: $('#memberCollection').value.trim(), colors: [...editorColors], referenceKey };
  if (!draft.name || !draft.collection) { editorStatus('Add a name and a collection.'); return; }
  button.disabled = true; editorStatus('Saving…'); const owner = session.user.id;
  try {
    const { error } = await client.rpc('save_member_palette', { p_item_id: editing, p_collection_name: draft.collection, p_name: draft.name, p_colors: draft.colors, p_reference_key: referenceKey });
    if (session?.user.id !== owner) return;
    if (error) throw error;
    clearDraft(); $('#pendingDraft').hidden = true; editor.close(); status('Palette saved privately.');
    await loadCollections(); await loadPalettes();
  } catch { writeDraft(draft); editorStatus('Could not save. Your draft is kept in this tab. Try again.'); }
  finally { button.disabled = false; }
});

function openStudio(item, colors) {
  const draft = sanitizeDraft({ name: item.name, colors, referenceKey: item.source_metadata?.reference_key || item.palette_id });
  try { sessionStorage.setItem(STUDIO_HANDOFF_KEY, JSON.stringify(draft)); }
  catch { status('Browser storage is unavailable. Allow site storage to transfer this palette to Studio.', 'error'); return; }
  location.assign('/studio/?saved=1');
}
function chooseStudio(item) {
  if (item.colors.length === 5) { openStudio(item, item.colors); return; }
  choice = item; chosen = []; renderChoice(); $('#studioColorPicker').showModal();
}
function renderChoice() {
  $('#studioChoiceColors').replaceChildren();
  choice.colors.forEach((color, index) => {
    const button = make('button'); button.type = 'button'; button.style.setProperty('--swatch', color); button.style.setProperty('--swatch-ink', textOn(color));
    button.setAttribute('aria-pressed', String(chosen.includes(index))); button.setAttribute('aria-label', `Color ${index + 1}: ${color}`);
    const position = chosen.indexOf(index); button.append(make('strong', position >= 0 ? String(position + 1) : '+'), make('span', color));
    button.addEventListener('click', () => { if (chosen.includes(index)) chosen = chosen.filter(value => value !== index); else if (chosen.length < 5) chosen.push(index); renderChoice(); });
    $('#studioChoiceColors').append(button);
  });
  $('#studioChoiceStatus').textContent = `${chosen.length} of 5 selected`; $('#openChosenStudio').disabled = chosen.length !== 5;
}
$('#closeStudioPicker').addEventListener('click', () => $('#studioColorPicker').close());
$('#openChosenStudio').addEventListener('click', () => { const colors = studioColors(choice.colors, chosen); if (colors) openStudio(choice, colors); });
$('#cancelDelete').addEventListener('click', () => $('#deletePaletteDialog').close());
$('#confirmDelete').addEventListener('click', async () => {
  if (!deleting || !session) return; $('#confirmDelete').disabled = true;
  try {
    const { error } = await client.rpc('delete_saved_palette_item', { p_item_id: deleting.id }); if (error) throw error;
    $('#deletePaletteDialog').close(); deleting = null; status('Palette removed from your collection.'); await loadPalettes();
  } catch { $('#deleteStatus').textContent = 'Could not delete this palette. Please try again.'; }
  finally { $('#confirmDelete').disabled = false; }
});
$('#loadMore').addEventListener('click', () => loadPalettes(false));
$('#collectionFilter').addEventListener('change', () => loadPalettes());
$('#signOut').addEventListener('click', async () => {
  $('#signOut').disabled = true;
  try {
    const { error } = await client.auth.signOut(); if (error) throw error;
    session = null; recovery = false; clearDraft(); renderSession(); status('Signed out. Your saved palettes are safe in your account.');
  } catch { status('Sign-out could not be completed. Please retry.', 'error'); }
  finally { $('#signOut').disabled = false; }
});

setMode('signin');
initAccountNavigation();
try {
  client = await getAccountClient();
  client.auth.onAuthStateChange((event, nextSession) => {
    const changedUser = session?.user.id !== nextSession?.user.id;
    session = nextSession;
    if (event === 'PASSWORD_RECOVERY') recovery = true;
    if (!session) recovery = false;
    renderSession();
    // Never make another Supabase request inside its auth lock/callback.
    if (session && (changedUser || event === 'SIGNED_IN')) setTimeout(async () => { await loadCollections(); await loadPalettes(); }, 0);
  });
  const { data, error } = await client.auth.getSession();
  if (error) throw error;
  session = data.session; renderSession();
  // INITIAL_SESSION can arrive before getSession resolves; load saved work in
  // either ordering instead of leaving a returning member with an empty view.
  if (session) { await loadCollections(); await loadPalettes(); }
  const errorParams = new URLSearchParams(location.hash.slice(1));
  if (errorParams.has('error') || new URLSearchParams(location.search).has('error')) status('This email link is invalid or expired. Request a fresh link or sign in with your password.', 'error');
  if (location.search || location.hash) history.replaceState(null, '', '/account/');
} catch (error) { renderSession(); status(client ? authMessage(error) : error.message, 'error'); }
