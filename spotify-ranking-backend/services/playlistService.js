const db = require('../db');

const getAllPlaylistsFromDb = async (userId) => {
    const client = await db.connect();
    try {
        const result = await client.query('SELECT * FROM playlists WHERE user_id = $1', [userId]);
        return result.rows;
    } catch (error) {
        console.error('Error getting playlists:', error);
        throw new Error('Error getting playlists');
    } finally {
        client.release();
    }
};

const savePlaylistsToDb = async (playlists, userId) => {
    const client = await db.connect();
    try {
        await client.query('BEGIN');
        const playlistInsert = `
            INSERT INTO playlists (id, playlist_name, playlist_length, playlist_image_url, user_id)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (id) DO UPDATE
            SET playlist_name = EXCLUDED.playlist_name,
                playlist_length = EXCLUDED.playlist_length,
                playlist_image_url = EXCLUDED.playlist_image_url,
                user_id = EXCLUDED.user_id
        `;

        for (const playlist of playlists) {
            const { id, name, tracks, images } = playlist;
            const playlistLength = tracks.total;
            const playlistImageUrl = images && images[0]?.url;
            
            await client.query(playlistInsert, [id, name, playlistLength, playlistImageUrl, userId]);
        }
        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error saving playlists:', error);
        throw new Error('Error saving playlists');
    } finally {
        client.release();
    }
};

// Export the functions
module.exports = {
    getAllPlaylistsFromDb,
    savePlaylistsToDb
};