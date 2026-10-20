export type PostgresConfig = {
	host: string;
	port: number;
	username: string;
	password: string;
	database: string;
	ssl:
		| false
		| {
				ca: string;
				rejectUnauthorized: true;
		  };
};
