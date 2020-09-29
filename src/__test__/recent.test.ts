import PodcastIndexClient from "../index";

const knownKeys = "response has known keys";

describe("recent api", () => {
  let client: PodcastIndexClient;
  beforeAll(() => {
    client = new PodcastIndexClient({
      key: process.env.API_KEY ?? "",
      secret: process.env.API_SECRET ?? "",
    });
  });

  describe("episodes", () => {
    it(knownKeys, async () => {
      const properties = ["status", "items", "count", "max", "description"];
      const recentEpisodes = await client.recentEpisodes();

      expect(Object.keys(recentEpisodes)).toHaveLength(properties.length);
      properties.forEach((prop) => expect(recentEpisodes).toHaveProperty(prop));
    });
  });

  describe("feeds", () => {
    it(knownKeys, async () => {
      const properties = ["since", "status", "feeds", "count", "max", "description"];
      const recentFeeds = await client.recentFeeds();

      expect(Object.keys(recentFeeds)).toHaveLength(properties.length);
      properties.forEach((prop) => expect(recentFeeds).toHaveProperty(prop));
    });
  });

  it("feeds with a max", async () => {
    const recentFeeds = await client.recentFeeds(10);
    expect(recentFeeds).toHaveProperty("count", 10);
  });

  describe("new feeds", () => {
    it(knownKeys, async () => {
      const properties = ["status", "feeds", "count", "max", "description"];
      const recentNewFeeds = await client.recentNewFeeds();

      expect(Object.keys(recentNewFeeds)).toHaveLength(properties.length);
      properties.forEach((prop) => expect(recentNewFeeds).toHaveProperty(prop));
    });
  });
});
