/* eslint-disable no-await-in-loop */
import PodcastIndexClient from "../index";
import { ApiResponse } from "../types";

describe("search api", () => {
  let client: PodcastIndexClient;
  beforeAll(() => {
    client = new PodcastIndexClient({
      key: process.env.API_KEY ?? "",
      secret: process.env.API_SECRET ?? "",
    });
  });

  it("supports basic query", async () => {
    const defaultCount = 25;
    const searchResult = await client.search("javascript");
    expect(searchResult.count).toEqual(defaultCount);
    expect(searchResult.feeds).toHaveLength(defaultCount);
  });

  it("supports explicit results", async () => {
    const searchResult = await client.search("sexual wellness", { max: 3 });
    expect(searchResult.count).toEqual(3);

    const allEpisodes: ApiResponse.EpisodeInfo[] = [];
    for (let i = 0; i < searchResult.feeds.length; i += 1) {
      const feed = searchResult.feeds[i];
      const feedEpisodes = await client.episodesByFeedId(feed.id);
      allEpisodes.push(...feedEpisodes.items);
    }

    expect(allEpisodes.some((ep) => ep.explicit)).toEqual(true);
  });

  it("supports clean only results", async () => {
    const searchResult = await client.search("sexual wellness", { clean: true, max: 5 });
    expect(searchResult.count).toBeLessThanOrEqual(5);

    const allEpisodes: ApiResponse.EpisodeInfo[] = [];
    for (let i = 0; i < searchResult.feeds.length; i += 1) {
      const feed = searchResult.feeds[i];
      const feedEpisodes = await client.episodesByFeedId(feed.id);
      allEpisodes.push(...feedEpisodes.items);
    }

    expect(allEpisodes.some((ep) => ep.explicit)).toEqual(false);
  });

  it("supports max items returned", async () => {
    const max = 2;
    const searchResult = await client.search("javascript", { max });
    expect(searchResult.count).toEqual(max);
    expect(searchResult.feeds).toHaveLength(max);
  });
});
