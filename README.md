# Simple IMAP Notification Script

This is a very basic script in Node.js that connects to a IMAP server and keeps checking for new emails.

When a new email is received, it sends a notification to the console with the email subject.

During first execution, it will also notify of all existing unread emails in the invoice.

It is pre-configured with Gmail IMAP server, SSL enabled and port 993, but it can be changed in the script.

## Usage

1. Install requirements
```
npm install
```
2. Define environment variables with IMAP login credentials. For example (in Unix shell): 
```
export EMAIL=ivanrdgc@gmail.com
export PASSWORD=xxx
```
3. Execute the script in Node.js
```
node notifier.js
```
