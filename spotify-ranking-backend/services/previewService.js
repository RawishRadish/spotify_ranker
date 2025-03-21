const spotifyPreviewFinder = require('spotify-preview-finder');

// Function to get the preview URL of a song
const getPreviewUrl = async (songs) => {
    console.log('Getting preview URL for:', songs);
    const result = await Promise.all(songs.map(async (song) => {
            const result = await spotifyPreviewFinder(`${song.title} - ${song.artist}`, 1);
            return result.results;
    }));
    
    // await spotifyPreviewFinder(songs);
    console.log('Preview URL:', result);
    return result;
};

// Export the functions
module.exports = {
    getPreviewUrl
};