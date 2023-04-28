const Imap = require('imap');
const { simpleParser } = require('mailparser');

// Your email credentials
const EMAIL = process.env.EMAIL;
const PASSWORD = process.env.PASSWORD;

// IMAP server and port
const IMAP_SERVER = 'imap.gmail.com';
const IMAP_PORT = 993;

const imap = new Imap({
    user: EMAIL,
    password: PASSWORD,
    host: IMAP_SERVER,
    port: IMAP_PORT,
    tls: true,
    tlsOptions: {
        rejectUnauthorized: false
    }
});

let seenEmails = {}; // Dictionary to store seen email UIDs

function openInbox(callback) {
    imap.openBox('INBOX', false, callback);
}

function processEmail(rawEmail, uid) {
    if (seenEmails[uid]) {
        return;
    }

    seenEmails[uid] = true;

    simpleParser(rawEmail)
        .then(parsedEmail => {
            console.log('New Email: ', parsedEmail.subject);
        })
        .catch(err => {
            console.error('Error parsing email:', err);
        });
}

function fetchUnseenEmails() {
    imap.search(['UNSEEN'], (err, results) => {
        if (err) {
            console.error('Error searching for unseen emails:', err);
            return;
        }

        if (!results.length) {
            console.log('No new emails');
            return;
        }

        const fetch = imap.fetch(results, { bodies: ['HEADER.FIELDS (SUBJECT)'], struct: true });

        fetch.on('message', (msg, seqno) => {
            let rawEmail = '';
            let uid;

            msg.on('attributes', attrs => {
                uid = attrs.uid;
            });

            msg.on('body', (stream, info) => {
                stream.on('data', chunk => {
                    rawEmail += chunk.toString('utf8');
                });
            });

            msg.on('end', () => {
                processEmail(rawEmail, uid);
            });
        });

        fetch.on('error', err => {
            console.error('Error fetching emails:', err);
        });

        fetch.on('end', () => {
            //console.log('Finished fetching emails');
            imap.once('idle', () => {
                fetchUnseenEmails();
            });
        });
    });
}

imap.on('ready', () => {
    openInbox((err, box) => {
        if (err) {
            console.error('Error opening inbox:', err);
            return;
        }

        fetchUnseenEmails();

        imap.on('mail', mail => {
            fetchUnseenEmails();
        });
    });
});

imap.on('error', err => {
    console.error('IMAP error:', err);
});

imap.on('end', () => {
    console.log('IMAP connection ended');
});

imap.connect();
