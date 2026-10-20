import { minimumRelease } from './config/releaseProfile';
import { validateProductionEnvironment } from './config/production';

export async function initializeBackend(raw: Record<string, string | undefined>, dependencies: {
 connect: () => Promise<unknown>;
 verifyEmail: () => Promise<boolean>;
}) {
 validateProductionEnvironment(raw);
 await dependencies.connect();
 if (raw.NODE_ENV === 'production' && !minimumRelease(raw)) {
  try {
   if (!await dependencies.verifyEmail()) throw new Error();
  } catch { throw new Error('Required SMTP verification failed'); }
 }
}
