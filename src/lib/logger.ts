import fs from 'fs';
import path from 'path';

const LOG_FILE = path.join(process.cwd(), 'server_debug.log');

export function logError(context: string, error: any) {
  const timestamp = new Date().toISOString();
  const errorMessage = error instanceof Error ? error.stack || error.message : JSON.stringify(error, null, 2);
  
  const logEntry = `\n[${timestamp}] CONTEXT: ${context}\nERROR: ${errorMessage}\n${'-'.repeat(50)}\n`;
  
  try {
    fs.appendFileSync(LOG_FILE, logEntry);
    console.log(`[Logger] Logged error to ${LOG_FILE}`);
  } catch (err) {
    console.error('[Logger] Failed to write to log file:', err);
  }
}

export function logInfo(context: string, data: any) {
  const timestamp = new Date().toISOString();
  const dataString = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  
  const logEntry = `\n[${timestamp}] INFO: ${context}\nDATA: ${dataString}\n${'-'.repeat(50)}\n`;
  
  try {
    fs.appendFileSync(LOG_FILE, logEntry);
  } catch (err) {
    console.error('[Logger] Failed to write to log file:', err);
  }
}
