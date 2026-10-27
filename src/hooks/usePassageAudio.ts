import { useState, useEffect, useRef, useCallback } from "react";
import { Capacitor } from "@capacitor/core";
import { TextToSpeech, type SpeechSynthesisVoice } from "@capacitor-community/text-to-speech";
import type { Passage, BibleVersion } from "../types";

export type AudioPlaybackState = "stopped" | "playing" | "paused";

export interface TtsVoiceOption {
	id: string;
	nativeIndex: number;
	name: string;
	lang: string;
	displayName: string;
	default: boolean;
}

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
	voices: TtsVoiceOption[];
	selectedVoiceId: string | null;
	setVoice: (voiceId: string) => void;
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

function getVoiceDisplayName(name: string, lang: string): string {
	let clean = name.trim();
	// Format Android raw identifiers like "en-us-x-sfg-local" or "en-gb-x-rjs-network"
	if (/^[a-z]{2}[-_][a-z]{2}[-_]x[-_]/i.test(clean)) {
		const parts = clean.split(/[-_]/);
		const region = parts[1]?.toUpperCase() || "";
		const variant = parts.slice(3).join(" ").replace(/local|network/gi, "").trim();
		clean = `English (${region}) ${variant ? variant.toUpperCase() : ""}`.trim();
	}
	if (lang && !clean.toLowerCase().includes(lang.toLowerCase())) {
		clean = `${clean} (${lang})`;
	}
	return clean;
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
	const [voices, setVoices] = useState<TtsVoiceOption[]>([]);
	const [selectedVoiceId, setSelectedVoiceId] = useState<string | null>(null);

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

	const voicesRef = useRef<TtsVoiceOption[]>([]);
	voicesRef.current = voices;

	const selectedVoiceRef = useRef<TtsVoiceOption | null>(null);
	const webVoicesRef = useRef<SpeechSynthesisVoice[]>([]);

	// Incremental session ID to cancel out-of-date utterances and asynchronous loops
	const sessionIdRef = useRef<number>(0);

	// Check speech capability
	useEffect(() => {
		const hasCapacitor = Capacitor.isNativePlatform();
		const hasWebSpeech =
			typeof window !== "undefined" && "speechSynthesis" in window;
		setIsSupported(hasCapacitor || hasWebSpeech);
	}, []);

	// Discover and load supported voices for Native and Web
	useEffect(() => {
		let isMounted = true;

		async function loadVoices() {
			try {
				if (Capacitor.isNativePlatform()) {
					const res = await TextToSpeech.getSupportedVoices();
					if (!isMounted) return;
					const rawVoices = res?.voices || [];
					const mapped: TtsVoiceOption[] = rawVoices.map((v, idx) => ({
						id: v.voiceURI || v.name || `native-voice-${idx}`,
						nativeIndex: idx,
						name: v.name || `Voice ${idx + 1}`,
						lang: v.lang || "en-US",
						displayName: getVoiceDisplayName(
							v.name || `Voice ${idx + 1}`,
							v.lang || "en-US",
						),
						default: !!v.default,
					}));

					const englishVoices = mapped.filter((v) =>
						v.lang.toLowerCase().startsWith("en"),
					);
					const voiceList = englishVoices.length > 0 ? englishVoices : mapped;
					setVoices(voiceList);
					voicesRef.current = voiceList;

					const savedId = localStorage.getItem("bible_reader_tts_voice_id");
					let chosen = voiceList.find((v) => v.id === savedId);
					if (!chosen) {
						chosen = voiceList.find((v) => v.default) || voiceList[0] || null;
					}
					if (chosen) {
						setSelectedVoiceId(chosen.id);
						selectedVoiceRef.current = chosen;
					}
				} else if (
					typeof window !== "undefined" &&
					"speechSynthesis" in window
				) {
					const updateWebVoices = () => {
						const rawVoices = window.speechSynthesis.getVoices() || [];
						if (!rawVoices.length || !isMounted) return;
						webVoicesRef.current = rawVoices;

						const mapped: TtsVoiceOption[] = rawVoices.map((v, idx) => ({
							id: v.voiceURI || v.name || `web-voice-${idx}`,
							nativeIndex: idx,
							name: v.name || `Voice ${idx + 1}`,
							lang: v.lang || "en-US",
							displayName: getVoiceDisplayName(
								v.name || `Voice ${idx + 1}`,
								v.lang || "en-US",
							),
							default: !!v.default,
						}));

						const englishVoices = mapped.filter((v) =>
							v.lang.toLowerCase().startsWith("en"),
						);
						const voiceList = englishVoices.length > 0 ? englishVoices : mapped;
						setVoices(voiceList);
						voicesRef.current = voiceList;

						const savedId = localStorage.getItem("bible_reader_tts_voice_id");
						let chosen = voiceList.find((v) => v.id === savedId);
						if (!chosen) {
							chosen = voiceList.find((v) => v.default) || voiceList[0] || null;
						}
						if (chosen) {
							setSelectedVoiceId(chosen.id);
							selectedVoiceRef.current = chosen;
						}
					};

					updateWebVoices();
					window.speechSynthesis.onvoiceschanged = updateWebVoices;
				}
			} catch {
				// Ignore voice loading errors
			}
		}

		loadVoices();

		return () => {
			isMounted = false;
			if (typeof window !== "undefined" && "speechSynthesis" in window) {
				window.speechSynthesis.onvoiceschanged = null;
			}
		};
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

				const currentVoice = selectedVoiceRef.current;

				if (Capacitor.isNativePlatform()) {
					TextToSpeech.speak({
						text,
						rate,
						lang: currentVoice?.lang || "en-US",
						voice: currentVoice ? currentVoice.nativeIndex : undefined,
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
					if (currentVoice) {
						utterance.lang = currentVoice.lang || "en-US";
						const matchingVoice = webVoicesRef.current.find(
							(v) =>
								(v.voiceURI && v.voiceURI === currentVoice.id) ||
								v.name === currentVoice.name,
						);
						if (matchingVoice) {
							utterance.voice = matchingVoice;
						}
					} else {
						utterance.lang = "en-US";
					}
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

	// Set reader voice
	const setVoice = useCallback(
		(voiceId: string) => {
			setSelectedVoiceId(voiceId);
			try {
				localStorage.setItem("bible_reader_tts_voice_id", voiceId);
			} catch {
				// Ignore
			}
			const matched = voicesRef.current.find((v) => v.id === voiceId) || null;
			selectedVoiceRef.current = matched;
			// If currently speaking, re-trigger current verse with new voice
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
		voices,
		selectedVoiceId,
		setVoice,
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
