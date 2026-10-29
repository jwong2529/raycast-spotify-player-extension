import { Action, ActionPanel, Icon } from "@raycast/api";
import { SimplifiedAlbumObject, SimplifiedTrackObject } from "../helpers/spotify.api";
import { TracksList } from "./TracksList";
import { AddToPlaylistAction } from "./AddToPlaylistAction";
import { FooterAction } from "./FooterAction";
import { AddToQueueAction } from "./AddtoQueueAction";
import { StartRadioAction } from "./StartRadioAction";
import { PlayAction } from "./PlayAction";
import { AddToSavedTracksAction } from "./AddToSavedTracksAction";
import { ShowContent } from "../shortcuts/shortcuts";

type TrackActionPanelProps = {
  title: string;
  track: SimplifiedTrackObject;
  album?: SimplifiedAlbumObject;
  showAddToSaved?: boolean;
  showGoToAlbum?: boolean;
  playingContext?: string;
  tracksToQueue?: SimplifiedTrackObject[];
};

export function TrackActionPanel({
  title,
  track,
  album,
  showAddToSaved,
  showGoToAlbum,
  playingContext,
  tracksToQueue,
}: TrackActionPanelProps) {
  return (
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
      {track.uri && <AddToPlaylistAction uri={track.uri} />}
      <FooterAction url={track?.external_urls?.spotify} uri={track.uri} title={title} />
    </ActionPanel>
  );
}
