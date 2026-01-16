import { isNotEmpty, useForm } from '@mantine/form';
import { useEffect, useState } from 'react'
import { addpurok, updatepuroks } from '../../../API/Utils/HealthInstiUtils';
import { Button, Group, Modal, Stack, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';

export default function PurokModal({
    opened,
    onClose,
    data,
    onSuccess
}) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditing = !!data;


    const form = useForm({
        initialValues: {
            purok_name: data?.purok_name || '',
        },
        validate: {
            purok_name: isNotEmpty('Purok name cannot be empty'),
        },
    });

    useEffect(() => {
        // Only run this logic when the modal state changes or the data changes
        if (opened && isEditing && data) {
            // Set values for EDITING mode
            form.setValues({
                purok_name: data.purok_name,
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
                await updatepuroks(data.purok_code, {
                    purok_name: values.purok_name,
                });

                notifications.show({
                    color: "green",
                    title: 'Update Successful',
                    message: `${data.purok_name} was updated successfully.`,
                });

                form.reset();

            } else {
                // --- 2. ADD LOGIC ---
                await addpurok({
                    purok_name: values.purok_name,
                });

                notifications.show({
                    color: "green",
                    title: 'Added Successfuly',
                    message: 'New purok was added successfuly👌',
                });
                form.reset();

            }

            // Call the success handler passed from the parent component (to trigger fetchTypes())
            onSuccess();
            onClose(); // Close the modal

        } catch (error) {
            console.error('API Error:', error);
            notifications.show({
                color: "red",
                title: 'Operation Failed',
                message: `Could not ${isEditing ? 'update' : 'add'} a Purok.`,
            });
            form.reset();
        } finally {
            setIsSubmitting(false);
        }
    };


    const modalTitle = isEditing ?
        `Edit Purok Detail` :
        'Add New Purok';



    return (
        <Modal opened={opened} onClose={onClose} title={modalTitle} centered>
            <form onSubmit={form.onSubmit(submitEntry)}>
                <Stack>
                    <TextInput
                        label="Purok name"
                        description="Please check the name first before the insertion"
                        placeholder="ex. Purok 1"
                        withAsterisk
                        {...form.getInputProps('purok_name')}
                        disabled={isSubmitting}
                    />

                    <Group justify="flex-end" mt="md">
                        <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" loading={isSubmitting}>
                            {isEditing ? 'Save Changes' : 'Add City'}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    )
}
