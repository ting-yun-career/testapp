import express from "express";
import cors from "cors";
import newsData from "./data.json";

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.get("/news", (req, res) => {
  const tags = req.query.tags as string;

  if (!tags) {
    return res.json(newsData);
  }

  const requestedTags = tags.split(",");
  console.log("Requested tags:", requestedTags);

  res.json(newsData);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
