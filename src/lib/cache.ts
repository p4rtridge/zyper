import { LRUCache } from "lru-cache";

const opts = { max: 64, ttl: 1000 * 60 * 10, ttlAutopurge: true };

const cache = new LRUCache(opts);

export default cache;
