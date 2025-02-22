const express = require('express');
const router = express.Router();
const axios = require('axios');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const db = require('../db');
const {isAccessTokenValid} = require('./spotify_authorization');

// Get all playlists from the database
router.get('/playlists', async (req, res) => {
    try {
        const client = await db.connect();
        try {
            const result = await client.query('SELECT * FROM playlists');
            res.json(result.rows);
        } catch (error) {
            console.error('Database error:', error);
            res.status(500).send('Database error');
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error retrieving playlists:', error);
        res.status(500).send('Error retrieving playlists');
    }
});


// Post all playlists from the user to the database
router.post('/playlists', async (req, res) => {
    const spotifyToken = req.cookies.spotifyAccessToken;
    const decodedUserToken = jwt.verify(req.cookies.accessToken, process.env.ACCESS_TOKEN_SECRET);
    const userId = decodedUserToken.id;

    try {
        const response = await axios.get('https://api.spotify.com/v1/me/playlists', {
            headers: { Authorization: `Bearer ${spotifyToken}` }
        });
        const playlists = response.data.items;

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
                console.log('Playlist:', name, 'Length:', playlistLength);
                const playlistImageUrl = images && images.length > 0 ? images[0].url : null;
                console.log('Image URL:', playlistImageUrl);
                
                await client.query(playlistInsert, [id, name, playlistLength, playlistImageUrl, userId]);
            }

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error saving playlists:', error);
        } finally {
            client.release();
        }

        res.status(200).send('Playlists saved');
    } catch (error) {
        console.error('Error retrieving playlists:', error.response ? error.response.data : error);
        const status = error.response ? error.response.status : 500;
        res.status(status).send('Error retrieving playlists');
    }
});

// Save all songs from a playlist to the database
router.post('/playlists/:id/songs', async (req, res) => {
    const token = req.session.spotifyAccessToken;
    console.log('Token:', token);

    try {
        const validToken = await isAccessTokenValid(token);
        if (!validToken) {
            console.log('Token is invalid');
            return res.status(401).send('Unauthorized');
        } else {
            console.log('Token is valid');
        }

        const playlistId = req.params.id;

        let allTracks = [];
        try {
            let offset = 0;
            const limit = 100;

            while (true) {
                const response = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
                    headers: { Authorization: `Bearer ${token}` },
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
                console.log(`INSERTING: spotify_song_id=${id}, playlist_id=${playlistId}`);                                
                await client.query(trackInsert, [id, name, artist, playlistId]);
            }

            await client.query('COMMIT');
            res.status(200).send('Songs saved');
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error saving songs:', error);
            res.status(500).send('Error saving songs');
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error retrieving songs:', error.response ? error.response.data : error);
        res.status(500).send('Error retrieving songs');
    }
});

// router.post('/playlists', async (req, res) => {
//     const token = req.headers.authorization.split(' ')[1];
//     const playlistId = req.body.playlistId;

//     try {
//         const response = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}`, {
//             headers: { Authorization: `Bearer ${token}` }
//         });

//         const {id, name, tracks } = response.data;

//         //Sla de playlist op in de database
//         const client = await db.connect();
//         try {
//             await client.query('BEGIN');

//             //Playlist opslaan
//             const playlistInsert = `
//                 INSERT INTO playlists (id, playlist_name, user_id) VALUES ($1, $2, $3)
//                 ON CONFLICT (id) DO NOTHING
//             `;
//             await client.query(playlistInsert, [id, name, 1]);

//             //Nummers opslaan
//             const trackInsert = `
//                 INSERT INTO songs (spotify_song_id, title, artist, playlist_id)
//                 VALUES ($1, $2, $3, $4)
//                 ON CONFLICT (id) DO NOTHING
//             `;
//             for (const item of tracks.items) {
//                 const track = item.track;
//                 await client.query(trackInsert, [ track.id, track.name, track.artists[0].name, id ]);
//             }

//             await client.query('COMMIT');
//             res.status(200).send('Playlist saved');
//         } catch (error) {
//             await client.query('ROLLBACK');
//             throw error;
//         } finally {
//             client.release();
//         }
//     } catch (error) {
//         console.error('Error saving playlist:', error);
//         res.status(500).send('Error saving playlist');
//     }
// });

//Delete a playlist from the database
router.delete('/playlists/:id', async (req, res) => {
    const playlistId = req.params.id;
    if (!playlistId) {
        return res.status(400).send('No playlist ID provided');
    }

    try {
        const client = await db.connect();
        try {
            await client.query('BEGIN');

            const deleteSongs = `
                DELETE FROM songs WHERE playlist_id = $1
            `;
            await client.query(deleteSongs, [playlistId]);

            const deletePlaylist = `
                DELETE FROM playlists WHERE id = $1
            `;
            await client.query(deletePlaylist, [playlistId]);

            await client.query('COMMIT');
            res.status(200).send('Playlist deleted');
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Database error:', error);
            res.status(500).send('Database error');
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error deleting playlist:', error);
        res.status(500).send('Error deleting playlist');
    }
});

//Get a random pair of songs from a playlist
router.get('/playlists/:id/random', async (req, res) => {
    if (!req.headers.authorization) {
        return res.status(401).send('Unauthorized, no header found');
    }
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        return res.status(401).send('Unauthorized');
    }
    const playlistId = req.params.id;
    try {
        const response = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const { items } = response.data;
        const randomIndex = Math.floor(Math.random() * items.length);
        res.json(items[randomIndex].track);
    } catch (error) {
        console.error('Error retrieving random song:', error.response ? error.response.data : error);
        res.status(500).send('Error retrieving random song');
    }
});



module.exports = router;