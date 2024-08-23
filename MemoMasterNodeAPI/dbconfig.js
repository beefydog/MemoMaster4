import dotenv from 'dotenv';
import sql from 'mssql';

// Determine the appropriate .env file based on NODE_ENV
const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
dotenv.config({ path: envFile });

// Configuration object
const config = {
    user: process.env.DB_USER || 'default_user',
    password: process.env.DB_PASSWORD || 'default_password',
    server: process.env.DB_SERVER || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 1433,
    database: process.env.DB_NAME || 'default_database',
    options: {
        encrypt: true, // For Azure users
        trustServerCertificate: true, // For local dev environments
    }
};

// Connect to the database
const poolPromise = sql.connect(config)
    .then(pool => {
        console.log(`Connected to SQL Server database ${config.database} on server ${config.server}`);
        return pool;
    })
    .catch(err => console.error('Database Connection Failed!', err));

export { sql, poolPromise };
