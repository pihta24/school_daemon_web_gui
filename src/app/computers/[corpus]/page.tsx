"use client"

import styles from './page.module.css'
import {Comfortaa} from "@next/font/google";
import {useEffect} from "react";

const comfortaa = Comfortaa({subsets: ["latin", "cyrillic"]});

export default function Home({params}: { params: { corpus: string} }) {
    const {corpus} = params

    useEffect(() => {
        const createOnClick = (cab: string) => {return () => {window.location.href = `/computers/${corpus}/${cab}`}};

        (async () => {
            const {cabinets} = await (await fetch("/api/data/cabinets/get", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    corpus: corpus
                })
            })).json() as { cabinets: string[] }

            cabinets.sort()

            const main = document.getElementsByClassName(styles.main)[0]

            for (const cabinet of cabinets) {
                console.log(cabinet)
                const div = document.createElement("div")
                const p = document.createElement("p")

                p.textContent = cabinet
                p.className = comfortaa.className
                div.onclick = createOnClick(cabinet)
                div.className = styles.cabinet

                div.appendChild(p)
                main.appendChild(div)
            }
        })()
    }, [])


    return (
        <main className={styles.main}>

        </main>
    )
}
