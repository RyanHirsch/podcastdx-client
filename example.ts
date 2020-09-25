import PodcastIndexClient from "./src";

const client = new PodcastIndexClient({
  key: process.env.API_KEY!,
  secret: process.env.API_SECRET!,
});

(async function () {
  const result = await client.recentFeeds(10, { language: "en", isCategory: [2, 10] });
  result.feeds.forEach((f) => console.log(f.categories));
})();
