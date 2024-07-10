import { DataSource } from 'typeorm';
import { config } from 'dotenv';
config({
    path:
        process.env.NODE_ENV == 'production'
            ? __dirname + '/../../.env.production'
            : process.env.NODE_ENV == 'development'
                ? __dirname + '/../../.env.development'
                : __dirname + '/../../.env.test'
});

export default new DataSource({
    type: 'postgres',
    host: process.env.POSTGRES_HOST ,
    port: parseInt(process.env.POSTGRES_PORT),
    username: process.env.POSTGRES_USERNAME ,
    password: process.env.POSTGRES_PASSWORD ,
    database: process.env.POSTGRES_DATABASE ,
    entities: ['src/**/*.entity{.ts,.js}'],
    migrations: ['src/database/migrations/*.ts'],
    migrationsTableName: 'migrations',
    synchronize:false,
});