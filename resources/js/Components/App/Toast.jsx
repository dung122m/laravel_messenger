import {useEventBus} from "@/EventBus.jsx";
import {useEffect, useState} from "react";
import {v4 as uuidv4} from "uuid";

export default function Toast({}) {
    const {on} = useEventBus();
    const [toast, setToast] = useState([]);
    useEffect(() => {
        on('toast.show', (message) => {
            const uuid = uuidv4();
            setToast((oldToasts) => [...oldToasts, {message, uuid}]);
            setTimeout(() => {
                setToast((oldToasts) => oldToasts.filter((t) => t.uuid !== uuid));
            }, 3000);
        })
    }, [on]);
    return (
        <div className="toast min-w-[280px]">
            {toast.map((t, index) => (
                <div key={t.uuid} className="alert alert-success py-3 px-4 text-gray-100 rounded-lg ">
                    <span>{t.message} </span>
                </div>
            ))}
        </div>
    )
}
