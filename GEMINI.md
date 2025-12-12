# GEMINI.md

## News Data Format Instructions

### Field Types and Description

```typescript
{
  id: string;           // base64 hash of the summary field
  title: string;        // Brief headline describing the factual event/impact
  summary: string;      // 1-3 sentences summary
  fullContent: string;  // 3-8 sentences (expanded content)
  daysAgo: number;      // 0-7 (days since publication)
  tags: string[];       // 1-3 topic tags (e.g. #science, #technology, #politics)
  sourceUrl: string;    // Article URL (optional)
}
```

### Guidelines

- Spread search across different topics
- Do not fetch news older than a week ago  
- Include only relevant news content
- Replace special characters with browser-friendly ASCII

### Sample Output

```json
[
  {
    "id": "e49f6976-1b5e-49b8-b11a-1d374e2d83f3",
    "title": "Quantum AI breakthrough",
    "summary": "Scientists announce a major leap in quantum computing, enabling new AI capabilities.",
    "daysAgo": 1,
    "tags": ["ai", "technology"],
    "sourceUrl": "https://www.nature.com/news/qcf41f7rj",
    "fullContent": "In a historic announcement, researchers from a global consortium of universities and private labs have revealed a significant advancement in quantum computing. The breakthrough involves a new type of qubit that maintains its state for unprecedented durations, drastically reducing the error rate that has long plagued quantum systems. This technological leap is expected to unlock new capabilities for artificial intelligence, particularly in complex problem-solving and machine learning algorithms that are too computationally intensive for classical computers."
  }
]
```
