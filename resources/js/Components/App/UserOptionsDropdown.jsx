import {Menu, Transition} from "@headlessui/react";
import {Fragment} from "react";
import {ShieldCheckIcon, UserIcon} from "@heroicons/react/24/solid";

export default function UserOptionsDropdown({conversation}) {

    const changeUserRole = () => {
        console.log("Change user role");
        if (!conversation.is_user) {
            return;
        }
        axios.post(route("user.changeRole", conversation.id))
            .then((res) => {
                console.log(res.data);

            })
            .catch((error) => {
                console.log(error.response.data);
            });
    }
    const onBlockUser = () => {
        console.log("Block user");
        if (!conversation.is_user) {
            return;
        }
        axios.post("user.blockUnblock", conversation.id)
            .then((res) => {
                console.log(res.data);
            })
            .catch((error) => {
                console.log(error.response.data);
            });

    }
    return (
        <div>
            <Menu as="div" className="relative inline-block text-left">
                <div>
                    <Menu.Button className="flex justify-center items-center w-8 h-8 rounded-full hover:bg-black/40 ">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                             stroke="currentColor" className="h-5 w-5">
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z"/>
                        </svg>


                    </Menu.Button>
                </div>
                <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                >
                    <Menu.Items className="absolute right-0 mt-2 w-48 rounded-md bg-gray-800 shadow-lg z-50">
                        <div className="px-1 py-1">
                            <Menu.Item>
                                {({active}) => (
                                    <button onClick={onBlockUser}
                                            className={`${active ? "bg-black/30 text-white" : "text-gray-100 "} group flex w-full items-center rounded-md px-2 py-2 text-sm`}>

                                        {

                                            conversation.blocked_at && (
                                                <>
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                                         strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
                                                        <path strokeLinecap="round" strokeLinejoin="round"
                                                              d="M13.5 10.5V6.75a4.5 4.5 0 1 1 9 0v3.75M3.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"/>
                                                    </svg>
                                                    Unblock User

                                                </>
                                            )
                                        }
                                        {
                                            !conversation.blocked_at && (
                                                <>
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                                         strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
                                                        <path strokeLinecap="round" strokeLinejoin="round"
                                                              d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"/>
                                                    </svg>
                                                    Block User
                                                </>
                                            )
                                        }
                                    </button>
                                )}
                            </Menu.Item>
                        </div>
                        <div className="px-1 py-1">
                            <Menu.Item>
                                {({active}) => (
                                    <button onClick={changeUserRole}
                                            className={`${active ? "bg-black/30 text-white" : "text-gray-100"} group flex w-full items-center rounded-md px-2 py-2 text-sm`}

                                    >
                                        {
                                            conversation.is_admin && (
                                                <>
                                                    <UserIcon className="w-4 h-4 mr-2"/>
                                                    Make Regular User

                                                </>
                                            )
                                        }
                                        {
                                            !conversation.is_admin && (
                                                <>
                                                    <ShieldCheckIcon className="w-4 h-4 mr-2"/>
                                                    Make Admin

                                                </>
                                            )
                                        }
                                    </button>
                                )}

                            </Menu.Item>
                        </div>
                    </Menu.Items>
                </Transition>
            </Menu>
        </div>
    )

}
