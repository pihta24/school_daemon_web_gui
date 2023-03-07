"use client"

import styles from './page.module.css'
import {Comfortaa} from "@next/font/google";
import {useEffect} from "react";
import ButtonBack from "@/button_back";
import swal from "sweetalert";

const comfortaa = Comfortaa({subsets: ["latin", "cyrillic"]});

export default function Home() {
    useEffect(() => {
        const createOnClick = (corp: string) => {return () => {window.location.href = `/computers/${corp}/`}};

        (async () => {
            const response = await fetch("/api/data/corpus/get", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                }
            })

            if (response.status !== 200) {
                swal({text: "Нет доступных кабинетов", title: "Ошибка", icon: "error", className: comfortaa.className})
                setTimeout(() => window.history.back(), 10000)
                return
            }

            const {corpusa} = await response.json() as { corpusa: Array<string[]> }

            if (corpusa.length === 0) {
                swal({text: "Нет доступных кабинетов", title: "Ошибка", icon: "error", className: comfortaa.className})
                setTimeout(() => window.history.back(), 10000)
                return
            }

            corpusa.sort()

            const main = document.getElementById("corpusa")

            for (const corpus of corpusa) {
                const div = document.createElement("div")
                const p = document.createElement("p")

                p.textContent = corpus[0]
                p.className = comfortaa.className
                div.onclick = createOnClick(corpus[1])
                div.className = styles.corpus

                div.appendChild(p)
                main?.appendChild(div)
            }
        })()
    }, [])


    return (
        <main className={styles.main}>
            <ButtonBack/>
            <div id={"corpusa"} className={styles.corpus_container}>

            </div>
        </main>
    )
}
