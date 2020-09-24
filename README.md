
# Podcast Index Client

## Installation

```sh
npm -i podcastdx-client
```

## Usage

```ts
const client = new PodcastIndexClient({
  key: process.env.API_KEY!,
  secret: process.env.API_SECRET!,
});

client.search("javascript").then(console.log);

client.latestFeeds().then(console.log);
client.latestEpisodes().then(console.log);

client.podcastByUrl("https://feeds.theincomparable.com/batmanuniversity").then(console.log);
client.podcastById(75075).then(console.log);
client.podcastByItunesId(1441923632).then(console.log);

client.episodesByFeedUrl("https://feeds.theincomparable.com/batmanuniversity").then(console.log);
client.episodesByFeedId(75075).then(console.log);
client.episodesByItunesId(1441923632).then(console.log);
client.episodeById(16795106).then(console.log);
```
