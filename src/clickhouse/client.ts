import {createClient} from "@clickhouse/client";

export const clickHouseClient = createClient({
    host: process.env["NOOBGAM_CLICKHOUSE_HOST"],
    username: process.env["NOOBGAM_CLICKHOUSE_USERNAME"],
    password: process.env["NOOBGAM_CLICKHOUSE_PASSWORD"],
})
