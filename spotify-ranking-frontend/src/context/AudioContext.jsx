import React, { createContext, useContext, useRef, useState } from 'react';

const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
    const currentAudio = useRef(null);
    const [currentPlayingId, setCurrentPlayingId] = useState(null);

    const play = (id, audioElement) => {
        if (currentAudio.current && currentAudio.current !== audioElement) {
            currentAudio.current.pause();
            currentAudio.current.currentTime = 0;
        }

        currentAudio.current = audioElement;
        setCurrentPlayingId(id);
        audioElement.play();
    };

    const stop = () => {
        if (currentAudio.current) {
            currentAudio.current.pause();
            currentAudio.current.currentTime = 0;
            currentAudio.current = null;
            setCurrentPlayingId(null);
        }
    };

    return (
        <AudioContext.Provider value={{ play, stop, currentPlayingId }}>
            {children}
        </AudioContext.Provider>
    );
};

export const useAudio = () => {
    const context = useContext(AudioContext);
    if (!context) {
        throw new Error('useAudio must be used within an AudioProvider');
    }
    return context;
};