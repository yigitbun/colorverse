import { roles } from './color.js?v=2';

// A Studio workspace keeps every palette member in order, plus five distinct
// member indices for the preview roles (Background, Surface, Primary, Accent,
// Text). `current.colors` stays the five role colors for existing renderers,
// colorways and five-color RPCs; the workspace travels beside it.
export const WORKSPACE_VERSION = 1;
export const MIN_MEMBERS = 5;
export const MAX_MEMBERS = 24;
export const COMPACT_MEMBERS = 10;
export const EXTRACT_MAX_MEMBERS = 10;

const isHex = value => typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value);
const identity = () => [0, 1, 2, 3, 4];

export function validRoleIndex(roleIndex, count) {
  return Array.isArray(roleIndex) && roleIndex.length === 5 && new Set(roleIndex).size === 5
    && roleIndex.every(index => Number.isInteger(index) && index >= 0 && index < count);
}

// Five members are always the five roles, in role order (the historic model).
function canonical(workspace) {
  if (workspace.members.length !== 5 || workspace.roleIndex.every((member, role) => member === role)) return workspace;
  return { v: WORKSPACE_VERSION, members: workspace.roleIndex.map(index => workspace.members[index]), roleIndex: identity() };
}

export function workspaceFromColors(colors, roleIndex = identity()) {
  if (!Array.isArray(colors) || colors.length < MIN_MEMBERS || colors.length > MAX_MEMBERS || !colors.every(isHex)) return null;
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

export const roleColors = workspace => workspace.roleIndex.map(index => workspace.members[index]);
export const roleOfMember = (workspace, index) => workspace.roleIndex.indexOf(index);
export const isCompact = workspace => workspace.members.length > 5;
// Member identity is independent of its application. The persisted five-role
// mapping and legacy export keys remain unchanged.
export const memberLabel = (_workspace, index) => `Color ${index + 1}`;
export const previewColorLabel = (workspace, role) => memberLabel(workspace, workspace.roleIndex[role]);

// Normalise any palette entering Studio: 5–24 colors survive; five role colors
// derive from the mapping. Anything outside that range is rejected (null), never cut.
export function withWorkspace(palette) {
  const colors = Array.isArray(palette?.colors) ? palette.colors : [];
  const workspace = sanitizeWorkspace(palette?.workspace, colors.length === 5 ? colors : null)
    || workspaceFromColors(colors);
  if (!workspace) return null;
  return { ...palette, colors: roleColors(workspace), workspace };
}

// For writers that only edit the five preview colors (the legacy /home-test/
// page): write each edited role color back into the member that fills it, so
// extra members, member order and the role map survive. Palettes without a
// valid larger workspace are returned unchanged; Studio's validation is not relaxed.
export function syncRoleColors(palette) {
  const workspace = sanitizeWorkspace(palette?.workspace);
  const colors = palette?.colors;
  if (!workspace || !isCompact(workspace) || !Array.isArray(colors) || colors.length !== 5 || !colors.every(isHex)) return palette;
  const next = workspace.roleIndex.reduce((draft, member, role) => setMember(draft, member, colors[role]), workspace);
  return { ...palette, colors: roleColors(next), workspace: next };
}

export function setMember(workspace, index, color) {
  if (!isHex(color) || index < 0 || index >= workspace.members.length) return workspace;
  const members = [...workspace.members];
  members[index] = color.toUpperCase();
  return { ...workspace, members };
}

// Give `role` to `member`. A member that already holds another role trades
// places with the role's current member; otherwise that member leaves the preview.
export function assignRole(workspace, role, member) {
  if (role < 0 || role > 4 || member < 0 || member >= workspace.members.length) return workspace;
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

// Insert before `position`; role indices after it shift so each role keeps its member.
export function insertMember(workspace, position, color, max = MAX_MEMBERS) {
  if (!isHex(color) || workspace.members.length >= max) return null;
  const at = Math.max(0, Math.min(workspace.members.length, position));
  const members = [...workspace.members];
  members.splice(at, 0, color.toUpperCase());
  return { ...workspace, members, roleIndex: workspace.roleIndex.map(index => index >= at ? index + 1 : index) };
}

// Only colors outside the preview can be removed, and never below five.
export function removeMember(workspace, index) {
  if (workspace.members.length <= MIN_MEMBERS || roleOfMember(workspace, index) >= 0 || index < 0 || index >= workspace.members.length) return null;
  const members = workspace.members.filter((_, position) => position !== index);
  return canonical({ ...workspace, members, roleIndex: workspace.roleIndex.map(member => member > index ? member - 1 : member) });
}

export const previewMapping = workspace => Object.fromEntries(roles.map((role, index) => [role.toLowerCase(), workspace.roleIndex[index] + 1]));
