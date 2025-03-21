import React, { useState, useEffect } from 'react';
import PreviewSongPlayer from './PreviewSongPlayer';
import api from '../axiosConfig';

const SongCard = ({ song, opponent, onChoose }) => {
    const [artUrl, setArtUrl] = useState(null);
    const [externalUrl, setExternalUrl] = useState(null);

    useEffect(() => {
        const getAlbumArtUrl = async () => {
            console.log('Getting album art for:', song);
            try {
                const response = await api.post('/pairs/album-art', {
                    song: song,
                });
                setArtUrl(response.data);
            } catch (error) {
                console.error('Error getting album art:', error);
            }
        }

        const getExternalUrl = async () => {
            console.log('Getting external URL for:', song);
            try {
                const response = await api.post('/pairs/external-url', {
                    song: song,
                });
                console.log('External URL:', response.data);
                setExternalUrl(response.data);
            } catch (error) {
                console.error('Error getting external URL:', error);
            }
        }

        getAlbumArtUrl();
        getExternalUrl();
    }, [song]);

    const handleClick = () => {
        onChoose(song.id, opponent.id);
    };

    const handlePreviewClick = (e) => {
        e.stopPropagation();
    };

    return (
        <div 
        className='flex flex-col md:flex-row items-stretch bg-white p-6 rounded-2x1 shadow-sm hover:bg-gray-50 transition-all w-full min-w-[280px] max-w-[400px] min-h-[200px] flex-1'
        onClick={handleClick}
        >
            {/* Left: cover art */}
            <div className="w-full md:w-32 flex justify-center items-center mb-4 md:mb-0">
                <img 
                    src={artUrl} 
                    alt="Album cover" 
                    className="rounded-xl shadow-sm aspect-square w-24 object-cover" />
            </div>
            {/* Right: song info */}
            <div className="flex flex-col justify-center w-full md:ml-6 text-center md:text-left">
                <div className="">
                    <h2 className="text-xl font-semibold text-gray-800 mb-1">{song.title}</h2>
                    <p className="text-md text-gray-500">{song.artist}</p>
                </div>
                {/* <div className="mt-4 md:mt-0 self-center md:self-start" onClick={handlePreviewClick}>
                    <PreviewSongPlayer song={song} />
                </div> */}
                <div className="mt-4 flex gap-4 justify-center md:justify-start">
                    <a
                        href={externalUrl}
                    >
                        Listen on Spotify
                    </a>
                </div>
            </div>
        </div>
    );
};

export default SongCard;