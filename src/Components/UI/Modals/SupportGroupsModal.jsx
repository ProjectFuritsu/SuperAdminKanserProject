import { isNotEmpty, useForm } from '@mantine/form';
import { useEffect, useState } from 'react'
import { updateGroupType, addGroupType } from '../../../API/Utils/SupportGroupsUtils'
import { Notifications, notifications } from '@mantine/notifications';
import { Button, Group, Modal, Stack, TextInput } from '@mantine/core';

export default function SupportGroupsModal({
    opened,
    onClose,
    data,
    onSuccess
}) {

    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditing = !!data;
    const form = useForm({
        initialValues: {
            group_type_name: data?.group_type_name || '',
        },
        validate: {
            group_type_name: isNotEmpty('Group Type Name cannot be empty'),
        },
    });

    useEffect(() => {
        // Only run this logic when the modal state changes or the data changes
        if (opened && isEditing && data) {
            // Set values for EDITING mode
            form.setValues({
                group_type_name: data.group_type_name,
            });

        } else if (opened && !isEditing) {
            // Reset the form values for ADDING mode when the modal opens
            form.reset();
        }
    }, [opened, data]);


    const submitEntry = async (values) => {
        setIsSubmitting(true);

        try {
            if (isEditing) {
                // --- 1. UPDATE LOGIC ---
                await updateGroupType(data.group_type_code, {
                    group_type_name: values.group_type_name,
                });

                notifications.show({
                    color: "green",
                    title: 'Update Successful',
                    message: `${data.group_type_name} was updated successfully.`,
                });

                form.reset();

            } else {
                // --- 2. ADD LOGIC ---
                await addGroupType({
                    group_type_name: values.group_type_name,
                });

                notifications.show({
                    color: "green",
                    title: 'Added Successfuly',
                    message: 'New group Type was added successfuly👌',
                });
                form.reset();

            }

            // Call the success handler passed from the parent component (to trigger fetchTypes())
            onSuccess();
            onClose(); // Close the modal

        } catch (error) {
            console.error('API Error:', error);
            Notifications.show({
                color: "red",
                title: 'Operation Failed',
                message: `Could not ${isEditing ? 'update' : 'add'} the group type.`,
            });
            form.reset();
        } finally {
            setIsSubmitting(false);
        }
    };


    const modalTitle = isEditing ?
        `Edit Group Type Detail` :
        'Add New Group Type';

    return (
        <Modal opened={opened} onClose={onClose} title={modalTitle} centered>
            <form onSubmit={form.onSubmit(submitEntry)}>
                <Stack>
                    <TextInput
                        label="Group Type Name"
                        description="Please check the input data before submitting"
                        placeholder="ex. Peer-Led Groups"
                        withAsterisk
                        {...form.getInputProps('group_type_name')}
                        disabled={isSubmitting}
                    />

                    <Group justify="flex-end" mt="md">
                        <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" loading={isSubmitting}>
                            {isEditing ? 'Save Changes' : 'Add Group Type'}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    )
}
