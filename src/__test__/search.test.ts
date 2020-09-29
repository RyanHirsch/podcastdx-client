import PodcastIndexClient from "../index";

describe("search api", () => {
  let client: PodcastIndexClient;
  beforeAll(() => {
    client = new PodcastIndexClient({
      key: process.env.API_KEY ?? "",
      secret: process.env.API_SECRET ?? "",
    });
  });

  it("response has known keys", async () => {
    const properties = ["query", "status", "feeds", "count", "description"];
    const searchResult = await client.search("javascript");

    expect(Object.keys(searchResult)).toHaveLength(properties.length);
    properties.forEach((prop) => expect(searchResult).toHaveProperty(prop));
  });
});
