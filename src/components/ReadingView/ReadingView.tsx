import React, { useState, useEffect, useCallback } from "react";
import { Capacitor } from "@capacitor/core";
import { Share } from "@capacitor/share";
import {
	ArrowLeft,
	ChevronLeft,
	ChevronRight,
	Volume2,
	VolumeX,
	Pause,
	Type,
	BookOpen,
	Sparkles,
	Palette,
	BookText,
	Copy,
	Share2,
	Check,
	CheckCircle2,
	Circle,
} from "lucide-react";
import type {
	Passage,
	ReaderFontSize,
	PaperTheme,
	FontStyle,
	BibleVersion,
} from "../../types";
import { formatFullDate, formatDateKey } from "../../lib/dateUtils";
import { usePassageAudio } from "../../hooks/usePassageAudio";
import { AudioPlayerControls } from "../AudioPlayer/AudioPlayerControls";

interface ReadingViewProps {
	selectedDate: Date;
	passages: Passage[];
	paperTheme: PaperTheme;
	onSelectPaperTheme: (theme: PaperTheme) => void;
	bibleVersion: BibleVersion;
	onSelectBibleVersion: (version: BibleVersion) => void;
	onBackToCalendar?: () => void;
	onPrevDay: () => void;
	onNextDay: () => void;
	initialPassageIndex?: number;
	isLoadingVerses?: boolean;
	isPassageRead?: (dateStr: string, passageIndex: number) => boolean;
	onTogglePassageRead?: (dateStr: string, passageIndex: number) => void;
}

export const ReadingView: React.FC<ReadingViewProps> = ({
	selectedDate,
	passages,
	paperTheme,
	onSelectPaperTheme,
	bibleVersion,
	onSelectBibleVersion,
	onBackToCalendar,
	onPrevDay,
	onNextDay,
	initialPassageIndex = 0,
	isLoadingVerses = false,
	isPassageRead,
	onTogglePassageRead,
}) => {
	const [activePassageIndex, setActivePassageIndex] =
		useState<number>(initialPassageIndex);
	const [fontSize, setFontSize] = useState<ReaderFontSize>("md");
	const [fontStyle, setFontStyle] = useState<FontStyle>("serif");
	const [highlightedVerse, setHighlightedVerse] = useState<string | null>(null);
	const [copiedVerseId, setCopiedVerseId] = useState<string | null>(null);
	const [toastMessage, setToastMessage] = useState<string | null>(null);
	const [toastVisible, setToastVisible] = useState<boolean>(false);
	const [scrollProgress, setScrollProgress] = useState<number>(0);

	// Sync activePassageIndex with initialPassageIndex and date changes
	useEffect(() => {
		setActivePassageIndex(initialPassageIndex || 0);
	}, [initialPassageIndex, selectedDate]);

	const safeIndex =
		passages.length > 0
			? Math.min(Math.max(0, activePassageIndex), passages.length - 1)
			: 0;
	const currentPassage = passages[safeIndex];
	const selectedDateStr = formatDateKey(selectedDate);
	const isCurrentPassageRead = isPassageRead
		? isPassageRead(selectedDateStr, safeIndex)
		: false;

	// Enhanced passage audio reader
	const audio = usePassageAudio(currentPassage, bibleVersion);

	// Smoothly scroll active spoken verse into viewport
	useEffect(() => {
		if (audio.isPlaying && audio.currentVerseNumber !== null) {
			const verseEl = document.getElementById(
				`verse-${safeIndex}-${audio.currentVerseNumber}`,
			);
			if (verseEl) {
				verseEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
			}
		}
	}, [audio.isPlaying, audio.currentVerseNumber, safeIndex]);

	useEffect(() => {
		const handleScroll = () => {
			const totalHeight =
				document.documentElement.scrollHeight - window.innerHeight;
			if (totalHeight > 0) {
				const currentProgress = (window.scrollY / totalHeight) * 100;
				setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
			}
		};

		window.addEventListener("scroll", handleScroll);
		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, [selectedDate, safeIndex]);

	// Navigate cleanly between passages and scroll up to the passage top
	const goToPassage = (newIndex: number) => {
		if (newIndex < 0 || newIndex >= passages.length) return;
		audio.stop();
		setActivePassageIndex(newIndex);
		setHighlightedVerse(null);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	/** Show a bottom toast notification for 2.2 s */
	const showToast = useCallback((message: string) => {
		setToastMessage(message);
		setToastVisible(true);
		setTimeout(() => {
			setToastVisible(false);
			setTimeout(() => setToastMessage(null), 300);
		}, 2200);
	}, []);

	/** Copy a single verse to clipboard and show the toast */
	const copyVerse = useCallback(
		(text: string, refStr: string, verseId: string) => {
			const content = `"${text}" — ${refStr}`;
			navigator.clipboard.writeText(content).then(() => {
				setCopiedVerseId(verseId);
				showToast("Verse copied to clipboard!");
				setTimeout(() => setCopiedVerseId(null), 2000);
			});
		},
		[showToast],
	);

	/** Share a verse via Capacitor Share (native Android/iOS) or Web Share API */
	const shareVerse = useCallback(
		async (text: string, refStr: string) => {
			const content = `"${text}" — ${refStr}`;
			try {
				if (Capacitor.isNativePlatform()) {
					await Share.share({
						title: refStr,
						text: content,
						dialogTitle: `Share ${refStr}`,
					});
					return;
				}

				if (typeof navigator !== "undefined" && navigator.share) {
					await navigator.share({
						title: refStr,
						text: content,
					});
					return;
				}

				await navigator.clipboard.writeText(content);
				showToast("Verse copied to clipboard!");
			} catch (err: unknown) {
				const errMsg = err instanceof Error ? err.message : String(err);
				if (
					(err instanceof Error && err.name === "AbortError") ||
					errMsg.toLowerCase().includes("cancel") ||
					errMsg.toLowerCase().includes("abort")
				) {
					return;
				}

				try {
					await navigator.clipboard.writeText(content);
					showToast("Verse copied to clipboard!");
				} catch {
					// User denied clipboard permission
				}
			}
		},
		[showToast],
	);

	const getFontSizeClass = () => {
		switch (fontSize) {
			case "sm":
				return "font-size-sm";
			case "lg":
				return "font-size-lg";
			case "xl":
				return "font-size-xl";
			default:
				return "font-size-md";
		}
	};

	return (
		<div className="reader-container" data-paper={paperTheme}>
			{/* Scroll Progress Bar */}
			<div
				style={{
					position: "fixed",
					top: 0,
					left: 0,
					right: 0,
					height: "4px",
					zIndex: 40,
					backgroundColor: "transparent",
				}}
			>
				<div
					style={{
						height: "100%",
						backgroundColor: "var(--accent-gold)",
						width: `${scrollProgress}%`,
						transition: "width 0.15s ease",
					}}
				/>
			</div>

			{/* Reader Nav Bar */}
			<div className="reader-nav-bar">
				<button
					onClick={() => {
						audio.stop();
						onBackToCalendar?.();
					}}
					className="btn-secondary"
					style={{ padding: "0.4rem 0.85rem", marginBottom: "1rem" }}
				>
					<ArrowLeft size={16} />
					<span>Back to Calendar</span>
				</button>

				<div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
					<button
						onClick={() => {
							audio.stop();
							onPrevDay();
						}}
						className="btn-icon"
						style={{ width: "32px", height: "32px" }}
						title="Previous Day"
					>
						<ChevronLeft size={16} />
					</button>
					<span
						style={{
							fontSize: "0.75rem",
							fontWeight: 700,
							color: "var(--text-muted)",
						}}
					>
						Day
					</span>
					<button
						onClick={() => {
							audio.stop();
							onNextDay();
						}}
						className="btn-icon"
						style={{ width: "32px", height: "32px" }}
						title="Next Day"
					>
						<ChevronRight size={16} />
					</button>
				</div>
			</div>

			{/* Header */}
			<div
				style={{
					textAlign: "center",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					gap: "0.4rem",
				}}
			>
				<span className="badge-pill">
					<Sparkles size={12} /> Daily Passage
				</span>
				<h2
					style={{
						fontFamily: "var(--font-heading)",
						fontSize: "2rem",
						fontWeight: 700,
					}}
				>
					{formatFullDate(selectedDate)}
				</h2>
			</div>

			{/* Toolbar */}
			<div className="reader-toolbar">
				{/* Paper Themes */}
				<div className="paper-themes-row">
					<Palette
						size={14}
						color="var(--text-muted)"
						style={{ margin: "0 4px" }}
					/>
					<button
						onClick={() => onSelectPaperTheme("parchment")}
						className={`paper-btn ${paperTheme === "parchment" ? "active" : ""}`}
					>
						Cream
					</button>
					<button
						onClick={() => onSelectPaperTheme("sepia")}
						className={`paper-btn ${paperTheme === "sepia" ? "active" : ""}`}
					>
						Sepia
					</button>
					<button
						onClick={() => onSelectPaperTheme("midnight")}
						className={`paper-btn ${paperTheme === "midnight" ? "active" : ""}`}
					>
						Slate
					</button>
					<button
						onClick={() => onSelectPaperTheme("oled")}
						className={`paper-btn ${paperTheme === "oled" ? "active" : ""}`}
					>
						OLED
					</button>
				</div>

				{/* Bible Version Switcher */}
				<div className="paper-themes-row">
					<BookText
						size={14}
						color="var(--text-muted)"
						style={{ margin: "0 4px" }}
					/>
					{(["KJV", "WEB"] as BibleVersion[]).map((v) => (
						<button
							key={v}
							onClick={() => onSelectBibleVersion(v)}
							className={`paper-btn ${bibleVersion === v ? "active" : ""}`}
							title={
								v === "KJV"
									? "King James Version (public domain)"
									: "World English Bible (public domain)"
							}
						>
							{v}
						</button>
					))}
				</div>

				{/* Font Style & Size */}
				<div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
					<button
						onClick={() =>
							setFontStyle((prev) => (prev === "serif" ? "sans" : "serif"))
						}
						className="btn-secondary"
						style={{
							padding: "0.35rem 0.65rem",
							textTransform: "uppercase",
							fontSize: "0.75rem",
						}}
					>
						{fontStyle}
					</button>

					<div className="paper-themes-row">
						<Type
							size={14}
							color="var(--text-muted)"
							style={{ margin: "0 4px" }}
						/>
						{(["sm", "md", "lg", "xl"] as ReaderFontSize[]).map((size) => (
							<button
								key={size}
								onClick={() => setFontSize(size)}
								className={`paper-btn ${fontSize === size ? "active" : ""}`}
								style={{ textTransform: "uppercase" }}
							>
								{size}
							</button>
						))}
					</div>
				</div>

				{audio.isSupported && (
					<button
						onClick={audio.togglePlayPause}
						className="btn-secondary"
						style={{
							backgroundColor: audio.isPlaying ? "#f59e0b" : undefined,
							color: audio.isPlaying ? "#ffffff" : undefined,
							fontSize: "0.78rem",
						}}
						title={
							audio.isPlaying
								? "Pause audio reading"
								: "Listen to audio reading"
						}
					>
						{audio.isPlaying ? <VolumeX size={14} /> : <Volume2 size={14} />}
						<span>{audio.isPlaying ? "Pause Audio" : "Listen Now"}</span>
					</button>
				)}
			</div>

			{/* Passage Quick-Jump Tabs (when multiple passages for the day) */}
			{passages.length > 1 && (
				<div className="passage-tabs">
					{passages.map((p, pIdx) => {
						const pRead = isPassageRead
							? isPassageRead(selectedDateStr, pIdx)
							: false;
						const isActive = pIdx === safeIndex;
						return (
							<button
								key={pIdx}
								onClick={() => goToPassage(pIdx)}
								className={`passage-tab-btn ${isActive ? "active" : ""} ${pRead ? "read" : ""}`}
								title={`${p.book} ${p.chapters}${pRead ? " (Read)" : ""}`}
							>
								<span className="passage-tab-num">{pIdx + 1}</span>
								<span className="passage-tab-title">
									{p.book} {p.chapters}
								</span>
								{pRead && <Check size={12} className="passage-tab-check" />}
							</button>
						);
					})}
				</div>
			)}

			{/* Single Passage Article */}
			{currentPassage ? (
				<article className="passage-article">
					{/* Passage Header */}
					<div className="passage-header">
						<div
							style={{
								display: "flex",
								alignItems: "center",
								justifyContent: "space-between",
								width: "100%",
								flexWrap: "wrap",
								gap: "0.5rem",
							}}
						>
							<div
								style={{
									display: "flex",
									alignItems: "center",
									gap: "0.4rem",
									flexWrap: "wrap",
								}}
							>
								<span className="badge-pill">
									{currentPassage.category || "Scripture"}
								</span>
								<span
									className="badge-pill"
									style={{ fontSize: "0.65rem", opacity: 0.75 }}
								>
									{bibleVersion}
								</span>
								{passages.length > 1 && (
									<span
										className="badge-pill"
										style={{ fontSize: "0.68rem", fontWeight: 700 }}
									>
										Passage {safeIndex + 1} of {passages.length}
									</span>
								)}
							</div>

							{/* Mark as Read / Unread toggle */}
							{onTogglePassageRead && (
								<button
									onClick={() => {
										onTogglePassageRead(selectedDateStr, safeIndex);
										showToast(
											isCurrentPassageRead
												? "Passage marked as unread"
												: "Passage marked as read!",
										);
									}}
									className={`btn-mark-read ${isCurrentPassageRead ? "btn-mark-read--completed" : ""}`}
									title={
										isCurrentPassageRead
											? "Click to mark as unread"
											: "Click to mark as read"
									}
								>
									{isCurrentPassageRead ? (
										<>
											<CheckCircle2 size={15} />
											<span>Read</span>
										</>
									) : (
										<>
											<Circle size={15} />
											<span>Mark as Read</span>
										</>
									)}
								</button>
							)}
						</div>
						<h3>
							{currentPassage.book} {currentPassage.chapters}
						</h3>
					</div>

					{/* Enhanced Audio Controls for Current Passage */}
					<AudioPlayerControls
						audio={audio}
						passage={currentPassage}
						bibleVersion={bibleVersion}
					/>

					{/* Verses List */}
					{currentPassage.versesText && currentPassage.versesText.length > 0 ? (
						<div
							className={`verses-list ${fontStyle === "serif" ? "font-scripture" : "font-ui"} ${getFontSizeClass()}`}
						>
							{currentPassage.versesText.map((verse, vIdx) => {
								const verseId = `${safeIndex}-${verse.number}`;
								const isHighlighted = highlightedVerse === verseId;
								const isCopied = copiedVerseId === verseId;
								const isAudioActive =
									audio.currentVerseIndex === vIdx &&
									(audio.isPlaying || audio.isPaused);
								const isThisVerseSpeaking =
									audio.currentVerseIndex === vIdx && audio.isPlaying;
								const refStr = `${currentPassage.book} ${currentPassage.chapters}:${verse.number}`;

								return (
									<p
										key={verse.number}
										id={`verse-${safeIndex}-${verse.number}`}
										onClick={() =>
											setHighlightedVerse(isHighlighted ? null : verseId)
										}
										className={`verse-paragraph ${vIdx === 0 ? "drop-cap" : ""} ${isHighlighted ? "verse-paragraph--highlighted" : ""} ${isAudioActive ? "verse-paragraph--audio-active" : ""}`}
									>
										<sup className="verse-num">{verse.number}</sup>
										<span>{verse.text}</span>

										{/* Verse action buttons */}
										<span className="verse-actions">
											<button
												className={`verse-action-btn ${isThisVerseSpeaking ? "verse-action-btn--audio-active" : ""}`}
												title={
													isThisVerseSpeaking
														? "Pause audio for this verse"
														: "Listen to this verse"
												}
												onClick={(e) => {
													e.stopPropagation();
													if (isThisVerseSpeaking) {
														audio.pause();
													} else {
														audio.skipToVerse(vIdx);
													}
												}}
											>
												{isThisVerseSpeaking ? (
													<Pause size={14} />
												) : (
													<Volume2 size={14} />
												)}
												<span className="verse-action-label">
													{isThisVerseSpeaking ? "Pause" : "Listen"}
												</span>
											</button>
											<button
												className={`verse-action-btn ${isCopied ? "verse-action-btn--copied" : ""}`}
												title="Copy verse"
												onClick={(e) => {
													e.stopPropagation();
													copyVerse(verse.text, refStr, verseId);
												}}
											>
												{isCopied ? <Check size={14} /> : <Copy size={14} />}
												<span className="verse-action-label">
													{isCopied ? "Copied" : "Copy"}
												</span>
											</button>
											<button
												className="verse-action-btn"
												title="Share verse"
												onClick={(e) => {
													e.stopPropagation();
													shareVerse(verse.text, refStr);
												}}
											>
												<Share2 size={14} />
												<span className="verse-action-label">Share</span>
											</button>
										</span>
									</p>
								);
							})}
						</div>
					) : (
						<div
							style={{
								padding: "2rem 0",
								textAlign: "center",
								color: "var(--text-muted)",
								fontStyle: "italic",
							}}
						>
							{isLoadingVerses
								? "Loading scripture text..."
								: `Refer to ${currentPassage.book} ${currentPassage.chapters} in your printed Bible.`}
						</div>
					)}

					{/* Bottom Navigation for Previous / Next Passage */}
					{passages.length > 0 && (
						<div className="passage-bottom-nav">
							<button
								onClick={() => goToPassage(safeIndex - 1)}
								disabled={safeIndex === 0}
								className="btn-secondary passage-nav-btn"
								title={safeIndex === 0 ? "First passage" : "Previous passage"}
								style={{
									opacity: safeIndex === 0 ? 0.45 : 1,
									cursor: safeIndex === 0 ? "not-allowed" : "pointer",
								}}
							>
								<ChevronLeft size={18} />
								<span>Previous Passage</span>
							</button>

							<div className="passage-nav-indicator">
								<span className="passage-nav-current">{safeIndex + 1}</span>
								<span className="passage-nav-sep">/</span>
								<span className="passage-nav-total">{passages.length}</span>
							</div>

							{safeIndex < passages.length - 1 ? (
								<button
									onClick={() => goToPassage(safeIndex + 1)}
									className="btn-primary passage-nav-btn"
									title="Next passage"
								>
									<span>Next Passage</span>
									<ChevronRight size={18} />
								</button>
							) : (
								<button
									onClick={() => {
										audio.stop();
										onNextDay();
									}}
									className="btn-primary passage-nav-btn"
									title="Proceed to next day"
								>
									<span>Next Day</span>
									<ChevronRight size={18} />
								</button>
							)}
						</div>
					)}
				</article>
			) : (
				<div
					className="card-surface"
					style={{
						textAlign: "center",
						padding: "2.5rem 1rem",
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						gap: "0.75rem",
					}}
				>
					<BookOpen size={40} color="var(--accent-gold)" />
					<h3>No Reading Assigned</h3>
					<p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
						There are no assigned passages for {formatFullDate(selectedDate)}.
					</p>
				</div>
			)}

			{/* Copy / Share Success Toast */}
			{toastMessage && (
				<div
					className={`verse-copy-toast ${toastVisible ? "verse-copy-toast--visible" : ""}`}
				>
					<Check size={15} />
					<span>{toastMessage}</span>
				</div>
			)}
		</div>
	);
};
