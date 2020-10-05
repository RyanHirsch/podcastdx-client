interface PodcastBase {
  /** The internal podcastindex.org feed id. */
  id: number;
  /** The feed title. */
  title: string;
  /** The current feed url. */
  url: string;
  /** The itunes id of this feed if there is one, and we know what it is. */
  itunesId: number;
  /** The channel-level language specification of the feed. Languages accord with the RSS language spec. */
  language: string;
  /** category id: name, NOTE: this is not always present on the raw responses and will be populated with an empty object when missing form the api response */
  categories: Record<string, string>;
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ApiResponse {
  export enum Status {
    Success = "true",
  }

  export type AnyQueryOptions = Record<string, string | string[] | number | number[] | undefined>;

  export interface NewPodcastFeed extends PodcastBase {
    /** [Unix Epoch] Timestamp */
    newestItemPublishTime: number;
  }

  export interface PodcastFeed extends PodcastBase {
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
    generator: string;
    /** 0 = RSS, 1 = ATOM */
    type: PodcastFeedType;
    /** At some point, we give up trying to process a feed and mark it as dead. This is usually after 1000 errors without a successful pull/parse cycle. Once the feed is marked dead, we only check it once per month. */
    dead: number;
    /** The number of errors we’ve encountered trying to pull a copy of the feed. Errors are things like a 500 or 404 response, a server timeout, bad encoding, etc. */
    crawlErrors: number;
    /** The number of errors we’ve encountered trying to parse the feed content. Errors here are things like not well-formed xml, bad character encoding, etc. We fix many of these types of issues on the fly when parsing. We only increment the errors count when we can’t fix it. */
    parseErrors: number;
  }

  export interface Category {
    id: number;
    name: string;
  }

  export interface SimplePodcastFeed {
    id: number;
    url: string;
    timeAdded: number;
    status: ApiResponse.Status;
    contentHash: string;
  }

  export interface PodcastEpisode {
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
    episode: number;
    episodeType: string;
    season: number;
    /** URL to episode image */
    image: string;
    feedItunesId: number;
    /** URL to feed image */
    feedImage: string;
    feedId: number;
    feedTitle: string;
    feedLanguage: string;
  }

  export interface RandomPodcastEpisode {
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
    episode: number;
    episodeType: string;
    season: number;
    /** URL to episode image */
    image: string;
    feedItunesId: number;
    /** URL to feed image */
    feedImage: string;
    feedId: number;
    feedTitle: string;
    feedLanguage: string;
    categories: Record<string, string>;
  }

  export interface EpisodeInfo {
    id: number;
    title: string;
    link: string;
    description: string;
    guid: string;
    datePublished: number;
    dateCrawled: number;
    enclosureUrl: string;
    enclosureType: string;
    enclosureLength: number;
    explicit: number;
    episode: number;
    episodeType: string;
    season: number;
    /** URL to episode image */
    image: string;
    feedItunesId: number;
    /** URL to feed image */
    feedImage: string;
    feedId: number;
    feedLanguage: string;
  }

  export interface Search {
    status: ApiResponse.Status;
    feeds: Array<ApiResponse.PodcastFeed>;
    count: number;
    description: string;
    query: string;
  }

  export interface RecentFeeds {
    since: number;
    status: ApiResponse.Status;
    feeds: Array<ApiResponse.NewPodcastFeed>;
    count: number;
    max: number;
    description: string;
  }

  export interface RecentNewFeeds {
    status: ApiResponse.Status;
    feeds: Array<ApiResponse.SimplePodcastFeed>;
    count: number;
    max: number;
    description: string;
  }

  export interface RecentEpisodes {
    status: ApiResponse.Status;
    items: Array<ApiResponse.PodcastEpisode>;
    count: number;
    max: number;
    description: string;
  }

  export interface Podcast {
    status: ApiResponse.Status;
    feed: ApiResponse.PodcastFeed;
    description: string;
    query: {
      url?: string;
      id?: string;
    };
  }

  export type PodcastById = ApiResponse.Podcast;
  export type PodcastByItunesId = ApiResponse.Podcast;
  export type PodcastByUrl = ApiResponse.Podcast;

  export interface Categories {
    status: ApiResponse.Status;
    feeds: Array<ApiResponse.Category>;
    count: number;
    description: string;
  }

  export interface Episodes {
    status: ApiResponse.Status;
    items: Array<ApiResponse.EpisodeInfo>;
    count: number;
    query: string;
    description: string;
  }

  export type EpisodesByItunesId = ApiResponse.Episodes;
  export type EpisodesByFeedId = ApiResponse.Episodes;
  export type EpisodesByFeedUrl = ApiResponse.Episodes;

  export interface RandomEpisodes {
    status: ApiResponse.Status;
    max: number;
    episodes: Array<ApiResponse.RandomPodcastEpisode>;
    count: number;
    description: string;
  }

  export interface EpisodeById {
    status: ApiResponse.Status;
    id: string;
    episode: ApiResponse.PodcastEpisode;
    description: string;
  }
}

export enum PodcastFeedType {
  RSS = 0,
  ATOM = 1,
}
