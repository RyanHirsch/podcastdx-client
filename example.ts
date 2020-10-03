import PodcastIndexClient from "./src";

const client = new PodcastIndexClient({
  key: process.env.API_KEY!,
  secret: process.env.API_SECRET!,
});

(async function () {
  const result = await client.recentFeeds(2);
  result.feeds.forEach(async (feed) => console.log(await client.podcastById(feed.id)));
  // result.feeds.forEach((f) => console.log(f.categories));
  // console.log(await client.categories());
})();

// 39633 categories
// 386307 categories
