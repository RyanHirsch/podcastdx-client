import PodcastIndexClient from "../index";

describe("categories api", () => {
  let client: PodcastIndexClient;
  beforeAll(() => {
    client = new PodcastIndexClient({
      key: process.env.API_KEY ?? "",
      secret: process.env.API_SECRET ?? "",
    });
  });

  it("response has known keys", async () => {
    const properties = ["status", "feeds", "count", "description"];
    const categoriesList = await client.categories();

    expect(Object.keys(categoriesList)).toHaveLength(properties.length);
    properties.forEach((prop) => expect(categoriesList).toHaveProperty(prop));
  });
});
