import {Head} from '@inertiajs/react';
import ChatLayout from "@/Layouts/ChatLayout.jsx";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {useCallback, useEffect, useRef, useState} from "react";
import {ChatBubbleLeftRightIcon} from "@heroicons/react/24/solid";
import ConversationHeader from "@/Components/App/ConversationHeader.jsx";
import MessageItem from "@/Components/App/MessageItem.jsx";
import MessageInput from "@/Components/App/MessageInput.jsx";
import {useEventBus} from "@/EventBus.jsx";

function Home({selectedConversation = null, messages = null}) {
    const messagesCtrRef = useRef(null);
    const loadMoreIntersect = useRef(null);
    const [localMessages, setLocalMessages] = useState([]);
    const {on} = useEventBus();
    const [scrollFromBottom, setScrollFromBottom] = useState(0);
    const [noMoreMessages, setNoMoreMessages] = useState(false);
    const [isNewMessage, setIsNewMessage] = useState(false); // Flag to determine if a new message is added

    const loadMoreMessages = useCallback(() => {
        if (noMoreMessages) {
            return;
        }
        const firstMessage = localMessages[0];
        axios.get(route("message.loadOlder", firstMessage.id))
            .then(({data}) => {
                if (data.data.length === 0) {
                    setNoMoreMessages(true);
                    return;
                }
                const scrollHeight = messagesCtrRef.current.scrollHeight;
                const scrollTop = messagesCtrRef.current.scrollTop;
                const clientHeight = messagesCtrRef.current.clientHeight;
                setScrollFromBottom(scrollHeight - scrollTop - clientHeight);
                setLocalMessages((prevMessages) => [...data.data.reverse(), ...prevMessages]);
            })
    }, [localMessages, noMoreMessages]);

    const messageCreated = (message) => {
        if (
            selectedConversation &&
            selectedConversation.is_group &&
            parseInt(selectedConversation.id) === parseInt(message.group_id)
        ) {
            setLocalMessages((prevMessages) => [...prevMessages, message]);
            setIsNewMessage(true); // Set flag to true for new messages
        }

        if (
            selectedConversation &&
            selectedConversation.is_user &&
            (parseInt(selectedConversation.id) === parseInt(message.sender_id) ||
                parseInt(selectedConversation.id) === parseInt(message.receiver_id))
        ) {
            setLocalMessages((prevMessages) => [...prevMessages, message]);
            setIsNewMessage(true); // Set flag to true for new messages
        }
    }

    useEffect(() => {
        setTimeout(() => {
            if (messagesCtrRef.current) {
                messagesCtrRef.current.scrollTop = messagesCtrRef.current.scrollHeight;
            }
        }, 10);

        const offCreated = on('message.create', messageCreated);
        setScrollFromBottom(0);
        setNoMoreMessages(false);
        return () => {
            offCreated();
        };
    }, [selectedConversation]);

    useEffect(() => {
        setLocalMessages(messages ? messages.data.reverse() : [])
    }, [messages]);

    useEffect(() => {
        if (messagesCtrRef.current && scrollFromBottom !== null) {
            messagesCtrRef.current.scrollTop = messagesCtrRef.current.scrollHeight -
                messagesCtrRef.current.offsetHeight - scrollFromBottom;
        }
        if (noMoreMessages) {
            return;
        }
        const observer = new IntersectionObserver(
            (entries) =>
                entries.forEach(
                    (entry) => entry.isIntersecting && loadMoreMessages()
                ),
            {
                rootMargin: "0px 0px 250px 0px",
            }
        );
        if (loadMoreIntersect.current) {
            setTimeout(() => {
                observer.observe(loadMoreIntersect.current);
            }, 100)
        }
        return () => {
            observer.disconnect();
        }
    }, [localMessages]);

    useEffect(() => {
        if (isNewMessage && messagesCtrRef.current) {
            messagesCtrRef.current.scrollTop = messagesCtrRef.current.scrollHeight;
            setIsNewMessage(false); // Reset the flag after scrolling
        }
    }, [localMessages, isNewMessage]);

    return (
        <>
            {
                !messages && (
                    <div className="flex flex-col gap-8 justify-center items-center text-center h-full opacity-35">
                        <div className="text-2xl md:text-4xl p-16 text-slate-200">
                            Please select conversation to see message
                        </div>
                        <ChatBubbleLeftRightIcon className="w-32 h-32 inline-block"/>
                    </div>
                )
            }
            {messages && (
                <>
                    <ConversationHeader
                        selectedConversation={selectedConversation}
                    />
                    <div
                        ref={messagesCtrRef}
                        className="flex-1 overflow-y-auto p-5"
                    >
                        {localMessages.length === 0 && (
                            <div className="flex justify-center items-center h-full">
                                <div className="text-lg text-slate-300">
                                    No messages yet
                                </div>
                            </div>
                        )
                        }
                        {localMessages.length > 0 && (

                            <div className="flex-1 flex flex-col gap-2">
                                <div ref={loadMoreIntersect}></div>
                                {localMessages.map((message) => (
                                    <MessageItem
                                        key={message.id}
                                        message={message}
                                    />
                                ))}
                            </div>
                        )
                        }
                    </div>
                    <MessageInput conversation={selectedConversation}/>
                </>
            )}
        </>
    );
}

Home.layout = (page) => {
    return <AuthenticatedLayout
        user={page.props.auth.user}>
        <ChatLayout children={page}></ChatLayout>
    </AuthenticatedLayout>;
};

export default Home;
