import React from "react";
import {
	Play,
	Pause,
	Square,
	RotateCcw,
	SkipBack,
	SkipForward,
	Repeat,
	Repeat1,
	Volume2,
	VolumeX,
	Radio,
	Speech,
} from "lucide-react";
import type { Passage, BibleVersion } from "../../types";
import type { UsePassageAudioReturn } from "../../hooks/usePassageAudio";

interface AudioPlayerControlsProps {
	audio: UsePassageAudioReturn;
	passage: Passage;
	bibleVersion: BibleVersion;
}

const SPEED_OPTIONS = [0.75, 1.0, 1.25, 1.5, 2.0];

export const AudioPlayerControls: React.FC<AudioPlayerControlsProps> = ({
	audio,
	passage,
	bibleVersion,
}) => {
	const verses = passage.versesText || [];
	const totalVerses = verses.length;
	const currentVerse = verses[audio.currentVerseIndex];
	const hasVerses = totalVerses > 0;

	const progressPercent = hasVerses
		? Math.min(
				100,
				Math.max(
					0,
					((audio.currentVerseIndex + (audio.isPlaying ? 1 : 0)) /
						totalVerses) *
						100,
				),
			)
		: 0;

	if (!audio.isSupported || !hasVerses) {
		return null;
	}

	return (
		<div className="audio-player-card">
			{/* Top Bar: Title, Status Badge, Speed Options */}
			<div className="audio-player-top">
				<div className="audio-player-info">
					<div
						className={`audio-status-icon ${audio.isPlaying ? "audio-status-icon--playing" : ""}`}
					>
						{audio.isPlaying ? (
							<Volume2 size={18} className="audio-pulse-icon" />
						) : audio.isPaused ? (
							<VolumeX size={18} />
						) : (
							<Radio size={18} />
						)}
					</div>
					<div>
						<div className="audio-passage-title">
							<span>
								{passage.book} {passage.chapters}
							</span>
							<span className="audio-version-tag">{bibleVersion}</span>
						</div>
						<div className="audio-status-text">
							{audio.isPlaying ? (
								<span className="audio-status-badge audio-status-badge--live">
									Reading Verse {audio.currentVerseNumber} of {totalVerses}
								</span>
							) : audio.isPaused ? (
								<span className="audio-status-badge audio-status-badge--paused">
									Paused at Verse {audio.currentVerseNumber}
								</span>
							) : (
								<span className="audio-status-badge">
									Audio Reader • {totalVerses} Verses
								</span>
							)}
						</div>
					</div>
				</div>

				{/* Options: Voice & Speed Selectors */}
				<div className="audio-player-options">
					{/* Voice Selector */}
					<div
						className="audio-voice-group"
						title="Select voice for audio reading"
					>
						<Speech size={13} color="var(--accent-gold)" />
						<span className="audio-voice-label">Voice:</span>
						<select
							className="audio-voice-select"
							value={audio.selectedVoiceId || "default"}
							onChange={(e) => audio.setVoice(e.target.value)}
							aria-label="Select audio reader voice"
						>
							{audio.voices && audio.voices.length > 0 ? (
								audio.voices.map((v) => (
									<option key={v.id} value={v.id}>
										{v.displayName}
									</option>
								))
							) : (
								<option value="default">System Default</option>
							)}
						</select>
					</div>

					{/* Speed Selector */}
					<div
						className="audio-speed-group"
						title="Audio reading speed options"
					>
						<span className="audio-speed-label">Speed:</span>
						<div className="audio-speed-pills">
							{SPEED_OPTIONS.map((s) => (
								<button
									key={s}
									onClick={() => audio.setSpeed(s)}
									className={`audio-speed-pill ${audio.speed === s ? "active" : ""}`}
									title={`Playback speed ${s}x`}
								>
									{s}x
								</button>
							))}
						</div>
					</div>
				</div>
			</div>

			{/* Progress Indicator */}
			<div className="audio-progress-bar-container">
				<div
					className="audio-progress-bar-fill"
					style={{ width: `${progressPercent}%` }}
				/>
			</div>

			{/* Main Audio Controls */}
			<div className="audio-controls-row">
				{/* Secondary Action: Restart */}
				<button
					onClick={audio.restart}
					className="btn-icon audio-control-btn"
					title="Restart from Verse 1"
				>
					<RotateCcw size={17} />
				</button>

				{/* Skip Previous Verse */}
				<button
					onClick={audio.prevVerse}
					disabled={audio.currentVerseIndex === 0}
					className="btn-icon audio-control-btn"
					title="Previous verse"
					style={{ opacity: audio.currentVerseIndex === 0 ? 0.45 : 1 }}
				>
					<SkipBack size={18} />
				</button>

				{/* Play / Pause Main Button */}
				<button
					onClick={audio.togglePlayPause}
					className={`audio-play-main-btn ${audio.isPlaying ? "playing" : ""}`}
					title={audio.isPlaying ? "Pause audio" : "Start reading audio"}
				>
					{audio.isPlaying ? (
						<Pause size={24} fill="currentColor" />
					) : (
						<Play size={24} fill="currentColor" style={{ marginLeft: "2px" }} />
					)}
				</button>

				{/* Stop Button */}
				<button
					onClick={audio.stop}
					disabled={audio.isStopped}
					className="btn-icon audio-control-btn"
					title="Stop reading"
					style={{ opacity: audio.isStopped ? 0.45 : 1 }}
				>
					<Square size={17} />
				</button>

				{/* Skip Next Verse */}
				<button
					onClick={audio.nextVerse}
					disabled={audio.currentVerseIndex >= totalVerses - 1}
					className="btn-icon audio-control-btn"
					title="Next verse"
					style={{
						opacity: audio.currentVerseIndex >= totalVerses - 1 ? 0.45 : 1,
					}}
				>
					<SkipForward size={18} />
				</button>

				<div className="audio-controls-divider" />

				{/* Repeat Single Verse Mode */}
				<button
					onClick={audio.toggleRepeatVerse}
					className={`audio-toggle-btn ${audio.repeatVerse ? "active" : ""}`}
					title={
						audio.repeatVerse
							? "Repeat Single Verse: ON (click to disable)"
							: "Repeat Single Verse: OFF (click to repeat current verse)"
					}
				>
					<Repeat1 size={17} />
					<span className="audio-toggle-label">Repeat Verse</span>
				</button>

				{/* Loop Entire Passage Mode */}
				<button
					onClick={audio.toggleLoopPassage}
					className={`audio-toggle-btn ${audio.loopPassage ? "active" : ""}`}
					title={
						audio.loopPassage
							? "Loop Passage: ON (click to disable)"
							: "Loop Passage: OFF (click to loop entire passage continuously)"
					}
				>
					<Repeat size={17} />
					<span className="audio-toggle-label">Loop Passage</span>
				</button>
			</div>

			{/* Active Verse Excerpt Display */}
			{currentVerse && (audio.isPlaying || audio.isPaused) && (
				<div className="audio-active-verse-preview">
					<span className="audio-active-verse-ref">
						v{currentVerse.number}:
					</span>
					<span className="audio-active-verse-text">
						"{currentVerse.text}"
					</span>
				</div>
			)}
		</div>
	);
};
