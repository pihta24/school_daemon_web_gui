export default function CommandForm({
                                        corpus,
                                        cabinet,
                                        computer
                                    }: { corpus: string, cabinet: string, computer: string | undefined }) {
    const sendCommand = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const other_data = e.currentTarget.other_data.value
        const command = e.currentTarget.command.value

        fetch(`/api/computer/${corpus}/${cabinet}${computer ? ("/" + computer) : ""}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                other_data: other_data,
                command: command
            })
        }).then();
    }

    const setCommand = (e: React.FormEvent<HTMLSelectElement>) => {
        if (e.currentTarget.value === "ntf" || e.currentTarget.value === "ffx" || e.currentTarget.value === "wae") {
            if (e.currentTarget.value === "ntf" || e.currentTarget.value === "ffx")
                document.getElementsByName("other_data")[0].setAttribute("required", "required")
            document.getElementsByName("other_data")[0].removeAttribute("hidden")
        } else {
            document.getElementsByName("other_data")[0].removeAttribute("required")
            document.getElementsByName("other_data")[0].setAttribute("hidden", "")
        }
    }

    return (
        <form onSubmit={sendCommand} style={{
            maxWidth: "500px",
            width: "100%"
        }}>
            <div style={
                {
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "1rem",
                    padding: "20px",
                    width: "100%",
                    border: "3px solid #ccc",
                    borderRadius: "10px",
                    overflow: "hidden"
                }
            }>
                <select name={"command"} onChange={setCommand} defaultValue={"ffx"} style={
                    {
                        width: "100%",
                        maxWidth: "500px",
                        height: "30px",
                    }
                }>
                    <option value={"shd"}>Выключить</option>
                    <option value={"rbt"}>Перезагрузить</option>
                    <option value={"blc"}>Заблокировать</option>
                    <option value={"ubl"}>Разблокировать</option>
                    <option value={"ffx"}>Открыть ссылку в браузере</option>
                    <option value={"ntf"}>Отправить уведомление</option>
                    <option value={"pau"}>Разрешить настроку wifi</option>
                    <option value={"pno"}>Запретить настройку wifi</option>
                    <option value={"los"}>Выйти из пользователя student</option>
                    <option value={"est"}>Разрешить системные настройки для всех</option>
                    <option value={"dst"}>Разрешить системные настройки только для админов</option>
                    <option value={"wae"}>Включить контроль обоев</option>
                    <option value={"wad"}>Выключить контроль обоев</option>
                </select>
                <input name={"other_data"} required={true} hidden={false} style={
                    {
                        width: "100%",
                        maxWidth: "500px",
                        height: "30px",
                    }
                }/>
                <button style={
                    {
                        width: "100%",
                        maxWidth: "500px",
                        height: "30px",
                    }
                }>Send
                </button>
            </div>
        </form>
    )
}