import {NextApiRequest, NextApiResponse} from "next";
import {User, users, corpus as corp_data, Corpus, privateKey} from "@/database";
import {getToken} from "next-auth/jwt";
import {create_msg, send_msg} from "@/utils";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST' && req.method !== 'GET') {
        res.status(405).json({error: 'Method Not Allowed'});
        return;
    }
    const token = await getToken({req});
    const {hostname} = req.query;
    const {command, other_data} = req.body;
    if (!token) {
        res.status(401).json({error: 'Unauthorized'});
        return;
    }
    if (!hostname || !command) {
        res.status(400).json({error: 'Bad Request'});
        return;
    }

    let corpus: string;
    let cabinet: string | null = null;
    let computer: string | null = null
    switch (hostname.length) {
        case 1:
            corpus = hostname[0];
            break;
        case 2:
            corpus = hostname[0];
            cabinet = hostname[1];
            break;
        case 3:
            corpus = hostname[0];
            cabinet = hostname[1];
            computer = hostname[2];
            break;
        default:
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
            doMagic(corpus, cabinet, computer, command, other_data, req, res);
            break;

        case 'teacher':
            if (user.access.hasOwnProperty(corpus)) {
                if (user.access[corpus].broadcast) {
                    doMagic(corpus, cabinet, computer, command, other_data, req, res);
                    break;
                } else if (!cabinet) {
                    res.status(403).json({error: 'Forbidden'});
                    break;
                }

                if (user.access[corpus].cabinets.hasOwnProperty(cabinet)) {
                    if (user.access[corpus].cabinets[cabinet].broadcast) {
                        doMagic(corpus, cabinet, computer, command, other_data, req, res);
                        break;
                    } else if (!computer) {
                        res.status(403).json({error: 'Forbidden'});
                        break;
                    }

                    if (user.access[corpus].cabinets[cabinet].computers.includes(computer)) {
                        doMagic(corpus, cabinet, computer, command, other_data, req, res);
                        break;
                    }
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

function doMagic(corpus: string, cabinet: string | null, computer: string | null, command: string, other_data: string | null, req: NextApiRequest, res: NextApiResponse) {
    const corp = corp_data.find((corp: Corpus) => corp.name === corpus);
    if (!corp) {
        res.status(400).json({error: 'Bad Request'});
        return;
    }

    if (cabinet && !corp.cabinets.hasOwnProperty(cabinet)) {
        res.status(400).json({error: 'Bad Request'});
        return;
    } else if (cabinet) {
        if (computer && !corp.cabinets[cabinet].includes(computer)) {
            res.status(400).json({error: 'Bad Request'});
            return;
        }
    }

    let hostname = corpus;
    if (cabinet) {
        hostname += `-${cabinet}`;
        if (computer) {
            hostname += `-${computer}`;
        }
    }

    const message = create_msg(command, hostname, other_data ? other_data:"", privateKey);

    send_msg(message, corp);

    res.status(200).json({do: 'Magic'});
    return "Magic";
}