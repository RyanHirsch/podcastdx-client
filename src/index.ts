import crypto from "crypto";
import fetch from "node-fetch";
import dotEnv from "dotenv";
import { pick } from "ramda";

import { track, init, register } from "./analytics";
import logger from "./logger";
import { ApiResponse } from "./types";
import { normalizeKey, toEpochTimestamp } from "./utils";

dotEnv.config();

const clientUserAgent = `podcastdx client/2.4.1`;
const apiVersion = "1.0";

function encodeObjectToQueryString(qs?: ApiResponse.AnyQueryOptions) {
  if (!qs) {
    return null;
  }

  return Object.entries(qs)
    .map(([key, val]) => {
      if (!val) {
        return null;
      }

      if (Array.isArray(val)) {
        return `${key}[]=${(val as unknown[]).map((v) => encodeURI(`${v}`)).join(",")}`;
      }

      if (val === true) {
        return key;
      }

      return `${key}=${encodeURI(`${val}`)}`;
    })
    .filter((x) => x)
    .join("&");
}

register({
  "api version": apiVersion,
  "client user-agent": clientUserAgent,
  "node environment": process.env.NODE_ENV,
});

export default class PodcastIndexClient {
  private apiUrl = `https://api.podcastindex.org/api/1.0`;

  private userAgent = clientUserAgent;

  private version = apiVersion;

  private key: string;

  private secret: string;

  constructor({
    key = process.env.API_KEY,
    secret = process.env.API_SECRET,
    enableAnalytics,
  }: {
    key?: string;
    secret?: string;
    enableAnalytics?: boolean;
  } = {}) {
    if (!key || !secret) {
      throw new Error("Unable to initialize due to missing key or secret");
    }
    this.key = key;
    this.secret = secret;
    init(key, { enableAnalytics: enableAnalytics ?? false });
  }

  private generateHeaders() {
    if (!this.key || !this.secret) {
      throw new Error("Missing key or secret");
    }

    const apiHeaderTime = Math.floor(Date.now() / 1000);
    const sha1Algorithm = "sha1";
    const sha1Hash = crypto.createHash(sha1Algorithm);
    const data4Hash = this.key + this.secret + apiHeaderTime;
    sha1Hash.update(data4Hash);
    const hash4Header = sha1Hash.digest("hex");

    return {
      "Content-Type": "application/json",
      "X-Auth-Date": `${apiHeaderTime}`,
      "X-Auth-Key": this.key,
      Authorization: hash4Header,
      "User-Agent": `${this.userAgent}/${this.version}`,
    };
  }

  private fetch<T>(endpoint: string, qs?: ApiResponse.AnyQueryOptions): Promise<T> {
    const start = Date.now();
    const queryString = qs ? encodeObjectToQueryString(qs) : null;
    const options = {
      method: `GET`,
      headers: this.generateHeaders(),
    };
    const url = `${this.apiUrl}${endpoint}${queryString ? `?${queryString}` : ``}`;

    logger.log(url);
    return fetch(url, options).then((res) => {
      track("API Call", {
        endpoint,
        url,
        duration: Date.now() - start,
        "response status": res.status,
        "response text": res.statusText,
        ...(queryString ? { "full query": queryString, ...qs } : undefined),
      });
      if (res.status >= 200 && res.status < 300) {
        return res.json();
      }
      throw new Error(res.statusText);
    });
  }

  // #region Search
  /**
   * List all categories
   *
   * @param query search query
   */
  public categories(): Promise<ApiResponse.Categories> {
    return this.fetch("/categories/list");
  }
  // #endregion

  // #region Search
  /**
   * This call returns all of the feeds that match the search terms in the title, author, or owner of the feed.
   * This is ordered by the last-released episode, with the latest at the top of the results.
   *
   * @param query search query
   */
  public search(
    query: string,
    options: {
      clean?: boolean;
      max?: number;
    } = {}
  ): Promise<ApiResponse.Search> {
    return this.fetch("/search/byterm", {
      q: query,
      max: options.max ?? 25,
      clean: Boolean(options.clean),
    });
  }
  // #endregion

  // #region Recent
  /**
   * This call returns the most recent [max] number of episodes globally across the whole index, in reverse chronological order. Max of 1000
   */
  public recentEpisodes(
    options: {
      max?: number;
      /** If you pass this argument, any item containing this string will be discarded from the result set. This may, in certain cases, reduce your set size below your “max” value. */
      excludeString?: string;
      /** If you pass an episode id, you will get recent episodes before that id, allowing you to walk back through the episode history sequentially. */
      before?: number;
    } = {}
  ): Promise<ApiResponse.RecentEpisodes> {
    return this.fetch("/recent/episodes", { ...options, max: options.max ?? 10 });
  }

  /**
   * This call returns the most recently feeds in reverse chronological order.
   *
   * @param options additional api options
   */
  public async recentFeeds(
    options: {
      /** Max number of items to return, defaults to 40 */
      max?: number;
      /** You can specify a hard-coded unix timestamp, or a negative integer that represents a number of seconds prior to now. Either way you specify, the search will start from that time and only return feeds updated since then. */
      since?: number;
      /** specifying a language code (like “en”) will return only feeds having that specific language. */
      lang?: string | string[];
      /** You can pass multiple of these to form an array. The category ids given will be excluded from the result set. */
      notCategory?: string[] | number[] | string | number;
      /** You can pass multiple of these to form an array. It will take precedent over the notCategory[] array, and instead only show you feeds with those categories in the result set. These values are OR'd */
      category?: string[] | number[] | string | number;
    } = {}
  ): Promise<ApiResponse.RecentFeeds> {
    const apiOptions: Record<string, string | number | undefined> = {
      max: options.max ?? 40,
      ...pick(["since"], options),
    };

    if (options.lang) {
      if (Array.isArray(options.lang)) {
        apiOptions.lang = options.lang.join(",");
      } else {
        apiOptions.lang = options.lang;
      }
    }
    if (options.notCategory) {
      apiOptions.notcat = Array.isArray(options.notCategory)
        ? options.notCategory.join(",")
        : options.notCategory;
    }

    if (options.category) {
      apiOptions.cat = Array.isArray(options.category)
        ? options.category.join(",")
        : options.category;
    }

    const result = await this.fetch<ApiResponse.RecentFeeds>("/recent/feeds", apiOptions);

    return {
      ...result,
      feeds: result.feeds
        .map((feed) => {
          if (!feed.categories) {
            return { ...feed, categories: {} };
          }
          return feed;
        })
        .map((feed) => normalizeKey((lang) => lang.toLowerCase(), "language", feed)),
    };
  }

  /**
   * This call returns every new feed added to the index over the past 24 hours in reverse chronological order. Max of 1000
   *
   * @param options
   */
  public recentNewFeeds(
    options: {
      /** Max number of items to return, defaults to 10 */
      max?: number;
    } = {}
  ): Promise<ApiResponse.RecentNewFeeds> {
    return this.fetch("/recent/newfeeds", { max: options.max ?? 10 });
  }

  /**
   * The most recent 60 soundbites that the index has discovered
   */
  public recentSoundbites(): Promise<ApiResponse.RecentSoundbites> {
    return this.fetch("/recent/soundbites");
  }
  // #endregion

  // #region Podcasts
  /** This call returns everything we know about the feed. */
  public async podcastByUrl(url: string): Promise<ApiResponse.PodcastByUrl> {
    const result = await this.fetch<ApiResponse.PodcastByUrl>("/podcasts/byfeedurl", { url });
    if (!result.feed.categories) {
      result.feed.categories = {};
    }
    return result;
  }

  /** This call returns everything we know about the feed. */
  public async podcastById(id: number): Promise<ApiResponse.PodcastById> {
    const result = await this.fetch<ApiResponse.PodcastById>("/podcasts/byfeedid", { id });
    if (!result.feed.categories) {
      result.feed.categories = {};
    }
    return result;
  }

  /** If we have an itunes id on file for a feed, then this call returns everything we know about that feed. */
  public async podcastByItunesId(id: number): Promise<ApiResponse.PodcastByItunesId> {
    const result = await this.fetch<ApiResponse.PodcastByItunesId>("/podcasts/byitunesid", { id });
    if (!result.feed.categories) {
      result.feed.categories = {};
    }
    return result;
  }
  // #endregion

  // #region Episodes
  /** This call returns all the episodes we know about for this feed, in reverse chronological order. */
  public episodesByFeedUrl(
    url: string,
    options: {
      /** You can specify a maximum number of results to return */
      max?: number;
      /** You can specify a hard-coded unix timestamp, or a negative integer that represents a number of seconds prior to right now. Either way you specify, the search will start from that time and only return feeds updated since then. */
      since?: number;
    } = {}
  ): Promise<ApiResponse.EpisodesByFeedUrl> {
    const { since, ...rest } = options;
    return this.fetch("/episodes/byfeedurl", { ...rest, since: toEpochTimestamp(since), url });
  }

  /**
   * This call returns all the episodes we know about for this feed, in reverse chronological order.
   * Note: The id parameter is the internal Podcastindex id for this feed.
   */
  public episodesByFeedId(
    id: number | number[],
    options: {
      /** You can specify a maximum number of results to return */
      max?: number;
      /** You can specify a hard-coded unix timestamp, or a negative integer that represents a number of seconds prior to right now. Either way you specify, the search will start from that time and only return feeds updated since then. */
      since?: number;
    } = {}
  ): Promise<ApiResponse.EpisodesByFeedId> {
    const { since, ...rest } = options;
    const parsedId = Array.isArray(id) ? id.join(",") : id;
    return this.fetch("/episodes/byfeedid", {
      ...rest,
      since: toEpochTimestamp(since),
      id: parsedId,
    });
  }

  /**
   * If we have an itunes id on file for a feed, then this call returns all the episodes we know about for the feed, in reverse chronological order.
   * Note: The itunes id parameter can either be the number alone, or be prepended with “id”.
   */
  public episodesByItunesId(
    id: number,
    options: {
      /** You can specify a maximum number of results to return */
      max?: number;
      /** You can specify a hard-coded unix timestamp, or a negative integer that represents a number of seconds prior to right now. Either way you specify, the search will start from that time and only return feeds updated since then. */
      since?: number | Date;
    } = {}
  ): Promise<ApiResponse.EpisodesByItunesId> {
    const { since, ...rest } = options;
    return this.fetch("/episodes/byitunesid", { ...rest, since: toEpochTimestamp(since), id });
  }

  /**
   * This call returns a random batch of [max] episodes, in no specific order.
   *
   * Note: If no [max] is specified, the default is 1. You can return up to 40 episodes at a time.
   * Note: Language and category names are case-insensitive.
   * Note: You can mix and match the cat and notcat filters to fine tune a very specific result set.
   */
  public episodesRandom(
    options: {
      /** You can specify a maximum number of results to return */
      max?: number;
      /** Specifying a language code (like "en") will return only episodes having that specific language. You can specify multiple languages by separating them with commas. If you also want to return episodes that have no language given, use the token "unknown". (ex. en,es,ja,unknown) */
      lang?: string | string[];
      /** You may use this argument to specify that you ONLY want episodes with these categories in the results. Separate multiple categories with commas. You may specify either the category id or the category name */
      cat?: string | string[];
      /** You may use this argument to specify categories of episodes to NOT show in the results. Separate multiple categories with commas. You may specify either the category id or the category name. */
      notcat?: string | string[];
    } = {}
  ): Promise<ApiResponse.RandomEpisodes> {
    const parsedOptions: Record<string, number | string | undefined> = options.max
      ? { max: options.max }
      : {};

    parsedOptions.lang = Array.isArray(options.lang) ? options.lang.join(",") : options.lang;
    parsedOptions.cat = Array.isArray(options.cat) ? options.cat.join(",") : options.cat;
    parsedOptions.notcat = Array.isArray(options.notcat)
      ? options.notcat.join(",")
      : options.notcat;

    return this.fetch("/episodes/random", parsedOptions);
  }

  /** Get all the metadata for a single episode by passing its id. */
  public episodeById(id: number): Promise<ApiResponse.EpisodeById> {
    return this.fetch("/episodes/byid", { id });
  }
  // #endregion
}
