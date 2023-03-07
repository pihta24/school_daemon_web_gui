"use client"

import styles from './page.module.css'
import {Comfortaa} from "@next/font/google";
import {useEffect} from "react";
import swal from "sweetalert";
import ButtonBack from "@/button_back";

const comfortaa = Comfortaa({subsets: ["latin", "cyrillic"]});

export default function Home({params}: { params: { corpus: string} }) {
    const {corpus} = params

    useEffect(() => {
        const createOnClick = (cab: string) => {return () => {window.location.href = `/computers/${corpus}/${cab}`}};

        (async () => {
            const response = await fetch("/api/data/cabinets/get", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    corpus: corpus
                })
            })

            if (response.status !== 200) {
                swal({text: "Нет доступных кабинетов", title: "Ошибка", icon: "error", className: comfortaa.className})
                setTimeout(() => window.history.back(), 10000)
                return
            }

            const {cabinets} = await response.json() as { cabinets: string[] }

            if (cabinets.length === 0) {
                swal({text: "Нет доступных кабинетов", title: "Ошибка", icon: "error", className: comfortaa.className})
                setTimeout(() => window.history.back(), 10000)
                return
            }

            cabinets.sort()

            const main = document.getElementById("cabinets")

            for (const cabinet of cabinets) {
                const div = document.createElement("div")
                const p = document.createElement("p")

                p.textContent = cabinet
                p.className = comfortaa.className
                div.onclick = createOnClick(cabinet)
                div.className = styles.cabinet

                div.appendChild(p)
                main?.appendChild(div)
            }
        })()
    }, [])


    return (
        <main className={styles.main}>
            <div style={{marginTop: "-3rem"}}><ButtonBack/></div>
            <div id={"cabinets"} className={styles.cabinet_container}>

            </div>
        </main>
    )
}
