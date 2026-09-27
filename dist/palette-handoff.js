// The storage getter also catches browsers that deny access to sessionStorage.
// No navigation or success message is allowed until the write succeeds.
export function savePaletteHandoff(palette, getStorage, onError = () => {}) {
  try {
    getStorage().setItem('colorverse-current-palette', JSON.stringify(palette));
    return true;
  } catch {
    onError('Browser storage is unavailable. Your palette is still here; copy it before leaving.');
    return false;
  }
}
