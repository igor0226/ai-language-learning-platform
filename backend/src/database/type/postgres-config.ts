export type PostgresConfig = {
	host: string;
	port: number;
	username: string;
	password: string | (() => Promise<string>);
	database: string;
	ssl:
		| false
		| {
				ca: string;
				rejectUnauthorized: true;
		  };
};
