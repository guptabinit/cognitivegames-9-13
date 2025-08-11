# Game Data API Documentation

This document describes the unified API endpoint for saving game results for both Game1 and Game3.

## Base URL
```
http://your-domain.com/backend/saveResults.php
```

## Common Headers
```
Content-Type: application/json
Access-Control-Allow-Origin: *
```

## Game1 (Word Triads) - Data Format

### Request
```json
{
  "gameType": "game1",
  "player": {
    "nickname": "player123",
    "avatar": "avatar1"
  },
  "ageGroup": "11-13",
  "difficultyTier": "medium",
  "rounds": [
    {
      "triadId": "triad_123",
      "word1": "ocean",
      "word2": "water",
      "word3": "deep",
      "correctWord": "ocean",
      "userAnswer": "ocean",
      "isCorrect": true,
      "timeTaken": 2.5,
      "choiceChanges": 1,
      "errorType": null
    }
    // ... more rounds
  ],
  "results": {
    "accuracyScore": 90,
    "accuracyValue": "Excellent",
    "timeScore": 85,
    "timeValue": "Good",
    "totalScore": 88,
    "totalValue": "Very Good",
    "feedback": "Great job!"
  }
}
```

## Game3 (Memory Test) - Data Format

### Request
```json
{
  "gameType": "game3",
  "player": {
    "nickname": "player123",
    "avatar": "avatar1"
  },
  "forwardTrials": [
    {
      "spanLength": 3,
      "sequence": "123",
      "userAnswer": "123",
      "isCorrect": true,
      "responseTimeMs": 1000
    }
    // ... more forward trials
  ],
  "backwardTrials": [
    {
      "spanLength": 2,
      "sequence": "12",
      "userAnswer": "21",
      "isCorrect": true,
      "responseTimeMs": 1200
    }
    // ... more backward trials
  ],
  "processingSpeed": {
    "avgResponseTimeMs": 500,
    "adjustmentValue": 1.0
  },
  "memoryRating": {
    "forwardSpan": 3,
    "backwardSpan": 2,
    "forwardScore": 3,
    "backwardScore": 2,
    "speedAdjustment": 1.0,
    "finalRating": 5
  }
}
```

## Response Format (Both Games)

### Success Response
```json
{
  "status": "success",
  "message": "Game data saved successfully",
  "playerId": 123,
  "sessionId": 456
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Error description here"
}
```

## Database Tables

### Game1 Tables
1. `players` - Stores player information
2. `game_sessions` - Game session records
3. `game_rounds` - Individual round data
4. `game_results` - Final game results

### Game3 Tables
1. `players` - Shared with Game1
2. `game3_fwdspan` - Forward span test results
3. `game3_backspan` - Backward span test results
4. `game3_processspd` - Processing speed data
5. `game3_memrating` - Memory rating results

## Notes
- The `gameType` parameter is required to determine which game's data is being saved.
- All player information is stored in the shared `players` table.
- Each game maintains its own set of tables for storing game-specific data.
- The API supports CORS for cross-origin requests from your frontend.
