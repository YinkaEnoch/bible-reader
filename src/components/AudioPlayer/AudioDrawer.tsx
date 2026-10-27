import React, { useState } from "react";
import {
	Play,
	Pause,
	Square,
	SkipBack,
	SkipForward,
	Volume2,
	VolumeX,
	Radio,
	ChevronUp,
	ChevronDown,
	RotateCcw,
	Repeat,
	Repeat1,
	BookOpen,
	Speech,
} from "lucide-react";
import type { BibleVersion } from "../../types";
import type { UsePassageAudioReturn } from "../../hooks/usePassageAudio";

const SPEED_OPTIONS = [0.75, 1.0, 1.25, 1.5, 2.0];

interface AudioDrawerProps {
	audio: UsePassageAudioReturn;
	bibleVersion: BibleVersion;
	/** Called when the user taps the passage title / "Open Reader" button. */
	onOpenReader: () => void;
}

/**
 * A persistent bottom drawer that shows the audio player when audio is
 * playing or paused in the background (i.e. the user has navigated away
 * from the ReadingView).
 *
 * Two states:
 *  - **Mini bar** (collapsed): passage info + quick controls. Tap the
 *    chevron or the passage name to expand.
 *  - **Expanded sheet**: full controls (speed, voice, repeat/loop, restart).
 */
export const AudioDrawer: React.FC<AudioDrawerProps> = ({
	audio,
	bibleVersion: _bibleVersion,
	onOpenReader,
}) => {
	const [expanded, setExpanded] = useState(false);

	const passage = audio.activePassage;

	// Only render when actively playing or paused
	if (!passage || audio.isStopped || !audio.isSupported) {
		return null;
	}

	const verses = passage.versesText || [];
	const totalVerses = verses.length;
	const currentVerse = verses[audio.currentVerseIndex];

	const progressPercent =
		totalVerses > 0
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

	return (
		<div
			className={`audio-drawer ${expanded ? "audio-drawer--expanded" : ""} ${audio.isPlaying ? "audio-drawer--playing" : "audio-drawer--paused"}`}
			role="region"
			aria-label="Audio playback"
		>
			{/* Thin accent progress stripe at the very top of the drawer */}
			<div className="audio-drawer-progress-stripe">
				<div
					className="audio-drawer-progress-stripe-fill"
					style={{ width: `${progressPercent}%` }}
				/>
			</div>

			{/* Mini bar — always visible */}
			<div className="audio-drawer-mini">
				{/* Status icon */}
				<div
					className={`audio-drawer-status-icon ${audio.isPlaying ? "audio-drawer-status-icon--playing" : ""}`}
				>
					{audio.isPlaying ? (
						<Volume2 size={16} className="audio-pulse-icon" />
					) : audio.isPaused ? (
						<VolumeX size={16} />
					) : (
						<Radio size={16} />
					)}
				</div>

				{/* Passage info — tapping opens reader */}
				<button
					className="audio-drawer-passage-info"
					onClick={onOpenReader}
					title="Open Reader"
					aria-label="Open Bible reader"
				>
					<span className="audio-drawer-passage-title">
						{passage.book} {passage.chapters}
					</span>
					<span className="audio-drawer-passage-meta">
						{audio.isPlaying
							? `Verse ${audio.currentVerseNumber} of ${totalVerses}`
							: audio.isPaused
								? `Paused · v${audio.currentVerseNumber}`
								: `${totalVerses} verses`}
					</span>
				</button>

				{/* Quick controls */}
				<div className="audio-drawer-quick-controls">
					<button
						onClick={audio.prevVerse}
						disabled={audio.currentVerseIndex === 0}
						className="audio-drawer-ctrl-btn"
						title="Previous verse"
						style={{ opacity: audio.currentVerseIndex === 0 ? 0.4 : 1 }}
					>
						<SkipBack size={16} />
					</button>

					<button
						onClick={audio.togglePlayPause}
						className="audio-drawer-play-btn"
						title={audio.isPlaying ? "Pause" : "Play"}
						aria-label={audio.isPlaying ? "Pause audio" : "Resume audio"}
					>
						{audio.isPlaying ? (
							<Pause size={18} fill="currentColor" />
						) : (
							<Play size={18} fill="currentColor" style={{ marginLeft: "2px" }} />
						)}
					</button>

					<button
						onClick={audio.nextVerse}
						disabled={audio.currentVerseIndex >= totalVerses - 1}
						className="audio-drawer-ctrl-btn"
						title="Next verse"
						style={{
							opacity: audio.currentVerseIndex >= totalVerses - 1 ? 0.4 : 1,
						}}
					>
						<SkipForward size={16} />
					</button>

					<button
						onClick={audio.stop}
						className="audio-drawer-ctrl-btn"
						title="Stop playback"
					>
						<Square size={14} />
					</button>
				</div>

				{/* Expand / Collapse toggle */}
				<button
					onClick={() => setExpanded((v) => !v)}
					className="audio-drawer-expand-btn"
					title={expanded ? "Collapse player" : "Expand player"}
					aria-label={expanded ? "Collapse audio drawer" : "Expand audio drawer"}
					aria-expanded={expanded}
				>
					{expanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
				</button>
			</div>

			{/* Expanded panel — full controls */}
			{expanded && (
				<div className="audio-drawer-expanded-panel">
					{/* Active verse excerpt */}
					{currentVerse && (
						<div className="audio-drawer-verse-preview">
							<span className="audio-drawer-verse-ref">v{currentVerse.number}:</span>
							<span className="audio-drawer-verse-text">"{currentVerse.text}"</span>
						</div>
					)}

					{/* Voice & Speed options */}
					<div className="audio-drawer-options">
						{/* Voice Selector — always rendered; shows placeholder while voices load */}
						<div className="audio-voice-group" title="Select reading voice">
							<Speech size={13} color="var(--accent-gold)" />
							<span className="audio-voice-label">Voice:</span>
							<select
								className="audio-voice-select"
								value={audio.selectedVoiceId || ""}
								onChange={(e) => audio.setVoice(e.target.value)}
								aria-label="Select audio reader voice"
								disabled={!audio.voices || audio.voices.length === 0}
							>
								{audio.voices && audio.voices.length > 0 ? (
									audio.voices.map((v) => (
										<option key={v.id} value={v.id}>
											{v.displayName}
										</option>
									))
								) : (
									<option value="">Loading voices…</option>
								)}
							</select>
						</div>

						{/* Speed pills */}
						<div className="audio-speed-group" title="Playback speed">
							<span className="audio-speed-label">Speed:</span>
							<div className="audio-speed-pills">
								{SPEED_OPTIONS.map((s) => (
									<button
										key={s}
										onClick={() => audio.setSpeed(s)}
										className={`audio-speed-pill ${audio.speed === s ? "active" : ""}`}
										title={`${s}x speed`}
									>
										{s}x
									</button>
								))}
							</div>
						</div>
					</div>

					{/* Secondary controls row */}
					<div className="audio-drawer-secondary-controls">
						{/* Restart */}
						<button
							onClick={audio.restart}
							className="btn-icon audio-control-btn"
							title="Restart from Verse 1"
						>
							<RotateCcw size={16} />
						</button>

						{/* Repeat verse */}
						<button
							onClick={audio.toggleRepeatVerse}
							className={`audio-toggle-btn ${audio.repeatVerse ? "active" : ""}`}
							title={
								audio.repeatVerse
									? "Repeat Verse: ON"
									: "Repeat Verse: OFF"
							}
						>
							<Repeat1 size={15} />
							<span className="audio-toggle-label">Repeat Verse</span>
						</button>

						{/* Loop passage */}
						<button
							onClick={audio.toggleLoopPassage}
							className={`audio-toggle-btn ${audio.loopPassage ? "active" : ""}`}
							title={
								audio.loopPassage
									? "Loop Passage: ON"
									: "Loop Passage: OFF"
							}
						>
							<Repeat size={15} />
							<span className="audio-toggle-label">Loop Passage</span>
						</button>

						{/* Open Reader shortcut */}
						<button
							onClick={onOpenReader}
							className="btn-secondary audio-drawer-open-reader-btn"
							title="Open Bible Reader"
						>
							<BookOpen size={14} />
							<span>Open Reader</span>
						</button>
					</div>
				</div>
			)}
		</div>
	);
};
