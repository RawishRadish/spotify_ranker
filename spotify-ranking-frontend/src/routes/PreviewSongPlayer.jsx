import React, { useState, useRef, useEffect } from 'react';
import api from '../axiosConfig';
import { FaRegPlayCircle, FaRegPauseCircle, FaPlay, FaPause } from "react-icons/fa";


const PreviewSongPlayer = ({ song }) => {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying ] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        const fetchPreviewUrl = async (song) => {
            try {
                const response = await api.post('/pairs/preview', {
                    songs: [song]
                });
                console.log('Preview URL:', response.data);
                setPreviewUrl(response.data[0][0].previewUrls[0]);
            } catch (error) {
                console.error('Error fetching preview URL:', error);
            }
        }

        fetchPreviewUrl(song);
    }, [song]);

    const togglePlay = () => {
        if (audioRef) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    return (
        <div className='flex w-[60%] h-full items-center gap-4'>
            <audio ref={audioRef} src={previewUrl} />
            <button className="text-gray-600/60  px-4 py-2 w-full h-full rounded-full transition-all" onClick={togglePlay}>
                {isPlaying ? <FaPause className='h-full w-full'/> : <FaPlay className='h-full w-full' />}
            </button>
        </div>
    );
}

export default PreviewSongPlayer;