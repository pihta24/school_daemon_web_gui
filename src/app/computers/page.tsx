"use client"

import io from 'socket.io-client'
import styles from './page.module.css'
import {useEffect, useState} from "react";


export default function Home() {
    const [image, setImage] = useState("")

    useEffect( () => {socketInitializer().then()}, []);

    const socketInitializer = async () => {
        await fetch("/api/socket")

        const socket = io()
        socket.on("connect", () => {
            console.log("connected")
            socket.emit("setType", "controller")
            socket.emit("setComputers", "LAPTOP")
        })

        socket.on("image", (data) => {
            setImage(data)
        })
    }

    return (
        <main className={styles.main}>
            <img className={styles.image} alt={Date.now().toString()} id={"test"} src={image}/>
        </main>
    )
}
