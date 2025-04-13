import React, { useState, useEffect } from 'react';
import PreviewSongPlayer from './PreviewSongPlayer';
import api from '../axiosConfig';

const SongCard = ({ song, opponent, onChoose }) => {
    const [artUrl, setArtUrl] = useState(null);
    const [externalUrl, setExternalUrl] = useState(null);

    useEffect(() => {
        setArtUrl(song.albumImageUrl);
        setExternalUrl(song.externalUrl);
    }, [song]);

    const handleClick = () => {
        onChoose(song.id, opponent.id);
    };

    const handlePreviewClick = (e) => {
        e.stopPropagation();
    };

    return (
        <div 
            className='relative w-64 h-full flex flex-col rounded-xl overflow-hidden shadow-md transition hover:shadow-lg'
            onClick={handleClick}
        >
            <div
                className='relative h-64 aspect-square bg-cover bg-center'
                style={{ backgroundImage: `url(${artUrl})` }}
            >
                <div className='absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition'
                    onClick={handlePreviewClick}
                >
                    <PreviewSongPlayer song={song} />
                </div>
            </div>
            <div className='flex-grow flex flex-col justify-between bg-white px-4 py-3'>
                <div className='flex-grow flex flex-col justify-center'>
                    <h2 className='text-lg font-semibold text-gray-800 break-words whitespace-normal'>{song.title}</h2>
                    <p className='text-sm text-gray-500 break-words'>{song.artist}</p>
                </div>
            </div>

        </div>
    );
};

export default SongCard;