import { registerAs } from '@nestjs/config';

export default registerAs('encrypt', () => ({
    key: process.env.ENCRYPTION_KEY,
}));
