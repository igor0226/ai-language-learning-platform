"use client";

import type { LanguageLevel } from "@llp/contracts";

import { useCallback, useState } from "react";

import { apiUrl } from "@/shared/api";
import { notifyClientError } from "@/shared/lib";

export type UploadVideoInput = {
	title: string;
	file: File;
	sourceLanguage: string;
	explanationLanguage: string;
	languageLevel: LanguageLevel;
};

export function useVideoUpload() {
	const [uploadProgress, setUploadProgress] = useState(0);
	const [isUploading, setIsUploading] = useState(false);

	const uploadVideo = useCallback((input: UploadVideoInput) => {
		const validationError = validateUpload(input);
		if (validationError) {
			return Promise.reject(validationError);
		}

		const formData = new FormData();
		formData.set("title", input.title.trim());
		formData.set("file", input.file);
		formData.set("sourceLanguage", input.sourceLanguage.trim());
		formData.set("explanationLanguage", input.explanationLanguage.trim());
		formData.set("languageLevel", input.languageLevel);

		setIsUploading(true);
		setUploadProgress(0);

		return postUpload(formData, setUploadProgress, setIsUploading);
	}, []);

	return {
		uploadVideo,
		uploadProgress,
		isUploading,
	};
}

function validateUpload(input: UploadVideoInput): Error | null {
	if (!input.file) {
		return new Error("Missing file");
	}
	if (!input.title.trim()) {
		return new Error("Missing title");
	}
	if (!input.sourceLanguage.trim()) {
		return new Error("Missing source language");
	}
	if (!input.explanationLanguage.trim()) {
		return new Error("Missing explanation language");
	}
	if (!input.languageLevel) {
		return new Error("Missing language level");
	}
	return null;
}

function postUpload(
	formData: FormData,
	setUploadProgress: (value: number) => void,
	setIsUploading: (value: boolean) => void,
): Promise<string> {
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		xhr.open("POST", apiUrl("/api/videos/upload"));
		xhr.withCredentials = true;
		xhr.upload.onprogress = (progressEvent) => {
			if (progressEvent.lengthComputable) {
				setUploadProgress((progressEvent.loaded / progressEvent.total) * 100);
			}
		};
		xhr.onerror = () => {
			setIsUploading(false);
			const error = new Error("Upload failed due to a network issue.");
			notifyClientError({ error, id: "video-upload" });
			reject(error);
		};
		xhr.onload = () => {
			setIsUploading(false);
			if (xhr.status < 200 || xhr.status >= 300) {
				const error = new Error(xhr.responseText || "Upload failed.");
				notifyClientError({ error, id: "video-upload" });
				reject(error);
				return;
			}
			const responsePayload = JSON.parse(xhr.responseText) as { id: string };
			setUploadProgress(100);
			resolve(responsePayload.id);
		};
		xhr.send(formData);
	});
}
