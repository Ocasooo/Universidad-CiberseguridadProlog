export async function readTextFile(path: string): Promise<string> {
  try {
    const { readTextFile: tauriRead } = await import('@tauri-apps/plugin-fs');
    return await tauriRead(path);
  } catch {
    throw new Error('Failed to read file. Tauri API not available.');
  }
}

export async function writeTextFile(path: string, contents: string): Promise<void> {
  try {
    const { writeTextFile: tauriWrite } = await import('@tauri-apps/plugin-fs');
    await tauriWrite(path, contents);
  } catch {
    throw new Error('Failed to write file. Tauri API not available.');
  }
}

export async function openFileDialog(): Promise<string | null> {
  try {
    const { open } = await import('@tauri-apps/plugin-dialog');
    const result = await open({
      multiple: false,
      filters: [{ name: 'CSV Files', extensions: ['csv'] }],
    });
    return result as string | null;
  } catch {
    throw new Error('Failed to open file dialog. Tauri API not available.');
  }
}

export async function saveFileDialog(contents: string, defaultName: string): Promise<boolean> {
  try {
    const { save } = await import('@tauri-apps/plugin-dialog');
    const { writeTextFile: tauriWrite } = await import('@tauri-apps/plugin-fs');
    const path = await save({
      filters: [
        { name: 'Text Files', extensions: ['txt'] },
        { name: 'CSV Files', extensions: ['csv'] },
        { name: 'All Files', extensions: ['*'] },
      ],
      defaultPath: defaultName,
    });
    if (path) {
      await tauriWrite(path, contents);
      return true;
    }
    return false;
  } catch {
    throw new Error('Failed to save file. Tauri API not available.');
  }
}

export function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}
