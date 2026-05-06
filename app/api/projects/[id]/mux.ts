import Mux from '@mux/mux-node';
import { getRequiredEnv } from '@/lib/env'

export function getMuxClient() {
  return new Mux({
    tokenId: getRequiredEnv('MUX_TOKEN_ID'),
    tokenSecret: getRequiredEnv('MUX_TOKEN_SECRET'),
  });
}
