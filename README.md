# Spotify Charts GraphQL API

## Project Name

Spotify Charts GraphQL API

## Objective

A GraphQL API that serves the Spotify Top 10000 Streamed Songs dataset. Users can browse songs, artists, and the top chart, as well as create, update, and delete songs via authenticated mutations. The API uses JWT authentication for write operations and is publicly deployed on Render.

## Implementation Type

GraphQL

## Links and Testing

| | URL / File |
|---|---|
| **Production API** | https://api-027.onrender.com/ |
| **GraphQL Playground** | https://api-027.onrender.com/ |
| **Postman Collection** | `spotify-graphql-api.postman_collection.json` |
| **Production Environment** | `production.postman_environment.json` |

**Examiner can verify tests in one of the following ways:**

1. **CI/CD pipeline** — check the pipeline output in GitLab for test results.
2. **Run manually** — no setup needed:
   ```
   npx newman run spotify-graphql-api.postman_collection.json -e production.postman_environment.json
   ```

## Dataset

| Field | Description |
|---|---|
| **Dataset source** | [Kaggle — Spotify Top 10000 Streamed Songs](https://www.kaggle.com/datasets/rakkesharv/spotify-top-10000-streamed-songs) |
| **Format** | CSV (`data/Spotify_final_dataset.csv`) |
| **Data points** | ~10 000 songs |
| **Primary resource (CRUD)** | Song — id, title, artist, position, daysReleased, top10, peakPosition, peakPositionTimes, peakStreams, totalStreams |
| **Secondary resource 1 (read-only)** | Artist — name, songs, numberOfSongs, totalStreams (aggregated from Song collection) |
| **Secondary resource 2 (read-only)** | TopChart — position, song (top songs sorted by streams) |

## Seed Script

The seed script reads the CSV file and populates the MongoDB database.

**Prerequisites:** a `.env` file with `MONGODB_URI` must exist.

```bash
node seed.js
```

The script deletes all existing songs and inserts fresh data from `data/Spotify_final_dataset.csv`. The CSV file is not included in the repository (listed in `.gitignore`) — download it from the Kaggle link above and place it in the `data/` folder.

## Design Decisions

### Authentication

JWT (JSON Web Tokens) with `bcryptjs` for password hashing. On register or login the API returns a signed token that the client includes as `Authorization: Bearer <token>` on write operations. The token is verified server-side on every request via a context function. Alternatives like sessions or API keys were considered but JWT fits stateless REST/GraphQL APIs better since no session state needs to be stored server-side.

### API Design

The API uses a single `/graphql` endpoint handled by Apollo Server v4.

**Schema overview:**
- **Queries:** `songs`, `song`, `artists`, `artist`, `topChart`
- **Mutations:** `register`, `login`, `addSong`, `updateSong`, `deleteSong`

Nested queries are supported — querying an `artist` returns the artist's `songs` array inline, allowing clients to fetch related data in a single request rather than multiple round-trips.

Pagination is implemented on `songs` and `artists` via `page` and `limit` arguments. The `songs` query returns a `SongsResult` type that includes `songs`, `totalCount`, `totalPages`, and `currentPage`.

### Error Handling

All errors use `GraphQLError` with an `extensions.code` field (`UNAUTHENTICATED`, `NOT_FOUND`, `BAD_USER_INPUT`) so clients can handle error types programmatically. GraphQL always returns HTTP 200 — error details are in the `errors` array of the response body.

## Core Technologies Used

| Technology | Reason |
|---|---|
| Apollo Server v4 | Industry-standard GraphQL server for Node.js |
| MongoDB Atlas + Mongoose | Flexible document storage with schema validation |
| JWT + bcryptjs | Stateless authentication with secure password hashing |
| Newman | CLI runner for Postman collections in CI/CD |
| Render | Free-tier hosting with automatic deploys from GitHub |

## Reflection

*What was hard? What did you learn? What would you do differently?*

## Acknowledgements

Dataset: [Spotify Top 10000 Streamed Songs](https://www.kaggle.com/datasets/rakkesharv/spotify-top-10000-streamed-songs) by rakkesharv on Kaggle.

## Requirements

See [all requirements in Issues](../../issues/). Close issues as you implement them. Create additional issues for any custom functionality. See [TESTING.md](TESTING.md) for detailed testing requirements.

### Functional Requirements — Common

| Requirement | Issue | Status |
|---|---|---|
| Data acquisition — choose and document a dataset (1000+ data points) | [#1](../../issues/1) | :white_check_mark: |
| Full CRUD for primary resource, read-only for secondary resources | [#2](../../issues/2) | :white_check_mark: |
| JWT authentication for write operations | [#3](../../issues/3) | :white_check_mark: |
| Error handling (400, 401, 404 with consistent format) | [#4](../../issues/4) | :white_check_mark: |
| Filtering and pagination for large result sets | [#17](../../issues/17) | :white_check_mark: |

### Functional Requirements — GraphQL

| Requirement | Issue | Status |
|---|---|---|
| Queries and mutations via single `/graphql` endpoint | [#14](../../issues/14) | :white_check_mark: |
| At least one nested query | [#15](../../issues/15) | :white_check_mark: |
| GraphQL Playground available | [#16](../../issues/16) | :white_check_mark: |

### Non-Functional Requirements

| Requirement | Issue | Status |
|---|---|---|
| Automated Postman tests (20+ test cases, success + failure) | [#7](../../issues/7) | :white_check_mark: |
| CI/CD pipeline running tests on every commit/MR | [#8](../../issues/8) | :white_large_square: |
| Seed script for sample data | [#5](../../issues/5) | :white_check_mark: |
| Code quality (consistent standard, modular, documented) | [#10](../../issues/10) | :white_check_mark: |
| Deployed and publicly accessible | [#9](../../issues/9) | :white_check_mark: |
| Peer review reflection submitted on merge request | [#11](../../issues/11) | :white_large_square: |
