import React, { useState, useEffect, useCallback } from "react";
import {
	ArrowLeft,
	ChevronLeft,
	ChevronRight,
	Volume2,
	VolumeX,
	Type,
	Bookmark,
	BookOpen,
	Sparkles,
	Palette,
	BookText,
	Copy,
	Share2,
	Check,
} from "lucide-react";
import type {
	Passage,
	ReaderFontSize,
	PaperTheme,
	FontStyle,
	BibleVersion,
} from "../../types";
import { formatFullDate } from "../../lib/dateUtils";

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
}) => {
	const [fontSize, setFontSize] = useState<ReaderFontSize>("md");
	const [fontStyle, setFontStyle] = useState<FontStyle>("serif");
	const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
	const [speechSupported, setSpeechSupported] = useState<boolean>(false);
	const [highlightedVerse, setHighlightedVerse] = useState<string | null>(null);
	const [copiedVerseId, setCopiedVerseId] = useState<string | null>(null);
	const [toastMessage, setToastMessage] = useState<string | null>(null);
	const [toastVisible, setToastVisible] = useState<boolean>(false);
	const [scrollProgress, setScrollProgress] = useState<number>(0);

	useEffect(() => {
		setSpeechSupported("speechSynthesis" in window);

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
			if ("speechSynthesis" in window) {
				window.speechSynthesis.cancel();
			}
		};
	}, [selectedDate]);

	useEffect(() => {
		if (initialPassageIndex !== undefined && initialPassageIndex > 0) {
			const timer = setTimeout(() => {
				const el = document.getElementById(`passage-${initialPassageIndex}`);
				if (el) {
					el.scrollIntoView({ behavior: "smooth", block: "start" });
				}
			}, 150);
			return () => clearTimeout(timer);
		}
	}, [initialPassageIndex, passages]);

	const toggleSpeech = () => {
		if (!speechSupported) return;

		if (isSpeaking) {
			window.speechSynthesis.cancel();
			setIsSpeaking(false);
			return;
		}

		const fullText = passages
			.map(
				(p) =>
					`${p.book} chapter ${p.chapters}. ${
						p.versesText
							?.map((v) => `Verse ${v.number}: ${v.text}`)
							.join(" ") || ""
					}`,
			)
			.join(". ");

		if (!fullText) return;

		const utterance = new SpeechSynthesisUtterance(fullText);
		utterance.rate = 0.95;
		utterance.pitch = 1.0;
		utterance.onend = () => setIsSpeaking(false);
		utterance.onerror = () => setIsSpeaking(false);

		window.speechSynthesis.speak(utterance);
		setIsSpeaking(true);
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

	/** Share a verse via Web Share API, falling back to clipboard copy */
	const shareVerse = useCallback(
		async (text: string, refStr: string) => {
			const content = `"${text}" — ${refStr}`;
			if (navigator.share) {
				try {
					await navigator.share({ text: content });
				} catch {
					// user cancelled or share failed — silently ignore
				}
			} else {
				// Fallback: copy to clipboard when Web Share is unavailable (e.g. desktop)
				await navigator.clipboard.writeText(content);
				showToast("Verse copied to clipboard!");
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
					onClick={onBackToCalendar}
					className="btn-secondary"
					style={{ padding: "0.4rem 0.85rem", marginBottom: "1rem" }}
				>
					<ArrowLeft size={16} />
					<span>Back to Calendar</span>
				</button>

				<div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
					<button
						onClick={onPrevDay}
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
						onClick={onNextDay}
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

				{speechSupported && (
					<button
						onClick={toggleSpeech}
						className="btn-secondary"
						style={{
							backgroundColor: isSpeaking ? "#f59e0b" : undefined,
							color: isSpeaking ? "#ffffff" : undefined,
							fontSize: "0.78rem",
						}}
					>
						{isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
						<span>{isSpeaking ? "Pause Audio" : "Listen Now"}</span>
					</button>
				)}
			</div>

			{/* Passages List */}
			{passages.length > 0 ? (
				<div
					style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
				>
					{passages.map((passage, pIdx) => (
						<article
							key={pIdx}
							id={`passage-${pIdx}`}
							className="passage-article"
						>
							<div className="passage-header">
								<div
									style={{
										display: "flex",
										alignItems: "center",
										justifyContent: "space-between",
										width: "100%",
									}}
								>
									<div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
										<span className="badge-pill">
											{passage.category || "Scripture"}
										</span>
										<span
											className="badge-pill"
											style={{ fontSize: "0.65rem", opacity: 0.75 }}
										>
											{bibleVersion}
										</span>
									</div>
									<Bookmark
										size={16}
										color="var(--accent-gold)"
										style={{ marginLeft: "auto" }}
									/>
								</div>
								<h3>
									{passage.book} {passage.chapters}
								</h3>
							</div>

							{passage.versesText && passage.versesText.length > 0 ? (
								<div
									className={`verses-list ${fontStyle === "serif" ? "font-scripture" : "font-ui"} ${getFontSizeClass()}`}
								>
									{passage.versesText.map((verse, vIdx) => {
										const verseId = `${pIdx}-${verse.number}`;
										const isHighlighted = highlightedVerse === verseId;
										const isCopied = copiedVerseId === verseId;
										const refStr = `${passage.book} ${passage.chapters}:${verse.number}`;

										return (
											<p
												key={verse.number}
												onClick={() =>
													setHighlightedVerse(isHighlighted ? null : verseId)
												}
												className={`verse-paragraph ${vIdx === 0 ? "drop-cap" : ""} ${isHighlighted ? "verse-paragraph--highlighted" : ""}`}
											>
												<sup className="verse-num">{verse.number}</sup>
												<span>{verse.text}</span>

												{/* Verse action buttons — revealed on hover via CSS */}
												<span className="verse-actions">
													<button
														className={`verse-action-btn ${isCopied ? "verse-action-btn--copied" : ""}`}
														title="Copy verse"
														onClick={(e) => {
															e.stopPropagation();
															copyVerse(verse.text, refStr, verseId);
														}}
													>
														{isCopied ? <Check size={13} /> : <Copy size={13} />}
													</button>
													<button
														className="verse-action-btn"
														title="Share verse"
														onClick={(e) => {
															e.stopPropagation();
															shareVerse(verse.text, refStr);
														}}
													>
														<Share2 size={13} />
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
										: `Refer to ${passage.book} ${passage.chapters} in your printed Bible.`}
								</div>
							)}
						</article>
					))}
				</div>
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

			{/* Copy / Share Success Toast — fixed bottom center */}
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
