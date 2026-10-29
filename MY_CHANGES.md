# Custom Spotify Player Modifications

## Overview
This local fork of the Raycast `spotify-player` extension contains custom modifications to optimize the user experience and tailor playback interactions.

## Change Ledger

### Add to Queue as Primary Action for Songs
* **Target File(s):**
  * `src/components/PlayAction.tsx`
  * `src/components/AddtoQueueAction.tsx`
  * `src/components/TrackActionPanel.tsx`
* **Purpose:** Swaps the priority of the "Play" and "Add to Queue" actions for tracks so that pressing `Enter` defaults to queueing the song rather than playing it immediately, while preserving the play action as a secondary action on the `opt+q` (macOS) / `alt+q` (Windows) shortcut.
* **Code Diff / Exact Changes:**
  * **`src/components/PlayAction.tsx`**:
    * Imported `Keyboard` from `@raycast/api`.
    * Added optional `shortcut?: Keyboard.Shortcut` to `PlayActionProps` and passed it down to the `Action` component:
      ```tsx
      type PlayActionProps = {
        id?: string;
        type?: "album" | "artist" | "playlist" | "track" | "show" | "episode";
        playingContext?: string;
        onPlay?: () => void;
        tracksToQueue?: SimplifiedTrackObject[];
        shortcut?: Keyboard.Shortcut;
      };

      export function PlayAction({ id, type, playingContext, onPlay, tracksToQueue, shortcut }: PlayActionProps) {
        // ...
        return <Action icon={Icon.Play} title="Play" onAction={handlePlayAction} shortcut={shortcut} />;
      }
      ```
  * **`src/components/AddtoQueueAction.tsx`**:
    * Imported `Keyboard` from `@raycast/api`.
    * Added optional `shortcut?: Keyboard.Shortcut` to `AddToQueueActionProps` defaulting to the original shortcut:
      ```tsx
      type AddToQueueActionProps = {
        uri: string;
        title: string;
        shortcut?: Keyboard.Shortcut;
      };

      export function AddToQueueAction({
        uri,
        title,
        shortcut = {
          macOS: { modifiers: ["opt"], key: "q" },
          Windows: { modifiers: ["alt"], key: "q" },
        },
      }: AddToQueueActionProps) {
        // ...
        return <Action icon={Icon.Plus} title="Add to Queue" shortcut={shortcut} onAction={async () => { ... }} />;
      }
      ```
  * **`src/components/TrackActionPanel.tsx`**:
    * Reordered actions so `AddToQueueAction` is at the very top of `<ActionPanel>` and passed `shortcut={undefined}`.
    * Placed `PlayAction` below `AddToQueueAction` and passed `shortcut={{ macOS: { modifiers: ["opt"], key: "q" }, Windows: { modifiers: ["alt"], key: "q" } }}`:
      ```tsx
      <ActionPanel>
        {track.uri && <AddToQueueAction uri={track.uri} title={title} shortcut={undefined} />}
        {album && showGoToAlbum && (
          <Action.Push
            icon={Icon.AppWindowList}
            title="Go to Album"
            target={<TracksList album={album} showGoToAlbum={false} />}
            shortcut={ShowContent}
          />
        )}
        <StartRadioAction trackId={track.id} />
        {showAddToSaved && <AddToSavedTracksAction trackId={track.id} />}
        <PlayAction
          id={track.id as string}
          type="track"
          playingContext={playingContext}
          tracksToQueue={tracksToQueue}
          shortcut={{
            macOS: { modifiers: ["opt"], key: "q" },
            Windows: { modifiers: ["alt"], key: "q" },
          }}
        />
        {/* ... other actions ... */}
      </ActionPanel>
      ```
* **Verification/Testing Steps:**
  1. Open Raycast and run the **Search** (Development) command.
  2. Search for any track and highlight it.
  3. Press **Enter** to verify the track is successfully added to the queue.
  4. Press **opt+q** (on macOS) or **alt+q** (on Windows) to verify that the song plays immediately.

### Toggle Preference to Hide Album Artwork and Artist Profile Pictures
* **Target File(s):**
  * `package.json`
  * `src/helpers/shouldHideArtwork.ts` (NEW)
  * `src/components/TrackListItem.tsx`
  * `src/components/ArtistItem.tsx`
  * `src/components/AlbumItem.tsx`
  * `src/components/PlaylistItem.tsx`
  * `src/components/ShowItem.tsx`
  * `src/components/PlaylistPicker.tsx`
  * `src/components/EpisodeListItem.tsx`
  * `src/components/PlaylistLikedTracksItem.tsx`
  * `src/nowPlaying.tsx`
  * `src/nowPlayingMenuBar.tsx`
* **Purpose:** Introduces a global user preference `hideArtwork` to hide all visual images/artwork (album covers, artist profiles, playlist thumbnails, podcast artwork) across the entire user interface.
* **Code Diff / Exact Changes:**
  * **`package.json`**:
    * Declared a new global checkbox preference in the `preferences` array:
      ```json
      {
        "name": "hideArtwork",
        "description": "If enabled, album artwork and artist profile pictures will be hidden across the UI",
        "type": "checkbox",
        "label": "Hide album artwork and artist profile pictures",
        "default": false,
        "required": false
      }
      ```
  * **`src/helpers/shouldHideArtwork.ts`**:
    * Created a centralized, encapsulated helper utility that retrieves `hideArtwork` in a runtime-safe `try/catch` block.
  * **Visual Item Components (`TrackListItem.tsx`, `ArtistItem.tsx`, `AlbumItem.tsx`, `PlaylistItem.tsx`, `ShowItem.tsx`, `EpisodeListItem.tsx`, `PlaylistLikedTracksItem.tsx`)**:
    * Integrated the `shouldHideArtwork` helper to conditionally assign the component's `icon` or `content` properties to `undefined` when the preference is enabled.
  * **Now Playing View (`nowPlaying.tsx`)**:
    * Read the `shouldHideArtwork` preference and conditionally omitted the album/episode cover image markdown string.
  * **Menu Bar Player (`nowPlayingMenuBar.tsx`)**:
    * Checked `shouldHideArtwork` and fell back to the standard Spotify app icon, overriding the "cover-image" layout when active.
* **Verification/Testing Steps:**
  1. Start the extension development server (`npm run dev`).
  2. Open the extension configuration preferences in Raycast (`Command + Option + ,`).
  3. Toggle the **Hide album artwork and artist profile pictures** checkbox to `true`.
  4. Perform search queries or navigate menus (Your Library, etc.) to verify all list item visuals are hidden.
  5. Check **Now Playing** to confirm no cover images render in the track/episode markdown.

### Disable Search History Preference
* **Target File(s):**
  * `package.json`
  * `src/search.tsx`
* **Purpose:** Introduces a global user preference `disableSearchHistory` to turn off saving search history and completely remove the "Recent searches" section from the root search view, presenting the user with a clean slate.
* **Code Diff / Exact Changes:**
  * **`package.json`**:
    * Declared a new global checkbox preference in the `preferences` array:
      ```json
      {
        "name": "disableSearchHistory",
        "description": "If enabled, search history will be disabled and cleared from the root search view",
        "type": "checkbox",
        "label": "Disable search history",
        "default": false,
        "required": false
      }
      ```
  * **`src/search.tsx`**:
    * Destructured `disableSearchHistory` from `getPreferenceValues<Preferences.Search>()`.
    * Prevented search query logging inside the `useEffect` hook by returning early if the preference is `true`.
    * Conditionally omitted rendering the `<List.Section title="Recent searches">` section in the root search view if `disableSearchHistory` is enabled.
* **Verification/Testing Steps:**
  1. Start the extension development server (`npm run dev`).
  2. Open the extension configuration preferences in Raycast (`Command + Option + ,`).
  3. Toggle the **Disable search history** checkbox to `true`.
  4. Perform queries and navigate back to the root search view to verify the "Recent searches" section is not displayed and no search history is saved.

---

## Upstream Sync Procedure

Since this repository is an isolated fork of a subfolder within the [raycast/extensions monorepo](https://github.com/raycast/extensions/tree/main/extensions/spotify-player), standard `git pull` from the upstream monorepo cannot be used directly.

To keep this fork updated with official releases without losing custom modifications, follow this:

### Branch Structure
* **`upstream`**: Tracks the pristine, unmodified official code from `raycast/extensions/extensions/spotify-player`.
* **`main`**: Contains the customized fork (upstream code + custom modifications).

### Step-by-Step Sync Workflow

1. **Download latest official files:**
   Download the `extensions/spotify-player` folder from the Raycast repository using sparse checkout:
   ```bash
   rm -rf /tmp/raycast-extensions && git clone --depth 1 --filter=blob:none --no-checkout https://github.com/raycast/extensions.git /tmp/raycast-extensions
   cd /tmp/raycast-extensions && git sparse-checkout init --cone && git sparse-checkout set extensions/spotify-player && git checkout main
   ```

2. **Update the `upstream` branch:**
   ```bash
   git checkout upstream
   rsync -av --delete --exclude=".git" --exclude="MY_CHANGES.md" --exclude="node_modules" /tmp/raycast-extensions/extensions/spotify-player/ ./
   git add -A
   git commit -m "Sync official spotify-player from raycast/extensions"
   ```

3. **Merge or Rebase into `main`:**
   ```bash
   git checkout main
   git merge upstream
   ```
   * Files that only changed upstream update automatically.
   * For files with custom features (e.g., `TrackActionPanel.tsx`, `PlaylistItem.tsx`, `nowPlaying.tsx`, `package.json`), review against the Change Ledger above to ensure customizations remain intact.

