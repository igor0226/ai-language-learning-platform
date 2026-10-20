export type S3Config = {
	endpoint: string | undefined;
	region: string;
	bucket: string;
	credentials?: {
		accessKeyId: string;
		secretAccessKey: string;
		sessionToken?: string;
	};
	forcePathStyle: boolean;
};
