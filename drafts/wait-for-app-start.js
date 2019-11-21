'use strict';

const http = require('http');

// e.g. http://127.0.0.1:1337
const protHostPort = process.argv[2];

const periodToCheckAppMs = 2000;
const defaultTimeoutMs = 1000 * 60 * 3;

async function waitForAppStart(
  periodMs = periodToCheckAppMs,
  timeoutMs = defaultTimeoutMs
) {
  return new Promise((resolve, reject) => {
    let intervalId;

    const timeoutId = setTimeout(() => {
      clearInterval(intervalId);
      return reject(
        new Error(
          `waitForAppStart: Application did not start for required timeout (${timeoutMs}).`
        )
      );
    }, timeoutMs);

    intervalId = setInterval(() => {
      const req = http.request(`${protHostPort}/login`, (response) => {
        if (response.statusCode === 200) {
          console.log('Application started.');
          resolve(true);
          clearInterval(intervalId);
          clearTimeout(timeoutId);
        } else {
          console.log('Wait.');
        }
      });

      req.on('error', (err) => {
        console.log(`Error: ${err}`);
      });
      req.end();
    }, periodMs);
  });
}

waitForAppStart();
