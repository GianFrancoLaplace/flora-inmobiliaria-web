import NextAuth from 'next-auth';
import type { User as NextAuthUser } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { z } from 'zod';
import type { User as AppUser } from '@/types/user.types';
import bcrypt from 'bcryptjs';
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!);

async function getUser(email: string): Promise<AppUser | undefined> {
    try {
        const users = await sql<AppUser[]>`SELECT * FROM admin WHERE admin_email=${email}`;
        return users[0];
    } catch (error) {
        console.error('Failed to fetch user:', error);
        throw new Error('Failed to fetch user.');
    }
}

export const { auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            async authorize(credentials): Promise<NextAuthUser | null> {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (!parsedCredentials.success) {
                    return null;
                }

                const { email, password: inputPassword } = parsedCredentials.data;

                const userFromDb = await getUser(email);

                if (!userFromDb) {
                    return null;
                }

                const passwordsMatch = await bcrypt.compare(inputPassword, userFromDb.admin_password);

                if (passwordsMatch) {
                    return {
                        id: userFromDb.id_admin.toString(),
                        email: userFromDb.admin_email,
                    };
                }
                return null;
            },
        }),
    ],
});