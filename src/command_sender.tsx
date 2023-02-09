export default function CommandForm({corpus, cabinet, computer}: {corpus: string, cabinet: string, computer: string | undefined}) {
    const sendCommand = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const other_data = e.currentTarget.other_data.value
        const command = e.currentTarget.command.value

        fetch(`/api/computer/${corpus}/${cabinet}${computer? ("/" + computer) : ""}`, {
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
        if (e.currentTarget.value === "ntf" || e.currentTarget.value === "ffx") {
            document.getElementsByName("other_data")[0].setAttribute("required", "required")
            document.getElementsByName("other_data")[0].removeAttribute("hidden")
        } else {
            document.getElementsByName("other_data")[0].removeAttribute("required")
            document.getElementsByName("other_data")[0].setAttribute("hidden", "")
        }
    }

    return (
        <form onSubmit={sendCommand}>
            <select name={"command"} onChange={setCommand} defaultValue={"ffx"}>
                <option value={"shd"}>Shutdown</option>
                <option value={"rbt"}>Reboot</option>
                <option value={"blc"}>Lock</option>
                <option value={"ubl"}>Unlock</option>
                <option value={"ffx"}>Open Firefox</option>
                <option value={"ntf"}>Send message</option>
                <option value={"pau"}>Enable change wifi</option>
                <option value={"pno"}>Disable change wifi</option>
                <option value={"los"}>Logout student</option>
                <option value={"est"}>Enable system settings</option>
                <option value={"dst"}>Disable system settings</option>
            </select>
            <input name={"other_data"} required={true} hidden={false}/>
            <button>Send</button>
        </form>
    )
}