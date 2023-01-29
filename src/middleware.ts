export { default } from "next-auth/middleware";

export const config = {
    matcher: ['/((?!api/socket|_next/static|_next/image|favicon.ico).*)']
}