import {PauseCircleIcon, PlayCircleIcon} from "@heroicons/react/24/solid";
import React, {useRef, useState} from "react";

const CustomAudioPlayer = ({file, showVoLume = true}) => {
    const audioRef = useRef();
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(1);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const togglePlayPause = () => {
        const audio = audioRef.current;
        if (isPlaying) {
            audio.pause();

        } else {
            console.log(audio.duration);
            setDuration(audio.duration);
            audio.play();
        }
        setIsPlaying(!isPlaying);
    }
    const handleVolumeChange = (ev) => {
        const volume = ev.target.value;
        audioRef.current.volume = volume;
        setVolume(volume);
    }
    const handleTimeUpdate = (ev) => {
        const audio = audioRef.current;
        setDuration(audio.duration);
        setCurrentTime(audio.currentTime);
    }
    const handleLoadedMetadata = (ev) => {
        setDuration(ev.target.duration);
    }
    const handleSeekChange = (ev) => {
        const time = ev.target.value;
        audioRef.current.currentTime = time;
        setCurrentTime(time);
    }
    return (
        <div className="w-full flex items-center gap-2 py-2 px-3 rounded-md bg-slate-800">
            <audio src={file.url} ref={audioRef}
                   controls
                   onTimeUpdate={handleTimeUpdate}
                   onLoadedMetadata={handleLoadedMetadata}
                   className="hidden"
            />
            < button onClick={togglePlayPause}>
                {isPlaying && <PauseCircleIcon className="w-6 text-gray-400"/>}
                {!isPlaying && <PlayCircleIcon className="w-6 text-gray-400"/>}
            </button>
            {showVoLume && (
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                />
            )}
            <input
                type="range"
                className="flex-1"
                min="0"
                max={duration}
                step="0.01"
                value={currentTime}
                onChange={handleSeekChange}
            />
        </div>
    )
}
export default CustomAudioPlayer;
