import { isNotEmpty, useForm } from '@mantine/form';
import  { useEffect, useState } from 'react'
import { addprovince, updateprovinces } from '../../../API/Utils/HealthInstiUtils';
import { Button, Group, Modal, Stack, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';

export default function HealthInsUtilsModal({
    opened,
    onClose,
    data,
    onSuccess }) {

    const [isSubmitting, setIsSubmitting] = useState(false);

    const isEditing = !!data;

    const form = useForm({
        initialValues: {
            province_name: data?.province_name || '',
        },
        validate: {
            province_name: isNotEmpty('Province name cannot be empty'),
        },
    });

    useEffect(() => {
        if (isEditing) {
            form.setValues({
                province_name: data.province_name,
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
                await updateprovinces(data.province_code, {
                    province_name: values.province_name,
                });

                notifications.show({
                    color: "green",
                    title: 'Update Successful',
                    message: `${data.province_name} was updated successfully.`,
                });

                form.reset();

            } else {
                // --- 2. ADD LOGIC ---
              
                await addprovince({
                    province_name: values.province_name,
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
            form.reset();
        } finally {
            setIsSubmitting(false);
        }
    };

    const modalTitle = isEditing ?
        `Edit Province Detail: ${data?.province_name}` :
        'Add New Province';


    return (
        <Modal opened={opened} onClose={onClose} title={modalTitle} centered>
            <form onSubmit={form.onSubmit(submitEntry)}>
                <Stack>
                    <TextInput
                        label="Province name"
                        description="Please verify the province first before the insertion"
                        placeholder="ex. Davao de Oro"
                        withAsterisk
                        {...form.getInputProps('province_name')}
                        disabled={isSubmitting}
                    />

                    <Group justify="flex-end" mt="md">
                        <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" loading={isSubmitting}>
                            {isEditing ? 'Save Changes' : 'Add Province'}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    )
}
