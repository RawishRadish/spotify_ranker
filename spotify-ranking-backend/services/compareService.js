const db = require('../db');

// Fetch pairs of songs to compare
const fetchSongPairs = async (playlist_id) => {
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
        WITH filtered_songs AS (
            SELECT *
            FROM songs
            WHERE playlist_id = $1
            AND match_count < $2
            ORDER BY random()
            LIMIT 50
        )
        SELECT 	s1.id AS song1_id, s2.id AS song2_id,
                s1.title AS song1_title, s2.title AS song2_title,
                s1.artist AS song1_artist, s2.artist AS song2_artist,
                s1.elo_rating AS song1_rating, s2.elo_rating AS song2_rating
        FROM filtered_songs s1
        JOIN filtered_songs s2 ON s1.id < s2.id
        ORDER BY random()
        LIMIT 10;
        `, [playlist_id, matchThreshold]);

    // Fetch songs with match count above threshold
    // Fetch songs with elo rating difference within 200
    const within200 = await db.query(`
        WITH selected_songs AS (
            SELECT *
            FROM songs
            WHERE playlist_id = $1
            ORDER BY random()
            LIMIT 30
        )
        SELECT	s1.id AS song1_id, s2.id AS song2_id,
                s1.title AS song1_title, s2.title AS song2_title,
                s1.artist AS song1_artist, s2.artist AS song2_artist,
                s1.elo_rating AS song1_rating, s2.elo_rating AS song2_rating
        FROM 	selected_songs s1
        JOIN LATERAL (
            SELECT * FROM songs s2
            WHERE s2.playlist_id = $1
            AND s2.elo_rating BETWEEN s1.elo_rating - 200 AND s1.elo_rating + 200
            AND s1.id <> s2.id
            ORDER BY random()
        ) s2 ON true
        ORDER BY random()
        LIMIT 30;
    `, [playlist_id]);

    // Fetch songs with elo rating difference beyond 200
    let beyond200 = await db.query(`
        WITH selected_songs AS (
            SELECT *
            FROM songs
            WHERE playlist_id = $1
            ORDER BY random()
            LIMIT 30
        )
        SELECT	s1.id AS song1_id, s2.id AS song2_id,
                s1.title AS song1_title, s2.title AS song2_title,
                s1.artist AS song1_artist, s2.artist AS song2_artist,
                s1.elo_rating AS song1_rating, s2.elo_rating AS song2_rating
        FROM 	selected_songs s1
        JOIN LATERAL (
            SELECT * FROM songs s2
            WHERE s2.playlist_id = $1
            AND s2.elo_rating NOT BETWEEN s1.elo_rating - 200 AND s1.elo_rating + 200
            AND s1.id <> s2.id
            ORDER BY random()
        ) s2 ON true
        ORDER BY random()
        LIMIT 10;
        `, [playlist_id]);

    if (beyond200.rowCount < 10) {
        const neededPairs = 10 - beyond200.rowCount;
        const additionalPairs = await db.query(`
            WITH selected_songs AS (
                SELECT *
                FROM songs
                WHERE playlist_id = $1
                ORDER BY random()
                LIMIT 30
            )
            SELECT	s1.id AS song1_id, s2.id AS song2_id,
                    s1.title AS song1_title, s2.title AS song2_title,
                    s1.artist AS song1_artist, s2.artist AS song2_artist,
                    s1.elo_rating AS song1_rating, s2.elo_rating AS song2_rating
            FROM 	selected_songs s1
            JOIN LATERAL (
                SELECT * FROM songs s2
                WHERE s2.playlist_id = $1
                AND s2.elo_rating BETWEEN s1.elo_rating - 200 AND s1.elo_rating + 200
                AND s1.id <> s2.id
                ORDER BY random()
            ) s2 ON true
            ORDER BY random()
            LIMIT $2;
            `, [playlist_id, neededPairs]);

        beyond200.rows.push(...additionalPairs.rows);
    }

    let allPairs = within200.rows.concat(beyond200.rows, unrankedSongs.rows);
    allPairs = allPairs.sort(() => Math.random() - 0.5);

    return allPairs;
};

// Compare two songs and update their ratings
const compareSongs = async (playlist_id, winner_id, loser_id) => {
    const result = await db.query(`
        SELECT id, elo_rating
        FROM songs
        WHERE playlist_id = $1
        AND id IN ($2, $3);
        `, [playlist_id, winner_id, loser_id]);

    console.log("Query executed with:", playlist_id, winner_id, loser_id);
    console.log("Query result:", result.rows);

    const winner = result.rows.find(row => row.id === winner_id);
    const loser = result.rows.find(row => row.id === loser_id);

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
    `, [winner_id, newWinnerRating, loser_id, newLoserRating]);
};

module.exports = {
    fetchSongPairs,
    compareSongs
}