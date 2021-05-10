# Podcast Index Client

The is a client for interacting with <https://podcastindex.org/>. In order for this to be useful, you need to get a developer `API KEY` and `API SECRET` from <https://api.podcastindex.org>

This includes typescript types as well as JSDoc strings that should make interacting with the API easier.

Optionally provide usage analytics back to me to help me improve the library. **If you do not provide this value, analytics will be sent. You must opt-out.**

JSON Schema generated from the types contained in the project can be found at <https://github.com/RyanHirsch/podcastdx-client/tree/master/src/schemas>

## Installation

```sh
npm -i podcastdx-client
```

## Usage

Auto-generated docs are available at <https://ryanhirsch.github.io/podcastdx-client/classes/_src_index_.podcastindexclient.html>

```ts
import PodcastIndexClient from "podcastdx-client";

// assumes you have an your key and secret set as environment variables
const client = new PodcastIndexClient({
  key: process.env.API_KEY,
  secret: process.env.API_SECRET,
  // opt-out of analytics collection
  disableAnalytics: true,
});

client.search("javascript").then(console.log);

client.recentFeeds().then(console.log);
client.recentNewFeeds().then(console.log);
client.recentEpisodes().then(console.log);

client.podcastByUrl("https://feeds.theincomparable.com/batmanuniversity").then(console.log);
client.podcastById(75075).then(console.log);
client.podcastByItunesId(1441923632).then(console.log);

client.episodesByFeedUrl("https://feeds.theincomparable.com/batmanuniversity").then(console.log);
client.episodesByFeedId(75075).then(console.log);
client.episodesByItunesId(1441923632).then(console.log);
client.episodeById(16795106).then(console.log);
```

## Releasing a new version

1. Ensure you're fully committed
   1. Make sure tests are green schema is correct `yarn tsc && yarn test && yarn validate`
2. Run `yarn publish`

## Community

Join on Discord at <https://discord.gg/d6apPvR3N6> or on <https://podcastindex.social/>
