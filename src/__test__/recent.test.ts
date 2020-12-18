/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable no-await-in-loop */
import PodcastIndexClient from "../index";

describe("recent", () => {
  let client: PodcastIndexClient;

  beforeAll(async () => {
    client = new PodcastIndexClient({
      key: process.env.API_KEY ?? "",
      secret: process.env.API_SECRET ?? "",
    });
  });

  describe("episodes", () => {
    it("returns a default of 10 episodes", async () => {
      const recentResults = await client.recentEpisodes();
      expect(recentResults.items).toHaveLength(10);
    });

    it("returns a user provided max count of episodes", async () => {
      const max = 20;
      const recentResults = await client.recentEpisodes({ max });
      expect(recentResults.items).toHaveLength(max);
    });

    it("supports exclusion string", async () => {
      const resultToExclude = await client.recentEpisodes();
      const episodeToExclude = resultToExclude.items.find((i) => i.feedLanguage.startsWith("en"));

      const excludedResultsByFeed = await client.recentEpisodes({
        excludeString: episodeToExclude?.feedTitle ?? "Today",
      });

      expect(excludedResultsByFeed.items.map((f) => f.id)).not.toContain(episodeToExclude?.id ?? 0);
      const excludedResultsByEpisode = await client.recentEpisodes({
        excludeString: episodeToExclude?.title ?? "Today",
      });

      expect(excludedResultsByEpisode.items.map((f) => f.id)).not.toContain(
        episodeToExclude?.id ?? 0
      );
    });

    it("supports walking back through episodes string", async () => {
      const first = 1305556075;
      const second = 1304492281;
      const third = 1304390354;

      const secondEpisode = await client.recentEpisodes({
        before: first,
        max: 1,
      });

      expect(secondEpisode.items[0]).toHaveProperty("id", second);

      const thirdEpisode = await client.recentEpisodes({
        before: second,
        max: 1,
      });

      expect(thirdEpisode.items[0]).toHaveProperty("id", third);
    });
  });

  describe("feeds", () => {
    it("returns a default of 40 feeds", async () => {
      const recentResults = await client.recentFeeds();
      expect(recentResults.feeds).toHaveLength(40);
    });

    it("returns a user provided max count of feeds", async () => {
      const max = 20;
      const recentResults = await client.recentFeeds({ max });
      expect(recentResults.feeds).toHaveLength(max);
    });

    it("returns feeds based on an optional language", async () => {
      const lang = "en";
      const recentResults = await client.recentFeeds({ lang });

      expect(recentResults.feeds.every((f) => f.language === lang)).toEqual(true);
    });

    it("returns feeds based on multiple optional languages", async () => {
      const lang = ["en", "en-us"];
      const recentResults = await client.recentFeeds({ lang });
      expect(recentResults.feeds.every((f) => lang.includes(f.language))).toEqual(true);
    });

    it("returns returns feeds based on since", async () => {
      const latestResults = await client.recentFeeds({ max: 5 });
      const firstResults = await client.recentFeeds({
        since: latestResults.feeds[0].newestItemPublishTime - 1,
      });
      const futureResults = await client.recentFeeds({
        since: latestResults.feeds[0].newestItemPublishTime,
      });

      expect(latestResults.feeds).toHaveLength(5);
      expect(futureResults.feeds).toHaveLength(0);
      expect(firstResults.feeds).toHaveLength(1);
    });

    it("returns returns feeds based on single category", async () => {
      const latestResults = await client.recentFeeds({ max: 5 });

      const [category] = latestResults.feeds.reduce<string[]>((acc, curr) => {
        const cats = Object.values(curr.categories ?? {});
        return acc.concat(cats);
      }, []);

      const byCategory = await client.recentFeeds({
        category,
      });

      expect(
        byCategory.feeds.every((f) => Object.values(f.categories ?? {}).includes(category))
      ).toEqual(true);
    });

    it("returns returns feeds based on multiple categories (categories are OR'd)", async () => {
      const latestResults = await client.recentFeeds({ max: 5 });

      const [firstCat, secondCat] = Array.from(
        new Set(
          latestResults.feeds.reduce<string[]>((acc, curr) => {
            const cats = Object.values(curr.categories ?? {});
            return acc.concat(cats);
          }, [])
        )
      );

      const byCategory = await client.recentFeeds({
        category: [firstCat, secondCat],
      });

      expect(
        byCategory.feeds.every((f) => {
          const categories = Object.values(f.categories ?? {});
          return categories.includes(firstCat) || categories.includes(secondCat);
        })
      ).toEqual(true);
    });

    it("returns returns feeds based on single notCategory", async () => {
      const latestResults = await client.recentFeeds({ max: 5 });

      const [category] = latestResults.feeds.reduce<string[]>((acc, curr) => {
        const cats = Object.values(curr.categories ?? {});
        return acc.concat(cats);
      }, []);

      const byCategory = await client.recentFeeds({
        notCategory: category,
      });

      expect(
        byCategory.feeds.every((f) => !Object.values(f.categories ?? {}).includes(category))
      ).toEqual(true);
    });

    it("returns returns feeds based on multiple notCategories", async () => {
      const latestResults = await client.recentFeeds({ max: 5 });

      const [firstCat, secondCat] = Array.from(
        new Set(
          latestResults.feeds.reduce<string[]>((acc, curr) => {
            const cats = Object.values(curr.categories ?? {});
            return acc.concat(cats);
          }, [])
        )
      );

      const byCategory = await client.recentFeeds({
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

  describe("new feeds", () => {
    it("returns a default of 10 feeds", async () => {
      const recentResults = await client.recentNewFeeds();
      expect(recentResults.feeds).toHaveLength(10);
    });

    it("returns a user provided max count of feeds", async () => {
      const max = 20;
      const recentResults = await client.recentNewFeeds({ max });
      expect(recentResults.feeds).toHaveLength(max);
    });
  });

  describe("new soundbites", () => {
    it("returns a default of 60 soundbites", async () => {
      const recentResults = await client.recentSoundbites();
      expect(recentResults.items).toHaveLength(60);
    });
  });
});
