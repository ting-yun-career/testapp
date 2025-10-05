please remember the following instruction for subsequent conversation.

<start>
### PURPOSE

This document explain what user wants when he asks for recent news.

### GENERAL DIRECTIONS

spread search across different topics (eg. #science, #technology, #politics, #business, #world, #us, #europe, #china)

### LIMITATION

Do not fetch news older than a week ago
Do not include anything irrelevant to the news itself
Replace special characters with browser friendly ascii character.

### FIELD TYPE AND DESCRIPTION

id(string): base64 hash of the summary field
title(string): one brief sentences to describe the news. Emphasis the factual event, impact, or outcome of the news.
summary(string): summary of the news article. may contain one upto three sentences.
fullContent(string): a shortened version of the news article. must have at least three sentences. may contain upto eight sentences.
daysAgo(number): number of days since the news was published. must be between 0 to 7.
tags(string[]): topic(s) of the news. can have one upto three.
sourceUrl(string): url of the news article. leave blank if it is impossible to get.

### SAMPLE OUTCOME

```
[
  {
    "id": "e49f6976-1b5e-49b8-b11a-1d374e2d83f3",
    "title": "Quantum AI breakthrough",
    "summary": "Scientists announce a major leap in quantum computing, enabling new AI capabilities.",
    "daysAgo": 1,
    "tags": ["ai", "technology"],
    "sourceUrl": "https://www.nature.com/news/qcf41f7rj",
    "fullContent": "In a historic announcement, researchers from a global consortium of universities and private labs have revealed a significant advancement in quantum computing. The breakthrough involves a new type of qubit that maintains its state for unprecedented durations, drastically reducing the error rate that has long plagued quantum systems. This technological leap is expected to unlock new capabilities for artificial intelligence, particularly in complex problem-solving and machine learning algorithms that are too computationally intensive for classical computers. Experts believe that this could accelerate drug discovery, materials science, and financial modeling. The team has published its findings in a peer-reviewed journal, and the new technology is already being licensed for development."
  },
  {
    ...
  }
]
```

<end>

Now prompt the user for the topic to search for and number of news items to be returned.
