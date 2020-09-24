import crypto from "crypto";
import fetch from "node-fetch";
import dotEnv from "dotenv";
import querystring from "querystring";

import { ApiResponse } from "./types";

dotEnv.config();

export default class PodcastIndexClient {
  private apiUrl = `https://api.podcastindex.org/api/1.0`;

  private userAgent = "podcastdx client/1.0";

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
    const queryString = qs ? querystring.encode(qs) : null;
    const options = {
      method: `GET`,
      headers: this.generateHeaders(),
    };
    return fetch(`${this.apiUrl}${endpoint}${queryString ? `?${queryString}` : ``}`, options).then(
      (res) => {
        if (res.status >= 200 && res.status < 300) {
          return res.json();
        }
        return res.statusText;
      }
    );
  }

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
   * This call returns every new feed added to the index over the past 24 hours in reverse chronological order. Max of 1000
   *
   * @param max the max number of items to return, defaults to 10
   */
  public latestFeeds(
    max = 10,
    options: {
      /** If you pass this argument, any item containing this string will be discarded from the result set. This may, in certain cases, reduce your set size below your “max” value. */
      excludedString?: string;
      /** If you pass an episode id, you will get recent episodes before that id, allowing you to walk back through the episode history sequentially. */
      before?: number;
    } = {}
  ): Promise<ApiResponse.LatestFeeds> {
    return this.fetch("/recent/newfeeds", { ...options, max });
  }

  /**
   * This call returns the most recent [max] number of episodes globally across the whole index, in reverse chronological order. Max of 1000
   *
   * @param max the max number of items to return, defaults to 10
   */
  public latestEpisodes(max = 10): Promise<ApiResponse.LatestEpisodes> {
    return this.fetch("/recent/episodes", { max });
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
  public episodesByFeedId(id: number): Promise<ApiResponse.Episodes> {
    return this.fetch("/episodes/byfeedid", { id });
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
