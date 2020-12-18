import PodcastIndexClient from "./src";

const client = new PodcastIndexClient({
  key: process.env.API_KEY!,
  secret: process.env.API_SECRET!,
  enableAnalytics: true,
});

(async function () {
  // const result = await client.search("Peace in their time");
  // console.log(JSON.stringify(result));

  // const feed = await client.episodesByFeedId(1333936);
  // console.log(JSON.stringify(feed, null, 2));

  // const foundFeed = await client.podcastByItunesId(1538359974);
  // console.log(JSON.stringify(foundFeed, null, 2));
  // const result = await client.recentEpisodes(3);
  // result.items.forEach((f) => console.log(f));
  // result.feeds.forEach((f) => console.log(f.categories));
  // console.log(await client.categories());

  // const episodes = await client.episodesByFeedUrl("https://feeds.buzzsprout.com/217882.rss");
  const podcast = await client.episodesByFeedUrl("http://feeds.feedburner.com/FreeSexPodcast");
  // console.log(JSON.stringify(feeds));
  console.log(podcast.items);
})();

// 39633 categories
// 386307 categories
