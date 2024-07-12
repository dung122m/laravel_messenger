import {useState, Fragment} from "react";
import {
    PaperClipIcon,
    PhotoIcon,
    FaceSmileIcon,
    HandThumbUpIcon,
    PaperAirplaneIcon,
    HeartIcon, XCircleIcon
} from "@heroicons/react/24/solid";
import NewMessageInput from "./NewMessageInput";
import EmojiPicker from "emoji-picker-react";
import {Popover, Transition} from '@headlessui/react'
import {isAudio, isImage} from "@/helpers.jsx";
import AttachmentPreview from "@/Components/App/AttachmentPreview.jsx";
import CustomAudioPlayer from "@/Components/App/CustomAudioPlayer.jsx";

const MessageInput = ({conversation = null}) => {
    const [newMessage, setNewMessage] = useState("");
    const [inputErrorMessages, setInputErrorMessages] = useState("");
    const [messageSending, setMessageSending] = useState(false);
    const [chosenFile, setChosenFile] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(0);
    const onFileChange = (ev) => {
        const files = ev.target.files;
        const updatedFiles = [...files].map((file) => {
            return {
                file: file,
                url: URL.createObjectURL(file),

            };

        });
        setChosenFile((prevFiles) => [...prevFiles, ...updatedFiles])
        ev.target.value = null;

    }
    const onLikeClick = () => {
        if (messageSending) {
            return;
        }
        const data = {message: "👍"};
        if (conversation.is_user) {
            data["receiver_id"] = conversation.id;
        } else if (conversation.is_group) {
            data["group_id"] = conversation.id;
        }
        axios.post(route("message.store"), data);
    }
    const onHeartClick = () => {
        if (messageSending) {
            return;
        }
        const data = {message: "😍"};
        if (conversation.is_user) {
            data["receiver_id"] = conversation.id;
        } else if (conversation.is_group) {
            data["group_id"] = conversation.id;
        }
        axios.post(route("message.store"), data);

    }
    const onSendClick = () => {
        if (messageSending) {
            return;
        }
        if (newMessage.trim() === "" && chosenFile.length === 0) {
            setInputErrorMessages("Please enter a message or attach a file");
            setTimeout(() => {
                setInputErrorMessages("");
            }, 3000);
            return;
        }

        const formData = new FormData();
        chosenFile.forEach((file) => {
            formData.append("attachments[]", file.file);

        })
        formData.append("message", newMessage);
        if (conversation.is_user) {
            formData.append("receiver_id", conversation.id);
        } else if (conversation.is_group) {
            formData.append("group_id", conversation.id);
        }

        setMessageSending(true);

        axios.post(route("message.store"), formData, {
            onUploadProgress: (progressEvent) => {
                const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setUploadProgress(progress);
            }
        })
            .then(response => {
                setNewMessage("");
                setMessageSending(false);
                setUploadProgress(0);
                setChosenFile([]);
            })
            .catch(error => {
                setMessageSending(false);
                setChosenFile([]);
                const message = error?.response?.data?.message;
                setInputErrorMessages(message || "An error occurred while sending message");
            });
    };

    return (
        <div className="flex flex-wrap items-start border-t border-slate-700 py-3">
            <div className="order-2 flex-1 xs:flex-none xs:order-1 p-2">
                <button className="p-1 text-gray-400 hover:text-gray-300 relative ">
                    <PaperClipIcon className="w-6"/>
                    <input type="file" multiple
                           className="absolute left-0 top-0 right-0 bottom-0 z-20 opacity-0 cursor-pointer "
                           onChange={onFileChange}
                    />
                </button>
                <button className="p-1 text-gray-400 hover:text-gray-300 relative">
                    <PhotoIcon className="w-6"/>
                    <input
                        onChange={onFileChange}
                        type="file" multiple accept="image/*"
                        className="absolute left-0 top-0 right-0 bottom-0 z-20 opacity-0 cursor-pointer"/>
                </button>
            </div>
            <div className="order-1 px-3 xs:p-0 min-w-[220px] basis-full xs:basis-0 xs:order-2 flex-1 relative">
                <div className="flex ">
                    <NewMessageInput value={newMessage}
                                     onSend={onSendClick}
                                     onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <button onClick={onSendClick}
                            disabled={messageSending}

                            className="btn btn-info rounded-l-none">

                        <PaperAirplaneIcon className="w-6"/>
                        <span className="hidden sm:inline">Send</span>
                    </button>
                </div>
                {!!uploadProgress && (
                    <progress
                        className="progress progess-info w-full"
                        value={uploadProgress}
                        max="100"
                    >

                    </progress>
                )}
                {inputErrorMessages && (
                    <p className="text-xs text-red-500">{inputErrorMessages}</p>
                )}
                <div className="flex flex-wrap gap-1 mt-2">
                    {chosenFile.map((file) => (
                        <div key={file.file.name}
                             className={
                                 `relative flex justify-between cursor-pointer
                            + (!isImage(file.file) ? " w-[240px]" : "")`}>
                            {isImage(file.file) && (
                                <img src={file.url} alt="" className="w-16 h-16 object-cover"/>
                            )}
                            {isAudio(file.file) && (
                                <CustomAudioPlayer file={file.file} showVolume={false}/>
                            )}
                            {!isImage(file.file) && !isAudio(file.file) && (
                                <AttachmentPreview file={file}/>
                            )}
                            <button onClick={() => {
                                setChosenFile(chosenFile.filter(
                                    (f) => f.file.name !== file.file.name
                                ))
                            }} className="absolute w-6 h-6 rounded-full bg-gray-800 -right-2 -top-2 text-gray-300 hover:text-gray-100 z-10">
                                <XCircleIcon className="w-6" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="order-3 xs:order-3 p-2 flex">
                <Popover className="relative">
                    <Popover.Button className="p-1 text-gray-400 I hover:text-gray-300">
                        <FaceSmileIcon className="w-6 h-6"/> </Popover.Button>
                    <Popover.Panel className="absolute z-10 right-0 bottom-[100px]">
                        <EmojiPicker theme="dark"
                                     onEmojiClick={
                                         (ev) => setNewMessage(
                                             newMessage + ev.emoji)
                                     }>
                        </EmojiPicker>
                    </Popover.Panel>
                </Popover>

                <button onClick={onLikeClick} className="p-1 text-gray-400 hover:text-gray-300 ">
                    <HandThumbUpIcon className="w-6"/>
                </button>
                <button onClick={onHeartClick} className="p-1 text-gray-400 hover:text-gray-300 ">
                    <HeartIcon className="w-6"/>
                </button>
            </div>
        </div>
    );
};
export default MessageInput;

