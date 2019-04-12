import * as keytar from 'keytar';

const SERVICE_NAME: string = 'VisualGit';
const ACCOUNT_NAME: string = 'GitHub';

function storeCredentials(username: string, password: string): void {
  keytar.setPassword(SERVICE_NAME, ACCOUNT_NAME, JSON.stringify({
    username: username,
    password: password,
  }));
}

async function readCredentials(): Promise<{ username: string, password: string } | null> {
  const storedCredentials = await keytar.getPassword(SERVICE_NAME, ACCOUNT_NAME);
  if (storedCredentials) {
    const parsed = JSON.parse(storedCredentials);
    return parsed || { username: '', password: '' };
  } else {
    return null;
  }
}

// this should be used to clear credentials (refer to index.js)
function clearCredentials(): void {
  keytar.deletePassword(SERVICE_NAME, ACCOUNT_NAME);
}

export { clearCredentials };
