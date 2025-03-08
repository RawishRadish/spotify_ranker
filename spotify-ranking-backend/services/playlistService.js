const db = require('../db');
const { spotifyApi } = require('../config/spotifyConfig');

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

// Get songs from a playlist
const getPlaylistSongs = async (playlistId) => {
    let allTracks = [];
    try {
        let offset = 0;
        const limit = 100;

        while (true) {
            const response = await spotifyApi.get(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
                params: { offset, limit }
            });

            const { items } = response.data;
            allTracks.push(...items);

            // If there are less than 100 items, we have reached the end of the playlist
            if (items.length < limit) {
                break;
            }
            offset += limit; // Increase the offset to get the next 100 items, get next batch
        }
    } catch (error) {
        console.error('Error fetching playlist tracks:', error);
    }
    return allTracks;
}

// Save songs to the database
const savePlaylistSongsToDb = async (allTracks, playlistId) => {
    const client = await db.connect();
    try {
        await client.query('BEGIN');
        const trackInsert = `
            INSERT INTO songs (spotify_song_id, title, artist, playlist_id)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (spotify_song_id, playlist_id) DO NOTHING
        `;

        for (const track of allTracks) {
            const { id, name, artists } = track.track;
            const artist = artists.map(artist => artist.name).join(', ');
            if (!playlistId) {
                console.error("Error: playlistId is missing for track", name);
            }
            if (!id) {
                console.error("Error: spotify_song_id is missing for track", name);
            }
            const res = await client.query(trackInsert, [id, name, artist, playlistId]);
            if (res.rowCount > 0) {
                console.log('Saved song:', name);
            }
        }
        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error saving songs:', error);
        throw new Error('Error saving songs');
    } finally {
        client.release();
    }
};

// Export the functions
module.exports = {
    getAllPlaylistsFromDb,
    savePlaylistsToDb,
    getPlaylistSongs,
    savePlaylistSongsToDb
};