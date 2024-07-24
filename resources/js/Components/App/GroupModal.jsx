import TextAreaInput from "@/Components/TextAreaInput";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel.jsx";
import Modal from "@/Components/Modal.jsx";
import TextInput from "@/Components/TextInput.jsx";
import SecondaryButton from "@/Components/SecondaryButton.jsx";
import PrimaryButton from "@/Components/PrimaryButton.jsx";
import UserPicker from "@/Components/App/UserPicker" ;
import {useForm, usePage} from "@inertiajs/react";
import {useEventBus} from "@/EventBus" ;
import {useEffect, useState} from "react";

export default function GroupModal({show = false, onClose = () => {}
}) {
    const page = usePage();
    const conversations = page.props.conversation;
    const {on, emit} = useEventBus();
    const [group, setGroup] = useState({});
    const {data, setData, processing, reset, post, put, errors} = useForm({
        id: "",
        name: "",
        description: "",
        user_ids: [],


    });
    const users = conversations.filter(conversation => !conversation.is_group);

    const createOrUpdateGroup = (e) => {
        e.preventDefault();
        if (group.id) {
            put(route("group.update", group.id), {
                onSuccess: () => {
                    closeModal();
                    emit("toast.show", `Group "${data.name}" updated successfully`);
                }
            });
            return;
        }
        post(route("group.store"), {
            onSuccess: () => {
                emit("toast.show", `Group "${data.name}" created successfully`);
                closeModal();

            }
        });

    }
    const closeModal = () => {
        reset();
        onClose();
    }
    useEffect(() => {
        return on("GroupModal.show", (group) => {
            setData({
                name: group.name,
                description: group.description,
                user_ids: group.users.filter((user) => group.owner_id !== user.id).map((user) => user.id),
            })
            setGroup(group);
        });
    }, [on]);

    return (
        <Modal show={show} onClose={closeModal}>
            <form onSubmit={createOrUpdateGroup} className="p-6 overflow-y-auto">
                <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100">

                    {group.id ? `Edit Group "${group.name}"` : "Create Group"}
                </h2>
                <div className="mt-8">
                    <InputLabel htmlFor="name" value="Name"/>
                    <TextInput
                        id="name"
                        value={data.name}
                        disabled={!!group.id}
                        onChange={(e) => setData("name", e.target.value)}
                        className="mt-1 block w-full"
                        required
                        isFocused
                    />
                    <InputError className="mt-2" error={errors.name}/>
                </div>
                <div className="mt-4">
                    <InputLabel htmlFor="description" value="Description"/>
                    <TextAreaInput
                        id="description"
                        value={data.description || ""}
                        onChange={(e) => setData("description", e.target.value)}
                        className="mt-1 block w-full"
                        rows="3"
                    />
                    <InputError className="mt-2" error={errors.description}/>
                </div>
                <div className="mt-4">
                    <InputLabel value="Select Users"/>
                    <UserPicker
                        value={
                        users.filter((user) => group.owner_id !== user.id && data.user_ids.includes(user.id)) || []
                        }
                        options={users}
                        onSelect={(users) => setData("user_ids", users.map((user) => user.id))}
                    />
                    <InputError className="mt-2" error={errors.user_ids}/>
                </div>

                <div className="mt-6 flex justify-end">
                    <SecondaryButton onClick={closeModal}>Cancel</SecondaryButton>
                    <PrimaryButton className="ms-3" disabled={processing}>
                        {group.id ? "Update" : "Create"}
                    </PrimaryButton>
                </div>
            </form>

        </Modal>
    );
}
