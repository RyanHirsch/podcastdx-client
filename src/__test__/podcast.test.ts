import { keys } from "ts-transformer-keys";

import { assertObjectsHaveProperties, assertObjectHasProperties } from "./utils";
import PodcastIndexClient from "../index";
import { ApiResponse } from "../types";

const knownKeys = "response has known keys";

describe("podcasts api", () => {
  let client: PodcastIndexClient;
  let randomFeed: ApiResponse.PodcastFeed;
  beforeAll(async () => {
    client = new PodcastIndexClient({
      key: process.env.API_KEY ?? "",
      secret: process.env.API_SECRET ?? "",
    });
    const [randomEpisode] = await (await client.episodesRandom({ max: 1, lang: "en" })).episodes;
    randomFeed = await (await client.podcastById(randomEpisode.feedId)).feed;
  });

  describe("byUrl", () => {
    it(knownKeys, async () => {
      const podcast = await client.podcastByUrl(randomFeed.url);

      assertObjectHasProperties<ApiResponse.PodcastByUrl>(
        keys<ApiResponse.PodcastByUrl>(),
        podcast
      );
      assertObjectHasProperties<ApiResponse.PodcastFeed>(
        keys<ApiResponse.PodcastFeed>(),
        podcast.feed
      );
    });
  });

  describe("byId", () => {
    it(knownKeys, async () => {
      const podcast = await client.podcastById(randomFeed.id);
      assertObjectHasProperties<ApiResponse.PodcastById>(keys<ApiResponse.PodcastById>(), podcast);
      assertObjectHasProperties<ApiResponse.PodcastFeed>(
        keys<ApiResponse.PodcastFeed>(),
        podcast.feed
      );
    });
  });

  describe("byItunesId", () => {
    it(knownKeys, async () => {
      const podcast = await client.podcastByItunesId(randomFeed.itunesId);

      assertObjectHasProperties<ApiResponse.PodcastByItunesId>(
        keys<ApiResponse.PodcastByItunesId>(),
        podcast
      );
      assertObjectHasProperties<ApiResponse.PodcastFeed>(
        keys<ApiResponse.PodcastFeed>(),
        podcast.feed
      );
    });
  });
});
