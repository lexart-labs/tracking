import React, { createContext } from "react";
import '@iframe-resizer/child'
import sessionStore from "@/stores/session";

export const resizerContext = createContext()

function ResizerProvider({ children }) {
    const { setIframeSession, user, token } = sessionStore()
    const [refreshCounter, setRefreshCounter] = React.useState(0)
    const [iframeChecked, setIframeChecked] = React.useState(window.parent === window)

    window.iFrameResizer = {
        onMessage: (event) => {
            if (event?.user && event?.token) setIframeSession(event.user, event.token)
            setIframeChecked(true)
        }
    }

    React.useEffect(() => {
        if (iframeChecked) return
        const timeout = window.setTimeout(() => setIframeChecked(true), 1500)
        return () => window.clearTimeout(timeout)
    }, [iframeChecked])

    React.useEffect(() => {
        const handleMessage = (event) => {
            if (event.data && event.data.action === 'refresh-dashboard') {
                setRefreshCounter(prev => prev + 1)
            }
        }
        window.addEventListener('message', handleMessage)
        return () => window.removeEventListener('message', handleMessage)
    }, [])

    if (!iframeChecked) return null

    return (
        <resizerContext.Provider value={{ user, token, refreshCounter }}>
            {children}
        </resizerContext.Provider>
    )
}

export default ResizerProvider
