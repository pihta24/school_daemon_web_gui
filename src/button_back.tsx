import {Comfortaa} from "@next/font/google";

const comfortaa = Comfortaa({subsets: ["latin", "cyrillic"]});

export default function ButtonBack() {
    return (
        <div onClick={() => history.back()} className={comfortaa.className} style={{
            padding: "2rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            maxWidth: "100px",
            width: "100%",
            height: "50px",
            background: "#7979794C",
            borderRadius: "35px",
            cursor: "pointer"
        }}>
            Назад
        </div>
    )
}