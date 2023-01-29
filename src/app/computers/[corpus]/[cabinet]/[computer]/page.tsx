"use client"

import io from 'socket.io-client'
import styles from './page.module.css'
import {useEffect, useState} from "react";


export default function Home({params}: {params: {corpus: string, cabinet: string, computer: string}}) {
    const [image, setImage] = useState("")
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
            if (hostname.search(`${corpus}-${cabinet}-${computer}`) !== -1) setImage(image);
        })

        return () => {
            socket.disconnect()
        }
    }

    const sendCommand = async (e: any) => {
        e.preventDefault()
        const other_data = e.target.other_data.value
        const command = e.target.command.value

        await fetch(`/api/computer/${corpus}/${cabinet}/${computer}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                other_data: other_data,
                command: command
            })
        });
    }

    return (
        <main className={styles.main}>
            <img className={styles.image} alt={"alt"} id={"test"} src={image}/>
            <form onSubmit={sendCommand}>
                <input name={"command"}/>
                <input name={"other_data"}/>
                <button>Send</button>
            </form>
        </main>
    )
}
