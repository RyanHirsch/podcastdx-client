
# Podcast Index Client

The is a client for interacting with <https://podcastindex.org/>. In order for this to be useful, you need to get a developer `API KEY` and `API SECRET` from <https://api.podcastindex.org>

This includes typescript types as well as JSDoc strings that should make interacting with the API easier.

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
  key: process.env.API_KEY!,
  secret: process.env.API_SECRET!,
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
