// Modal Component
import { useState, useEffect } from 'react';
import { Modal, Button, TextInput, Stack, Group, Text } from '@mantine/core';
import { useForm, isNotEmpty } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { addpublicationtype, updatepublicationtype } from '../../../API/Utils/PublicationUtils.jsx';
// Import both your API functions
// Assuming: import { addpublicationtype, updatepublicationtype } from './api/publicationService'; 

export default function PubtypeModal({
    opened,
    onClose,
    data,
    onSuccess
}) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Determine if the modal is for editing or adding
    const isEditing = !!data;

    const form = useForm({
        initialValues: {
            type_description: data?.type_description || '',
        },
        validate: {
            type_description: isNotEmpty('Publication type description cannot be empty'),
        },
    });

    // CRITICAL: Reset the form values when the 'data' prop changes (i.e., when a new item is selected for editing)
    useEffect(() => {
        if (isEditing) {
            form.setValues({
                type_description: data.type_description,
            });
        } else {
            // Reset for new entry mode
            form.reset();
        }
    }, []);


    const submitEntry = async (values) => {
        setIsSubmitting(true);

        try {
            if (isEditing) {
                // --- 1. UPDATE LOGIC ---
                await updatepublicationtype(data.publication_type_code, {
                    type_description: values.type_description,
                });

                notifications.show({
                    color: "green",
                    title: 'Update Successful',
                    message: `${data.type_description} was updated successfully.`,
                });
                form.reset();

            } else {
                // --- 2. ADD LOGIC ---
                await addpublicationtype({
                    type_description: values.type_description,
                });

                notifications.show({
                    color: "green",
                    title: 'Added Successfuly',
                    message: 'New Publication Type was Added Successfuly👌',
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
        } finally {
            setIsSubmitting(false);
        }
    };

    const modalTitle = isEditing ?
        `Edit Publication Type: ${data?.type_description}` :
        'Add New Publication Type';

    return (
        <Modal opened={opened} onClose={onClose} title={modalTitle} centered>
            <form onSubmit={form.onSubmit(submitEntry)}>
                <Stack>
                    <TextInput
                        
                        label="Publication Type Name"
                        description="Make sure it is a generic term for the type."
                        placeholder="ex. Research Article, Thesis, Review"
                        withAsterisk
                        {...form.getInputProps('type_description')}
                        disabled={isSubmitting}
                    />

                    <Group justify="flex-end" mt="md">
                        <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" loading={isSubmitting}>
                            {isEditing ? 'Save Changes' : 'Add Publication Type'}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}