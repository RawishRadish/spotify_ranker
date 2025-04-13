import React, { useState, useRef, useEffect } from 'react';
import api from '../axiosConfig';
import { FaPlay, FaPause, FaSpotify, FaSpinner } from "react-icons/fa";
import { useAudio } from '../context/AudioContext';


const PreviewSongPlayer = ({ song }) => {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying ] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [previewLoading, setPreviewLoading] = useState(true);
    const { play, stop, currentPlayingId } = useAudio();

    useEffect(() => {
        setPreviewLoading(true);
        const fetchPreviewUrl = async () => {
            try {
                const response = await api.get(`/songs/preview`, {
                    params: {
                        title: song.title,
                        artist: song.artist,
                    },
                });
                if (response.data === null) {
                    setPreviewUrl(null);
                    setPreviewLoading(false);
                    return;
                }
                setPreviewUrl(response.data.previewUrls[0]);
                setPreviewLoading(false);
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

    if (previewLoading) {
        return (
            <div className='flex w-[60%] h-full items-center justify-center gap-4'>
                <FaSpinner 
                    className='animate-spin text-gray-600/60 h-full w-full'
                    style={{ animationDuration : '1.5s'}}
                />
            </div>
        )
    }


    return (
        <div className='flex w-[60%] h-full items-center gap-4'>
            {previewUrl !== null ? (
                <>
                    <audio ref={audioRef} src={previewUrl} />
                    <button className="text-gray-600/60  px-4 py-2 w-full h-full rounded-full transition-all" onClick={togglePlay}>
                        {isPlaying ? <FaPause className='h-full w-full'/> : <FaPlay className='h-full w-full' />}
                    </button>
                </>
            ) : (
                <a 
                    href={song.externalUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-gray-600/60 px-4 py-2 w-full h-full rounded-full transition-all'
                >
                    <FaSpotify className='h-full w-full' />
                </a>
            )}
        </div>
    );
}

export default PreviewSongPlayer;