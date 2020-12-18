/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable no-await-in-loop */
import PodcastIndexClient from "../index";
import { ApiResponse, PIApiPodcast } from "../types";

describe("podcasts api", () => {
  let client: PodcastIndexClient;
  let feedByUrl: PIApiPodcast;
  let feedById: PIApiPodcast;
  let feedByItunesId: PIApiPodcast;
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
});
