import { personalPlatformUser, json } from '../route-helpers';
import { readLiveSummary } from '@/server/personal-platform-live';

export async function GET(request: Request): Promise<Response> {
  const user = await personalPlatformUser(request);
  if (user instanceof Response) return user;
  return json(await readLiveSummary(user));
}
