import { useContext } from "react"
import { resizerContext } from "@/providers/iframe-resizer"
import BreadCrumbs from "@/components/shared/BreadCrumbs"

export function Dashboard() {
    const { user } = useContext(resizerContext)

    return (
        <div>
            <BreadCrumbs items={[{ label: 'Dashboard' }]} />
            <h1 className="text-black">Welcome {user?.userName}</h1>
        </div>
    )
}
