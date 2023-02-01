import {NextApiRequest, NextApiResponse} from "next";
import {getToken} from "next-auth/jwt";
import {Corpus, corpus as corp_data, User, users} from "@/database";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const {corpus, cabinet} = req.body;

    if (req.method !== 'POST') {
        res.status(405).json({error: 'Method Not Allowed'});
        return;
    }

    const token = await getToken({req});
    if (!token) {
        res.status(401).json({error: 'Unauthorized'});
        return;
    }
    if (!corpus || !cabinet) {
        res.status(400).json({error: 'Bad Request'});
        return;
    }

    const user = users.find((user: User) => user.username === token.sub);
    if (!user) {
        res.status(401).json({error: 'Unauthorized'});
        return;
    }

    switch (user.role) {
        case 'admin':
            doMagic(corpus, cabinet, req, res);
            break;

        case 'teacher':
            if (user.access.hasOwnProperty(corpus)) {
                if (user.access[corpus].broadcast) {
                    doMagic(corpus, cabinet, req, res);
                    break;
                }

                if (user.access[corpus].cabinets.hasOwnProperty(cabinet)) {
                    doMagic(corpus, cabinet, req, res);
                    break;
                }
            }
            res.status(403).json({error: 'Forbidden'});
            break;
        default:
            res.status(403).json({error: 'Forbidden'});
            break;
    }

    return;
}

function doMagic(corpus: string, cabinet: string, req: NextApiRequest, res: NextApiResponse) {
    const corp = corp_data.find((corp: Corpus) => corp.name === corpus);
    if (!corp) {
        res.status(400).json({error: 'Bad Request'});
        return;
    }

    if (!corp.cabinets.hasOwnProperty(cabinet)) {
        res.status(400).json({error: 'Bad Request'});
        return;
    }

    res.status(200).json({computers: corp.cabinets[cabinet]});
    return;
}
