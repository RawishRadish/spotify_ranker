import React, { useState, useRef, useEffect } from 'react';
import api from '../axiosConfig';
import { FaPlay, FaPause } from "react-icons/fa";
import { useAudio } from '../context/AudioContext';


const PreviewSongPlayer = ({ song }) => {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying ] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const { play, stop, currentPlayingId } = useAudio();

    useEffect(() => {
        const fetchPreviewUrl = async () => {
            try {
                const response = await api.post('/pairs/preview', {
                    songs: [song]
                });
                setPreviewUrl(response.data[0][0].previewUrls[0]);
            } catch (error) {
                console.error('Error fetching preview URL:', error);
            }
        };

        fetchPreviewUrl();
    }, [song]);

    useEffect(() => {
        setIsPlaying(currentPlayingId === song.id);
    }, [currentPlayingId, song.id]);

    useEffect(() => {
        const audio = audioRef.current;
        const handleEnded = () => {
            setIsPlaying(false);
        };

        if (audio) {
            audio.addEventListener('ended', handleEnded);
        }

        return () => {
            if (audio) {
                audio.removeEventListener('ended', handleEnded);
            }
        };
    }, []);

    const togglePlay = () => {
        if (!audioRef.current) return;
                
        if (isPlaying) {
            stop();
            setIsPlaying(false);
        } else {
            play(song.id, audioRef.current);
            setIsPlaying(true);
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