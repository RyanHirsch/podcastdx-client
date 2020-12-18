/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */
import Ajv from "ajv";
import * as fs from "fs";
import * as path from "path";
import * as TJS from "typescript-json-schema";
import * as R from "ramda";

import PodcastIndexClient from "../index";

const client = new PodcastIndexClient();

const randomValues = {
  search: ["politics", "tech"],
  feedUrl: [
    "https://feeds.theincomparable.com/batmanuniversity",
    "https://feeds.twit.tv/twit.xml",
    "https://feeds.buzzsprout.com/217882.rss",
    "http://mp3s.nashownotes.com/pc20rss.xml",
    "https://feeds.podcasts.dell.com/technologypowersx",
    "https://feeds.buzzsprout.com/926059.rss",
    "https://feeds.buzzsprout.com/1152806.rss",
  ],
  feedId: ["286504", "555343", "854465", "75075", "453550", "448732", "710181"],
  iTunesId: ["1439743528", "1491697526", "1508189931", "977386811", "1518105204"],
  episodeId: ["1259601251", "1258727571", "1204436090", "1258177517", "1258243519", "1258315764"],
};

function getRandom<K extends keyof typeof randomValues>(name: K) {
  const values = randomValues[name];
  const randomIndex = Math.floor(Math.random() * values.length);
  return values[randomIndex];
}

type ValidationConfig = {
  title: string;
  endpoint: string;
  typeName: string;
  params?: Record<string, string>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getResponse: () => Promise<any>;
};

const types: ValidationConfig[] = [
  {
    getResponse: () => client.categories(),
    endpoint: "/api/1.0/categories/list",
    title: "Get all category names and ids",
    typeName: "ApiResponse.Categories",
  },
  // #region Searching
  {
    getResponse: () => client.search(getRandom("search")),
    endpoint: "/api/1.0/search/byterm",
    params: {
      q: "search terms",
    },
    title:
      "This call returns all of the feeds that match the search terms in the title of the feed.",
    typeName: "ApiResponse.Search",
  },
  // #endregion
  // #region Podcasts
  {
    getResponse: () => client.podcastByUrl(getRandom("feedUrl")),
    endpoint: "/api/1.0/podcasts/byfeedurl",
    params: {
      url: "feed url",
    },
    title: "This call returns everything we know about the feed.",
    typeName: "ApiResponse.Podcast",
  },
  {
    getResponse: () => client.podcastById(parseInt(getRandom("feedId"), 10)),
    endpoint: "/api/1.0/podcasts/byfeedid",
    params: {
      id: "feed id",
    },
    title: "This call returns everything we know about the feed.",
    typeName: "ApiResponse.Podcast",
  },
  {
    getResponse: () => client.podcastByItunesId(parseInt(getRandom("iTunesId"), 10)),
    endpoint: "/api/1.0/podcasts/byitunesid",
    params: {
      id: "iTunes id",
    },
    title: "This call returns everything we know about the feed.",
    typeName: "ApiResponse.Podcast",
  },
  // #endregion
  // #region Episodes
  {
    getResponse: () => client.episodesByFeedId(parseInt(getRandom("feedId"), 10)),
    endpoint: "/api/1.0/episodes/byfeedurl",
    params: {
      id: "feed id",
    },
    title:
      "This call returns all the episodes we know about for this feed, in reverse chronological order.",
    typeName: "ApiResponse.Episodes",
  },
  {
    getResponse: () => client.episodesByFeedUrl(getRandom("feedUrl")),
    endpoint: "/api/1.0/episodes/byfeedid",
    title:
      "This call returns all the episodes we know about for this feed, in reverse chronological order",
    params: {
      url: "feed url",
    },
    typeName: "ApiResponse.Episodes",
  },
  {
    getResponse: () => client.episodesByItunesId(parseInt(getRandom("iTunesId"), 10)),
    endpoint: "/api/1.0/episodes/byitunesid",
    params: {
      id: "iTunes id",
    },
    title:
      "If we have an itunes id on file for a feed, then this call returns all the episodes we know about for the feed, in reverse chronological order.",
    typeName: "ApiResponse.Episodes",
  },
  {
    getResponse: () => client.episodeById(parseInt(getRandom("episodeId"), 10)),
    endpoint: "/api/1.0/episodes/byid",
    params: {
      id: "episode id",
    },
    title: "Get all the metadata for a single episode by passing its id.",
    typeName: "ApiResponse.EpisodeById",
  },
  {
    getResponse: () => client.episodesRandom({ max: 10 }),
    endpoint: "/api/1.0/episodes/random",
    params: {
      max: "number",
    },
    title: "This call returns a random batch of [max] episodes, in no specific order.",
    typeName: "ApiResponse.RandomEpisodes",
  },
  // #endregion
  // #region Recent
  {
    getResponse: () => client.recentEpisodes({ max: Math.floor(Math.random() * 500) }),
    endpoint: "/api/1.0/recent/episodes",
    params: {
      max: "max number items to return",
    },
    title:
      "This call returns the most recent [max] number of episodes globally across the whole index, in reverse chronological order.",
    typeName: "ApiResponse.RecentEpisodes",
  },
  {
    getResponse: () => client.recentFeeds({ max: 3 }),
    endpoint: "/api/1.0/recent/feeds",
    params: {
      max: "max number items to return",
    },
    title: "This call returns the most recent [max] feeds, in reverse chronological order.",
    typeName: "ApiResponse.RecentFeeds",
  },
  {
    getResponse: () => client.recentNewFeeds(),
    endpoint: "/api/1.0/recent/newfeeds",
    title:
      "This call returns every new feed added to the index over the past 24 hours in reverse chronological order.",
    typeName: "ApiResponse.RecentNewFeeds",
  },
  {
    getResponse: () => client.recentSoundbites(),
    endpoint: "/api/1.0/recent/soundbites",
    title:
      "This call returns the most recent 60 soundbites that the index has discovered. A soundbite consists of an enclosure url, a start time and a duration.",
    typeName: "ApiResponse.RecentSoundbites",
  },
  // #endregion
];

const settings: TJS.PartialArgs = {
  required: true,
  noExtraProps: true,
};

const program = TJS.getProgramFromFiles([path.resolve("src/types.ts")], {
  strict: true,
});
const ajv = new Ajv();

function processPath(pathName: string): R.Path {
  const pathParts = pathName
    .split(".")
    .flatMap((x) => x.split("["))
    .filter((x) => x);
  return pathParts.map((part) =>
    part.endsWith("]") ? parseInt(part.substring(0, part.length - 1), 10) : part
  );
}

async function validateResponse(
  schema: TJS.Definition,
  { title, endpoint, typeName, getResponse }: ValidationConfig
) {
  const data = await getResponse();
  const validate = ajv.compile(schema);
  const [, version, ...name] = endpoint.split("/").filter((x) => x);
  const versionDir = path.resolve(__dirname, version);
  fs.mkdirSync(versionDir, { recursive: true });
  fs.writeFileSync(
    path.join(versionDir, `${name.join("-")}.json`),
    JSON.stringify(
      {
        title: `\`${endpoint}\` - ${title}`,
        ...schema,
      },
      null,
      2
    ),
    "utf-8"
  );
  if (!validate(data)) {
    console.warn(`Schema for ${typeName} doesn't match return from ${endpoint}`);
    if (validate.errors) {
      for (let j = 0; j < validate.errors.length; j += 1) {
        console.error(validate.errors[j]);
        const dataPath = processPath(validate.errors[j].dataPath);
        console.error(R.path(dataPath, data));
      }
    }
  }
}

(async function validator() {
  for (let i = 0; i < types.length; i += 1) {
    const currType = types[i];
    const schema = TJS.generateSchema(program, currType.typeName, settings);
    if (schema) {
      await validateResponse(schema, currType);
    } else {
      console.error(`Failed to generate schema for ${currType.typeName}`);
    }
  }
})();
