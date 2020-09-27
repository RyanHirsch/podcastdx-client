import crypto from "crypto";
import fetch from "node-fetch";
import dotEnv from "dotenv";
import { pick } from "ramda";

import logger from "./logger";
import { ApiResponse } from "./types";

dotEnv.config();

function encodeObjectToQueryString(qs?: Record<string, string | number | number[] | undefined>) {
  if (!qs) {
    return null;
  }

  return Object.entries(qs)
    .map(([key, val]) => {
      if (!val) {
        return null;
      }

      if (Array.isArray(val)) {
        return `${key}[]=${val.map((v) => encodeURI(`${v}`)).join(",")}`;
      }

      return `${key}=${encodeURI(`${val}`)}`;
    })
    .filter((x) => x)
    .join("&");
}

export default class PodcastIndexClient {
  private apiUrl = `https://api.podcastindex.org/api/1.0`;

  private userAgent = "podcastdx client/2.0";

  private version = "1.0";

  private key: string;

  private secret: string;

  constructor({ key, secret }: { key: string; secret: string }) {
    this.key = key;
    this.secret = secret;
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

  private fetch(endpoint: string, qs?: Record<string, string | number | undefined>) {
    const queryString = qs ? encodeObjectToQueryString(qs) : null;
    const options = {
      method: `GET`,
      headers: this.generateHeaders(),
    };
    const url = `${this.apiUrl}${endpoint}${queryString ? `?${queryString}` : ``}`;

    logger.log(url);
    return fetch(url, options).then((res) => {
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
   * This call returns all of the feeds that match the search terms in the title of the feed.
   * This is ordered by the last-released episode, with the latest at the top of the results.
   *
   * @param query search query
   */
  public search(query: string): Promise<ApiResponse.Search> {
    return this.fetch("/search/byterm", { q: query });
  }
  // #endregion

  // #region Recent
  /**
   * This call returns the most recent [max] number of episodes globally across the whole index, in reverse chronological order. Max of 1000
   *
   * @param max the max number of items to return, defaults to 10
   */
  public recentEpisodes(max = 10): Promise<ApiResponse.RecentEpisodes> {
    return this.fetch("/recent/episodes", { max });
  }

  /**
   * This call returns the most recently feeds in reverse chronological order.
   *
   * @param max the max number of items to return, defaults to 40
   * @param options additional api options
   */
  public recentFeeds(
    max = 40,
    options: {
      /** You can specify a hard-coded unix timestamp, or a negative integer that represents a number of seconds prior to now. Either way you specify, the search will start from that time and only return feeds updated since then. */
      since?: number;
      /** specifying a language code (like “en”) will return only feeds having that specific language. */
      language?: string;
      /** You can pass multiple of these to form an array. The category ids given will be excluded from the result set. */
      notCategory?: string[] | number[];
      /** You can pass multiple of these to form an array. It will take precedent over the notCategory[] array, and instead only show you feeds with those categories in the result set. These values are OR'd */
      isCategory?: string[] | number[];
    } = {}
  ): Promise<ApiResponse.RecentFeeds> {
    const apiOptions: Record<string, string | number | undefined> = {
      max,
      ...pick(["language", "since"], options),
    };

    if (options.notCategory) {
      apiOptions["notCategory[]"] = options.notCategory.join(",");
    }

    if (options.isCategory) {
      apiOptions["isCategory[]"] = options.isCategory.join(",");
    }

    return this.fetch("/recent/feeds", apiOptions);
  }

  /**
   * This call returns every new feed added to the index over the past 24 hours in reverse chronological order. Max of 1000
   * NOTE: As of Sept 27, the API does not respect max
   *
   * @param max the max number of items to return, defaults to 10
   */
  public recentNewFeeds(
    max = 10,
    options: {
      /** If you pass this argument, any item containing this string will be discarded from the result set. This may, in certain cases, reduce your set size below your “max” value. */
      excludedString?: string;
      /** If you pass an episode id, you will get recent episodes before that id, allowing you to walk back through the episode history sequentially. */
      before?: number;
    } = {}
  ): Promise<ApiResponse.RecentNewFeeds> {
    return this.fetch("/recent/newfeeds", { ...options, max });
  }
  // #endregion

  // #region Podcasts
  /** This call returns everything we know about the feed. */
  public podcastByUrl(url: string): Promise<ApiResponse.Podcast> {
    return this.fetch("/podcasts/byfeedurl", { url });
  }

  /** This call returns everything we know about the feed. */
  public podcastById(id: number): Promise<ApiResponse.Podcast> {
    return this.fetch("/podcasts/byfeedid", { id });
  }

  /** If we have an itunes id on file for a feed, then this call returns everything we know about that feed. */
  public podcastByItunesId(id: number): Promise<ApiResponse.Podcast> {
    return this.fetch("/podcasts/byitunesid", { id });
  }
  // #endregion

  // #region Episodes
  /** This call returns all the episodes we know about for this feed, in reverse chronological order. */
  public episodesByFeedUrl(url: string): Promise<ApiResponse.Episodes> {
    return this.fetch("/episodes/byfeedurl", { url });
  }

  /**
   * This call returns all the episodes we know about for this feed, in reverse chronological order.
   * Note: The id parameter is the internal Podcastindex id for this feed.
   */
  public episodesByFeedId(
    id: number,
    options: {
      /** If you pass this argument, any item containing this string will be discarded from the result set. This may, in certain cases, reduce your set size below your “max” value. */
      max?: number;
    } = {}
  ): Promise<ApiResponse.Episodes> {
    return this.fetch("/episodes/byfeedid", { ...options, id });
  }

  /**
   * If we have an itunes id on file for a feed, then this call returns all the episodes we know about for the feed, in reverse chronological order.
   * Note: The itunes id parameter can either be the number alone, or be prepended with “id”.
   */
  public episodesByItunesId(id: number): Promise<ApiResponse.Episodes> {
    return this.fetch("/episodes/byitunesid", { id });
  }

  /** Get all the metadata for a single episode by passing its id. */
  public episodeById(id: number): Promise<ApiResponse.Episode> {
    return this.fetch("/episodes/byid", { id });
  }
  // #endregion
}
