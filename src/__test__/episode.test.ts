import PodcastIndexClient from "../index";

const knownKeys = "response has known keys";

describe("episodes api", () => {
  let client: PodcastIndexClient;
  beforeAll(() => {
    client = new PodcastIndexClient({
      key: process.env.API_KEY ?? "",
      secret: process.env.API_SECRET ?? "",
    });
  });

  describe("byFeedUrl", () => {
    it(knownKeys, async () => {
      const properties = ["status", "items", "count", "description", "query"];
      const podcast = await client.episodesByFeedUrl("https://feeds.twit.tv/twit.xml");

      expect(Object.keys(podcast)).toHaveLength(properties.length);
      properties.forEach((prop) => expect(podcast).toHaveProperty(prop));
    });
  });

  describe("byFeedId", () => {
    it(knownKeys, async () => {
      const properties = ["status", "items", "count", "description", "query"];
      const podcast = await client.episodesByFeedId(555343);

      expect(Object.keys(podcast)).toHaveLength(properties.length);
      properties.forEach((prop) => expect(podcast).toHaveProperty(prop));
    });
  });

  describe("byItunesId", () => {
    it(knownKeys, async () => {
      const properties = ["status", "items", "count", "description", "query"];
      const podcast = await client.episodesByItunesId(73329404);
      expect(Object.keys(podcast)).toHaveLength(properties.length);
      properties.forEach((prop) => expect(podcast).toHaveProperty(prop));
    });
  });

  describe("byId", () => {
    it(knownKeys, async () => {
      const properties = ["status", "id", "episode", "description"];
      const podcast = await client.episodeById(391128542);

      expect(Object.keys(podcast)).toHaveLength(properties.length);
      properties.forEach((prop) => expect(podcast).toHaveProperty(prop));
    });
  });
});
