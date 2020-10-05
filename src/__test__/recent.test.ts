import { keys } from "ts-transformer-keys";

import { assertObjectsHaveProperties, assertObjectHasProperties } from "./utils";
import PodcastIndexClient from "../index";
import { ApiResponse } from "../types";

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
      const recentEpisodes = await client.recentEpisodes();

      assertObjectHasProperties<ApiResponse.RecentEpisodes>(
        keys<ApiResponse.RecentEpisodes>(),
        recentEpisodes
      );
      assertObjectsHaveProperties<ApiResponse.PodcastEpisode>(
        keys<ApiResponse.PodcastEpisode>(),
        recentEpisodes.items
      );
    });
  });

  describe("feeds", () => {
    it(knownKeys, async () => {
      const recentFeeds = await client.recentFeeds();

      assertObjectHasProperties<ApiResponse.RecentFeeds>(
        keys<ApiResponse.RecentFeeds>(),
        recentFeeds
      );

      assertObjectsHaveProperties<ApiResponse.NewPodcastFeed>(
        keys<ApiResponse.NewPodcastFeed>(),
        recentFeeds.feeds
      );
    });
  });

  it("feeds with a max", async () => {
    const recentFeeds = await client.recentFeeds(10);
    expect(recentFeeds).toHaveProperty("count", 10);
  });

  describe("new feeds", () => {
    it(knownKeys, async () => {
      const recentNewFeeds = await client.recentNewFeeds();

      assertObjectHasProperties<ApiResponse.RecentNewFeeds>(
        keys<ApiResponse.RecentNewFeeds>(),
        recentNewFeeds
      );
      assertObjectsHaveProperties<ApiResponse.SimplePodcastFeed>(
        keys<ApiResponse.SimplePodcastFeed>(),
        recentNewFeeds.feeds
      );
    });
  });
});
