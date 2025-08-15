import { useContext } from "react"
import { resizerContext } from "@/providers/iframe-resizer"
import BreadCrumbs from "@/components/shared/BreadCrumbs"

export function Dashboard() {
    const { user } = useContext(resizerContext)    

    return (
        <div>
            <BreadCrumbs />
            <h1 className="text-black">{user?.userId}</h1>
        </div>
    )
}