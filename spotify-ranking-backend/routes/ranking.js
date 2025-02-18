const express = require('express');
const router = express.Router();
const db = require('../db');

// Fetch pairs of songs to compare
router.get('/pairs/:playlist_id', async (req, res) => {
    const { playlist_id } = req.params;

    try {
        console.log('Fetching song pairs for playlist:', playlist_id);
        // Determine total number of comparisons made in the playlist
        const totalComparisonsResult = await db.query(`
            SELECT SUM(match_count) AS comparisons FROM songs WHERE playlist_id = $1;
            `, [playlist_id]);
        const totalComparisons = totalComparisonsResult.rows[0].comparisons || 0;

        // Determine threshold for number of matches for song to be considered 'new'
        const songCountResult = await db.query(`
                SELECT COUNT(*) AS song_count FROM songs WHERE playlist_id = $1;
            `, [playlist_id]);

        const songCount = songCountResult.rows[0].song_count;
        const matchThreshold = Math.max(3, Math.round(Math.log2(totalComparisons / songCount)));

        // Fetch songs with match count below threshold
        const unrankedSongs = await db.query(`
            SELECT  s1.id AS song1_id, s2.id AS song2_id,
                    s1.title AS song1_title, s2.title AS song2_title,
                    s1.artist AS song1_artist, s2.artist AS song2_artist,
                    s1.elo_rating AS song1_rating, s2.elo_rating AS song2_rating
            FROM songs s1
            JOIN songs s2 ON s1.id < s2.id
            WHERE s1.playlist_id = $1
            AND s2.playlist_id = $1
            AND (s1.match_count < $2 OR s2.match_count < $2)
            ORDER BY RANDOM()
            LIMIT 10;
            `, [playlist_id, matchThreshold]);

        // Fetch songs with match count above threshold
        // Fetch songs with elo rating difference within 200
        const within200 = await db.query(`
            SELECT  s1.id AS song1_id, s2.id AS song2_id,
                    s1.title AS song1_title, s2.title AS song2_title,
                    s1.artist AS song1_artist, s2.artist AS song2_artist,
                    s1.elo_rating AS song1_rating, s2.elo_rating AS song2_rating
            FROM songs s1
            JOIN songs s2 ON s1.id < s2.id
            WHERE s1.playlist_id = $1
            AND s2.playlist_id = $1
            AND ABS(s1.elo_rating - s2.elo_rating) <= 200
            ORDER BY RANDOM()
            LIMIT 30;
        `, [playlist_id]);


        // Fetch songs with elo rating difference beyond 200
        let beyond200 = await db.query(`
            SELECT  s1.id AS song1_id, s2.id AS song2_id,
                    s1.title AS song1_title, s2.title AS song2_title,
                    s1.artist AS song1_artist, s2.artist AS song2_artist,
                    s1.elo_rating AS song1_rating, s2.elo_rating AS song2_rating
            FROM songs s1
            JOIN songs s2 ON s1.id < s2.id
            WHERE s1.playlist_id = $1
            AND s2.playlist_id = $1
            AND ABS(s1.elo_rating - s2.elo_rating) > 200
            ORDER BY RANDOM()
            LIMIT 10;
            `, [playlist_id]);

        if (beyond200.rowCount < 10) {
            const neededPairs = 10 - beyond200.rowCount;

            const extraPairs = await db.query(`
                SELECT  s1.id AS song1_id, s2.id AS song2_id,
                        s1.title AS song1_title, s2.title AS song2_title,
                        s1.artist AS song1_artist, s2.artist AS song2_artist,
                        s1.elo_rating AS song1_rating, s2.elo_rating AS song2_rating
                FROM songs s1
                JOIN songs s2 ON s1.id < s2.id
                WHERE s1.playlist_id = $1
                AND s2.playlist_id = $1
                AND ABS(s1.elo_rating - s2.elo_rating) > 200
                ORDER BY RANDOM()
                LIMIT $2;`, [playlist_id, neededPairs]);

            beyond200.rows.push(...extraPairs.rows);
        }

        let allPairs = within200.rows.concat(beyond200.rows, unrankedSongs.rows);
        allPairs = allPairs.sort(() => Math.random() - 0.5);

        res.json(allPairs);
    } catch (error) {
        console.error('Error fetching song pairs:', error);
        res.status(500).json({ error: 'Error fetching song pairs' });
    }
});

// Compare two songs and update their ratings
router.post('/pairs/compare/:playlist_id', async (req, res) => {
    const { playlist_id } = req.params;
    const { winnerId, loserId } = req.body;

    try {
        // Get current ratings
        const result = await db.query(`
            SELECT id, elo_rating
            FROM songs
            WHERE playlist_id = $1
            AND id IN ($2, $3);
            `, [playlist_id, winnerId, loserId]);

        console.log("Query executed with:", playlist_id, winnerId, loserId);
        console.log("Query result:", result.rows);
        
        const winner = result.rows.find(row => row.id === winnerId);
        const loser = result.rows.find(row => row.id === loserId);

        // Elo rating calculation
        const k = 32;
        const expectedWinner = 1 / (1 + Math.pow(10, (loser.elo_rating - winner.elo_rating) / 400));
        const expectedLoser = 1 - expectedWinner;

        const newWinnerRating = parseFloat(winner.elo_rating) + k * (1 - expectedWinner);
        const newLoserRating = parseFloat(loser.elo_rating) + k * (0 - expectedLoser);

        // Update ratings and update match_count
        await db.query(`
            UPDATE songs
            SET 
                elo_rating = CASE
                    WHEN id = $1 THEN $2::double precision
                    WHEN id = $3 THEN $4::double precision
                END,
                match_count = match_count + 1
            WHERE id IN ($1, $3);
        `, [winnerId, newWinnerRating, loserId, newLoserRating]);

        res.json({ success: true });
    } catch (error) {
        console.error('Error comparing songs:', error);
        res.status(500).json({ error: 'Error comparing songs' });
    }
});

// Get the playlist ranked
router.get('/ranked/:playlist_id', async (req, res) => {
    const { playlist_id } = req.params;

    try {
        const result = await db.query(`
            SELECT id, title, artist, elo_rating
            FROM songs
            WHERE playlist_id = $1
            ORDER BY elo_rating DESC;
        `, [playlist_id]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching ranked playlist:', error);
        res.status(500).json({ error: 'Error fetching ranked playlist' });
    }
});

module.exports = router;