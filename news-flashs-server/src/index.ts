import express from "express";
import cors from "cors";
import newsData from "./data.json";

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// GET /news
// @tags News
// @summary Get news items, optionally filtered by tags
// @param {string} tags.query - Comma-separated list of tags to filter news items
// @return {array<NewsItem>} 200 - List of news items
// @example request - Example request
// /news?tags=business,technology
// @example response - 200 - Example response
// [
//   {
//     "id": "1",
//     "title": "Sample News Title",
//     "content": "This is a sample news content.",
//     "date": "2023-10-01T12:00:00Z",
//     "tags": ["business", "technology"]
//   }
// ]
//
app.get("/news", (req, res) => {
  const tags = req.query.tags as string;

  const newsItems = newsData;

  if (!tags) {
    return res.json(newsItems);
  }

  // filter by tags
  const requestedTags = tags.split(",");
  const filteredNews = newsItems.filter((news) =>
    news.tags.some((tag) => requestedTags.includes(tag))
  );

  res.json(filteredNews);
});

// GET /tags/random
// @tags Tags
// @summary Get a list of random tags
// @param {integer} count.query - Number of random tags to return (default is 10)
// @return {array<string>} 200 - List of random tags
// @example request - Example request
// /tags/random?count=5
// @example response - 200 - Example response
// [
//   "business",
//   "technology",
//   "health"
// ]
app.get("/tags/random", (req, res) => {
  const count = parseInt(req.query.count as string) || 10;
  const tags: string[] = newsData.flatMap((news) => news.tags);
  const randomTags = tags.sort(() => 0.5 - Math.random()).slice(0, count);
  res.json(randomTags);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
