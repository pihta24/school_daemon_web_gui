"use client"

import io from 'socket.io-client'
import styles from './page.module.css'
import {useEffect, useState} from "react";
import CommandForm from "@/command_sender";


export default function Home({params}: {params: {corpus: string, cabinet: string, computer: string}}) {
    const [image, setImage] = useState("/connection-error.png")
    const {corpus, cabinet, computer} = params
    let first = true;

    useEffect( () => {if (first) socketInitializer().then(); first = false}, []);

    const socketInitializer = async () => {
        await fetch("/api/socket")

        const socket = io()
        socket.on("connect", () => {
            console.log("connected")
            socket.emit("setType", "controller")
            socket.emit("setComputers", {corpus: corpus, cabinet: cabinet, computer: computer})
        })

        socket.on("image", (data) => {
            const {image, hostname} = data;
            if (hostname.replace("\n", "").replace(" ", "").endsWith(`${corpus}-${cabinet}-${computer}`)) setImage(image || "/connection-error.png")
        })

        return () => {
            socket.disconnect()
        }
    }

    return (
        <main className={styles.main}>
            <img className={styles.image} alt={`${corpus}-${cabinet}-${computer}`} src={image}/>
            <CommandForm corpus={corpus} cabinet={cabinet} computer={computer}/>
        </main>
    )
}
