import React, { useState, useRef, useEffect } from 'react';
import api from '../axiosConfig';
import { FaRegPlayCircle, FaRegPauseCircle } from "react-icons/fa";

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
                console.log('Preview URL of first song:', response.data[0][0].previewUrls[0]);
                setPreviewUrl(response.data[0][0].previewUrls[0]);
            } catch (error) {
                console.error('Error fetching preview URL:', error);
            }
        }

        fetchPreviewUrl(song);
    }, []);

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
        <div className='flex items-center gap-4'>
            <audio ref={audioRef} src={previewUrl} />
            <button onClick={togglePlay}>
                {isPlaying ? <FaRegPauseCircle /> : <FaRegPlayCircle className="text-green-600 text-2xl" />}
            </button>
        </div>
    );
}

export default PreviewSongPlayer;