# API Endpoints

## Search Endpoints

### GET `/api/search/facets`

Get faceted search counts for filters. This endpoint provides dynamic counts for each filter option, allowing users to see how many results would be returned for each filter before applying it.

#### Query Parameters

- `q` (optional): Search query term to apply before calculating facets
- `category` (optional): Category filter to apply before calculating facets
- `pricing` (optional): Pricing model filter to apply before calculating facets
- `difficulty` (optional): Difficulty level filter to apply before calculating facets
- `tags` (optional): Tags filter to apply before calculating facets (comma-separated)

#### Response Format

```json
{
  "success": true,
  "data": {
    "facetCounts": {
      "category_Development": 15,
      "category_Design": 8,
      "pricing_Free": 12,
      "pricing_Paid": 11,
      "difficulty_Beginner": 7,
      "difficulty_Intermediate": 10,
      "technology_JavaScript": 6,
      "technology_React": 4,
      "tag_frontend": 9,
      "tag_backend": 5,
      "benefits_Easy to use": 8
    },
    "totalResults": 23
  }
}
```

#### Example Request

```
GET /api/search/facets?q=javascript&category=Development
```

This request would return facet counts for all filters after applying both the search query for "javascript" and the category filter for "Development".

#### Rate Limiting

This endpoint is subject to rate limiting to prevent abuse and ensure optimal performance.
