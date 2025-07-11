import { useContext } from "react"
import { resizerContext } from "../../providers/iframe-resizer"

export function Dashboard() {
    const {userId} = useContext(resizerContext)    

    return (
        <div>
            <h1 className="text-black">{userId}</h1>
        </div>
    )
}