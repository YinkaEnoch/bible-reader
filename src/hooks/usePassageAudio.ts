import { useState, useEffect, useRef, useCallback } from "react";
import { Capacitor } from "@capacitor/core";
import { TextToSpeech } from "@capacitor-community/text-to-speech";
import type { Passage, BibleVersion } from "../types";

export type AudioPlaybackState = "stopped" | "playing" | "paused";

export interface UsePassageAudioReturn {
	playbackState: AudioPlaybackState;
	isPlaying: boolean;
	isPaused: boolean;
	isStopped: boolean;
	currentVerseIndex: number;
	currentVerseNumber: number | null;
	speed: number;
	repeatVerse: boolean;
	loopPassage: boolean;
	isSupported: boolean;
	play: (startIdx?: number) => void;
	pause: () => void;
	stop: () => void;
	restart: () => void;
	togglePlayPause: () => void;
	toggleRepeatVerse: () => void;
	toggleLoopPassage: () => void;
	setSpeed: (newSpeed: number) => void;
	skipToVerse: (index: number) => void;
	prevVerse: () => void;
	nextVerse: () => void;
}

// Inaudible 1-second WAV buffer (8kHz mono PCM silent WAV) for mobile background media session keeping
const SILENT_AUDIO_URI =
	"data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";

let silentAudioInstance: HTMLAudioElement | null = null;

function getSilentAudio(): HTMLAudioElement | null {
	if (typeof window === "undefined" || typeof Audio === "undefined") return null;
	if (!silentAudioInstance) {
		try {
			silentAudioInstance = new Audio(SILENT_AUDIO_URI);
			silentAudioInstance.loop = true;
			silentAudioInstance.volume = 0.01;
		} catch {
			silentAudioInstance = null;
		}
	}
	return silentAudioInstance;
}

function startBackgroundAudioSession() {
	try {
		const audio = getSilentAudio();
		if (audio && audio.paused) {
			audio.play().catch(() => {});
		}
	} catch {
		// Ignore autoplay limitations
	}
}

function stopBackgroundAudioSession() {
	try {
		const audio = getSilentAudio();
		if (audio && !audio.paused) {
			audio.pause();
			audio.currentTime = 0;
		}
	} catch {
		// Ignore
	}
}

export function usePassageAudio(
	passage: Passage | null | undefined,
	bibleVersion?: BibleVersion,
): UsePassageAudioReturn {
	const [playbackState, setPlaybackState] =
		useState<AudioPlaybackState>("stopped");
	const [currentVerseIndex, setCurrentVerseIndex] = useState<number>(0);
	const [speed, setSpeedState] = useState<number>(1.0);
	const [repeatVerse, setRepeatVerseState] = useState<boolean>(false);
	const [loopPassage, setLoopPassageState] = useState<boolean>(false);
	const [isSupported, setIsSupported] = useState<boolean>(true);

	// Refs for values accessed inside asynchronous speech loops
	const passageRef = useRef(passage);
	passageRef.current = passage;

	const bibleVersionRef = useRef(bibleVersion);
	bibleVersionRef.current = bibleVersion;

	const playbackStateRef = useRef(playbackState);
	playbackStateRef.current = playbackState;

	const currentVerseIndexRef = useRef(currentVerseIndex);
	currentVerseIndexRef.current = currentVerseIndex;

	const speedRef = useRef(speed);
	speedRef.current = speed;

	const repeatVerseRef = useRef(repeatVerse);
	repeatVerseRef.current = repeatVerse;

	const loopPassageRef = useRef(loopPassage);
	loopPassageRef.current = loopPassage;

	// Incremental session ID to cancel out-of-date utterances and asynchronous loops
	const sessionIdRef = useRef<number>(0);

	// Check speech capability
	useEffect(() => {
		const hasCapacitor = Capacitor.isNativePlatform();
		const hasWebSpeech =
			typeof window !== "undefined" && "speechSynthesis" in window;
		setIsSupported(hasCapacitor || hasWebSpeech);
	}, []);

	// Stop low-level speech engine
	const stopSpeechEngine = useCallback(async () => {
		if (Capacitor.isNativePlatform()) {
			try {
				await TextToSpeech.stop();
			} catch {
				// Ignore
			}
		}
		if (typeof window !== "undefined" && "speechSynthesis" in window) {
			try {
				window.speechSynthesis.cancel();
			} catch {
				// Ignore
			}
		}
	}, []);

	// Clean up media session metadata
	const clearMediaSession = useCallback(() => {
		if (typeof navigator === "undefined" || !("mediaSession" in navigator))
			return;
		try {
			navigator.mediaSession.playbackState = "none";
			navigator.mediaSession.setActionHandler("play", null);
			navigator.mediaSession.setActionHandler("pause", null);
			navigator.mediaSession.setActionHandler("stop", null);
			navigator.mediaSession.setActionHandler("previoustrack", null);
			navigator.mediaSession.setActionHandler("nexttrack", null);
		} catch {
			// Ignore
		}
	}, []);

	// Low-level speak of a single text string
	const speakTextPromise = useCallback(
		(text: string, rate: number): Promise<boolean> => {
			return new Promise((resolve) => {
				if (!text.trim()) {
					resolve(true);
					return;
				}

				if (Capacitor.isNativePlatform()) {
					TextToSpeech.speak({
						text,
						rate,
						lang: "en-US",
						category: "playback",
					})
						.then(() => resolve(true))
						.catch(() => resolve(false));
				} else if (
					typeof window !== "undefined" &&
					"speechSynthesis" in window
				) {
					window.speechSynthesis.cancel();
					const utterance = new SpeechSynthesisUtterance(text);
					utterance.rate = Math.max(0.5, Math.min(2.5, rate));
					utterance.pitch = 1.0;
					utterance.lang = "en-US";
					utterance.onend = () => resolve(true);
					utterance.onerror = (e) => {
						// Interrupted / canceled is expected when stopping/skipping
						if (e.error === "interrupted" || e.error === "canceled") {
							resolve(false);
						} else {
							resolve(false);
						}
					};
					window.speechSynthesis.speak(utterance);
				} else {
					resolve(false);
				}
			});
		},
		[],
	);

	// Stop speech and background audio completely
	const stop = useCallback(() => {
		sessionIdRef.current++;
		stopSpeechEngine();
		stopBackgroundAudioSession();
		clearMediaSession();
		setPlaybackState("stopped");
		setCurrentVerseIndex(0);
		currentVerseIndexRef.current = 0;
	}, [stopSpeechEngine, clearMediaSession]);

	// Pause speech
	const pause = useCallback(() => {
		sessionIdRef.current++;
		stopSpeechEngine();
		stopBackgroundAudioSession();
		setPlaybackState("paused");

		if (typeof navigator !== "undefined" && "mediaSession" in navigator) {
			try {
				navigator.mediaSession.playbackState = "paused";
			} catch {
				// Ignore
			}
		}
	}, [stopSpeechEngine]);

	// Start or continue playback loop
	const startPlaybackLoop = useCallback(
		async (startIdx: number) => {
			const activePassage = passageRef.current;
			if (!activePassage || !activePassage.versesText?.length) return;

			sessionIdRef.current++;
			const currentSessionId = sessionIdRef.current;

			setPlaybackState("playing");
			startBackgroundAudioSession();

			let idx = Math.max(
				0,
				Math.min(startIdx, activePassage.versesText.length - 1),
			);
			let isSessionFirst = true;

			while (sessionIdRef.current === currentSessionId) {
				const currentPassageData = passageRef.current;
				const verses = currentPassageData?.versesText;
				if (!verses || !verses.length || idx < 0 || idx >= verses.length) {
					break;
				}

				setCurrentVerseIndex(idx);
				currentVerseIndexRef.current = idx;

				const verse = verses[idx];

				// Update MediaSession for Android lockscreen and notification center
				if (typeof navigator !== "undefined" && "mediaSession" in navigator) {
					try {
						navigator.mediaSession.metadata = new MediaMetadata({
							title: `${currentPassageData.book} ${currentPassageData.chapters}:${verse.number}`,
							artist: `Bible Reader (${bibleVersionRef.current || "Scripture"})`,
							album: `${currentPassageData.book} ${currentPassageData.chapters}`,
							artwork: [
								{
									src: "/icon-192.png",
									sizes: "192x192",
									type: "image/png",
								},
								{
									src: "/icon-512.png",
									sizes: "512x512",
									type: "image/png",
								},
							],
						});
						navigator.mediaSession.playbackState = "playing";
						navigator.mediaSession.setActionHandler("play", () => {
							if (playbackStateRef.current !== "playing") {
								startPlaybackLoop(currentVerseIndexRef.current);
							}
						});
						navigator.mediaSession.setActionHandler("pause", () => pause());
						navigator.mediaSession.setActionHandler("stop", () => stop());
						navigator.mediaSession.setActionHandler("previoustrack", () => {
							const prev = Math.max(0, currentVerseIndexRef.current - 1);
							startPlaybackLoop(prev);
						});
						navigator.mediaSession.setActionHandler("nexttrack", () => {
							const total = passageRef.current?.versesText?.length || 0;
							if (currentVerseIndexRef.current + 1 < total) {
								startPlaybackLoop(currentVerseIndexRef.current + 1);
							}
						});
					} catch {
						// Ignore
					}
				}

				// Generate spoken text with natural phrasing
				let spokenText = "";
				if (idx === 0 && isSessionFirst) {
					spokenText = `${currentPassageData.book} chapter ${currentPassageData.chapters}. Verse ${verse.number}. ${verse.text}`;
				} else {
					spokenText = `Verse ${verse.number}. ${verse.text}`;
				}
				isSessionFirst = false;

				// Speak verse
				const completed = await speakTextPromise(
					spokenText,
					speedRef.current,
				);

				// Bail out if user interacted during speech
				if (sessionIdRef.current !== currentSessionId) {
					return;
				}

				if (!completed) {
					return;
				}

				// Check Repeat Verse mode (single verse loop)
				if (repeatVerseRef.current) {
					continue;
				}

				// Proceed to next verse or loop entire passage
				if (idx + 1 < verses.length) {
					idx++;
				} else {
					// End of passage
					if (loopPassageRef.current) {
						idx = 0;
						isSessionFirst = true;
					} else {
						// Reached end without loop
						setPlaybackState("stopped");
						setCurrentVerseIndex(0);
						currentVerseIndexRef.current = 0;
						stopBackgroundAudioSession();
						clearMediaSession();
						return;
					}
				}
			}
		},
		[speakTextPromise, pause, stop, clearMediaSession],
	);

	// Play action (from specific index or current index)
	const play = useCallback(
		(startIdx?: number) => {
			const idx =
				startIdx !== undefined ? startIdx : currentVerseIndexRef.current;
			startPlaybackLoop(idx);
		},
		[startPlaybackLoop],
	);

	// Toggle play/pause
	const togglePlayPause = useCallback(() => {
		if (playbackState === "playing") {
			pause();
		} else {
			play(currentVerseIndexRef.current);
		}
	}, [playbackState, pause, play]);

	// Restart from verse 1
	const restart = useCallback(() => {
		startPlaybackLoop(0);
	}, [startPlaybackLoop]);

	// Toggle single verse repeat
	const toggleRepeatVerse = useCallback(() => {
		setRepeatVerseState((prev) => !prev);
	}, []);

	// Toggle passage loop
	const toggleLoopPassage = useCallback(() => {
		setLoopPassageState((prev) => !prev);
	}, []);

	// Set playback speed
	const setSpeed = useCallback(
		(newSpeed: number) => {
			setSpeedState(newSpeed);
			speedRef.current = newSpeed;
			// If currently speaking, re-trigger current verse at new speed
			if (playbackStateRef.current === "playing") {
				startPlaybackLoop(currentVerseIndexRef.current);
			}
		},
		[startPlaybackLoop],
	);

	// Skip to a specific verse
	const skipToVerse = useCallback(
		(index: number) => {
			startPlaybackLoop(index);
		},
		[startPlaybackLoop],
	);

	// Previous verse
	const prevVerse = useCallback(() => {
		const target = Math.max(0, currentVerseIndexRef.current - 1);
		startPlaybackLoop(target);
	}, [startPlaybackLoop]);

	// Next verse
	const nextVerse = useCallback(() => {
		const total = passageRef.current?.versesText?.length || 0;
		if (currentVerseIndexRef.current + 1 < total) {
			startPlaybackLoop(currentVerseIndexRef.current + 1);
		} else if (loopPassageRef.current) {
			startPlaybackLoop(0);
		}
	}, [startPlaybackLoop, loopPassageRef]);

	// When passage changes, cleanly stop audio and reset
	useEffect(() => {
		sessionIdRef.current++;
		stopSpeechEngine();
		stopBackgroundAudioSession();
		clearMediaSession();
		setPlaybackState("stopped");
		setCurrentVerseIndex(0);
		currentVerseIndexRef.current = 0;
	}, [
		passage?.book,
		passage?.chapters,
		stopSpeechEngine,
		clearMediaSession,
	]);

	// Cleanup on unmount
	useEffect(() => {
		const sessionRef = sessionIdRef;
		return () => {
			sessionRef.current++;
			stopSpeechEngine();
			stopBackgroundAudioSession();
			clearMediaSession();
		};
	}, [stopSpeechEngine, clearMediaSession]);

	const currentVerseNumber =
		passage?.versesText && passage.versesText[currentVerseIndex]
			? passage.versesText[currentVerseIndex].number
			: null;

	return {
		playbackState,
		isPlaying: playbackState === "playing",
		isPaused: playbackState === "paused",
		isStopped: playbackState === "stopped",
		currentVerseIndex,
		currentVerseNumber,
		speed,
		repeatVerse,
		loopPassage,
		isSupported,
		play,
		pause,
		stop,
		restart,
		togglePlayPause,
		toggleRepeatVerse,
		toggleLoopPassage,
		setSpeed,
		skipToVerse,
		prevVerse,
		nextVerse,
	};
}
