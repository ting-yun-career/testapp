import express from "express";
import cors from "cors";
import { Client } from "@elastic/elasticsearch";
import newsData from "./data.json";

const app = express();
const port = 3000;

const client = new Client({ node: "http://localhost:9200" });
const INDEX_NAME = "news";

async function setupElasticsearch() {
  try {
    // Ping the cluster to see if it's available
    await client.ping();
    console.log("Elasticsearch cluster is up!");

    // Check if the index exists
    const indexExists = await client.indices.exists({ index: INDEX_NAME });

    if (!indexExists) {
      console.log(
        `Index "${INDEX_NAME}" does not exist. Creating and indexing data...`
      );
      // Create the index
      await client.indices.create({ index: INDEX_NAME });

      // Index the data from data.json
      const body = newsData.flatMap((doc) => [
        { index: { _index: INDEX_NAME, _id: doc.id } },
        doc,
      ]);
      const res = await client.bulk({ refresh: true, body });

      if (res.errors) {
        console.error("Failed to index data:", res.errors);
      } else {
        console.log("Data indexed successfully");
      }
    } else {
      console.log(`Index "${INDEX_NAME}" already exists.`);
    }
  } catch (error) {
    console.error("Error connecting to or setting up Elasticsearch:", error);
    // Exit the process if we can't connect to Elasticsearch
    process.exit(1);
  }
}

app.use(cors());
app.use(express.json());

// CRUD Operations for Elasticsearch

// Create a new news item
app.post("/news", async (req, res) => {
  try {
    const { id, ...body } = req.body;
    const result = await client.index({
      index: INDEX_NAME,
      id: id,
      body: body,
      refresh: "wait_for",
    });
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to create news item" });
  }
});

// Read a news item by ID
app.get("/news/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await client.get({
      index: INDEX_NAME,
      id: id,
    });
    res.json(result._source);
  } catch (error: any) {
    if (error.meta.statusCode === 404) {
      res.status(404).json({ error: "News item not found" });
    } else {
      res.status(500).json({ error: "Failed to retrieve news item" });
    }
  }
});

// Update a news item by ID
app.put("/news/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await client.update({
      index: INDEX_NAME,
      id: id,
      body: {
        doc: req.body,
      },
      refresh: "wait_for",
    });
    res.json(result);
  } catch (error: any) {
    if (error.meta.statusCode === 404) {
      res.status(404).json({ error: "News item not found" });
    } else {
      res.status(500).json({ error: "Failed to update news item" });
    }
  }
});

// Delete a news item by ID
app.delete("/news/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await client.delete({
      index: INDEX_NAME,
      id: id,
      refresh: "wait_for",
    });
    res.status(204).send();
  } catch (error: any) {
    if (error.meta.statusCode === 404) {
      res.status(404).json({ error: "News item not found" });
    } else {
      res.status(500).json({ error: "Failed to delete news item" });
    }
  }
});

// Delete all news items
app.delete("/news", async (req, res) => {
  try {
    await client.deleteByQuery({
      index: INDEX_NAME,
      body: {
        query: {
          match_all: {},
        },
      },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete news items" });
  }
});

app.get("/news", async (req, res) => {
  const tags = req.query.tags as string;
  const size = parseInt(req.query.size as string) || 100;

  try {
    if (!tags) {
      const result = await client.search({
        index: INDEX_NAME,
        size: size,
        body: {
          query: {
            match_all: {},
          },
        },
      });
      console.log("result:", result);
      const hits = result.hits.hits.map((hit) => hit._source);
      return res.json(hits);
    }

    const requestedTags = tags.split(",");
    const result = await client.search({
      index: INDEX_NAME,
      size: size,
      body: {
        query: {
          terms: {
            "tags.keyword": requestedTags,
          },
        },
      },
    });

    const hits = result.hits.hits.map((hit) => hit._source);
    res.json(hits);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve news" });
  }
});

app.get("/tags/random", async (req, res) => {
  const count = parseInt(req.query.count as string) || 10;
  try {
    const result = await client.search({
      index: INDEX_NAME,
      body: {
        size: 0,
        aggs: {
          random_tags: {
            terms: {
              field: "tags.keyword",
              size: 1000,
            },
          },
        },
      },
    });

    const random_tags_agg = result.aggregations?.random_tags as any;
    if (!random_tags_agg || !random_tags_agg.buckets) {
      return res.status(500).json({ error: "Failed to retrieve tags" });
    }

    const tags: string[] = random_tags_agg.buckets.map(
      (bucket: any) => bucket.key
    );
    const randomTags = tags.sort(() => 0.5 - Math.random()).slice(0, count);
    res.json(randomTags);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve tags" });
  }
});

setupElasticsearch().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
});
