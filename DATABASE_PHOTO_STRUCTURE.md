# Database Structure: Listing Photos

## Summary
This document outlines the database structure for listing photos and how to retrieve featured photos for proposals.

## Tables Overview

### 1. `proposal` Table (Bubble.io original data)
- **Primary Key**: `_id`
- **Key Columns**:
  - `_id`: Proposal ID
  - `Listing`: Foreign key to `listing._id`
  - `Guest`: Guest user ID
  - `Status`: Proposal status
  - `Deleted`: Boolean flag for soft deletion
  - `Created Date`: Timestamp

### 2. `listing` Table
- **Primary Key**: `_id`
- **Key Columns**:
  - `_id`: Listing ID
  - `Name`: Listing name
  - `Description`: Listing description
  - `Location - Address`: Address information
  - `Location - City`: City name
  - `Features - Photos`: Array of photo IDs (JSONB)

### 3. `listing_photo` Table (THE KEY TABLE FOR PHOTOS)
- **Primary Key**: `_id`
- **Key Columns**:
  - `_id`: Photo ID
  - `Listing`: Foreign key to `listing._id`
  - **`toggleMainPhoto`**: Boolean - **TRUE = Featured Photo**
  - `Active`: Boolean - Must be true for active photos
  - `Photo`: URL to the actual photo image
  - `SortOrder`: Integer for ordering photos
  - `Name`: Optional photo name
  - `Caption`: Optional photo caption
  - `Type`: Optional photo type

## Featured Photo Field

### The Answer to Your Question:
**Field Name**: `toggleMainPhoto`
**Data Type**: Boolean
**Meaning**: When `toggleMainPhoto = true`, this photo is the featured/main photo for the listing

## How to Get Featured Photo for a Proposal

### SQL Query Pattern:
```sql
SELECT
  p."_id" as proposal_id,
  p."Listing" as listing_id,
  l."Name" as listing_name,
  lp."Photo" as featured_photo_url
FROM proposal p
LEFT JOIN listing l ON p."Listing" = l."_id"
LEFT JOIN listing_photo lp ON l."_id" = lp."Listing"
  AND lp."toggleMainPhoto" = true
  AND lp."Active" = true
WHERE p."Deleted" IS NOT true;
```

### Key Join Conditions:
1. Join `proposal` to `listing` using `proposal."Listing" = listing."_id"`
2. Join `listing` to `listing_photo` using `listing."_id" = listing_photo."Listing"`
3. Filter for featured photo: `listing_photo."toggleMainPhoto" = true`
4. Filter for active photos: `listing_photo."Active" = true`
5. Filter out deleted proposals: `proposal."Deleted" IS NOT true`

## Sample Data

Based on recent data:
- Total listings with featured photos: Many
- Featured photos have URLs like:
  - `https://50bf0464e4735aabad1cc8848a0e8b8a.cdn.bubble.io/f1700161336954x936341834021570800/1.PNG`
  - `https://s3.amazonaws.com/appforest_uf/f1586449174807x724103464553312000/255489_1_6782894-650-570.jpg`

## Implementation Notes

### For React/Frontend:
1. When fetching proposals, include a join to get the featured photo
2. The featured photo URL is directly usable in `<img>` tags
3. Some listings may not have a featured photo (NULL handling required)
4. Always check both `toggleMainPhoto = true` AND `Active = true`

### Example Data Structure:
```javascript
{
  proposalId: "1763218177504x190087770662842560",
  listingId: "1700160484034x560364847502983200",
  listingName: "Beautiful NY views Apartment",
  featuredPhotoUrl: "https://50bf0464e4735aabad1cc8848a0e8b8a.cdn.bubble.io/f1700161336954x936341834021570800/1.PNG",
  status: "Pending"
}
```

## Important Considerations

1. **NULL Handling**: Not all listings have featured photos. Handle NULL gracefully with placeholder images.

2. **Multiple Featured Photos**: In theory, a listing could have multiple photos with `toggleMainPhoto = true`. Use `LIMIT 1` or `ORDER BY "SortOrder"` to get the primary one.

3. **Photo URLs**: Photos are hosted on external CDNs (S3, Bubble CDN). URLs are absolute and ready to use.

4. **Performance**: Consider indexing on `listing_photo."Listing"` and `listing_photo."toggleMainPhoto"` for faster queries.

## Relationships Diagram

```
proposal (Bubble.io original)
  |
  ├─ "Listing" → listing._id
  |
  └─ listing
       |
       └─ "_id" → listing_photo."Listing"
            |
            └─ listing_photo (WHERE toggleMainPhoto = true AND Active = true)
                 |
                 └─ "Photo" = URL to featured image
```

## Testing Query

Use this query to verify the relationship works:
```sql
SELECT
  p."_id" as proposal_id,
  p."Status",
  l."Name" as listing_name,
  lp."Photo" as featured_photo,
  lp."toggleMainPhoto",
  lp."Active"
FROM proposal p
LEFT JOIN listing l ON p."Listing" = l."_id"
LEFT JOIN listing_photo lp ON l."_id" = lp."Listing"
  AND lp."toggleMainPhoto" = true
  AND lp."Active" = true
WHERE p."Deleted" IS NOT true
LIMIT 10;
```
