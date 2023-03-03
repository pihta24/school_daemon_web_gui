import {NextApiRequest, NextApiResponse} from "next";
import {getToken} from "next-auth/jwt";
import {Corpus, corpus as corp_data, User, users} from "@/database";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.status(405).json({error: 'Method Not Allowed'});
        return;
    }

    const token = await getToken({req});
    if (!token) {
        res.status(401).json({error: 'Unauthorized'});
        return;
    }

    const user = users.find((user: User) => user.username === token.sub);
    if (!user) {
        res.status(401).json({error: 'Unauthorized'});
        return;
    }

    switch (user.role) {
        case 'admin':
            const corp = corp_data.map((value: Corpus) => [value.rus_name, value.name])
            res.status(200).json({corpusa: corp});
            break;
        case 'teacher':
            res.status(200).json({corpusa:
                    Object
                        .keys(user.access)
                        .map((value: string) =>
                            {
                                const corp = corp_data
                                .find(
                                    (corp: Corpus) => corp.name == value
                                )
                                return [corp?.rus_name, corp?.name]

                            }
                        )
            });
            break;
        default:
            res.status(403).json({error: 'Forbidden'});
            break;
    }

    return;
}