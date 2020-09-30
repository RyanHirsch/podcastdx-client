import { chain, uniq } from "ramda";
import PodcastIndexClient from "../index";
import { ApiResponse } from "../types";

const knownKeys = "response has known keys";
const sinceNowParam = "accepts a since param (now)";
const sinceIncludeLastEpisode = "accepts a since param (one second before last episode)";
const maxParamSingle = "accepts a max param (1)";
const maxParam = "accepts a max param (2)";

describe("episodes api", () => {
  let client: PodcastIndexClient;
  beforeAll(() => {
    client = new PodcastIndexClient({
      key: process.env.API_KEY ?? "",
      secret: process.env.API_SECRET ?? "",
    });
  });

  describe("byFeedUrl", () => {
    const feedUrl = "https://feeds.twit.tv/twit.xml";
    it(knownKeys, async () => {
      const properties = ["status", "items", "count", "description", "query"];
      const episodes = await client.episodesByFeedUrl(feedUrl);

      expect(Object.keys(episodes)).toHaveLength(properties.length);
      properties.forEach((prop) => expect(episodes).toHaveProperty(prop));
    });

    it(sinceNowParam, async () => {
      const episodes = await client.episodesByFeedUrl(feedUrl, {
        since: Date.now() / 1000,
      });

      expect(episodes.count).toEqual(0);
    });

    it(sinceIncludeLastEpisode, async () => {
      const beep = await client.episodesByFeedUrl(feedUrl, {
        max: 1,
      });
      const episodes = await client.episodesByFeedUrl(feedUrl, {
        since: beep.items[0].datePublished - 1,
      });

      expect(episodes.count).toEqual(1);
    });

    it(maxParamSingle, async () => {
      const episodes = await client.episodesByFeedUrl(feedUrl, {
        max: 1,
      });

      expect(episodes.count).toEqual(1);
    });

    it(maxParam, async () => {
      const episodes = await client.episodesByFeedUrl(feedUrl, {
        max: 2,
      });

      expect(episodes.count).toEqual(2);
    });
  });

  describe("byFeedId", () => {
    const feedId = 555343;
    it(knownKeys, async () => {
      const properties = ["status", "items", "count", "description", "query"];
      const episodes = await client.episodesByFeedId(feedId);

      expect(Object.keys(episodes)).toHaveLength(properties.length);
      properties.forEach((prop) => expect(episodes).toHaveProperty(prop));
    });

    it(sinceNowParam, async () => {
      const episodes = await client.episodesByFeedId(feedId, {
        since: Date.now() / 1000,
      });

      expect(episodes.count).toEqual(0);
    });

    it(sinceIncludeLastEpisode, async () => {
      const beep = await client.episodesByFeedId(feedId, {
        max: 1,
      });
      const episodes = await client.episodesByFeedId(feedId, {
        since: beep.items[0].datePublished - 1,
      });

      expect(episodes.count).toEqual(1);
    });

    it(maxParamSingle, async () => {
      const episodes = await client.episodesByFeedId(feedId, {
        max: 1,
      });

      expect(episodes.count).toEqual(1);
    });

    it(maxParam, async () => {
      const episodes = await client.episodesByFeedId(feedId, {
        max: 2,
      });

      expect(episodes.count).toEqual(2);
    });
  });

  describe("byItunesId", () => {
    const itunesId = 73329404;
    it(knownKeys, async () => {
      const properties = ["status", "items", "count", "description", "query"];
      const episodes = await client.episodesByItunesId(itunesId);
      expect(Object.keys(episodes)).toHaveLength(properties.length);
      properties.forEach((prop) => expect(episodes).toHaveProperty(prop));
    });

    it(sinceNowParam, async () => {
      const episodes = await client.episodesByItunesId(itunesId, {
        since: Date.now() / 1000,
      });

      expect(episodes.count).toEqual(0);
    });

    it(sinceIncludeLastEpisode, async () => {
      const beep = await client.episodesByItunesId(itunesId, {
        max: 1,
      });
      const episodes = await client.episodesByItunesId(itunesId, {
        since: beep.items[0].datePublished - 1,
      });

      expect(episodes.count).toEqual(1);
    });

    it(maxParamSingle, async () => {
      const episodes = await client.episodesByItunesId(itunesId, {
        max: 1,
      });

      expect(episodes.count).toEqual(1);
    });

    it(maxParam, async () => {
      const episodes = await client.episodesByItunesId(itunesId, {
        max: 2,
      });

      expect(episodes.count).toEqual(2);
    });
  });

  describe("byId", () => {
    it(knownKeys, async () => {
      const properties = ["status", "id", "episode", "description"];
      const episode = await client.episodeById(391128542);

      expect(Object.keys(episode)).toHaveLength(properties.length);
      properties.forEach((prop) => expect(episode).toHaveProperty(prop));
    });
  });

  describe("random", () => {
    it(knownKeys, async () => {
      const properties = ["status", "max", "episodes", "count", "description"];
      const episodes = await client.episodesRandom();
      expect(Object.keys(episodes)).toHaveLength(properties.length);
      properties.forEach((prop) => expect(episodes).toHaveProperty(prop));
    });

    it(maxParamSingle, async () => {
      const episodes = await client.episodesRandom({ max: 1 });

      expect(episodes.count).toEqual(1);
    });

    it(maxParam, async () => {
      const episodes = await client.episodesRandom({ max: 2 });

      expect(episodes.count).toEqual(2);
    });

    it.skip("accepts a not category param (name)", async () => {
      const testEpisodesResult = await client.episodesRandom({ max: 3 });
      const categoryValues = chain(
        (ep: ApiResponse.PodcastEpisode) => Object.values(ep.categories),
        testEpisodesResult.episodes
      );

      const [testCategory] = uniq(categoryValues);
      const episodes = await client.episodesRandom({
        notcat: testCategory,
        max: 20,
      });

      expect(episodes.count).toEqual(20);
      episodes.episodes.forEach((ep) =>
        expect(Object.values(ep.categories)).not.toContain(testCategory)
      );
    });

    it("accepts multiple not categories param (name)", async () => {
      const testEpisodesResult = await client.episodesRandom({ max: 3 });
      const categoryValues = chain(
        (ep: ApiResponse.PodcastEpisode) => Object.values(ep.categories),
        testEpisodesResult.episodes
      );

      const categories = uniq(categoryValues).slice(0, 2);
      const episodes = await client.episodesRandom({
        notcat: categories,
        max: 20,
      });

      expect(episodes.count).toEqual(20);
      episodes.episodes.forEach((ep) =>
        expect(Object.values(ep.categories).some((cat) => categories.includes(cat))).toBe(false)
      );
    });

    it.skip("accepts a category param (name)", async () => {
      const testEpisodesResult = await client.episodesRandom({ max: 3 });
      const categoryValues = chain(
        (ep: ApiResponse.PodcastEpisode) => Object.values(ep.categories),
        testEpisodesResult.episodes
      );

      const [testCategory] = uniq(categoryValues);
      const episodes = await client.episodesRandom({
        cat: testCategory,
        max: 20,
      });

      expect(episodes.count).toEqual(20);
      episodes.episodes.forEach((ep) =>
        expect(Object.values(ep.categories)).toContain(testCategory)
      );
    });

    it("accepts multiple categories param (name)", async () => {
      const testEpisodesResult = await client.episodesRandom({ max: 3 });
      const categoryValues = chain(
        (ep: ApiResponse.PodcastEpisode) => Object.values(ep.categories),
        testEpisodesResult.episodes
      );

      const categories = uniq(categoryValues).slice(0, 2);
      const episodes = await client.episodesRandom({
        cat: categories,
        max: 20,
      });

      expect(episodes.count).toEqual(20);
      episodes.episodes.forEach((ep) =>
        expect(Object.values(ep.categories).some((cat) => categories.includes(cat))).toBe(true)
      );
    });

    it.skip("accepts a category param (id)", async () => {
      const testEpisodesResult = await client.episodesRandom({ max: 3 });
      const categoryKeys = chain(
        (ep: ApiResponse.PodcastEpisode) => Object.keys(ep.categories),
        testEpisodesResult.episodes
      );

      const [testCategory] = uniq(categoryKeys);
      const episodes = await client.episodesRandom({
        cat: testCategory,
        max: 20,
      });

      expect(episodes.count).toEqual(20);
      episodes.episodes.forEach((ep) => expect(Object.keys(ep.categories)).toContain(testCategory));
    });

    it("accepts multiple categories param (id)", async () => {
      const testEpisodesResult = await client.episodesRandom({ max: 3 });
      const categoryKeys = chain(
        (ep: ApiResponse.PodcastEpisode) => Object.keys(ep.categories),
        testEpisodesResult.episodes
      );

      const categories = uniq(categoryKeys).slice(0, 2);
      const episodes = await client.episodesRandom({
        cat: categories,
        max: 20,
      });

      expect(episodes.count).toEqual(20);
      // expect(categories.every((cat) => Object.keys(ep.categories).includes(cat))).toBe(true)
      episodes.episodes.forEach((ep) =>
        expect(Object.keys(ep.categories).some((cat) => categories.includes(cat))).toBe(true)
      );
    });

    it.skip("accepts a not category param (id)", async () => {
      const testEpisodesResult = await client.episodesRandom({ max: 3 });
      const categoryKeys = chain(
        (ep: ApiResponse.PodcastEpisode) => Object.keys(ep.categories),
        testEpisodesResult.episodes
      );

      const [testCategory] = uniq(categoryKeys);
      const episodes = await client.episodesRandom({
        notcat: testCategory,
        max: 20,
      });

      expect(episodes.count).toEqual(20);
      episodes.episodes.forEach((ep) =>
        expect(Object.keys(ep.categories)).not.toContain(testCategory)
      );
    });

    it("accepts multiple not categories param (id)", async () => {
      const testEpisodesResult = await client.episodesRandom({ max: 3 });
      const categoryKeys = chain(
        (ep: ApiResponse.PodcastEpisode) => Object.keys(ep.categories),
        testEpisodesResult.episodes
      );

      const categories = uniq(categoryKeys).slice(0, 2);
      const episodes = await client.episodesRandom({
        notcat: categories,
        max: 20,
      });

      expect(episodes.count).toEqual(20);
      episodes.episodes.forEach((ep) =>
        expect(Object.keys(ep.categories).some((cat) => categories.includes(cat))).toBe(false)
      );
    });

    it.skip("accepts a language param", async () => {
      const episodes = await client.episodesRandom({
        lang: "en",
        max: 20,
      });

      expect(episodes.count).toEqual(20);
      episodes.episodes.forEach((ep) => expect(ep.feedLanguage).toEqual("en"));
    });

    it("accepts multiple language param", async () => {
      const languages = ["en", "es"];
      const episodes = await client.episodesRandom({
        lang: languages,
        max: 20,
      });

      expect(episodes.count).toEqual(20);
      episodes.episodes.forEach((ep) => expect(languages.includes(ep.feedLanguage)).toBe(true));
    });
  });
});
