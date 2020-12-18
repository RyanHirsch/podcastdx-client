/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable no-await-in-loop */
import PodcastIndexClient from "../index";
import { PIApiEpisodeInfo, PIApiRandomEpisode } from "../types";
import { toEpochTimestamp } from "../utils";

describe("episodes api", () => {
  let client: PodcastIndexClient;
  let episodesByFeedUrl: PIApiEpisodeInfo[];
  let episodesByFeedId: PIApiEpisodeInfo[];
  let episodesByItunesId: PIApiEpisodeInfo[];
  // TODO: Why are these types different?
  // let episodeById: ApiResponse.PodcastEpisode;
  let randomEpisode: PIApiRandomEpisode;

  const feedUrl = "https://feeds.theincomparable.com/batmanuniversity";
  const feedId = 75075;
  const altFeedId = 920666;
  const iTunesId = 1441923632;
  const episodeId = 16795090;

  beforeAll(async () => {
    client = new PodcastIndexClient({
      key: process.env.API_KEY ?? "",
      secret: process.env.API_SECRET ?? "",
    });
    episodesByFeedUrl = await (await client.episodesByFeedUrl(feedUrl)).items;
    episodesByFeedId = await (await client.episodesByFeedId(feedId)).items;
    episodesByItunesId = await (await client.episodesByItunesId(iTunesId)).items;
    [randomEpisode] = (await client.episodesRandom()).episodes;
  });

  describe("episodesByFeedId", () => {
    it("returns all items", async () => {
      const searchResult = await client.episodesByFeedId(feedId);
      expect(searchResult.items.length).toBeGreaterThan(10);
    });
    it("returns all items for multiple feeds", async () => {
      const altFeedResults = await client.episodesByFeedId(altFeedId);
      const searchResult = await client.episodesByFeedId([feedId, altFeedId]);
      expect(searchResult.items.length).toEqual(
        altFeedResults.items.length + episodesByFeedId.length
      );
    });
    it("returns user specified max items ", async () => {
      const max = 1;
      const searchResult = await client.episodesByFeedId(feedId, { max });
      expect(searchResult.items).toHaveLength(max);
    });
    it("returns user specified items since timestamp", async () => {
      const searchResult = await client.episodesByFeedId(feedId, {
        since: episodesByFeedId[1].datePublished - 1,
      });
      expect(searchResult.items).toHaveLength(2);
    });
    it("returns user specified items since negative seconds", async () => {
      const searchResult = await client.episodesByFeedId(feedId, {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        since: (toEpochTimestamp(new Date())! - episodesByFeedId[1].datePublished) * -1 - 2,
      });
      expect(searchResult.items).toHaveLength(2);
    });
    it("returns same object as byFeedUrl", async () => {
      const searchResult = await client.episodesByFeedId(feedId);
      searchResult.items.forEach((episodeInfo, idx) => {
        expect(episodeInfo).toEqual(episodesByFeedUrl[idx]);
      });
    });
    it("returns same object as byItunesId", async () => {
      const searchResult = await client.episodesByFeedId(feedId);
      searchResult.items.forEach((episodeInfo, idx) => {
        expect(episodeInfo).toEqual(episodesByItunesId[idx]);
      });
    });
  });

  describe("episodesByFeedUrl", () => {
    it("returns all items ", async () => {
      const searchResult = await client.episodesByFeedUrl(feedUrl);
      expect(searchResult.items.length).toBeGreaterThan(10);
    });
    it("returns user specified max items ", async () => {
      const max = 1;
      const searchResult = await client.episodesByFeedUrl(feedUrl, { max });
      expect(searchResult.items).toHaveLength(max);
    });
    it("returns user specified items since timestamp", async () => {
      const searchResult = await client.episodesByFeedUrl(feedUrl, {
        since: episodesByFeedId[1].datePublished - 1,
      });
      expect(searchResult.items).toHaveLength(2);
    });
    it("returns user specified items since negative seconds", async () => {
      const searchResult = await client.episodesByFeedUrl(feedUrl, {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        since: (toEpochTimestamp(new Date())! - episodesByFeedId[1].datePublished) * -1 - 2,
      });
      expect(searchResult.items).toHaveLength(2);
    });
    it("returns same object as byFeedId", async () => {
      const searchResult = await client.episodesByFeedUrl(feedUrl);
      searchResult.items.forEach((episodeInfo, idx) => {
        expect(episodeInfo).toEqual(episodesByFeedId[idx]);
      });
    });
    it("returns same object as byItunesId", async () => {
      const searchResult = await client.episodesByFeedUrl(feedUrl);
      searchResult.items.forEach((episodeInfo, idx) => {
        expect(episodeInfo).toEqual(episodesByItunesId[idx]);
      });
    });
  });
  describe("episodesByItunesId", () => {
    it("returns all items ", async () => {
      const searchResult = await client.episodesByItunesId(iTunesId);
      expect(searchResult.items.length).toBeGreaterThan(10);
    });
    it("returns user specified max items ", async () => {
      const max = 1;
      const searchResult = await client.episodesByItunesId(iTunesId, { max });
      expect(searchResult.items).toHaveLength(max);
    });
    it("returns user specified items since timestamp", async () => {
      const searchResult = await client.episodesByItunesId(iTunesId, {
        since: episodesByFeedId[1].datePublished - 1,
      });
      expect(searchResult.items).toHaveLength(2);
    });
    it("returns user specified items since negative seconds", async () => {
      const searchResult = await client.episodesByItunesId(iTunesId, {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        since: (toEpochTimestamp(new Date())! - episodesByFeedId[1].datePublished) * -1 - 2,
      });
      expect(searchResult.items).toHaveLength(2);
    });
    it("returns same object as byFeedId", async () => {
      const searchResult = await client.episodesByItunesId(iTunesId);
      searchResult.items.forEach((episodeInfo, idx) => {
        expect(episodeInfo).toEqual(episodesByFeedId[idx]);
      });
    });
    it("returns same object as byFeedUrl", async () => {
      const searchResult = await client.episodesByItunesId(iTunesId);
      searchResult.items.forEach((episodeInfo, idx) => {
        expect(episodeInfo).toEqual(episodesByFeedUrl[idx]);
      });
    });
  });

  describe("episodeById", () => {
    it("returns an expected episode", async () => {
      const searchResult = await client.episodeById(episodeId);
      expect(searchResult.episode).toHaveProperty("title");
      expect(searchResult.episode).toHaveProperty("description");
    });

    it("single episode shape matches all episodes", async () => {
      const searchResult = await client.episodeById(episodeId);
      // TODO: Fix this type!!
      const { feedTitle, ...episode } = searchResult.episode;
      expect(episode).toEqual(episodesByFeedId.find((ep) => ep.id === episodeId));
    });

    it("single episode shape matches all episodes", async () => {
      const searchResult = await client.episodeById(randomEpisode.id);

      // TODO: Fix this type!!
      const { categories, ...rando } = randomEpisode;
      const { duration, transcriptUrl, ...episode } = searchResult.episode;

      expect(episode).toEqual(rando);
    });
  });

  describe("random", () => {
    it("returns an random episode", async () => {
      const searchResult = await client.episodesRandom();
      expect(searchResult.episodes).toHaveLength(1);
    });

    it("returns a user specified max of random episodes", async () => {
      const max = 20;
      const searchResult = await client.episodesRandom({ max });
      expect(searchResult.episodes).toHaveLength(max);
    });

    it("returns a max of 40 random episodes", async () => {
      const searchResult = await client.episodesRandom({ max: 60 });
      expect(searchResult.episodes).toHaveLength(40);
    });

    it("accepts a user specified language", async () => {
      const lang = randomEpisode.feedLanguage.toLowerCase();
      const searchResult = await client.episodesRandom({
        max: 5,
        lang,
      });
      searchResult.episodes.forEach((randomResult) => {
        expect(randomResult.feedLanguage.toLowerCase()).toEqual(lang);
      });
    });

    it("accepts a user specified categories", async () => {
      const extracted = Object.values(randomEpisode.categories ?? {});
      const cat = extracted.length ? extracted : "Technology";
      const searchResult = await client.episodesRandom({
        max: 5,
        cat,
      });
      searchResult.episodes.forEach((randomResult) => {
        expect(
          Object.values(randomResult.categories ?? {}).some((c) => {
            if (Array.isArray(cat)) {
              return cat.includes(c);
            }
            return c === cat;
          })
        ).toEqual(true);
      });
    });
  });
});
