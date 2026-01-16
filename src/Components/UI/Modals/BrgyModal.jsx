import React, { useEffect, useState } from 'react'
import { isNotEmpty, useForm } from '@mantine/form';
import { addbarangay, updatebarangay } from '../../../API/Utils/HealthInstiUtils';
import { notifications } from '@mantine/notifications';
import { Button, Group, Modal, Stack, TextInput } from '@mantine/core';

export default function BrgyModal({
    opened,
    onClose,
    data,
    onSuccess
}) {

    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditing = !!data;


    const form = useForm({
        initialValues: {
            brgy_name: data?.brgy_name || '',
        },
        validate: {
            brgy_name: isNotEmpty('Barangay name cannot be empty'),
        },
    });


    useEffect(() => {
        // Only run this logic when the modal state changes or the data changes
        if (opened && isEditing && data) {
            // Set values for EDITING mode
            form.setValues({
                brgy_name: data.brgy_name,
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
                await updatebarangay(data.brgy_code, {
                    brgy_name: values.brgy_name,
                });

                notifications.show({
                    color: "green",
                    title: 'Update Successful',
                    message: `${data.brgy_name} was updated successfully.`,
                });

                form.reset();

            } else {
                // --- 2. ADD LOGIC ---
                await addbarangay({
                    brgy_name: values.brgy_name,
                });

                notifications.show({
                    color: "green",
                    title: 'Added Successfuly',
                    message: 'New barangay was added successfuly👌',
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
                message: `Could not ${isEditing ? 'update' : 'add'} the publication type.`,
            });
            form.reset();
        } finally {
            setIsSubmitting(false);
        }
    };


    const modalTitle = isEditing ?
        `Edit barangay Detail` :
        'Add New barangay';

    return (
        <>
            <Modal opened={opened} onClose={onClose} title={modalTitle} centered>
                <form onSubmit={form.onSubmit(submitEntry)}>
                    <Stack>
                        <TextInput
                            label="Barangay name"
                            description="Please check the name first before the insertion"
                            placeholder="ex. Gredu"
                            withAsterisk
                            {...form.getInputProps('brgy_name')}
                            disabled={isSubmitting}
                        />

                        <Group justify="flex-end" mt="md">
                            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                                Cancel
                            </Button>
                            <Button type="submit" loading={isSubmitting}>
                                {isEditing ? 'Save Changes' : 'Add Barangay'}
                            </Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>
        </>
    )
}
