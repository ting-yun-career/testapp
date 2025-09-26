import express from "express";
import cors from "cors";
import newsData from "./data.json";

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

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

app.get("/tags/random", (req, res) => {
  const tags: string[] = newsData.flatMap((news) => news.tags);
  const randomTags = tags.sort(() => 0.5 - Math.random()).slice(0, 5);
  res.json(randomTags);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
