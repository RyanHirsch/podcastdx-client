import PodcastIndexClient from "../index";

describe("API requests", () => {
  let client: PodcastIndexClient;
  beforeAll(() => {
    client = new PodcastIndexClient({
      key: process.env.API_KEY!,
      secret: process.env.API_SECRET!,
    });
  });

  describe("latest", () => {
    it("feeds", async () => {
      const recentFeeds = await client.recentFeeds();
      expect(recentFeeds).toHaveProperty("count", 40);

      expect(Object.keys(recentFeeds)).toHaveLength(6);
      expect(recentFeeds).toHaveProperty("since");
      expect(recentFeeds).toHaveProperty("status");
      expect(recentFeeds).toHaveProperty("feeds");
      expect(recentFeeds).toHaveProperty("count");
      expect(recentFeeds).toHaveProperty("max");
      expect(recentFeeds).toHaveProperty("description");
    });

    it("feeds with a max", async () => {
      const recentFeeds = await client.recentFeeds(10);
      expect(recentFeeds).toHaveProperty("count", 10);
    });

    it("episodes", async () => {
      const recentEpisodes = await client.recentEpisodes();
      expect(recentEpisodes).toHaveProperty("count", 10);

      expect(Object.keys(recentEpisodes)).toHaveLength(5);
      expect(recentEpisodes).toHaveProperty("status");
      expect(recentEpisodes).toHaveProperty("items");
      expect(recentEpisodes).toHaveProperty("count");
      expect(recentEpisodes).toHaveProperty("max");
      expect(recentEpisodes).toHaveProperty("description");
    });

    it("new feeds", async () => {
      const recentNewFeeds = await client.recentNewFeeds(10);
      // expect(recentNewFeeds).toHaveProperty("count", 10);

      expect(Object.keys(recentNewFeeds)).toHaveLength(5);
      expect(recentNewFeeds).toHaveProperty("status");
      expect(recentNewFeeds).toHaveProperty("feeds");
      expect(recentNewFeeds).toHaveProperty("count");
      expect(recentNewFeeds).toHaveProperty("max");
      expect(recentNewFeeds).toHaveProperty("description");
    });
  });

  describe("categories", () => {
    it("response has known keys", async () => {
      const categoriesList = await client.categories();

      expect(Object.keys(categoriesList)).toHaveLength(4);
      expect(categoriesList).toHaveProperty("status");
      expect(categoriesList).toHaveProperty("feeds");
      expect(categoriesList).toHaveProperty("count");
      expect(categoriesList).toHaveProperty("description");
    });
  });
});
