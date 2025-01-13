import express, {Express, Request, Response} from "express";
import {GoogleCalendarClient} from "../calendar/GoogleCalendarClient";
import {getGlobalLog} from "../config";
import {createValidationMiddleware, getEventsSchema} from "./apiSchema";

const clientSecretFile = process.env['NOOB_AGENT_CLIENT_SECRETS_FILE'];

export const apiApp: Express = express();
apiApp.use(express.json());
const port = parseInt(process.env["API_APP_PORT"] || "3000");

if (clientSecretFile) {
    const googleCalendarScopes = [
        'https://www.googleapis.com/auth/calendar.calendarlist.readonly',
        'https://www.googleapis.com/auth/calendar.events.readonly',
    ];
    const googleCalendarClient = new GoogleCalendarClient(clientSecretFile, googleCalendarScopes);

    const validateGetEventsInput = createValidationMiddleware(getEventsSchema);

    // Updated endpoint with reusable validation middleware
    apiApp.post('/calendar/getEvents', validateGetEventsInput, async (req: Request, res: Response) => {
        try {
            const { from, to } = req.body;

            // Use the parsed `from` and `to` values here
            const events = await googleCalendarClient.listEvents({ from, to });
            res.json(events);
        } catch (error) {
            console.error('Error fetching events:', error);
            res.status(500).send('Failed to fetch events.');
        }
    });

    apiApp.get('/calendar/getEvents', async (_: Request, res: Response) => {
        try {
            const events = await googleCalendarClient.listEvents({});
            res.json(events);
        } catch (error) {
            console.error('Error fetching events:', error);
            res.status(500).send('Failed to fetch events.');
        }
    });
} else {
    getGlobalLog().warn("Calendar apis will be disabled due to a lack of secret file")
}
apiApp.listen(port, () => {
    console.log(`Express server listening at http://localhost:${port}`);
});

