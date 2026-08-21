import { json, liveReadError, personalPlatformUser } from '../route-helpers';
import { parseLiveReadQuery, readLiveRecords } from '@/server/personal-platform-live';

export async function GET(request: Request): Promise<Response> {
  const user = await personalPlatformUser(request);
  if (user instanceof Response) return user;
  try {
    return json(await readLiveRecords(user, parseLiveReadQuery(new URL(request.url))));
  } catch (error) {
    return liveReadError(error);
  }
}
