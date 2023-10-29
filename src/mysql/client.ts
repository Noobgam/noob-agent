import mysql from 'mysql2';
import {Connection} from "mysql2/promise";

export const connectionPool = mysql.createPool({
    host: 'monorepo.noobgam.com',
    port: 3306,
    user: 'noobgam',
    password: process.env["NOOBGAM_MYSQL_PASSWORD"],
    database: 'noobgam_personal',

    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10,
    idleTimeout: 60000,
    queueLimit: 0
});


async function getConnection() {
    return await connectionPool.promise().getConnection();
}

export async function withConnection<T>(callable: (connection: Connection) => Promise<T>) {
    const conn = await getConnection();
    try {
        return await callable(conn);
    } finally {
        conn.release();
    }
}

