/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable no-await-in-loop */
import PodcastIndexClient from "../index";
import { ApiResponse, PIApiItunesPodcast, PIApiPodcast } from "../types";

describe("podcasts api", () => {
  let client: PodcastIndexClient;
  let feedByUrl: PIApiPodcast;
  let feedById: PIApiPodcast;
  let feedByItunesId: PIApiItunesPodcast;
  const feedUrl = "https://feeds.theincomparable.com/batmanuniversity";
  const feedId = 75075;
  const iTunesId = 1441923632;

  beforeAll(async () => {
    client = new PodcastIndexClient({
      key: process.env.API_KEY ?? "",
      secret: process.env.API_SECRET ?? "",
    });
    feedByUrl = await (await client.podcastByUrl(feedUrl)).feed;
    feedById = await (await client.podcastById(feedId)).feed;
    feedByItunesId = await (await client.podcastByItunesId(iTunesId)).feed;
  });

  describe("podcastByFeedUrl", () => {
    it("supports basic call", async () => {
      const searchResult = await client.podcastByUrl(feedUrl);
      expect(searchResult.status).toEqual(ApiResponse.Status.Success);
      expect(searchResult.feed).toHaveProperty("title", "Batman University");
    });
    it("returns same object as byUrl", async () => {
      const searchResult = await client.podcastByUrl(feedUrl);
      expect(searchResult.feed).toEqual(feedById);
    });
    it.skip("returns same object as byItunesId", async () => {
      const searchResult = await client.podcastByUrl(feedUrl);
      expect(searchResult.feed).toEqual(feedByItunesId);
    });
  });

  describe("podcastByItunesId", () => {
    it("supports basic call", async () => {
      const searchResult = await client.podcastByItunesId(iTunesId);
      expect(searchResult.status).toEqual(ApiResponse.Status.Success);
      expect(searchResult.feed).toHaveProperty("title", "Batman University");
    });
    it.skip("returns same object as byUrl", async () => {
      const searchResult = await client.podcastByItunesId(iTunesId);
      expect(searchResult.feed).toEqual(feedByUrl);
    });
    it.skip("returns same object as byId", async () => {
      const searchResult = await client.podcastByItunesId(iTunesId);
      expect(searchResult.feed).toEqual(feedById);
    });
  });

  describe("podcastById", () => {
    it("supports basic call", async () => {
      const searchResult = await client.podcastById(feedId);
      expect(searchResult.status).toEqual(ApiResponse.Status.Success);
      expect(searchResult.feed).toHaveProperty("title", "Batman University");
    });
    it("returns same object as byUrl", async () => {
      const searchResult = await client.podcastById(feedId);
      expect(searchResult.feed).toEqual(feedByUrl);
    });
    it.skip("returns same object as byItunesId", async () => {
      const searchResult = await client.podcastById(feedId);
      expect(searchResult.feed).toEqual(feedByItunesId);
    });
  });

  describe("trending", () => {
    it("returns a default of 40 feeds", async () => {
      const recentResults = await client.trending();
      expect(recentResults.feeds).toHaveLength(40);
    });

    it("returns a user provided max count of trending feeds", async () => {
      const max = 20;
      const recentResults = await client.trending({ max });
      expect(recentResults.feeds).toHaveLength(max);
    });

    it("returns trending feeds based on an optional language", async () => {
      const lang = "en";
      const recentResults = await client.trending({ lang });

      expect(recentResults.feeds.every((f) => f.language === lang)).toEqual(true);
    });

    it("returns trending feeds based on multiple optional languages", async () => {
      const lang = ["en", "en-us"];
      const recentResults = await client.trending({ lang });
      expect(recentResults.feeds.every((f) => lang.includes(f.language))).toEqual(true);
    });

    it("returns returns trending feeds based on since", async () => {
      const latestResults = await client.trending({ max: 5 });
      const firstResults = await client.trending({
        since: latestResults.feeds[0].newestItemPublishTime - 1,
      });
      const futureResults = await client.trending({
        since: latestResults.feeds[0].newestItemPublishTime,
      });

      expect(latestResults.feeds).toHaveLength(5);
      expect(futureResults.feeds).toHaveLength(40);
      expect(firstResults.feeds).toHaveLength(40);
    });

    it("returns returns trending feeds based on single category", async () => {
      const latestResults = await client.trending({ max: 5 });

      const [category] = latestResults.feeds.reduce<string[]>((acc, curr) => {
        const cats = Object.values(curr.categories ?? {});
        return acc.concat(cats);
      }, []);

      const byCategory = await client.trending({
        category,
      });

      expect(
        byCategory.feeds.every((f) => Object.values(f.categories ?? {}).includes(category))
      ).toEqual(true);
    });

    it("returns returns trending feeds based on multiple categories (categories are OR'd)", async () => {
      const latestResults = await client.trending({ max: 5 });

      const [firstCat, secondCat] = Array.from(
        new Set(
          latestResults.feeds.reduce<string[]>((acc, curr) => {
            const cats = Object.values(curr.categories ?? {});
            return acc.concat(cats);
          }, [])
        )
      );

      const byCategory = await client.trending({
        category: [firstCat, secondCat],
      });

      expect(
        byCategory.feeds.every((f) => {
          const categories = Object.values(f.categories ?? {});
          return categories.includes(firstCat) || categories.includes(secondCat);
        })
      ).toEqual(true);
    });

    it("returns returns trending feeds based on single notCategory", async () => {
      const latestResults = await client.trending({ max: 5 });

      const [category] = latestResults.feeds.reduce<string[]>((acc, curr) => {
        const cats = Object.values(curr.categories ?? {});
        return acc.concat(cats);
      }, []);

      const byCategory = await client.trending({
        notCategory: category,
      });

      expect(
        byCategory.feeds.every((f) => !Object.values(f.categories ?? {}).includes(category))
      ).toEqual(true);
    });

    it("returns returns trending feeds based on multiple notCategories", async () => {
      const latestResults = await client.trending({ max: 5 });

      const [firstCat, secondCat] = Array.from(
        new Set(
          latestResults.feeds.reduce<string[]>((acc, curr) => {
            const cats = Object.values(curr.categories ?? {});
            return acc.concat(cats);
          }, [])
        )
      );

      const byCategory = await client.trending({
        notCategory: [firstCat, secondCat],
      });

      expect(
        byCategory.feeds.every((f) => {
          const categories = Object.values(f.categories ?? {});
          return !categories.includes(firstCat) && !categories.includes(secondCat);
        })
      ).toEqual(true);
    });
  });
});
