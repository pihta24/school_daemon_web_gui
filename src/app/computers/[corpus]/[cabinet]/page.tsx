"use client"

import io from 'socket.io-client';
import styles from './page.module.css';
import {Comfortaa} from "@next/font/google";
import {useEffect, useState, useRef} from "react";

const comfortaa = Comfortaa({subsets: ["latin", "cyrillic"]});

export default function Home({params}: { params: { corpus: string, cabinet: string } }) {
    const images = useRef(new Map<string, string>())
    const [upi, updateImages] = useState(1);
    const {corpus, cabinet} = params
    let first = true;

    useEffect(() => {
        if (first) socketInitializer().then();
        first = false
    }, []);

    useEffect(() => {
        (async () => {
            const {computers} = await (await fetch("/api/data/computers/get", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    corpus: corpus,
                    cabinet: cabinet
                })
            })).json() as { computers: string[] }

            const div = document.getElementsByClassName(styles.image_container)[0]
            computers?.forEach(computer => {
                const img_div = document.createElement("div");
                const img = document.createElement("img");
                const title = document.createElement("p");
                title.innerText = `${corpus}-${cabinet}-${computer}`;
                title.className = comfortaa.className;
                title.style.margin = "10px";
                img_div.className = styles.image_box;
                img.className = styles.image + " " + comfortaa.className;
                img.alt = `${corpus}-${cabinet}-${computer}`;
                img.src = "/connection-error.png";
                img.onclick = () => {
                    window.location.href = `/computers/${corpus}/${cabinet}/${computer}`;
                }
                img.title = `Перейти в ${corpus}-${cabinet}-${computer}`;
                img.oncontextmenu = () => {
                    window.location.href = `/computers/${corpus}/${cabinet}/${computer}`;
                    return false;
                }
                img_div.appendChild(title);
                img_div.appendChild(img);
                div.appendChild(img_div);
            })
        })()
    }, [])

    useEffect(() => {
        const div = document.getElementsByClassName(styles.image_container)[0]
        for (let i = 0; i < div.getElementsByClassName(styles.image).length; i++) {
            const img: HTMLImageElement = div.getElementsByClassName(styles.image)[i] as HTMLImageElement
            img.src = images.current.get(img.alt.split("-")[img.alt.split("-").length - 1]) || "/connection-error.png"
        }
    }, [upi])


    const socketInitializer = async () => {
        await fetch("/api/socket")

        const socket = io()
        socket.on("connect", () => {
            console.log("connected")
            socket.emit("setType", "controller")
            socket.emit("setComputers", {corpus: corpus, cabinet: cabinet})
        })

        socket.on("image", (data) => {
            const {image, hostname} = data;
            if (hostname.search(`${corpus}-${cabinet}-`) !== -1) {
                const computer = hostname.split("-")[hostname.split("-").length - 1]
                images.current.set(computer, image);
                updateImages(Math.random());
            }
        })

        return () => {
            socket.disconnect()
        }
    }


    const sendCommand = async (e: any) => {
        e.preventDefault()
        const other_data = e.target.other_data.value
        const command = e.target.command.value

        await fetch(`/api/computer/${corpus}/${cabinet}`, {
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
            <div className={styles.image_container}>
            </div>
            <form onSubmit={sendCommand}>
                <input name={"command"}/>
                <input name={"other_data"}/>
                <button>Send</button>
            </form>
        </main>
    )
}