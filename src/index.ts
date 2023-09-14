import crypto from "crypto";
import fetch from "node-fetch";
import dotEnv from "dotenv";
import { pick } from "ramda";

import { track, init, register } from "./analytics";
import logger from "./logger";
import { ApiResponse } from "./types";
import { normalizeKey, toEpochTimestamp, ensureArray } from "./utils";
import { version } from "../package.json";

dotEnv.config();

const clientUserAgent = `podcastdx client/${version}`;
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

class PodcastIndexClient {
  private apiUrl = `https://api.podcastindex.org/api/1.0`;

  private userAgent = clientUserAgent;

  private version = apiVersion;

  private key: string;

  private secret: string;

  constructor({
    key = process.env.API_KEY,
    secret = process.env.API_SECRET,
    enableAnalytics,
    disableAnalytics,
  }: {
    key?: string;
    secret?: string;
    disableAnalytics?: boolean;
    enableAnalytics?: boolean;
  } = {}) {
    if (!key || !secret) {
      throw new Error("Unable to initialize due to missing key or secret");
    }
    this.key = key;
    this.secret = secret;
    init(key, { enableAnalytics: enableAnalytics === false ? false : !disableAnalytics });
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

  /**
   * Make a raw request to podcast index. This is an escape hatch for leveraging the auth handling in the client
   * but managing the calls and responses yourself.
   * Example:
   *      client.raw("/podcasts/byfeedid?id=75075");
   *      client.raw("/podcasts/byfeedid", { id: 75075 });
   *
   * @param endpoint
   * @param qs
   */
  public async raw<T>(endpoint: string, qs?: ApiResponse.AnyQueryOptions): Promise<T> {
    const result = await this.fetch<T>(endpoint, qs);

    track("Raw", {
      endpoint,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      ...("status" in result ? { status: result.status as string } : undefined),
    });

    return result;
  }

  // #region Search
  /**
   * List all categories
   *
   * @param query search query
   */
  public async categories(): Promise<ApiResponse.Categories> {
    const result = await this.fetch<ApiResponse.Categories>("/categories/list");
    track("Categories Response", {
      count: result.count,
      length: result.feeds.length,
      status: result.status,
    });
    return result;
  }
  // #endregion

  // #region Search
  /**
   * This call returns all of the feeds that match the search terms in the title, author, or owner of the feed.
   * This is ordered by the last-released episode, with the latest at the top of the results.
   *
   * @param query search query
   */
  public async search(
    query: string,
    options: {
      clean?: boolean;
      max?: number;
      fulltext?: boolean;
    } = {}
  ): Promise<ApiResponse.Search> {
    const result = await this.fetch<ApiResponse.Search>("/search/byterm", {
      q: query,
      max: options.max ?? 25,
      clean: Boolean(options.clean),
      fulltext: Boolean(options.fulltext),
    });

    track("Search", {
      query,
      clean: Boolean(options.clean),
      fulltext: options.fulltext,
      max: options.max,
      count: result.count,
      length: result.feeds.length,
      status: result.status,
    });

    return result;
  }

  /**
   * This call returns all of the episodes where the specified person is mentioned.
   *
   * @param query search query
   */
  public async searchPerson(
    query: string,
    options: {
      fulltext?: boolean;
    } = {}
  ): Promise<ApiResponse.SearchPerson> {
    const result = await this.fetch<ApiResponse.SearchPerson>("/search/byperson", {
      q: query,
      fulltext: Boolean(options.fulltext),
    });

    track("Search Person", {
      query,
      fulltext: options.fulltext,
      count: result.count,
      length: result.items.length,
      status: result.status,
    });

    return result;
  }
  // #endregion

  // #region Recent
  /**
   * This call returns the most recent [max] number of episodes globally across the whole index, in reverse chronological order. Max of 1000
   */
  public async recentEpisodes(
    options: {
      max?: number;
      /** If you pass this argument, any item containing this string will be discarded from the result set. This may, in certain cases, reduce your set size below your “max” value. */
      excludeString?: string;
      /** If you pass an episode id, you will get recent episodes before that id, allowing you to walk back through the episode history sequentially. */
      before?: number;
      /** If present, return the full text value of any text fields (ex: description). If not provided, field value is truncated to 100 words. */
      fulltext?: boolean;
    } = {}
  ): Promise<ApiResponse.RecentEpisodes> {
    const result = await this.fetch<ApiResponse.RecentEpisodes>("/recent/episodes", {
      ...options,
      max: options.max ?? 10,
    });

    track("Recent Episodes", {
      max: options.max,
      excludeString: options.excludeString,
      before: options.before,
      count: result.count,
      length: result.items.length,
      status: result.status,
    });

    return result;
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

    track("Recent Feeds", {
      max: options.max,
      lang: ensureArray(options.lang),
      category: ensureArray(options.category),
      notCategory: ensureArray(options.notCategory),
      count: result.count,
      length: result.feeds.length,
      status: result.status,
    });

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
  public async recentNewFeeds(
    options: {
      /** Max number of items to return, defaults to 10 */
      max?: number;
    } = {}
  ): Promise<ApiResponse.RecentNewFeeds> {
    const result = await this.fetch<ApiResponse.RecentNewFeeds>("/recent/newfeeds", {
      max: options.max ?? 10,
    });

    track("Recent New Feeds", {
      max: options.max,
      count: result.count,
      length: result.feeds.length,
      status: result.status,
    });

    return result;
  }

  /**
   * The most recent 60 soundbites that the index has discovered
   */
  public async recentSoundbites(): Promise<ApiResponse.RecentSoundbites> {
    const result = await this.fetch<ApiResponse.RecentSoundbites>("/recent/soundbites");
    track("Recent Soundbites", {
      count: result.count,
      length: result.items.length,
      status: result.status,
    });

    return result;
  }
  // #endregion

  // #region Podcasts
  /** This call returns everything we know about the feed. */
  public async podcastByUrl(url: string): Promise<ApiResponse.PodcastByUrl> {
    const result = await this.fetch<ApiResponse.PodcastByUrl>("/podcasts/byfeedurl", { url });
    if (!result.feed.categories) {
      result.feed.categories = {};
    }

    track("Feed by URL", {
      url,
      categoryCount: Object.keys(result.feed.categories).length,
      status: result.status,
    });

    return result;
  }

  /** This call returns everything we know about the feed. */
  public async podcastById(id: number): Promise<ApiResponse.PodcastById> {
    const result = await this.fetch<ApiResponse.PodcastById>("/podcasts/byfeedid", { id });
    if (!result.feed.categories) {
      result.feed.categories = {};
    }

    track("Feed by ID", {
      id,
      categoryCount: Object.keys(result.feed.categories).length,
      status: result.status,
    });

    return result;
  }

  /** If we have an itunes id on file for a feed, then this call returns everything we know about that feed. */
  public async podcastByItunesId(id: number): Promise<ApiResponse.PodcastByItunesId> {
    const result = await this.fetch<ApiResponse.PodcastByItunesId>("/podcasts/byitunesid", { id });
    if (!result.feed.categories) {
      result.feed.categories = {};
    }

    track("Feed by iTunes ID", {
      id,
      categoryCount: Object.keys(result.feed.categories).length,
      status: result.status,
    });

    return result;
  }

  /**
   * This call returns the podcasts/feeds that in the index that are trending.
   *
   * @param options additional api options
   */
  public async trending(
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
  ): Promise<ApiResponse.Trending> {
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

    const result = await this.fetch<ApiResponse.Trending>("/podcasts/trending", apiOptions);

    track("Trending Feeds", {
      max: options.max,
      lang: ensureArray(options.lang),
      category: ensureArray(options.category),
      notCategory: ensureArray(options.notCategory),
      count: result.count,
      length: result.feeds.length,
      status: result.status,
    });

    return {
      ...result,
      feeds: result.feeds
        // eslint-disable-next-line sonarjs/no-identical-functions
        .map((feed) => {
          if (!feed.categories) {
            return { ...feed, categories: {} };
          }
          return feed;
        })
        .map((feed) => normalizeKey((lang) => lang.toLowerCase(), "language", feed)),
    };
  }

  // #endregion

  // #region Episodes
  /** This call returns all the episodes we know about for this feed, in reverse chronological order. */
  public async episodesByFeedUrl(
    url: string,
    options: {
      /** You can specify a maximum number of results to return */
      max?: number;
      /** You can specify a hard-coded unix timestamp, or a negative integer that represents a number of seconds prior to right now. Either way you specify, the search will start from that time and only return feeds updated since then. */
      since?: number;
      fulltext?: boolean;
    } = {}
  ): Promise<ApiResponse.EpisodesByFeedUrl> {
    const { since, ...rest } = options;
    const result = await this.fetch<ApiResponse.EpisodesByFeedUrl>("/episodes/byfeedurl", {
      ...rest,
      since: toEpochTimestamp(since),
      url,
    });

    track("Episodes by Feed URL", {
      url,
      fulltext: options.fulltext,
      max: options.max,
      since: options.since,
      count: result.count,
      length: result.items.length,
      status: result.status,
    });

    return result;
  }

  /**
   * This call returns all the episodes we know about for this feed, in reverse chronological order.
   * Note: The id parameter is the internal Podcastindex id for this feed.
   */
  public async episodesByFeedId(
    id: number | number[],
    options: {
      /** You can specify a maximum number of results to return */
      max?: number;
      /** You can specify a hard-coded unix timestamp, or a negative integer that represents a number of seconds prior to right now. Either way you specify, the search will start from that time and only return feeds updated since then. */
      since?: number;
      fulltext?: boolean;
    } = {}
  ): Promise<ApiResponse.EpisodesByFeedId> {
    const { since, ...rest } = options;
    const parsedId = Array.isArray(id) ? id.join(",") : id;
    const result = await this.fetch<ApiResponse.EpisodesByFeedId>("/episodes/byfeedid", {
      ...rest,
      since: toEpochTimestamp(since),
      id: parsedId,
    });

    track("Episodes by Feed ID", {
      id,
      fulltext: options.fulltext,
      max: options.max,
      since: options.since,
      count: result.count,
      length: result.items.length,
      status: result.status,
    });

    return result;
  }

  /**
   * If we have an itunes id on file for a feed, then this call returns all the episodes we know about for the feed, in reverse chronological order.
   * Note: The itunes id parameter can either be the number alone, or be prepended with “id”.
   */
  public async episodesByItunesId(
    id: number,
    options: {
      /** You can specify a maximum number of results to return */
      max?: number;
      /** You can specify a hard-coded unix timestamp, or a negative integer that represents a number of seconds prior to right now. Either way you specify, the search will start from that time and only return feeds updated since then. */
      since?: number | Date;
      fulltext?: boolean;
    } = {}
  ): Promise<ApiResponse.EpisodesByItunesId> {
    const { since, ...rest } = options;
    const result = await this.fetch<ApiResponse.EpisodesByItunesId>("/episodes/byitunesid", {
      ...rest,
      since: toEpochTimestamp(since),
      id,
    });

    track("Episodes by iTunes ID", {
      id,
      fulltext: options.fulltext,
      max: options.max,
      since: options.since,
      count: result.count,
      length: result.items.length,
      status: result.status,
    });

    return result;
  }

  /**
   * This call returns a random batch of [max] episodes, in no specific order.
   *
   * Note: If no [max] is specified, the default is 1. You can return up to 40 episodes at a time.
   * Note: Language and category names are case-insensitive.
   * Note: You can mix and match the cat and notcat filters to fine tune a very specific result set.
   */
  public async episodesRandom(
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

    const result = await this.fetch<ApiResponse.RandomEpisodes>("/episodes/random", parsedOptions);

    track("Random Episodes", {
      max: options.max,
      lang: ensureArray(options.lang),
      category: ensureArray(options.cat),
      notCategory: ensureArray(options.notcat),
      count: result.count,
      length: result.episodes.length,
      status: result.status,
    });

    return result;
  }

  /** Get all the metadata for a single episode by passing its id. */
  public async episodeById(
    id: number,
    options: { fulltext?: boolean } = {}
  ): Promise<ApiResponse.EpisodeById> {
    const result = await this.fetch<ApiResponse.EpisodeById>("/episodes/byid", { id, ...options });

    track("Episode by ID", {
      id,
      fulltext: options.fulltext,
      status: result.status,
    });

    return result;
  }
  // #endregion

  public async stats(): Promise<ApiResponse.Stats> {
    const result = await this.fetch<ApiResponse.Stats>("/stats/current");

    track("Stats", {
      ...result.stats,
      status: result.status,
    });

    return result;
  }
}

export = PodcastIndexClient;
