import { Image, List } from "@raycast/api";
import { formatMs } from "../helpers/formatMs";
import { ShowBase, SimplifiedEpisodeObject } from "../helpers/spotify.api";
import { EpisodeActionPanel } from "./EpisodeActionPanel";
import { shouldHideArtwork } from "../helpers/shouldHideArtwork";

type EpisodeListItemProps = {
  episode: SimplifiedEpisodeObject;
  show?: ShowBase;
};

export default function EpisodeListItem({ episode, show }: EpisodeListItemProps) {
  const title = episode.name || "";
  const hideArtwork = shouldHideArtwork();

  let icon: Image.ImageLike | undefined = undefined;
  if (!hideArtwork) {
    if (show?.images) {
      icon = {
        source: show.images[show.images.length - 1]?.url,
      };
    } else if (episode.images) {
      icon = {
        source: episode.images[episode.images.length - 1]?.url,
      };
    }
  }

  return (
    <List.Item
      icon={icon}
      title={title}
      accessories={[{ text: episode.duration_ms ? formatMs(episode.duration_ms) : undefined }]}
      actions={<EpisodeActionPanel title={title} episode={episode} />}
    />
  );
}
