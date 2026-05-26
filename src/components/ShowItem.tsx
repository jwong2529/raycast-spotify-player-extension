import { Icon, Image } from "@raycast/api";
import { SimplifiedShowObject } from "../helpers/spotify.api";
import { ShowActionPanel } from "./ShowActionPanel";
import { ListOrGridItem } from "./ListOrGridItem";
import { shouldHideArtwork } from "../helpers/shouldHideArtwork";

type ShowItemProps = { type: "grid" | "list"; show: SimplifiedShowObject };

export function ShowItem({ type, show }: ShowItemProps) {
  const hideArtwork = shouldHideArtwork();
  const icon: Image.ImageLike | undefined = hideArtwork
    ? undefined
    : {
        source: show.images[0]?.url ?? Icon.Dot,
      };

  const title = show.name;

  return (
    <ListOrGridItem
      type={type}
      icon={icon}
      title={title}
      accessories={[{ text: `${show.total_episodes} episodes` }]}
      content={icon}
      actions={<ShowActionPanel show={show} />}
    />
  );
}
