import { chain, uniq } from "ramda";
import { keys } from "ts-transformer-keys";

import PodcastIndexClient from "../index";
import { ApiResponse } from "../types";
import { assertObjectsHaveProperties, assertObjectHasProperties } from "./utils";

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
      const episodes = await client.episodesByFeedUrl(feedUrl);

      assertObjectHasProperties(keys<ApiResponse.EpisodesByFeedUrl>(), episodes);
      assertObjectsHaveProperties(keys<ApiResponse.EpisodeInfo>(), episodes.items);
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
      const episodes = await client.episodesByFeedId(feedId);

      assertObjectHasProperties(keys<ApiResponse.EpisodesByFeedId>(), episodes);
      assertObjectsHaveProperties(keys<ApiResponse.EpisodeInfo>(), episodes.items);
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
      const episodes = await client.episodesByItunesId(itunesId);
      assertObjectHasProperties(keys<ApiResponse.EpisodesByItunesId>(), episodes);
      assertObjectsHaveProperties(keys<ApiResponse.EpisodeInfo>(), episodes.items);
    });

    it(sinceNowParam, async () => {
      const now = new Date();
      const episodesEpoch = await client.episodesByItunesId(itunesId, {
        since: now.getTime() / 1000,
      });
      const episodesNow = await client.episodesByItunesId(itunesId, {
        since: now.getTime(),
      });
      const episodesDate = await client.episodesByItunesId(itunesId, {
        since: now,
      });

      expect(episodesEpoch.count).toEqual(0);
      expect(episodesEpoch.query).toEqual(episodesNow.query);
      expect(episodesNow.query).toEqual(episodesDate.query);
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
      const episode = await client.episodeById(391128542);

      assertObjectHasProperties(keys<ApiResponse.EpisodeById>(), episode);
      assertObjectHasProperties(keys<ApiResponse.PodcastEpisode>(), episode.episode);
    });
  });

  describe("random", () => {
    it(knownKeys, async () => {
      const randomEpisodes = await client.episodesRandom();

      assertObjectHasProperties(keys<ApiResponse.RandomEpisodes>(), randomEpisodes);
      assertObjectsHaveProperties(
        keys<ApiResponse.RandomPodcastEpisode>(),
        randomEpisodes.episodes
      );
    });

    it(maxParamSingle, async () => {
      const episodes = await client.episodesRandom({ max: 1 });

      expect(episodes.count).toEqual(1);
    });

    it(maxParam, async () => {
      const episodes = await client.episodesRandom({ max: 2 });

      expect(episodes.count).toEqual(2);
    });

    it("accepts a not category param (name)", async () => {
      const testEpisodesResult = await client.episodesRandom({ max: 3 });
      const categoryValues = chain(
        (ep) => Object.values(ep.categories),
        testEpisodesResult.episodes
      );

      const [testCategory] = uniq(categoryValues);
      const episodes = await client.episodesRandom({
        notcat: testCategory,
        max: 40,
      });

      expect(episodes.count).toEqual(40);
      episodes.episodes.forEach((ep) =>
        expect(Object.values(ep.categories)).not.toContain(testCategory)
      );
    });

    it("accepts multiple not categories param (name)", async () => {
      const testEpisodesResult = await client.episodesRandom({ max: 3 });
      const categoryValues = chain(
        (ep) => Object.values(ep.categories),
        testEpisodesResult.episodes
      );

      const categories = uniq(categoryValues).slice(0, 2);
      const episodes = await client.episodesRandom({
        notcat: categories,
        max: 40,
      });

      expect(episodes.count).toEqual(40);
      episodes.episodes.forEach((ep) =>
        expect(Object.values(ep.categories).some((cat) => categories.includes(cat))).toBe(false)
      );
    });

    it("accepts a category param (name)", async () => {
      const testEpisodesResult = await client.episodesRandom({ max: 3 });
      const categoryValues = chain(
        (ep) => Object.values(ep.categories),
        testEpisodesResult.episodes
      );

      const [testCategory] = uniq(categoryValues);
      const episodes = await client.episodesRandom({
        cat: testCategory,
        max: 40,
      });

      expect(episodes.count).toBeLessThanOrEqual(40);
      episodes.episodes.forEach((ep) =>
        expect(Object.values(ep.categories)).toContain(testCategory)
      );
    });

    it("accepts multiple categories param (name)", async () => {
      const testEpisodesResult = await client.episodesRandom({ max: 3 });
      const categoryValues = chain(
        (ep) => Object.values(ep.categories),
        testEpisodesResult.episodes
      );

      const categories = uniq(categoryValues).slice(0, 2);
      const episodes = await client.episodesRandom({
        cat: categories,
        max: 40,
      });

      expect(episodes.count).toBeLessThanOrEqual(40);
      episodes.episodes.forEach((ep) =>
        expect(Object.values(ep.categories).some((cat) => categories.includes(cat))).toBe(true)
      );
    });

    it("accepts a category param (id)", async () => {
      const testEpisodesResult = await client.episodesRandom({ max: 3 });
      const categoryKeys = chain((ep) => Object.keys(ep.categories), testEpisodesResult.episodes);

      const [testCategory] = uniq(categoryKeys);
      const episodes = await client.episodesRandom({
        cat: testCategory,
        max: 40,
      });

      expect(episodes.count).toEqual(40);
      episodes.episodes.forEach((ep) => expect(Object.keys(ep.categories)).toContain(testCategory));
    });

    it("accepts multiple categories param (id)", async () => {
      const testEpisodesResult = await client.episodesRandom({ max: 3 });
      const categoryKeys = chain((ep) => Object.keys(ep.categories), testEpisodesResult.episodes);

      const categories = uniq(categoryKeys).slice(0, 2);
      const episodes = await client.episodesRandom({
        cat: categories,
        max: 40,
      });

      expect(episodes.count).toEqual(40);
      // expect(categories.every((cat) => Object.keys(ep.categories).includes(cat))).toBe(true)
      episodes.episodes.forEach((ep) =>
        expect(Object.keys(ep.categories).some((cat) => categories.includes(cat))).toBe(true)
      );
    });

    it("accepts a not category param (id)", async () => {
      const testEpisodesResult = await client.episodesRandom({ max: 3 });
      const categoryKeys = chain((ep) => Object.keys(ep.categories), testEpisodesResult.episodes);

      const [testCategory] = uniq(categoryKeys);
      const episodes = await client.episodesRandom({
        notcat: testCategory,
        max: 40,
      });

      expect(episodes.count).toBeLessThanOrEqual(40);
      episodes.episodes.forEach((ep) =>
        expect(Object.keys(ep.categories)).not.toContain(testCategory)
      );
    });

    it("accepts multiple not categories param (id)", async () => {
      const testEpisodesResult = await client.episodesRandom({ max: 3 });
      const categoryKeys = chain((ep) => Object.keys(ep.categories), testEpisodesResult.episodes);

      const categories = uniq(categoryKeys).slice(0, 2);
      const episodes = await client.episodesRandom({
        notcat: categories,
        max: 40,
      });

      expect(episodes.count).toBeLessThanOrEqual(40);
      episodes.episodes.forEach((ep) =>
        expect(Object.keys(ep.categories).some((cat) => categories.includes(cat))).toBe(false)
      );
    });

    it("accepts a language param", async () => {
      const episodes = await client.episodesRandom({
        lang: "en",
        max: 40,
      });

      expect(episodes.count).toEqual(40);
      episodes.episodes.forEach((ep) => expect(ep.feedLanguage).toEqual("en"));
    });

    it("accepts multiple language param", async () => {
      const languages = ["en", "es"];
      const episodes = await client.episodesRandom({
        lang: languages,
        max: 40,
      });

      expect(episodes.count).toEqual(40);
      episodes.episodes.forEach((ep) => expect(languages.includes(ep.feedLanguage)).toBe(true));
    });
  });
});
