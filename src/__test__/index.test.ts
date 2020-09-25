import PodcastIndexClient from "../index";

describe("API requests", () => {
  let client: PodcastIndexClient;
  beforeAll(() => {
    client = new PodcastIndexClient({
      key: process.env.API_KEY!,
      secret: process.env.API_SECRET!,
    });
  });

  it("fetches latest feeds", async () => {
    const recentFeeds = await client.recentFeeds();

    expect(recentFeeds).toHaveProperty("count", 40);
  });
});
