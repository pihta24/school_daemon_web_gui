import crypto from "node:crypto";
import dgram from "node:dgram";
import {Corpus} from "@/database";

export function sign(msg: Buffer, key: string): Buffer {
    const signature = crypto.sign("sha256", msg, {
        key: key,
        padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
    });

    return Buffer.concat([signature, msg])
}

export function add_rand_id(msg: Buffer): Buffer {
    const rand_id = crypto.randomBytes(16);
    return Buffer.concat([rand_id, msg]);
}

export function add_timestamp(msg: Buffer): Buffer {
    const timestamp = Buffer.alloc(5);
    timestamp.writeUInt32BE(Date.now() / 1000);
    return Buffer.concat([timestamp, msg]);
}

export function add_hostname(msg: Buffer, hostname: string): Buffer {
    while (hostname.length < 20) hostname += "q";
    const hostname_buf = Buffer.from(hostname, "ascii");
    return Buffer.concat([hostname_buf, msg]);
}

export function create_msg(command: string, hostname: string, other_data: string, key: string): Buffer {
    const command_buf = Buffer.from(command, "ascii");
    const other_data_buf = Buffer.from(other_data, "utf-8");
    const msg = Buffer.concat([command_buf, other_data_buf]);
    return add_rand_id(sign(add_timestamp(add_hostname(msg, hostname)), key));
}

export function send_msg(msg: Buffer, corp: Corpus) {
    const client = dgram.createSocket("udp4");
    const start_ip_nums = corp.start_ip.split('.').map((num: string) => parseInt(num));
    const end_ip_nums = corp.end_ip.split('.').map((num: string) => parseInt(num));
    for (let i1 = start_ip_nums[0]; i1 <= end_ip_nums[0]; i1++) {
        for (let i2 = start_ip_nums[1]; i2 <= end_ip_nums[1]; i2++) {
            for (let i3 = start_ip_nums[2]; i3 <= end_ip_nums[2]; i3++) {
                for (let i4 = start_ip_nums[3]; i4 <= end_ip_nums[3]; i4++) {
                    let ip = `${i1}.${i2}.${i3}.${i4}`;
                    client.send(msg, 55555, ip);
                }
            }
        }
    }
}