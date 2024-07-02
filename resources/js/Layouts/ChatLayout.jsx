import {usePage} from "@inertiajs/react";
import {useEffect, useState} from "react";
import TextInput from "@/Components/TextInput.jsx";
import ConversationItem from "@/Components/App/ConversationItem.jsx";
import {PencilSquareIcon} from "@heroicons/react/24/solid";

const ChatLayout = ({children}) => {
    const page = usePage();
    const conversations = page.props.conversation;
    const selectedConversation = page.props.selectedConversation;
    const [onlineUsers, setOnlineUsers] = useState({});
    const [localConversations, setLocalConversations] = useState(conversations);
    const [sortedConversations, setSortedConversations] = useState([]);
    const onSearch = (e) => {
        const search = e.target.value.toLowerCase();
        setLocalConversations(
            conversations.filter(
                (conversation) => {
                  return conversation.name.toLowerCase().includes(search)

                }
            )
        )
    }
    const isUserOnline = (userId) => onlineUsers[userId];
    useEffect(() => {
        setSortedConversations(
            localConversations.sort((a, b) => {
                    if (a.blocked_at && b.blocked_at) {
                        return a.blocked_at > b.blocked_at ? 1 : -1;
                    } else if (a.blocked_at) {
                        return 1;
                    } else if (b.blocked_at) {
                        return -1;
                    }
                    if (a.last_message_date && b.last_message_date) {
                        return b.last_message_date.localeCompare(
                            a.last_message_date
                        )
                    } else if (a.last_message_date) {
                        return -1;
                    } else {
                        return 0;
                    }
                }
            )
        )
    }, [localConversations]);
    useEffect(() => {
        Echo.join('online')
            .here((users) => {
                const onlineUsersObj = Object.fromEntries(
                    (users.map(
                        (user) => [user.id, user]))
                );
                setOnlineUsers((prevOnlineUsers) => {
                    return {...prevOnlineUsers, ...onlineUsersObj};
                })
            })
            .joining((user) => {
                setOnlineUsers((prevOnlineUsers) => {
                    const updatedUsers = {...prevOnlineUsers};
                    updatedUsers[user.id] = user;
                    return updatedUsers;
                })

            })
            .leaving((users) => {
                setOnlineUsers((prevOnlineUsers) => {
                    const updatedUsers = {...prevOnlineUsers};
                    delete updatedUsers[users.id];
                    return updatedUsers;
                })
            })
            .error((error) => {
                console.error(error);

            });
        return () => {
            Echo.leave('online');
        }
    }, []);

    return(
        <div className="flex-1 w-full overflow-hidden flex">
            <div
                className={`transition-all w-full sm:w-[220px] md:w-[300px] flex flex-col bg-slate-800 overflow-hidden ${
                    selectedConversation ? '-ml-[100%] sm:ml-0' : ''
                }`}>
                <div className="flex items-center justify-between py-2 px-3 text-xl font-medium">
                    My Conversation
                    <div className="tooltip tooltip-left" data-tip="create new group">
                        <button className="text-gray-700 hover:text-gray-200">
                            <PencilSquareIcon className="w-4 h-4 inline-block ml-2"/>


                        </button>
                    </div>


                </div>
                <div className="p-3">
                    <TextInput onKeyUp={onSearch} placeholder="Filter users and groups"
                               className="w-full"
                    />
                </div>
                <div className="flex-1 overflow-auto">
                    {sortedConversations && sortedConversations.map((conversation) => (
                        <ConversationItem
                            key={`${conversation.is_group ? 'group_' :
                                'user_'}${conversation.id}`}
                            conversation={conversation}
                            online={!!isUserOnline(conversation.id)}
                            selectedConversation={selectedConversation}
                        />
                    ))}
                </div>
            </div>
            <div className="flex-1 flex flex-col overflow-hidden">{children}</div>
        </div>
    )

}
export default ChatLayout;

