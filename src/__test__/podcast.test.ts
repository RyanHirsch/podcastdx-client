import PodcastIndexClient from "../index";

const knownKeys = "response has known keys";

describe("podcasts api", () => {
  let client: PodcastIndexClient;
  beforeAll(() => {
    client = new PodcastIndexClient({
      key: process.env.API_KEY ?? "",
      secret: process.env.API_SECRET ?? "",
    });
  });

  describe("byUrl", () => {
    it(knownKeys, async () => {
      const properties = ["status", "feed", "description", "query"];
      const podcast = await client.podcastByUrl("https://feeds.twit.tv/twit.xml");

      expect(Object.keys(podcast)).toHaveLength(properties.length);
      properties.forEach((prop) => expect(podcast).toHaveProperty(prop));
    });
  });

  describe("byId", () => {
    it(knownKeys, async () => {
      const properties = ["status", "feed", "description", "query"];
      const podcast = await client.podcastById(555343);

      expect(Object.keys(podcast)).toHaveLength(properties.length);
      properties.forEach((prop) => expect(podcast).toHaveProperty(prop));
    });
  });

  describe("byItunesId", () => {
    it(knownKeys, async () => {
      const properties = ["status", "feed", "description", "query"];
      const podcast = await client.podcastByItunesId(73329404);

      expect(Object.keys(podcast)).toHaveLength(properties.length);
      properties.forEach((prop) => expect(podcast).toHaveProperty(prop));
    });
  });
});
