import {Server} from 'socket.io';
import {NextApiRequest, NextApiResponse} from 'next';
import type {Server as HTTPServer} from 'http'
import type {Socket as NetSocket} from 'net'
import type {Server as IOServer} from 'socket.io'
import {corpus as corp_storage, privateKey} from "@/database";
import {SocketId} from "socket.io-adapter";
import {create_msg, send_msg} from "@/utils";
import {AddressInfo} from "net";

interface SocketServer extends HTTPServer {
    io?: IOServer | undefined
}

interface SocketWithIO extends NetSocket {
    server: SocketServer
}

interface NextApiResponseWithSocket extends NextApiResponse {
    socket: SocketWithIO
}

const connections = new Map<string, Map<string, Array<SocketId>>>();
let ip = "";

export default function handler(req: NextApiRequest, res: NextApiResponseWithSocket) {
    const ip_info: AddressInfo = req.socket.address() as AddressInfo;
    if (ip_info.family === "IPv6") {
        const splited = ip_info.address.split(":");
        if (splited.length <= 3) {
            ip = `127.0.0.1:${ip_info.port}`;
        } else {
            ip = `${splited[splited.length - 1]}:${ip_info.port}`;
        }
    } else {
        ip = `${ip_info.address}:${ip_info.port}`;
    }
    if (!res.socket.server.io) {

        const io = new Server(res.socket.server, {
            pingTimeout: 60000,
        });

        corp_storage.forEach((corpus) => {
            connections.set(corpus.name, new Map<string, Array<SocketId>>());
            Object.keys(corpus.cabinets).forEach((cabinet) => {
                connections.get(corpus.name)?.set(cabinet, []);
            });
        });


        io.on('connection', (socket) => {
            let host = {key: "", hostname: ""};
            let alreadySet = false;

            socket.on('setType', (data) => {
                switch (data) {
                    case 'controller':
                        socket.join('controller');
                        break;
                    case 'daemon':
                        socket.join('daemon');
                        break;
                    default:
                        break;
                }
            });

            socket.on('image', (data) => {
                if (socket.rooms.size === 0) return;
                if (!socket.rooms.has("daemon")) return;
                const {image, hostname} = data;
                io.of("/").adapter.rooms.forEach((value, key) => {
                    if (hostname.search(key) !== -1) {
                        host = {key: key, hostname: key + hostname.split(key)[1].replace("\n", "")};
                        io.to(key).emit('image', {image: image, hostname: key + hostname.split(key)[1].replace("\n", "")});
                    }
                });
            });

            socket.on('setComputers', (data) => {
                if (socket.rooms.size === 0) return;
                if (!socket.rooms.has("controller")) return;
                const {corpus, cabinet, computer} = data;
                if (!connections.has(corpus)) return;
                if (!cabinet) return;
                if (!corpus) return;
                if (!connections.get(corpus)?.has(cabinet)) return;

                if (!alreadySet) {
                    connections.get(corpus)?.get(cabinet)?.push(socket.id);
                    alreadySet = true;
                }

                let hostname = corpus;
                if (cabinet) {
                    hostname += `-${cabinet}`;
                    socket.join(hostname)
                    if (computer) {
                        hostname += `-${computer}`;
                    }
                }

                const message = create_msg("son", hostname, ip, privateKey);
                const corp = corp_storage.find((c) => c.name === corpus);
                send_msg(message, corp!);
            });

            socket.on('disconnecting', () => {
                if (socket.rooms.size === 0) return;
                if (socket.rooms.has("controller")) {
                    connections.forEach((c_corpus, name) => {
                        c_corpus.forEach((cabinet, c_name) => {
                            cabinet.splice(cabinet.indexOf(socket.id), 1);
                            if (cabinet.length === 0) {
                                setTimeout(() => {
                                    disconnect(cabinet, `${name}-${c_name}`);
                                });
                            }
                        });
                    })
                }
            });

            socket.on('disconnect', () => {
                if (host.key === "") return;
                io.in(host.key).emit("image", {image: null, hostname: host.hostname});
            });

            const disconnect = (cabinet: Array<SocketId>, to_disconnect: string) => {
                if (cabinet.length === 0) {
                    io.in("daemon").emit("stream_off", to_disconnect);
                }
            }
        });

        res.socket.server.io = io;
    }
    res.end();
}