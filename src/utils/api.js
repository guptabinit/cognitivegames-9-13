/**
 * Sends the game score to the server
 * @param {number} score - The final score to save
 * @param {object} [options] - Additional options
 * @param {number} [options.userId=0] - Optional user ID
 * @param {number} [options.gameId=1] - Game ID (defaults to 1)
 * @returns {Promise<object>} The server response
 */
export const saveGameScore = async (score, { userId = 0, gameId = 1 } = {}) => {
  try {
    const response = await fetch('http://localhost/cognitive-games/api/save_score.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        score,
        user_id: userId,
        game_id: gameId,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving score:', error);
    throw error;
  }
};
