"use client";

import type { CallTopic } from "@/entities/speaking-session";

import {
	Check,
	ChevronLeft,
	ChevronRight,
	Pencil,
	Plus,
	Trash2,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/shared/ui/button";

type TopicGridProps = {
	topics: CallTopic[];
	selectedTopicId: string;
	onTopicSelect: (id: string) => void;
	onAddTopic: () => void;
	onEditTopic: (topic: CallTopic) => void;
	onDeleteTopic: (id: string) => void;
};

export function TopicGrid({
	topics,
	selectedTopicId,
	onTopicSelect,
	onAddTopic,
	onEditTopic,
	onDeleteTopic,
}: TopicGridProps) {
	const carouselRef = useRef<HTMLDivElement>(null);
	const [canScrollLeft, setCanScrollLeft] = useState(false);
	const [canScrollRight, setCanScrollRight] = useState(true);
	const [deletingTopicId, setDeletingTopicId] = useState<string | null>(null);

	const checkScroll = useCallback(() => {
		const node = carouselRef.current;
		if (!node) {
			return;
		}
		const { scrollLeft, scrollWidth, clientWidth } = node;
		setCanScrollLeft(scrollLeft > 4);
		setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
	}, []);

	useEffect(() => {
		checkScroll();
		const node = carouselRef.current;
		if (!node) {
			return;
		}
		node.addEventListener("scroll", checkScroll, { passive: true });
		window.addEventListener("resize", checkScroll);
		return () => {
			node.removeEventListener("scroll", checkScroll);
			window.removeEventListener("resize", checkScroll);
		};
	}, [topics, checkScroll]);

	const handleScrollCarousel = (direction: "left" | "right") => {
		const node = carouselRef.current;
		if (!node) {
			return;
		}
		const scrollAmount = node.clientWidth * 0.75;
		node.scrollBy({
			left: direction === "left" ? -scrollAmount : scrollAmount,
			behavior: "smooth",
		});
	};

	return (
		<div className="space-y-3">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<div className="flex items-center gap-2">
					<p className="text-xs font-semibold uppercase tracking-wider">
						Select practice scenario
					</p>
					<span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
						{topics.length} available
					</span>
				</div>
				<div className="flex items-center gap-1.5">
					<Button
						type="button"
						variant="outline"
						size="icon"
						className="h-7 w-7"
						disabled={!canScrollLeft}
						onClick={() => handleScrollCarousel("left")}
						aria-label="Scroll topics left"
					>
						<ChevronLeft className="h-4 w-4" />
					</Button>
					<Button
						type="button"
						variant="outline"
						size="icon"
						className="h-7 w-7"
						disabled={!canScrollRight}
						onClick={() => handleScrollCarousel("right")}
						aria-label="Scroll topics right"
					>
						<ChevronRight className="h-4 w-4" />
					</Button>
					<Button type="button" size="sm" onClick={onAddTopic}>
						<Plus className="mr-1 h-3.5 w-3.5" />
						New topic
					</Button>
				</div>
			</div>

			<div ref={carouselRef} className="topicCarousel">
				{topics.map((topic) => {
					const isSelected = topic.id === selectedTopicId;
					const isDeleting = deletingTopicId === topic.id;
					return (
						<div
							key={topic.id}
							className={`topicCarouselCard ${isSelected ? "topicCarouselCardSelected" : ""}`}
						>
							<div>
								<div className="mb-2 flex items-center justify-between gap-1">
									<div className="flex items-center gap-1.5">
										<span className="rounded-sm bg-muted px-1.5 py-0.5 font-mono text-[11px]">
											{topic.level}
										</span>
										{topic.isCustom ? (
											<span className="rounded-sm border border-border bg-muted px-1.5 py-0.5 text-[10px] font-semibold">
												Custom
											</span>
										) : null}
									</div>
									<div className="flex items-center gap-0.5">
										<span className="font-mono text-[11px] text-muted-foreground">
											{topic.suggestedDurationMins}m
										</span>
										<Button
											type="button"
											variant="ghost"
											size="icon"
											className="h-7 w-7"
											onClick={(event) => {
												event.stopPropagation();
												onEditTopic(topic);
											}}
											aria-label={`Edit topic ${topic.title}`}
										>
											<Pencil className="h-3.5 w-3.5" />
										</Button>
										{topic.isCustom ? (
											<Button
												type="button"
												variant="ghost"
												size="icon"
												className="h-7 w-7 hover:text-destructive"
												onClick={(event) => {
													event.stopPropagation();
													setDeletingTopicId(isDeleting ? null : topic.id);
												}}
												aria-label={`Delete topic ${topic.title}`}
											>
												<Trash2 className="h-3.5 w-3.5" />
											</Button>
										) : null}
									</div>
								</div>

								{isDeleting ? (
									<div className="mb-2 flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 p-2 text-xs">
										<span>Delete topic?</span>
										<div className="flex gap-1">
											<Button
												type="button"
												variant="ghost"
												size="sm"
												onClick={(event) => {
													event.stopPropagation();
													setDeletingTopicId(null);
												}}
											>
												Cancel
											</Button>
											<Button
												type="button"
												variant="destructive"
												size="sm"
												onClick={(event) => {
													event.stopPropagation();
													onDeleteTopic(topic.id);
													setDeletingTopicId(null);
												}}
											>
												Delete
											</Button>
										</div>
									</div>
								) : null}

								<button
									type="button"
									className="w-full text-left"
									onClick={() => onTopicSelect(topic.id)}
								>
									<h3 className="line-clamp-2 text-xs font-bold">
										{topic.title}
									</h3>
									<p className="mt-1.5 line-clamp-2 text-[11px] text-muted-foreground">
										{topic.description}
									</p>
								</button>
							</div>

							{isSelected ? (
								<div className="flex justify-end border-t border-border pt-2">
									<span className="flex items-center gap-0.5 text-[10px] font-bold">
										<Check className="h-3 w-3" />
										Active
									</span>
								</div>
							) : null}
						</div>
					);
				})}

				<button type="button" className="topicCarouselAdd" onClick={onAddTopic}>
					<Plus className="mb-2 h-6 w-6 text-muted-foreground" />
					<span className="text-xs font-semibold">Add custom topic</span>
				</button>
			</div>
		</div>
	);
}
