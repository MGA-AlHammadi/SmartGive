import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (token) {
            const newSocket = io('http://localhost:5000', {
                auth: { token }
            });

            newSocket.on('connect', () => {
                console.log('Socket verbunden');
            });

            newSocket.on('new_message', (message) => {
                // Nur toasten, wenn wir nicht gerade in der Messaging-Seite sind 
                // oder einen allgemeinen Notification-Store haben
                if (window.location.pathname !== '/messages') {
                    toast.success('Neue Nachricht erhalten!', {
                        icon: '💬',
                    });
                }
            });

            newSocket.on('new_donation', (data) => {
                toast.success(data.message, {
                    icon: '🎁',
                    duration: 6000
                });
            });

            setSocket(newSocket);

            return () => newSocket.close();
        } else {
            if (socket) {
                socket.close();
                setSocket(null);
            }
        }
    }, [token]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
