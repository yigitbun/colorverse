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
  const list = $('#projectList');
  const templateList = $('#templateList');
  const message = $('#projectMessage');
  const syncLabel = $('#projectSyncLabel');
  const accountLabel = $('#projectAccount');
  const signOut = $('#projectSignOut');
  const nameInput = $('#projectName');
  const templateNameInput = $('#templateName');
  const contextInput = $('#projectContext');
  let session = null;
  let projects = [];
  let templates = [];
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
      templates = [];
      renderProjects();
      renderTemplates();
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
      item.append(copy, open);
      list.append(item);
    }
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
      item.append(copy, use);
      templateList.append(item);
    }
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

  async function loadColorTray() {
    if (!session) return;
    const { data, error } = await client
      .from('color_tray_items')
      .select('hex,position')
      .order('position', { ascending: true });
    if (error) return;
    window.dispatchEvent(new CustomEvent('colorverse:trayremote', {
      detail: { colors: (data || []).map(item => item.hex) },
    }));
  }

  async function syncColorTray(colors) {
    if (!session || !Array.isArray(colors)) return;
    await client.rpc('sync_color_tray', { p_colors: colors.slice(0, 18) });
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
    if (session) await Promise.all([loadProjects(), loadTemplates()]);
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

  signOut.addEventListener('click', async () => {
    await client.auth.signOut();
    activeProjectId = null;
    dirty = false;
    templates = [];
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
    await Promise.all([loadProjects(), loadTemplates(), loadColorTray()]);
    const active = projects.find(project => project.id === activeProjectId);
    const version = active && latestVersion(active);
    setSyncLabel(version ? `Saved · v${version.version_number}` : 'Cloud ready');
  }
  client.auth.onAuthStateChange((_event, nextSession) => {
    session = nextSession;
    renderSession();
    if (session) Promise.all([loadProjects(), loadTemplates(), loadColorTray()]);
  });

  window.addEventListener('colorverse:traychange', event => {
    syncColorTray(event.detail?.colors).catch(() => {});
  });
}
