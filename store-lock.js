import fs from 'fs';
import path from 'path';

function lockPayload() {
  return JSON.stringify({
    pid: process.pid,
    startedAt: new Date().toISOString(),
  });
}

export function readStoreLock(storeDir) {
  const lockPath = path.join(storeDir, 'LOCK');
  try {
    const raw = fs.readFileSync(lockPath, 'utf8');
    return {
      exists: true,
      path: lockPath,
      info: raw.trim(),
    };
  } catch (error) {
    if (error.code === 'ENOENT') {
      return { exists: false, path: lockPath, info: null };
    }
    throw error;
  }
}

export function acquireStoreLock(storeDir) {
  const lockPath = path.join(storeDir, 'LOCK');
  fs.mkdirSync(storeDir, { recursive: true });

  try {
    const fd = fs.openSync(lockPath, 'wx');
    fs.writeFileSync(fd, lockPayload());
    fs.closeSync(fd);
  } catch (error) {
    if (error.code === 'EEXIST') {
      const info = readStoreLock(storeDir);
      const details = info.info ? ` (${info.info})` : '';
      throw new Error(`Store is locked by another process${details}`);
    }
    throw error;
  }

  let released = false;
  return () => {
    if (released) {
      return;
    }
    released = true;
    try {
      fs.unlinkSync(lockPath);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  };
}
