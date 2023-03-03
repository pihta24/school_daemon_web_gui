"use client"

import styles from './page.module.css'
import {Comfortaa} from "@next/font/google";
import {useEffect} from "react";

const comfortaa = Comfortaa({subsets: ["latin", "cyrillic"]});

export default function Home() {
    useEffect(() => {
        const createOnClick = (corp: string) => {return () => {window.location.href = `/computers/${corp}/`}};

        (async () => {
            const {corpusa} = await (await fetch("/api/data/corpus/get", {
                method: "POST",
            })).json() as { corpusa: Array<string[]> }

            corpusa.sort()

            const main = document.getElementsByClassName(styles.main)[0]

            for (const corpus of corpusa) {
                const div = document.createElement("div")
                const p = document.createElement("p")

                p.textContent = corpus[0]
                p.className = comfortaa.className
                div.onclick = createOnClick(corpus[1])
                div.className = styles.corpus

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
