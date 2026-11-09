import dns from 'node:dns';

import { personalizedTerminal } from '#utils/terminal.util.mjs';


void personalizedTerminal();


const servers = dns.getServers();


if (servers.every(server => server === '127.0.0.1')) {
  dns.setServers([
    '8.8.8.8',
    '1.1.1.1',
  ]);
}

await import('./server.mjs');
