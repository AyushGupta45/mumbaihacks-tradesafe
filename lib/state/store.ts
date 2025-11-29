/**
 * Low-level JSON file persistence layer
 * Handles reading/writing state to disk
 */

import fs from 'fs';
import path from 'path';

const STATE_FILE_PATH = path.join(process.cwd(), 'state.json');

/**
 * Ensure the state file exists with default content
 */
function ensureStateFile(defaultState: any): void {
  if (!fs.existsSync(STATE_FILE_PATH)) {
    try {
      fs.writeFileSync(STATE_FILE_PATH, JSON.stringify(defaultState, null, 2), 'utf8');
      console.log('[Store] Created state.json with default state');
    } catch (error) {
      console.error('[Store] Failed to create state file:', error);
      throw error;
    }
  }
}

/**
 * Load state from JSON file
 */
export function loadState<T>(defaultState: T): T {
  try {
    ensureStateFile(defaultState);
    
    const fileContent = fs.readFileSync(STATE_FILE_PATH, 'utf8');
    const parsedState = JSON.parse(fileContent);
    
    // Merge with default state to handle schema changes
    return { ...defaultState, ...parsedState };
  } catch (error) {
    console.error('[Store] Failed to load state, using default:', error);
    return defaultState;
  }
}

/**
 * Save state to JSON file (atomic write)
 */
export function saveState<T>(state: T): void {
  try {
    const tempPath = STATE_FILE_PATH + '.tmp';
    
    // Write to temp file first
    fs.writeFileSync(tempPath, JSON.stringify(state, null, 2), 'utf8');
    
    // Atomic rename
    fs.renameSync(tempPath, STATE_FILE_PATH);
    
    // console.log('[Store] State persisted successfully');
  } catch (error) {
    console.error('[Store] Failed to save state:', error);
    throw error;
  }
}

/**
 * Get state file path (for debugging)
 */
export function getStateFilePath(): string {
  return STATE_FILE_PATH;
}
