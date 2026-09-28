import { roles, SUPPORT_ROLE, SUPPORT_COLORS } from './color.js?v=2';

export { SUPPORT_ROLE, SUPPORT_COLORS };

// A Studio workspace keeps every palette member in order, plus five entries for
// the preview roles (Background, Surface, Primary, Accent, Text). With five or
// more members each entry is a distinct member index. With 2–4 members every
// member fills exactly one role and each remaining role holds SUPPORT_ROLE: a
// fixed preview-only neutral that is never a member, never counted and never
// exported as an authored color. `current.colors` stays the five role colors
// for existing renderers, colorways and five-color RPCs; the workspace travels beside it.
export const WORKSPACE_VERSION = 1;
export const MIN_MEMBERS = 2;
export const MAX_MEMBERS = 24;
export const COMPACT_MEMBERS = 10;
export const EXTRACT_MAX_MEMBERS = 10;
const ROLE_COUNT = 5;
// Short palettes fill Primary, Accent, then Surface, Background; Text stays a readable support neutral.
const SHORT_FILL_ORDER = [2, 3, 1, 0, 4];

const isHex = value => typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value);
const identity = () => [0, 1, 2, 3, 4];
const isMemberIndex = (index, count) => Number.isInteger(index) && index >= 0 && index < count;

export const defaultRoleIndex = count => {
  if (count >= ROLE_COUNT) return identity();
  const roleIndex = Array(ROLE_COUNT).fill(SUPPORT_ROLE);
  SHORT_FILL_ORDER.slice(0, count).forEach((role, member) => { roleIndex[role] = member; });
  return roleIndex;
};

export function validRoleIndex(roleIndex, count) {
  if (!Array.isArray(roleIndex) || roleIndex.length !== ROLE_COUNT) return false;
  if (count >= ROLE_COUNT) return new Set(roleIndex).size === 5 && roleIndex.every(index => isMemberIndex(index, count));
  // 2–4 members: each member exactly once, support in every other role.
  const assigned = roleIndex.filter(index => index !== SUPPORT_ROLE);
  return count >= MIN_MEMBERS && assigned.length === count && new Set(assigned).size === count
    && assigned.every(index => isMemberIndex(index, count));
}

// Five members are always the five roles, in role order (the historic model).
function canonical(workspace) {
  if (workspace.members.length !== 5 || workspace.roleIndex.every((member, role) => member === role)) return workspace;
  return { v: WORKSPACE_VERSION, members: workspace.roleIndex.map(index => workspace.members[index]), roleIndex: identity() };
}

export function workspaceFromColors(colors, roleIndex) {
  if (!Array.isArray(colors) || colors.length < MIN_MEMBERS || colors.length > MAX_MEMBERS || !colors.every(isHex)) return null;
  if (roleIndex === undefined) roleIndex = defaultRoleIndex(colors.length);
  if (!validRoleIndex(roleIndex, colors.length)) return null;
  return canonical({ v: WORKSPACE_VERSION, members: colors.map(color => color.toUpperCase()), roleIndex: [...roleIndex] });
}

// Accept stored data only when it is bounded, versioned and agrees with the
// five role colors saved beside it; otherwise callers fall back to identity.
export function sanitizeWorkspace(value, expectedRoleColors = null) {
  if (!value || typeof value !== 'object' || value.v !== WORKSPACE_VERSION) return null;
  const workspace = workspaceFromColors(value.members, value.roleIndex);
  if (!workspace) return null;
  if (expectedRoleColors) {
    if (!Array.isArray(expectedRoleColors) || expectedRoleColors.length !== 5) return null;
    if (roleColors(workspace).some((color, role) => color !== String(expectedRoleColors[role]).toUpperCase())) return null;
  }
  return workspace;
}

export const isSupportRole = (workspace, role) => workspace.roleIndex[role] === SUPPORT_ROLE;
export const roleColors = workspace => workspace.roleIndex.map((index, role) => index === SUPPORT_ROLE ? SUPPORT_COLORS[role] : workspace.members[index]);
export const roleOfMember = (workspace, index) => workspace.roleIndex.indexOf(index);
export const isCompact = workspace => workspace.members.length > 5;
export const isShort = workspace => workspace.members.length < 5;
// Member identity is independent of its application. The persisted five-role
// mapping and legacy export keys remain unchanged.
export const memberLabel = (_workspace, index) => `Color ${index + 1}`;
export const previewColorLabel = (workspace, role) => isSupportRole(workspace, role) ? 'Preview support' : memberLabel(workspace, workspace.roleIndex[role]);

// Short workspaces take five role colors from a writer that only knows roles.
// A pure rearrangement of the current role colors moves roles (support
// included); otherwise authored roles take their new colors and support roles
// keep their fixed neutral. Support colors are never copied into members.
function applyShortRoleColors(workspace, colors) {
  const current = roleColors(workspace);
  const upper = colors.map(color => color.toUpperCase());
  if (upper.some((color, role) => color !== current[role])) {
    const used = new Set();
    const moved = upper.map(color => current.findIndex((value, role) => value === color && !used.has(role) && used.add(role)));
    if (moved.every(role => role >= 0)) return { ...workspace, roleIndex: moved.map(role => workspace.roleIndex[role]) };
  }
  return workspace.roleIndex.reduce((draft, member, role) => member === SUPPORT_ROLE ? draft : setMember(draft, member, upper[role]), workspace);
}

// Normalise any palette entering Studio: 2–24 colors survive; five role colors
// derive from the mapping. Anything outside that range is rejected (null), never cut.
// A stored 2–4 color workspace is kept even beside edited role colors, so its
// support neutrals are never re-read as five authored colors.
export function withWorkspace(palette) {
  const colors = Array.isArray(palette?.colors) ? palette.colors : [];
  const stored = sanitizeWorkspace(palette?.workspace);
  const short = stored && isShort(stored) && (colors.length === 5 && colors.every(isHex) ? applyShortRoleColors(stored, colors) : stored);
  const workspace = short || sanitizeWorkspace(palette?.workspace, colors.length === 5 ? colors : null)
    || workspaceFromColors(colors);
  if (!workspace) return null;
  return { ...palette, colors: roleColors(workspace), workspace };
}

// For writers that only edit the five preview colors (the legacy /home-test/
// page): write each edited role color back into the member that fills it, so
// extra members, member order and the role map survive. Short workspaces keep
// their member count and support roles. Palettes without a valid larger or
// shorter workspace are returned unchanged; Studio's validation is not relaxed.
export function syncRoleColors(palette) {
  const workspace = sanitizeWorkspace(palette?.workspace);
  const colors = palette?.colors;
  if (!workspace || workspace.members.length === 5 || !Array.isArray(colors) || colors.length !== 5 || !colors.every(isHex)) return palette;
  const next = isShort(workspace) ? applyShortRoleColors(workspace, colors)
    : workspace.roleIndex.reduce((draft, member, role) => setMember(draft, member, colors[role]), workspace);
  return { ...palette, colors: roleColors(next), workspace: next };
}

export function setMember(workspace, index, color) {
  if (!isHex(color) || !isMemberIndex(index, workspace.members.length)) return workspace;
  const members = [...workspace.members];
  members[index] = color.toUpperCase();
  return { ...workspace, members };
}

// Give `role` to `member`. A member that already holds another role trades
// places with the role's current member (or support); otherwise that member
// leaves the preview. Every short-palette member holds a role, so it always trades.
export function assignRole(workspace, role, member) {
  if (role < 0 || role > 4 || !isMemberIndex(member, workspace.members.length)) return workspace;
  const roleIndex = [...workspace.roleIndex];
  const held = roleIndex.indexOf(member);
  if (held === role) return workspace;
  if (held >= 0) [roleIndex[role], roleIndex[held]] = [roleIndex[held], roleIndex[role]];
  else roleIndex[role] = member;
  return canonical({ ...workspace, roleIndex });
}

export function swapRoles(workspace, from, to) {
  if (from === to || from < 0 || to < 0 || from > 4 || to > 4) return workspace;
  const roleIndex = [...workspace.roleIndex];
  [roleIndex[from], roleIndex[to]] = [roleIndex[to], roleIndex[from]];
  return canonical({ ...workspace, roleIndex });
}

// Insert before `position`; role indices after it shift so each role keeps its
// member. In a short palette the new member takes the first support role in
// fill order, so every member stays in the preview (five becomes the historic model).
export function insertMember(workspace, position, color, max = MAX_MEMBERS) {
  if (!isHex(color) || workspace.members.length >= max) return null;
  const at = Math.max(0, Math.min(workspace.members.length, position));
  const members = [...workspace.members];
  members.splice(at, 0, color.toUpperCase());
  const roleIndex = workspace.roleIndex.map(index => index !== SUPPORT_ROLE && index >= at ? index + 1 : index);
  const open = SHORT_FILL_ORDER.find(role => roleIndex[role] === SUPPORT_ROLE);
  if (open !== undefined) roleIndex[open] = at;
  return canonical({ ...workspace, members, roleIndex });
}

// Only colors outside the preview can be removed, and never below five.
export function removeMember(workspace, index) {
  if (workspace.members.length <= 5 || roleOfMember(workspace, index) >= 0 || index < 0 || index >= workspace.members.length) return null;
  const members = workspace.members.filter((_, position) => position !== index);
  return canonical({ ...workspace, members, roleIndex: workspace.roleIndex.map(member => member > index ? member - 1 : member) });
}

export const previewMapping = workspace => Object.fromEntries(roles.map((role, index) => [role.toLowerCase(), workspace.roleIndex[index] === SUPPORT_ROLE ? SUPPORT_ROLE : workspace.roleIndex[index] + 1]));
