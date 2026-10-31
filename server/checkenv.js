require('dotenv').config();
const url = process.env.REDIS_URL || '';
console.log('exists:', url.length > 0);
console.log('length:', url.length);
console.log('starts with rediss://:', url.startsWith('rediss://'));
console.log('starts with redis://:', url.startsWith('redis://'));
console.log('has newline:', /\r|\n/.test(url));
console.log('has quotes:', url.includes('"') || url.includes("'"));