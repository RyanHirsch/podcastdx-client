import PodcastIndexClient from "./src";

const client = new PodcastIndexClient({
  key: process.env.API_KEY!,
  secret: process.env.API_SECRET!,
  enableAnalytics: true,
});

export async function log(thennable: Promise<unknown>): Promise<void> {
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(await thennable, null, 2));
}

(async function runner() {
  // const result = await client.search("Peace in their time");
  // console.log(JSON.stringify(result));

  // const feed = await client.episodesByFeedId(1333936);
  // console.log(JSON.stringify(feed, null, 2));

  // const foundFeed = await client.podcastByItunesId(1538359974);
  // console.log(JSON.stringify(foundFeed, null, 2));
  // await log(client.recentEpisodes({ max: 3 }));
  // result.items.forEach((f) => console.log(f));
  // result.feeds.forEach((f) => console.log(f.categories));
  // console.log(await client.categories());

  // const episodes = await client.episodesByFeedUrl("https://feeds.buzzsprout.com/217882.rss");
  // const podcast = await client.episodesByFeedUrl("http://feeds.feedburner.com/FreeSexPodcast");
  // console.log(JSON.stringify(feeds));
  // console.log(podcast.items);

  // console.log(JSON.stringify(await client.stats(), null, 2));
  // await log(client.raw("/episodes/byid?id=1258727571"));
  // await log(client.raw("/podcasts/byfeedid?id=75075"));
  // await log(client.raw("/podcasts/byfeedid", { id: 75075 }));
  // const result = await client.recentEpisodes({ max: 25 });
  // console.log(
  //   `in order - ${result.items.reduce(
  //     (inOrder, currentItem, idx, all) =>
  //       inOrder && (idx === 0 || all[idx - 1].datePublished < currentItem.datePublished),
  //     true
  //   )}`
  // );

  await log(client.searchPerson("Adam Curry"));
})();

// 39633 categories
// 386307 categories
