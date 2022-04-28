import { Connection, createConnection, getConnectionOptions } from "typeorm";

interface IOptions {
  host: string;
}

getConnectionOptions().then(options => {
  const newOptions = options as IOptions;
  newOptions.host = "localhost";
  createConnection({
    ...options,
    synchronize: false
  });
});

export default async(host = "localhost"): Promise<Connection> => {
  const defaultOptions = await getConnectionOptions();

  Object.assign(defaultOptions, {
    host: process.env.NODE_ENV === "test" ? "localhost" : host,
    database: process.env.NODE_ENV === "test" ? "fin_api_test" : defaultOptions.database
  })

  return createConnection(defaultOptions);
}
