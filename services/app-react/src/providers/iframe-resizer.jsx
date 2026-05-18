import React, { createContext } from "react";
import '@iframe-resizer/child'
import sessionStore from "@/stores/session";

export const resizerContext = createContext()

function ResizerProvider({ children }) {
    const { setUser, setToken, user, token } = sessionStore()
    const [refreshCounter, setRefreshCounter] = React.useState(0)

    window.iFrameResizer = {
        onMessage: (event) => {
            if (event && (event.user || event.token)) {
                setUser(event.user || {})
                setToken(event.token || '')
            } else {
                console.warn('⚠️ Received unknown message from parent iframe', event);
            }
        }
    }

    React.useEffect(() => {
        const handleMessage = (event) => {
            if (event.data && event.data.action === 'refresh-dashboard') {
                setRefreshCounter(prev => prev + 1)
            }
        }
        window.addEventListener('message', handleMessage)
        return () => window.removeEventListener('message', handleMessage)
    }, [])

    if (!user || !token) {
        console.log('⏳ Waiting for session message from parent...');
        return null;
    }

    return (
        <resizerContext.Provider value={{ user, token, refreshCounter }}>
            {children}
        </resizerContext.Provider>
    )
}

export default ResizerProvider
