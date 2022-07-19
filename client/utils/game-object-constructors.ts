import type {
  Client,
  GameObjectName,
  Room,
  ScryfallCardData,
} from "../../models";

const scryfallAPI = "https://api.scryfall.com";

type FetchArgs = { cardName: string } | { scryfallID: string };
type Data = ScryfallCardData;

export async function fetchScryfallCardData(args: FetchArgs): Promise<Data> {
  let res: Response;
  if ("cardName" in args) {
    res = await fetch(`${scryfallAPI}/cards/named?fuzzy=${args.cardName}`);
  } else if ("scryfallID" in args) {
    res = await fetch(`${scryfallAPI}/cards/${args.scryfallID}`);
  } else {
    throw "invalid args: must have either cardName or scryfallID";
  }

  const data = await res.json();
  const notFound = {
    object: "error",
    code: "not_found",
    status: 404,
  };

  for (const key in notFound) {
    if (key in data && data[key] === notFound[key]) {
      if ("details" in data) {
        throw data.details;
      } else {
        throw "api error: card not found";
      }
    }
  }

  return data as Data;
}

type ConstructArgs<G extends GameObjectName = GameObjectName> =
  Client.GameObjectData<G> & {
    room: Room<"Client">;
    scene: Phaser.Scene;
    spawnX: number;
    spawnY: number;
  };

export function newCard(args: ConstructArgs<"Card">): Client.Card {
  const { room, scene, spawnX, spawnY, data } = args;
  const { image_uris, id } = data;
  const sprite = scene.add.image(spawnX, spawnY, id);
  const uri =
    image_uris?.png ??
    image_uris?.large ??
    image_uris?.normal ??
    image_uris?.small ??
    null;
  if (uri === null) {
    throw "TODO: load placeholder";
  } else {
    scene.load
      .image(id, data.image_uris!.png!)
      .once(Phaser.Loader.Events.COMPLETE, () => {
        sprite.setTexture(id).setScale(0.3).setInteractive();
        this.input.setDraggable(sprite);
      })
      .start();
  }

  throw "TODO: implement";
}
