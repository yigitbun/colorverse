const SUPABASE_URL = 'https://ayzymeogptrqtouwnahh.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_TY49mfQAzRXvIWjlXKi9Ow_gTCaGid_';
const ACTIVE_PROJECT_KEY = 'colorverse-active-project';

const $ = selector => document.querySelector(selector);
const validProjectId = value => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value || '');
const contextToDatabase = value => ({ landing: 'brand', interface: 'website', presentation: 'slides' })[value] || 'custom';
const contextToStudio = value => ({ brand: 'landing', website: 'interface', slides: 'presentation' })[value] || 'landing';

function relativeTime(value) {
  const then = new Date(value).getTime();
  const delta = Math.max(0, Date.now() - then);
  const minutes = Math.round(delta / 60000);
  if (minutes < 2) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

export async function initProjectWorkspace(studio) {
  const dialog = $('#projectDialog');
  const saveTrigger = $('#saveProject');
  const projectsTrigger = $('#openProjects');
  if (!dialog || !saveTrigger || !projectsTrigger || !window.supabase?.createClient || !studio) return;

  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      flowType: 'pkce',
      persistSession: true,
      detectSessionInUrl: true,
      storageKey: 'colorverse-auth',
    },
  });
  const authView = $('#projectAuthView');
  const workspaceView = $('#projectWorkspaceView');
  const authForm = $('#projectAuthForm');
  const saveForm = $('#projectSaveForm');
  const templateForm = $('#projectTemplateForm');
  const savePaletteForm = $('#savePaletteForm');
  const list = $('#projectList');
  const archivedList = $('#archivedProjectList');
  const templateList = $('#templateList');
  const savedPaletteList = $('#savedPaletteList');
  const message = $('#projectMessage');
  const syncLabel = $('#projectSyncLabel');
  const accountLabel = $('#projectAccount');
  const signOut = $('#projectSignOut');
  const nameInput = $('#projectName');
  const templateNameInput = $('#templateName');
  const collectionNameInput = $('#collectionName');
  const contextInput = $('#projectContext');
  let session = null;
  let projects = [];
  let archivedProjects = [];
  let templates = [];
  let savedPalettes = [];
  let activeProjectId = null;
  let dirty = false;

  try {
    const stored = localStorage.getItem(ACTIVE_PROJECT_KEY);
    if (validProjectId(stored)) activeProjectId = stored;
  } catch {}

  function setMessage(value, kind = '') {
    message.textContent = value;
    message.dataset.kind = kind;
  }

  function setSyncLabel(value) {
    syncLabel.textContent = value;
  }

  function renderSession() {
    const signedIn = Boolean(session?.user);
    authView.hidden = signedIn;
    workspaceView.hidden = !signedIn;
    accountLabel.textContent = signedIn ? session.user.email || 'Signed in' : '';
    signOut.hidden = !signedIn;
    if (!signedIn) {
      setSyncLabel('Local draft');
      projects = [];
      archivedProjects = [];
      templates = [];
      savedPalettes = [];
      renderProjects();
      renderArchivedProjects();
      renderTemplates();
      renderSavedPalettes();
    }
  }

  function latestVersion(project) {
    return [...(project.project_versions || [])].sort((a, b) => b.version_number - a.version_number)[0] || null;
  }

  function renderProjects() {
    list.replaceChildren();
    if (!projects.length) {
      const empty = document.createElement('p');
      empty.className = 'project-empty';
      empty.textContent = 'No saved projects yet. Your first save creates a private baseline.';
      list.append(empty);
      return;
    }
    for (const project of projects) {
      const version = latestVersion(project);
      const item = document.createElement('article');
      item.className = `project-item${project.id === activeProjectId ? ' is-active' : ''}`;
      const copy = document.createElement('div');
      const title = document.createElement('strong');
      title.textContent = project.name;
      const meta = document.createElement('span');
      meta.textContent = `${version ? `v${version.version_number}` : 'Empty'} · ${relativeTime(project.updated_at)}`;
      copy.append(title, meta);
      const open = document.createElement('button');
      open.type = 'button';
      open.className = 'project-open';
      open.textContent = project.id === activeProjectId ? 'Open' : 'Resume';
      open.addEventListener('click', () => openProject(project));
      const actions = document.createElement('div');
      actions.className = 'project-actions';
      const archive = document.createElement('button');
      archive.type = 'button';
      archive.className = 'project-manage';
      archive.textContent = 'Archive';
      archive.addEventListener('click', () => archiveProject(project));
      actions.append(open, archive);
      item.append(copy, actions);
      list.append(item);
    }
  }

  function renderArchivedProjects() {
    if (!archivedList) return;
    archivedList.replaceChildren();
    if (!archivedProjects.length) {
      const empty = document.createElement('p');
      empty.className = 'project-empty';
      empty.textContent = 'Archived projects will appear here.';
      archivedList.append(empty);
      return;
    }
    for (const project of archivedProjects) {
      const item = document.createElement('article');
      item.className = 'project-item';
      const copy = document.createElement('div');
      const title = document.createElement('strong');
      title.textContent = project.name;
      const version = latestVersion(project);
      const meta = document.createElement('span');
      meta.textContent = `${version ? `v${version.version_number}` : 'Empty'} · ${relativeTime(project.updated_at)}`;
      copy.append(title, meta);
      const restore = document.createElement('button');
      restore.type = 'button';
      restore.className = 'project-manage';
      restore.textContent = 'Restore';
      restore.addEventListener('click', () => restoreProject(project));
      item.append(copy, restore);
      archivedList.append(item);
    }
  }

  async function archiveProject(project) {
    if (!window.confirm(`Archive “${project.name}”? Its version history will be kept.`)) return;
    setMessage('Archiving project…');
    const { error } = await client.rpc('archive_project', { p_project_id: project.id });
    if (error) {
      setMessage('This project could not be archived.', 'error');
      return;
    }
    if (project.id === activeProjectId) {
      activeProjectId = null;
      try { localStorage.removeItem(ACTIVE_PROJECT_KEY); } catch {}
      setSyncLabel('Local draft');
    }
    await Promise.all([loadProjects(), loadArchivedProjects()]);
    setMessage('Project archived. Its history remains private.', 'success');
  }

  async function restoreProject(project) {
    setMessage('Restoring project…');
    const { error } = await client.rpc('restore_project', { p_project_id: project.id });
    if (error) {
      setMessage('This project could not be restored.', 'error');
      return;
    }
    await Promise.all([loadProjects(), loadArchivedProjects()]);
    setMessage('Project restored to your active list.', 'success');
  }

  function renderTemplates() {
    templateList.replaceChildren();
    if (!templates.length) {
      const empty = document.createElement('p');
      empty.className = 'project-empty';
      empty.textContent = 'Save a strong direction once and reuse it as a starting point.';
      templateList.append(empty);
      return;
    }
    for (const template of templates) {
      const item = document.createElement('article');
      item.className = 'template-item';
      const copy = document.createElement('div');
      const title = document.createElement('strong');
      title.textContent = template.name;
      const meta = document.createElement('span');
      meta.textContent = relativeTime(template.updated_at);
      copy.append(title, meta);
      const use = document.createElement('button');
      use.type = 'button';
      use.className = 'project-open';
      use.textContent = 'Use';
      use.addEventListener('click', () => openTemplate(template));
      const actions = document.createElement('div');
      actions.className = 'template-actions';
      const rename = document.createElement('button');
      rename.type = 'button';
      rename.className = 'template-manage';
      rename.textContent = 'Rename';
      rename.addEventListener('click', () => renameTemplate(template));
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'template-manage template-delete';
      remove.textContent = 'Delete';
      remove.addEventListener('click', () => deleteTemplate(template));
      actions.append(use, rename, remove);
      item.append(copy, actions);
      templateList.append(item);
    }
  }

  function renderSavedPalettes() {
    if (!savedPaletteList) return;
    savedPaletteList.replaceChildren();
    if (!savedPalettes.length) {
      const empty = document.createElement('p');
      empty.className = 'project-empty';
      empty.textContent = 'Save a direction here when it is worth keeping for later.';
      savedPaletteList.append(empty);
      return;
    }
    for (const item of savedPalettes) {
      const row = document.createElement('article');
      row.className = 'saved-palette-item';
      const copy = document.createElement('div');
      const title = document.createElement('strong');
      title.textContent = item.name || 'Untitled palette';
      const meta = document.createElement('span');
      meta.textContent = `${item.collections?.name || 'Saved palettes'} · ${relativeTime(item.created_at)}`;
      const swatches = document.createElement('div');
      swatches.className = 'saved-palette-swatches';
      for (const color of item.colors || []) {
        const swatch = document.createElement('i');
        swatch.style.setProperty('--swatch', color);
        swatch.title = color;
      swatches.append(swatch);
      }
      copy.append(title, meta, swatches);
      const actions = document.createElement('div');
      actions.className = 'template-actions';
      const use = document.createElement('button');
      use.type = 'button';
      use.className = 'project-open';
      use.textContent = 'Use';
      use.addEventListener('click', () => openSavedPalette(item));
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'template-manage template-delete';
      remove.textContent = 'Remove';
      remove.addEventListener('click', () => deleteSavedPalette(item));
      actions.append(use, remove);
      row.append(copy, actions);
      savedPaletteList.append(row);
    }
  }

  function openSavedPalette(item) {
    studio.loadSnapshot({
      name: item.name || 'Saved palette',
      sourcePaletteId: item.palette_id || null,
      colors: item.colors,
      roles: {},
      context: 'landing',
      productKind: 'footwear',
    });
    activeProjectId = null;
    dirty = true;
    try { localStorage.removeItem(ACTIVE_PROJECT_KEY); } catch {}
    setSyncLabel('Saved palette · local draft');
    window.colorverseTrack?.('palette_collection_use', { storage: 'cloud' });
    dialog.close();
  }

  async function deleteSavedPalette(item) {
    if (!window.confirm(`Remove “${item.name || 'Untitled palette'}” from this collection?`)) return;
    setMessage('Removing saved palette…');
    const { error } = await client.rpc('delete_saved_palette_item', { p_item_id: item.id });
    if (error) {
      setMessage('This saved palette could not be removed.', 'error');
      return;
    }
    await loadSavedPalettes();
    setMessage('Saved palette removed.', 'success');
  }

  async function renameTemplate(template) {
    const nextName = window.prompt('Template name', template.name)?.trim();
    if (!nextName || nextName === template.name) return;
    setMessage('Renaming template…');
    const { error } = await client.rpc('rename_template', {
      p_template_id: template.id,
      p_name: nextName,
    });
    if (error) {
      setMessage('This template could not be renamed.', 'error');
      return;
    }
    await loadTemplates();
    setMessage('Template renamed.', 'success');
  }

  async function deleteTemplate(template) {
    if (!window.confirm(`Delete “${template.name}”? This cannot be undone.`)) return;
    setMessage('Deleting template…');
    const { error } = await client.rpc('delete_template', { p_template_id: template.id });
    if (error) {
      setMessage('This template could not be deleted.', 'error');
      return;
    }
    await loadTemplates();
    setMessage('Template deleted.', 'success');
  }

  async function loadProjects() {
    if (!session) return;
    list.setAttribute('aria-busy', 'true');
    const { data, error } = await client
      .from('projects')
      .select('id,name,context_type,source_palette_id,updated_at,project_versions(id,version_number,name,colors,roles,editor_state,created_at)')
      .eq('status', 'active')
      .order('updated_at', { ascending: false });
    list.removeAttribute('aria-busy');
    if (error) {
      setMessage('Projects could not be loaded. Try again in a moment.', 'error');
      return;
    }
    projects = data || [];
    renderProjects();
  }

  async function loadArchivedProjects() {
    if (!session || !archivedList) return;
    archivedList.setAttribute('aria-busy', 'true');
    const { data, error } = await client
      .from('projects')
      .select('id,name,context_type,source_palette_id,updated_at,project_versions(id,version_number,name,colors,roles,editor_state,created_at)')
      .eq('status', 'archived')
      .order('updated_at', { ascending: false });
    archivedList.removeAttribute('aria-busy');
    if (error) {
      setMessage('Archived projects could not be loaded.', 'error');
      return;
    }
    archivedProjects = data || [];
    renderArchivedProjects();
  }

  async function loadTemplates() {
    if (!session) return;
    templateList.setAttribute('aria-busy', 'true');
    const { data, error } = await client
      .from('templates')
      .select('id,name,context_type,colors,roles,defaults,updated_at')
      .order('updated_at', { ascending: false });
    templateList.removeAttribute('aria-busy');
    if (error) {
      setMessage('Templates could not be loaded. Try again in a moment.', 'error');
      return;
    }
    templates = data || [];
    renderTemplates();
  }

  async function loadSavedPalettes() {
    if (!session || !savedPaletteList) return;
    savedPaletteList.setAttribute('aria-busy', 'true');
    const { data, error } = await client
      .from('saved_palette_items')
      .select('id,name,palette_id,colors,created_at,collections(name)')
      .order('created_at', { ascending: false })
      .limit(12);
    savedPaletteList.removeAttribute('aria-busy');
    if (error) {
      setMessage('Saved palettes could not be loaded. Try again in a moment.', 'error');
      return;
    }
    savedPalettes = data || [];
    renderSavedPalettes();
  }

  async function loadColorTray() {
    if (!session) return;
    const { data, error } = await client
      .from('color_tray_items')
      .select('hex,position')
      .order('position', { ascending: true });
    if (error) {
      window.dispatchEvent(new CustomEvent('colorverse:trayerror'));
      return;
    }
    window.dispatchEvent(new CustomEvent('colorverse:trayremote', {
      detail: { colors: (data || []).map(item => item.hex) },
    }));
  }

  async function syncColorTray(colors) {
    if (!session || !Array.isArray(colors)) return;
    const { error } = await client.rpc('sync_color_tray', { p_colors: colors.slice(0, 18) });
    if (error) window.dispatchEvent(new CustomEvent('colorverse:trayerror'));
  }

  function openProject(project) {
    const version = latestVersion(project);
    if (!version) return;
    studio.loadSnapshot({
      id: project.id,
      name: project.name,
      sourcePaletteId: project.source_palette_id,
      colors: version.colors,
      roles: version.roles,
      context: version.editor_state?.context || contextToStudio(project.context_type),
      productKind: version.editor_state?.productKind || 'footwear',
    });
    activeProjectId = project.id;
    dirty = false;
    try { localStorage.setItem(ACTIVE_PROJECT_KEY, activeProjectId); } catch {}
    setSyncLabel(`Saved · v${version.version_number}`);
    window.colorverseTrack?.('project_resume', { storage: 'cloud' });
    dialog.close();
  }

  function openTemplate(template) {
    studio.loadSnapshot({
      name: template.name,
      sourcePaletteId: null,
      colors: template.colors,
      roles: template.roles,
      context: template.defaults?.context || contextToStudio(template.context_type),
      productKind: template.defaults?.productKind || 'footwear',
    });
    activeProjectId = null;
    dirty = true;
    try { localStorage.removeItem(ACTIVE_PROJECT_KEY); } catch {}
    setSyncLabel('Template · local draft');
    window.colorverseTrack?.('template_use', { storage: 'cloud' });
    dialog.close();
  }

  async function openDialog(mode = 'save') {
    setMessage('');
    const snapshot = studio.getSnapshot();
    nameInput.value = activeProjectId ? (projects.find(project => project.id === activeProjectId)?.name || snapshot.name) : snapshot.name;
    templateNameInput.value = snapshot.name;
    contextInput.value = contextToDatabase(snapshot.context);
    renderSession();
    if (session) await Promise.all([loadProjects(), loadTemplates(), loadSavedPalettes()]);
    dialog.showModal();
    requestAnimationFrame(() => (session && mode === 'save' ? nameInput : $('#projectEmail'))?.focus());
  }

  authForm.addEventListener('submit', async event => {
    event.preventDefault();
    const email = $('#projectEmail').value.trim();
    if (!email) return;
    const submit = authForm.querySelector('button[type="submit"]');
    submit.disabled = true;
    setMessage('Sending a secure sign-in link…');
    const { error } = await client.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: 'https://colorverse.byigit.dev/studio/' },
    });
    submit.disabled = false;
    setMessage(error ? 'The sign-in link could not be sent. Check the address and try again.' : 'Check your email. The link returns you to this Studio.', error ? 'error' : 'success');
  });

  saveForm.addEventListener('submit', async event => {
    event.preventDefault();
    const snapshot = studio.getSnapshot();
    const submit = saveForm.querySelector('button[type="submit"]');
    submit.disabled = true;
    setMessage('Saving a private snapshot…');
    const { data, error } = await client.rpc('save_project_snapshot', {
      p_project_id: activeProjectId,
      p_name: nameInput.value.trim(),
      p_context_type: contextInput.value,
      p_source_palette_id: snapshot.sourcePaletteId,
      p_colors: snapshot.colors,
      p_roles: snapshot.roles,
      p_editor_state: { context: snapshot.context, productKind: snapshot.productKind },
    });
    submit.disabled = false;
    if (error || !validProjectId(data)) {
      setMessage('This version could not be saved. Your local draft is still intact.', 'error');
      return;
    }
    activeProjectId = data;
    dirty = false;
    try { localStorage.setItem(ACTIVE_PROJECT_KEY, activeProjectId); } catch {}
    await loadProjects();
    const version = latestVersion(projects.find(project => project.id === activeProjectId) || {});
    setSyncLabel(`Saved${version ? ` · v${version.version_number}` : ''}`);
    setMessage('Private project saved.', 'success');
    window.colorverseTrack?.('project_save', { storage: 'cloud' });
  });

  templateForm.addEventListener('submit', async event => {
    event.preventDefault();
    const snapshot = studio.getSnapshot();
    const submit = templateForm.querySelector('button[type="submit"]');
    submit.disabled = true;
    setMessage('Saving a reusable template…');
    const { data, error } = await client.rpc('save_template_snapshot', {
      p_template_id: null,
      p_name: templateNameInput.value.trim(),
      p_context_type: contextToDatabase(snapshot.context),
      p_source_project_id: activeProjectId,
      p_colors: snapshot.colors,
      p_roles: snapshot.roles,
      p_defaults: { context: snapshot.context, productKind: snapshot.productKind },
    });
    submit.disabled = false;
    if (error || !validProjectId(data)) {
      setMessage('This template could not be saved. Your project is still intact.', 'error');
      return;
    }
    await loadTemplates();
    setMessage('Private template saved.', 'success');
    window.colorverseTrack?.('template_save', { storage: 'cloud' });
  });

  savePaletteForm?.addEventListener('submit', async event => {
    event.preventDefault();
    const snapshot = studio.getSnapshot();
    const submit = savePaletteForm.querySelector('button[type="submit"]');
    submit.disabled = true;
    setMessage('Saving palette to your collection…');
    const { error } = await client.rpc('save_palette_to_collection', {
      p_collection_name: collectionNameInput.value.trim(),
      p_name: snapshot.name,
      p_palette_id: snapshot.sourcePaletteId,
      p_colors: snapshot.colors,
    });
    submit.disabled = false;
    if (error) {
      setMessage('This palette could not be saved. Your project is still intact.', 'error');
      return;
    }
    await loadSavedPalettes();
    setMessage('Palette saved to your private collection.', 'success');
    window.colorverseTrack?.('palette_collection_save', { storage: 'cloud' });
  });

  signOut.addEventListener('click', async () => {
    await client.auth.signOut();
    activeProjectId = null;
    dirty = false;
    templates = [];
    savedPalettes = [];
    try { localStorage.removeItem(ACTIVE_PROJECT_KEY); } catch {}
    setMessage('Signed out. The palette remains in this browser.', 'success');
  });

  saveTrigger.addEventListener('click', () => openDialog('save'));
  projectsTrigger.addEventListener('click', () => openDialog('projects'));
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
  dialog.querySelectorAll('[data-project-close]').forEach(button => button.addEventListener('click', () => dialog.close()));
  window.addEventListener('colorverse:studiochange', () => {
    if (!activeProjectId) return;
    dirty = true;
    setSyncLabel('Unsaved changes');
  });

  const { data } = await client.auth.getSession();
  session = data.session;
  renderSession();
  if (session) {
    await Promise.all([loadProjects(), loadArchivedProjects(), loadTemplates(), loadSavedPalettes(), loadColorTray()]);
    const active = projects.find(project => project.id === activeProjectId);
    const version = active && latestVersion(active);
    setSyncLabel(version ? `Saved · v${version.version_number}` : 'Cloud ready');
  }
  client.auth.onAuthStateChange((_event, nextSession) => {
    session = nextSession;
    renderSession();
    if (session) Promise.all([loadProjects(), loadArchivedProjects(), loadTemplates(), loadSavedPalettes(), loadColorTray()]);
  });

  window.addEventListener('colorverse:traychange', event => {
    syncColorTray(event.detail?.colors).catch(() => {});
  });
}
