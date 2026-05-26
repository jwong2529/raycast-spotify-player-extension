import { getPreferenceValues } from "@raycast/api";

export function shouldHideArtwork(): boolean {
  try {
    const { hideArtwork } = getPreferenceValues<ExtensionPreferences>();
    return !!hideArtwork;
  } catch {
    return false;
  }
}
