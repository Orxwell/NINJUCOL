/**
 * Mailer importer for configuring a SMTP-transporter.
 * @see {@link https://nodemailer.com/ | Nodemailer Documentation}
 */

// External & Internal libraries
import nodemailer from 'nodemailer';

import importer from '#importers/handler.importer.mjs';


let currentTransport;
let transportPromise;


// -----------SMTP-Transport - BELOW-----------
/**
 * Return a SMTP-Transport.
 * @returns {Promise<import('nodemailer').Transporter>}
 */
export async function transport ({ host, port, secure }={}) {
  // Already using a transport...
  if (currentTransport) return currentTransport;

  // Already creating a transport...
  if (transportPromise) return transportPromise;

  // Creating a transport...
  transportPromise = (async () => {
    try {
      const smtp = nodemailer.createTransport({
        host: host,
        port: port,
        secure: secure,
        auth: {
          user: importer.env.EMAIL_DOMAIN,
          pass: importer.env.EMAIL_KEY,
        },
      });

      await smtp.verify();
  
      console.log('  ~SMTP-Transport successfully verified.~');

      currentTransport = smtp;
  
      return smtp;
  
    } catch (error) {
      // If it fails, then reset
      transportPromise = null;
  
      throw error;
    }
  })();

  return transportPromise;
}
// -----------SMTP-Transport - ABOVE-----------
