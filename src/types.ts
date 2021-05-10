export interface PIApiCategory {
  id: number;
  name: string;
}

/** Not returned by any api, only extended by other types */
interface PIApiEpisodeBase {
  id: number;
  title: string;
  link: string;
  description: string;
  guid: string;
  datePublished: number;
  datePublishedPretty: string;
  dateCrawled: number;
  enclosureUrl: string;
  enclosureType: string;
  enclosureLength: number;
  explicit: number;
  episode: number | null;
  episodeType: string | null;
  season: number;
  /** URL to episode image */
  image: string;
  feedItunesId: number | null;
  /** URL to feed image */
  feedImage: string;
  feedId: number;
  feedLanguage: string;
  chaptersUrl: string | null;
  soundbite?: {
    startTime: number;
    duration: number;
    title: string;
  };
  soundbites?: Array<{
    startTime: number;
    duration: number;
    title: string;
  }>;
}

/** Returned by episodeById */
export interface PIApiEpisodeDetail extends PIApiEpisodeBase {
  feedTitle: string;
  transcriptUrl: string | null;
  duration: number;
}

/** Returned by episodesByFeed*, episodesByItunesId */
export interface PIApiEpisodeInfo extends PIApiEpisodeBase {
  duration: number;
  transcriptUrl: string | null;
}

/** Returned by episodesRandom */
export interface PIApiRandomEpisode extends PIApiEpisodeBase {
  feedTitle: string;
  /** category id: name, NOTE: this is not always present on the raw responses and will be populated with an empty object when missing form the api response */
  categories: {
    [k: string]: string;
  } | null;
}

/** Returned by recentEpisodes */
export interface PIApiRecentEpisode extends Omit<PIApiEpisodeBase, "chaptersUrl"> {
  feedTitle: string;
}

/** Returned by searchPerson */
export interface PIApiPersonEpisode
  extends Omit<PIApiEpisodeInfo, "datePublishedPretty" | "duration"> {
  duration: number | null;
  feedUrl: string;
  feedAuthor: string;
  feedTitle: string;
}

interface PIApiFeedBase {
  /** The internal podcastindex.org feed id. */
  id: number;
  /** The feed title. */
  title: string;
  /** The current feed url. */
  url: string;
  /** The iTunes id of this feed if there is one, and we know what it is. */
  itunesId: number | null;
  /** The channel-level language specification of the feed. Languages accord with the RSS language spec. */
  language: string;
  /** category id: name, NOTE: this is not always present on the raw responses and will be populated with an empty object when missing form the api response */
  categories: {
    [k: string]: string;
  } | null;
}

/** Returned by search */
export interface PIApiFeed extends PIApiFeedBase {
  locked?: number;
  imageUrlHash?: number;
  /** The url of the feed, before it changed to it’s current url. */
  originalUrl: string;
  /** The channel level link in the feed. */
  link: string;
  /** The channel-level description. */
  description: string;
  /** The channel-level author element. Usually iTunes specific, but could be from another namespace if not present. */
  author: string;
  /** The channel-level owner:name element. Usually iTunes specific, but could be from another namespace if not present. */
  ownerName: string;
  /** The channel-level image element. */
  image: string;
  /** The seemingly best artwork we can find for the feed. Might be the same as ‘image’ in most instances. */
  artwork: string;
  /** [Unix Epoch] The channel-level pubDate for the feed, if it’s sane. If not, this is a heuristic value, arrived at by analyzing other parts of the feed, like item-level pubDates. */
  lastUpdateTime: number;
  /** [Unix Epoch] The last time we attempted to pull this feed from it’s url. */
  lastCrawlTime: number;
  /** [Unix Epoch] The last time we tried to parse the downloaded feed content. */
  lastParseTime: number;
  /** [Unix Epoch] Timestamp of the last time we got a "good", meaning non-4xx/non-5xx, status code when pulling this feed from it’s url. */
  lastGoodHttpStatusTime: number;
  /** The last http status code we got when pulling this feed from it’s url. You will see some made up status codes sometimes. These are what we use to track state within the feed puller. These all start with 9xx. */
  lastHttpStatus: number;
  /** The Content-Type header from the last time we pulled this feed from it’s url. */
  contentType: string;
  /** The channel-level generator element if there is one. */
  generator: string | null;
  /** 0 = RSS, 1 = ATOM */
  type: PodcastFeedType;
  /** At some point, we give up trying to process a feed and mark it as dead. This is usually after 1000 errors without a successful pull/parse cycle. Once the feed is marked dead, we only check it once per month. */
  dead: number;
  /** The number of errors we’ve encountered trying to pull a copy of the feed. Errors are things like a 500 or 404 response, a server timeout, bad encoding, etc. */
  crawlErrors: number;
  /** The number of errors we’ve encountered trying to parse the feed content. Errors here are things like not well-formed xml, bad character encoding, etc. We fix many of these types of issues on the fly when parsing. We only increment the errors count when we can’t fix it. */
  parseErrors: number;
}

/** Returned by podcastBy* */
export interface PIApiPodcast extends PIApiFeed {
  episodeCount: number;
  explicit: boolean;
  chash: string;
  value?: {
    model: { type: string; method: string; suggested: string };
    destinations: Array<{
      name: string;
      address: string;
      type: string;
      split: number;
    }>;
  };
  funding?: { url: string; message: string };
}

/**
 * Returned by podcastByItunesId, internally this has a different code path than
 * the other podcastBy* so the result is less feature rich
 */
export interface PIApiItunesPodcast extends PIApiFeed {
  funding?: { url: string; message: string };
}

/** from recentFeeds */
export interface PIApiNewFeed extends PIApiFeedBase {
  /** [Unix Epoch] Timestamp */
  newestItemPublishTime: number;
  oldestItemPublishTime: number;
  description: string;
  image: string;
}

/** from recentSoundbites */
export interface PiApiSoundbite {
  enclosureUrl: string;
  title: string;
  startTime: number;
  duration: number;
  episodeId: number;
  episodeTitle: string;
  feedTitle: string;
  feedUrl: string;
  feedId: number;
}

/** from recentNewFeeds */
export interface PIApiRecentNewFeed {
  id: number;
  url: string;
  timeAdded: number;
  status: ApiResponse.NewFeedStatus;
  contentHash: string;
  language: string;
  image: string;
}

/** from stats */
export interface PIStats {
  feedCountTotal: number;
  episodeCountTotal: number;
  feedsWithNewEpisodes3days: number;
  feedsWithNewEpisodes10days: number;
  feedsWithNewEpisodes30days: number;
  feedsWithNewEpisodes90days: number;
  feedsWithValueBlocks: number;
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ApiResponse {
  export enum Status {
    Success = "true",
  }

  export enum NewFeedStatus {
    Confirmed = "confirmed",
    Success = "true",
    Pending = "pending",
  }

  export type AnyQueryOptions = Record<
    string,
    string | string[] | number | number[] | boolean | undefined
  >;

  export interface Search {
    status: ApiResponse.Status;
    feeds: Array<PIApiFeed>;
    count: number;
    description: string;
    query: string;
  }

  export interface SearchPerson {
    status: ApiResponse.Status;
    items: Array<PIApiPersonEpisode>;
    count: number;
    description: string;
    query: string;
  }

  export interface RecentFeeds {
    since: number | null;
    status: ApiResponse.Status;
    feeds: Array<PIApiNewFeed>;
    count: number;
    max: string;
    description: string;
  }

  export interface RecentSoundbites {
    status: ApiResponse.Status;
    items: Array<PiApiSoundbite>;
    count: number;
    description: string;
  }

  export interface RecentNewFeeds {
    status: ApiResponse.NewFeedStatus;
    feeds: Array<PIApiRecentNewFeed>;
    count: number;
    max: string;
    description: string;
  }

  export interface RecentEpisodes {
    status: ApiResponse.Status;
    items: Array<PIApiRecentEpisode>;
    count: number;
    max: string;
    description: string;
  }

  /** Not directly returned by any api */
  export interface Podcast {
    status: ApiResponse.Status;
    feed: PIApiPodcast;
    description: string;
    query: {
      url?: string;
      id?: string;
    };
  }

  export type PodcastById = ApiResponse.Podcast;
  export type PodcastByUrl = ApiResponse.Podcast;
  export interface PodcastByItunesId {
    status: ApiResponse.Status;
    feed: PIApiItunesPodcast;
    description: string;
    query: {
      url?: string;
      id?: string;
    };
  }

  export interface Categories {
    status: ApiResponse.Status;
    feeds: Array<PIApiCategory>;
    count: number;
    description: string;
  }

  export interface Episodes {
    status: ApiResponse.Status;
    items: Array<PIApiEpisodeInfo>;
    count: number;
    query: string;
    description: string;
  }

  export type EpisodesByItunesId = ApiResponse.Episodes;
  export type EpisodesByFeedId = ApiResponse.Episodes;
  export type EpisodesByFeedUrl = ApiResponse.Episodes;

  export interface RandomEpisodes {
    status: ApiResponse.Status;
    max: string;
    episodes: Array<PIApiRandomEpisode>;
    count: number;
    description: string;
  }

  export interface EpisodeById {
    status: ApiResponse.Status;
    id: string;
    episode: PIApiEpisodeDetail;
    description: string;
  }

  export interface Stats {
    status: ApiResponse.Status;
    stats: PIStats;
    description: string;
  }
}

export enum PodcastFeedType {
  RSS = 0,
  ATOM = 1,
}
