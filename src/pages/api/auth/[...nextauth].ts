import NextAuth from "next-auth";
import {User, users} from "@/database";
import crypto from "node:crypto";
import CredentialsProvider from "next-auth/providers/credentials";

export const authConfig = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Имя пользователя", type: "text" },
                password: { label: "Пароль", type: "password" },
            },
            async authorize(credentials) {
                const hash = crypto.createHash('sha256');
                if (credentials === undefined) return null;
                let user = users.find((user: User) => user.username === credentials.username)
                if (user === undefined) return null;
                hash.update(credentials.password);
                if (user.password !== hash.digest("hex")) return null;
                return {id: user.username}
            }
        })
    ]
};

export default NextAuth(authConfig);
