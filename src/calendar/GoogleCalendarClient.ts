import { google, Auth, calendar_v3 } from 'googleapis';
import { authenticate } from '@google-cloud/local-auth';
import { Credentials } from 'google-auth-library';
import * as path from 'path';
import * as fs from 'fs/promises';
import {constants} from "node:fs"; // Import fs.promises for async file operations

// https://developers.google.com/calendar/api/v3/reference/events/list
export class GoogleCalendarClient {
    private oauth2ClientSecretFile: string;
    private scopes: string[];
    private auth: Auth.OAuth2Client | null = null;
    private calendarService: calendar_v3.Calendar | null = null;
    private tokenFilePath: string;

    constructor(clientSecretFile: string, scopes: string[], tokenFilePath: string = './calendarToken.json') {
        this.oauth2ClientSecretFile = path.resolve(clientSecretFile);
        this.scopes = scopes;
        this.tokenFilePath = path.resolve(tokenFilePath);
    }

    private async storeCredentials(credentials: Credentials): Promise<void> {
        await fs.writeFile(this.tokenFilePath, JSON.stringify(credentials));
        console.log('Credentials stored to', this.tokenFilePath);
    }

    private async loadCredentials(): Promise<Credentials | null> {
        try {
            // Check if the file exists and is accessible
            await fs.access(this.tokenFilePath, constants.F_OK);
            const content = await fs.readFile(this.tokenFilePath, 'utf-8');
            const credentials = JSON.parse(content) as Credentials;
            console.log('Credentials loaded from', this.tokenFilePath);
            return credentials;
        } catch (err) {
            console.log('Error loading credentials from', this.tokenFilePath, err);
            return null;
        }
    }

    private async loadClientSecrets(): Promise<{ client_id: string, client_secret: string }> {
        try {
            const content = await fs.readFile(this.oauth2ClientSecretFile, 'utf-8');
            const keys = JSON.parse(content);
            const key = keys.installed || keys.web;
            if (!key) {
                throw new Error('Invalid client secret file. \'installed\' or \'web\' key not found.');
            }
            if (!key.client_id || !key.client_secret) {
                throw new Error('Invalid client secret file. \'client_id\' or \'client_secret\' not found.');
            }

            return { client_id: key.client_id, client_secret: key.client_secret };
        } catch (err) {
            console.error('Error loading client secrets', err);
            throw new Error('Failed to load client secrets.');
        }
    }

    public async authorize(): Promise<void> {
        const storedCredentials = await this.loadCredentials();

        if (storedCredentials) {

            const { client_id, client_secret } = await this.loadClientSecrets();
            const auth = new google.auth.OAuth2(
                client_id,
                client_secret
            );
            auth.setCredentials(storedCredentials);
            this.auth = auth;
            this.calendarService = google.calendar({ version: 'v3', auth: this.auth });
            console.log("Google Calendar client authorized using stored credentials.");
            return;
        }

        this.auth = await authenticate({
            keyfilePath: this.oauth2ClientSecretFile,
            scopes: this.scopes,
        });
        this.calendarService = google.calendar({ version: 'v3', auth: this.auth });
        console.log("Google Calendar client authorized.");

        if (this.auth.credentials) {
            await this.storeCredentials(this.auth.credentials);
        }
        this.auth.on('tokens', async (tokens) => {
            console.log('New tokens received', tokens);
            await this.storeCredentials(tokens);
        });
    }

    public async listEvents(params: { from?: string; to?: string }): Promise<calendar_v3.Schema$Event[]> {
        if (!this.calendarService) {
            await this.authorize();
        }
        if (!this.calendarService) {
            throw new Error('Unauthorized.');
        }

        const response = await this.calendarService.events.list({
            timeMin: params.from,
            timeMax: params.to,
            singleEvents: true,
            orderBy: "startTime",
            calendarId: 'primary'
        });

        return response.data.items || [];
    }
}
